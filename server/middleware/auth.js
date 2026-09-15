const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

// In-memory token blacklist (for logged out tokens)
const tokenBlacklist = new Set();

const revokeToken = (token) => {
  if (token) {
    tokenBlacklist.add(token);
  }
};

const isTokenRevoked = (token) => {
  return tokenBlacklist.has(token);
};

// Verify JWT Bearer Token & User Status
const authenticate = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: No token provided',
      });
    }

    if (isTokenRevoked(token)) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Token has been revoked. Please log in again.',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'sithma_super_secret_jwt_key_2026_ispm'
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: User no longer exists',
      });
    }

    // Check if account was deactivated or suspended
    if (user.status === 'inactive' || user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        status: user.status,
        message: 'This account has been deactivated. Please contact administration.',
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed: Invalid or expired token',
      error: error.message,
    });
  }
};

// Role-Based Access Control (RBAC)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

// Student Resource Ownership Check
// Ensures a student can ONLY view or modify their own student record
const checkStudentOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Staff and Admin can inspect any student
    if (['admin', 'staff'].includes(req.user.role)) {
      return next();
    }

    if (req.user.role === 'student') {
      const studentIdParam = req.params.id || req.params.studentId;
      if (!studentIdParam) {
        return next();
      }

      const targetStudent = await Student.findById(studentIdParam);
      if (!targetStudent) {
        return res.status(404).json({ success: false, message: 'Student record not found' });
      }

      if (targetStudent.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You are not authorized to view or modify another student\'s records.',
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify ownership authorization',
      error: error.message,
    });
  }
};

// Middleware: Ensure Student Account is Verified
const requireVerifiedStudent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Staff and Admin are exempt
    if (['admin', 'staff', 'instructor'].includes(req.user.role)) {
      return next();
    }

    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      const isVerified =
        (req.user.account_status === 'Verified' || req.user.status === 'active') &&
        (student?.account_status === 'Verified' || student?.accountStatus === 'active');

      if (!isVerified) {
        const paymentMethod = student?.payment_method || student?.advancePaymentStatus || 'bank_slip';
        let customMessage =
          'Your payment is currently being verified by a Data Entry Officer. You cannot access the system until your account is verified.';

        if (paymentMethod === 'physical_branch') {
          customMessage =
            'Please visit your nearest branch to complete your advance payment of LKR 5,000. You will gain full system access once the payment is verified by our team.';
        }

        return res.status(403).json({
          success: false,
          account_status: student?.account_status || 'Unverified / Pending Payment',
          payment_method: paymentMethod,
          message: customMessage,
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify account authorization',
      error: error.message,
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  checkStudentOwnership,
  requireVerifiedStudent,
  revokeToken,
};

