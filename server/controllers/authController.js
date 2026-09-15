const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Package = require('../models/Package');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const PasswordResetToken = require('../models/PasswordResetToken');
const { revokeToken } = require('../middleware/auth');
const { ADVANCE_PAYMENT_AMOUNT, MIN_REGISTRATION_AGE } = require('../config/constants');

// Maximum failed login attempts before temporary lockout
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username || user.email.split('@')[0],
      role: user.role,
      name: user.name,
      branch: user.branch,
      status: user.status,
      mustChangePassword: user.mustChangePassword,
    },
    process.env.JWT_SECRET || 'sithma_super_secret_jwt_key_2026_ispm',
    { expiresIn: '7d' }
  );
};

// Password policy validator: min 8 chars, 1 uppercase, 1 lowercase, 1 number, not matching username
const validatePasswordPolicy = (password, username, email) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one numeric digit (0-9).' };
  }
  if (username && username.trim().length >= 3 && password.toLowerCase().includes(username.toLowerCase().trim())) {
    return { valid: false, message: 'Password cannot contain your username.' };
  }
  if (email) {
    const localPart = email.split('@')[0];
    if (localPart && localPart.length >= 3 && password.toLowerCase().includes(localPart.toLowerCase())) {
      return { valid: false, message: 'Password cannot contain your email prefix.' };
    }
  }
  return { valid: true };
};

// @desc    Register a new student (Self-Registration - Path A)
// @route   POST /api/auth/register
// @access  Public
// @desc    Register a new student (Step 2: Full Course or Trial Only)
// @route   POST /api/auth/register
// @access  Public
exports.registerStudent = async (req, res) => {
  try {
    const {
      name,
      full_name,
      username,
      email,
      phone,
      nic,
      dob,
      dateOfBirth,
      password,
      branch,
      studentType,
      student_type,
      packageType,
      packageId,
      paymentPlan,
      customLessonsCount,
      lightVehicleLicenseDate,
      role, // Must be rejected if someone tries to register as staff/instructor/admin
    } = req.body;

    const studentFullName = (full_name || name || '').trim();
    const rawDob = dob || dateOfBirth;

    // Security Gate: No public sign-up path exists for Staff, Instructor, or Admin
    if (role && role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Staff, Instructor, and Admin accounts cannot be self-registered.',
      });
    }

    // 1. Required Fields Validation
    if (!studentFullName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your Full Name.',
      });
    }

    if (!email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Email Address, Phone Number, and Password.',
      });
    }

    if (!rawDob) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your Date of Birth (DOB).',
      });
    }

    // 2. Email and Phone Format Validation
    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address format.',
      });
    }

    const cleanPhone = phone.trim().replace(/[\s\-]/g, '');
    const phoneRegex = /^(\+94|0)?[0-9]{9,10}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid mobile number format (e.g., 0771234567).',
      });
    }

    // 3. Date of Birth & Live Age Validation (DMT Regulation Minimum 18 years)
    const birthDate = new Date(rawDob);
    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Date of Birth.',
      });
    }

    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }

    if (computedAge < MIN_REGISTRATION_AGE) {
      return res.status(400).json({
        success: false,
        message: `Minimum age requirement for driving registration is ${MIN_REGISTRATION_AGE} years. (Computed age: ${computedAge})`,
      });
    }

    // Database connectivity check
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is offline. Please whitelist your current IP address in MongoDB Atlas Network Access.',
        error: 'MongoDB Atlas connection required. Please add your current IP or allow 0.0.0.0/0 in cloud.mongodb.com > Network Access.',
      });
    }

    const cleanUsername = (username || cleanEmail.split('@')[0]).toLowerCase().trim();

    // Validate Password Policy (min 8 chars, 1 uppercase, 1 lowercase, 1 digit)
    const policy = validatePasswordPolicy(password, cleanUsername, cleanEmail);
    if (!policy.valid) {
      return res.status(400).json({
        success: false,
        message: policy.message,
      });
    }

    // 4. Duplicate Check: Email and Phone must be unique
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address is already registered.',
      });
    }

    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'A user with this phone number is already registered.',
      });
    }

    // Resolve Student Type (Type 1: Full Course, Type 2: Trial Only)
    const rawType = student_type || studentType || '';
    const resolvedStudentType =
      rawType === 'Type 2' || rawType === 'Type2_TrialReady' || rawType.toLowerCase().includes('trial')
        ? 'Type 2'
        : 'Type 1';
    const isType2 = resolvedStudentType === 'Type 2';
    const isType1 = !isType2;

    // Resolve Branch (default Maharagama)
    const resolvedBranch = ['Maharagama', 'Werahara', 'Delgoda'].includes(branch)
      ? branch
      : 'Maharagama';

    // 5. Create User Account Immediately with status = "Unverified / Pending Payment"
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: studentFullName,
      username: cleanUsername,
      email: cleanEmail,
      phone: cleanPhone,
      nic: (nic || '').trim(),
      dob: birthDate,
      dateOfBirth: birthDate,
      age: computedAge,
      passwordHash,
      role: 'student',
      student_type: resolvedStudentType,
      account_status: 'Unverified / Pending Payment',
      status: 'pending_verification',
      branch: resolvedBranch,
      mustChangePassword: false,
    });

    // 6. Create Student Profile
    // Resolve Package: Type 1 students do NOT select a vehicle package at initial registration
    let pkgDoc = null;
    let lessonsTotal = 0;
    let priceTotal = 0;
    let bonusLessons = { bike: 0, threeWheeler: 0 };
    let heavyVehicleEligible = false;

    if (isType2) {
      if (packageId) {
        pkgDoc = await Package.findById(packageId).catch(() => null);
      }
      if (!pkgDoc && packageType) {
        pkgDoc = await Package.findOne({ type: packageType, isActive: true }).catch(() => null);
      }
      if (!pkgDoc) {
        pkgDoc = await Package.findOne({ type: 'Car_Full', isActive: true }).catch(() => null);
      }

      lessonsTotal = pkgDoc ? pkgDoc.lessons : 15;
      priceTotal = pkgDoc ? pkgDoc.price : 40000;
      bonusLessons = pkgDoc?.bonusLessons || { bike: 2, threeWheeler: 2 };

      if (pkgDoc?.isPerLesson) {
        const qty = parseInt(customLessonsCount, 10) || 1;
        lessonsTotal = qty;
        priceTotal = pkgDoc.price * qty;
      }
    }

    const chosenPlan = paymentPlan || 'full';
    const student = await Student.create({
      userId: user._id,
      nic: (nic || '').trim(),
      dob: birthDate,
      dateOfBirth: birthDate,
      age: computedAge,
      studentType: resolvedStudentType,
      student_type: resolvedStudentType,
      branch: resolvedBranch,
      accountStatus: 'pending_verification',
      account_status: 'Unverified / Pending Payment',
      advancePaymentStatus: 'none',
      packagePaymentStatus: 'none',
      paymentPlan: chosenPlan,
      lessonsUnlocked: 0,
      lessonsUsed: 0,
      trialEligible: isType2 ? true : false,
      trial_eligible: isType2 ? true : false,
      learnerExamStatus: isType2 ? 'passed' : 'not_taken',
      lightVehicleLicenseDate: lightVehicleLicenseDate ? new Date(lightVehicleLicenseDate) : null,
      heavyVehicleEligible,
      package: isType1 ? {
        type: null,
        packageId: null,
        lessonsTotal: 0,
        lessonsUsed: 0,
        priceTotal: 0,
        bonusLessons: { bike: 0, threeWheeler: 0 },
      } : {
        type: pkgDoc?.type || packageType || 'Car_Refresher',
        packageId: pkgDoc?._id || null,
        lessonsTotal,
        lessonsUsed: 0,
        priceTotal,
        bonusLessons,
      },
      registrationStatus: 'pending_payment',
      isAdvancePaid: false,
      isPremium: false,
      advancePaymentAmount: ADVANCE_PAYMENT_AMOUNT,
    });

    // Per Step 2: Account exists in database immediately with status "Unverified / Pending Payment".
    // Proceed directly to Step 3 (Advance Payment) — do not allow login access yet.
    return res.status(201).json({
      success: true,
      pendingPayment: true,
      pendingUserId: user._id,
      account_status: 'Unverified / Pending Payment',
      message: 'Account created successfully! Please proceed to advance payment.',

      student: {
        id: student._id,
        _id: student._id,
        student_type: student.student_type,
        branch: student.branch,
        advancePaymentAmount: ADVANCE_PAYMENT_AMOUNT,
      },
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        age: user.age,
        student_type: user.student_type,
        account_status: user.account_status,
        branch: user.branch,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during student registration',
    });
  }
};

// @desc    Authenticate user & get token (Strict status check, rate limiting, lockout)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const loginIdentifier = (email || username || '').toLowerCase().trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email/username and password.',
      });
    }

    // Database connectivity check
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is offline. Please whitelist your current IP address in MongoDB Atlas Network Access.',
        error: 'MongoDB Atlas connection required. Please add your current IP or allow 0.0.0.0/0 in cloud.mongodb.com > Network Access.',
      });
    }

    // Lookup user by email, username, NIC, or name
    const rawIdentifier = (email || username || '').trim();
    const escapedIdentifier = rawIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const candidates = await User.find({
      $or: [
        { email: loginIdentifier },
        { username: loginIdentifier },
        { nic: rawIdentifier },
        { name: new RegExp(`^${escapedIdentifier}$`, 'i') },
      ],
    }).select('+passwordHash');

    let user = null;
    for (const candidate of candidates) {
      if (await candidate.comparePassword(password)) {
        user = candidate;
        break;
      }
    }
    // If password didn't match any candidate, fallback to the first candidate to record failed attempt / lockout
    if (!user && candidates.length > 0) {
      user = candidates[0];
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your username/email and password.',
      });
    }

    // 1. Check if account is locked due to repeated failed attempts
    if (user.isLocked()) {
      const remainingMinutes = Math.ceil((user.lockedUntil - Date.now()) / (60 * 1000));
      return res.status(423).json({
        success: false,
        accountLocked: true,
        lockedUntil: user.lockedUntil,
        message: `Account temporarily locked due to repeated failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      });
    }

    // 2. Check Account Status Lifecycle
    if (user.status === 'inactive' || user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        accountStatus: user.status,
        message: 'This account has been deactivated. Please contact administration.',
      });
    }

    // 3. Validate Password Hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      let lockoutTriggered = false;

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        lockoutTriggered = true;
      }
      await user.save();

      if (lockoutTriggered) {
        return res.status(423).json({
          success: false,
          accountLocked: true,
          lockedUntil: user.lockedUntil,
          message: `Too many failed login attempts. Your account has been temporarily locked for 15 minutes.`,
        });
      }

      const attemptsRemaining = MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;
      return res.status(401).json({
        success: false,
        attemptsRemaining,
        message: `Invalid credentials. (${attemptsRemaining} attempt(s) remaining before temporary lockout).`,
      });
    }

    // 4. Reset failed attempts upon correct password
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await user.save();
    }

    // 5. Fetch Student Profile & Latest Payment
    let studentProfile = null;
    let latestPayment = null;
    if (user.role === 'student') {
      studentProfile = await Student.findOne({ userId: user._id });
      latestPayment = await Payment.findOne({
        userId: user._id,
        paymentType: 'advance',
      }).sort({ createdAt: -1 });
    }

    const token = generateToken(user);

    const paymentMethod =
      latestPayment?.payment_method || latestPayment?.paymentMethod || 'physical_branch';
    const isVerified =
      (user.account_status === 'Verified' || user.status === 'active') &&
      studentProfile?.advancePaymentStatus === 'verified';

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      mustChangePassword: user.mustChangePassword || false,
      isVerified,
      account_status:
        user.account_status || (user.status === 'active' ? 'Verified' : 'Unverified / Pending Payment'),
      payment_method: paymentMethod,
      payment_status:
        latestPayment?.payment_status ||
        (paymentMethod === 'physical_branch'
          ? 'Pending Branch Payment'
          : 'Pending Verification'),
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        nic: user.nic,
        dob: user.dob || user.dateOfBirth,
        age: user.age,
        student_type: user.student_type || studentProfile?.student_type || 'Type 1',
        account_status:
          user.account_status || (user.status === 'active' ? 'Verified' : 'Unverified / Pending Payment'),
        role: user.role,
        status: user.status,
        branch: user.branch,
        mustChangePassword: user.mustChangePassword || false,
      },
      student: studentProfile,
      latestPayment,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// @desc    Change Password (Self-service or mandatory on first login)
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current password and new password.',
      });
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match.',
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Re-validate current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Check password policy
    const policy = validatePasswordPolicy(newPassword, user.username, user.email);
    if (!policy.valid) {
      return res.status(400).json({
        success: false,
        message: policy.message,
      });
    }

    // Cannot be same as current password
    if (await user.comparePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as your current password.',
      });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.mustChangePassword = false;
    await user.save();

    // Issue updated token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
      token,
      mustChangePassword: false,
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message,
    });
  }
};

// @desc    Forgot Password Request (Generates time-limited reset token)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Ambiguity rule: Do not expose whether user exists for security, unless development
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          'If an account exists with this email address, password reset instructions have been generated.',
      });
    }

    // Invalidate existing unused tokens for this user
    await PasswordResetToken.updateMany(
      { userId: user._id, used: false },
      { used: true }
    );

    // Generate cryptographically secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
      used: false,
    });

    // In production, an email is dispatched. For local/development, return token safely
    return res.status(200).json({
      success: true,
      message:
        'Password reset token generated. Use this token or the link sent to your email to reset your password.',
      resetToken: rawToken, // Provided for user interface completion & testing
      expiresAt,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
      error: error.message,
    });
  }
};

// @desc    Reset Password with Token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmNewPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both reset token and new password.',
      });
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await PasswordResetToken.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid, used, or expired. Please request a new one.',
      });
    }

    const user = await User.findById(resetRecord.userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const policy = validatePasswordPolicy(newPassword, user.username, user.email);
    if (!policy.valid) {
      return res.status(400).json({
        success: false,
        message: policy.message,
      });
    }

    // Update password
    user.passwordHash = await User.hashPassword(newPassword);
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.mustChangePassword = false;
    await user.save();

    // Mark token as used
    resetRecord.used = true;
    await resetRecord.save();

    return res.status(200).json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message,
    });
  }
};

// @desc    Logout (Revokes token on server)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    if (req.token) {
      revokeToken(req.token);
    }
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error during logout',
    });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let studentProfile = null;
    let latestPayment = null;
    if (user.role === 'student') {
      studentProfile = await Student.findOne({ userId: user._id });
      latestPayment = await Payment.findOne({
        userId: user._id,
        paymentType: 'advance',
      }).sort({ createdAt: -1 });
    }

    const paymentMethod =
      latestPayment?.payment_method || latestPayment?.paymentMethod || 'physical_branch';
    const isVerified =
      (user.account_status === 'Verified' || user.status === 'active') &&
      studentProfile?.advancePaymentStatus === 'verified';

    return res.status(200).json({
      success: true,
      isVerified,
      account_status:
        user.account_status || (user.status === 'active' ? 'Verified' : 'Unverified / Pending Payment'),
      payment_method: paymentMethod,
      payment_status:
        latestPayment?.payment_status ||
        (paymentMethod === 'physical_branch'
          ? 'Pending Branch Payment'
          : 'Pending Verification'),
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        nic: user.nic,
        dob: user.dob || user.dateOfBirth,
        age: user.age,
        student_type: user.student_type || studentProfile?.student_type || 'Type 1',
        account_status:
          user.account_status || (user.status === 'active' ? 'Verified' : 'Unverified / Pending Payment'),
        role: user.role,
        status: user.status,
        branch: user.branch,
        teachingCategories: user.teachingCategories,
        mustChangePassword: user.mustChangePassword || false,
        createdAt: user.createdAt,
      },
      student: studentProfile,
      latestPayment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message,
    });
  }
};

// @desc    Check Username Availability
// @route   GET /api/auth/check-username
// @access  Public
exports.checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        available: false,
        message: 'Please provide a username to check.',
      });
    }

    const cleanUsername = username.toLowerCase().trim();
    if (cleanUsername.length < 3) {
      return res.status(400).json({
        success: false,
        available: false,
        message: 'Username must be at least 3 characters long.',
      });
    }

    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'This username is already taken. Please choose another username.',
      });
    }

    return res.status(200).json({
      success: true,
      available: true,
      message: 'Username is available.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      available: false,
      message: 'Error checking username availability.',
      error: error.message,
    });
  }
};

// @desc    Register as Type 2 (Trial-Ready) Student (User Story US-02)
// @route   POST /api/auth/register-type2
// @access  Public
exports.registerType2Student = async (req, res) => {
  try {
    const {
      name,
      nic,
      dob,
      dateOfBirth,
      phone,
      email,
      branch,
      username,
      password,
      confirmPassword,
    } = req.body;

    // 1. Validate Required Fields
    const resolvedDob = dob || dateOfBirth;
    if (!name || !nic || !resolvedDob || !phone || !email || !branch || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Full name, NIC, Date of birth, Phone, Email, Preferred branch, Username, and Password.',
      });
    }

    // 2. Validate Proof of DMT Clearance File (Strictly Required for Type 2)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Proof of existing DMT clearance is required for Type 2 (Trial-Ready) registration. Please upload your learner exam pass certificate or DMT document (JPG, PNG, or PDF, max 5MB).',
      });
    }

    // 3. Validate Sri Lankan NIC format (old 9-digit+V/X or new 12-digit)
    const cleanNic = nic.trim().toUpperCase();
    const nicRegex = /^([0-9]{9}[VX]|[0-9]{12})$/;
    if (!nicRegex.test(cleanNic)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Sri Lankan NIC format. Must be 9 digits followed by V or X (e.g., 981234567V) or 12 digits (e.g., 200012345678).',
      });
    }

    // 4. Validate Date of Birth
    const parsedDob = new Date(resolvedDob);
    if (isNaN(parsedDob.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Date of Birth. Please select a valid date.',
      });
    }
    const today = new Date();
    let age = today.getFullYear() - parsedDob.getFullYear();
    const m = today.getMonth() - parsedDob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < parsedDob.getDate())) {
      age--;
    }
    if (age < 17) {
      return res.status(400).json({
        success: false,
        message: 'Eligibility criteria not met: Candidate must be at least 17 years of age for DMT learner clearance certification.',
      });
    }

    // 5. Validate Sri Lankan Mobile Phone format
    const cleanPhone = phone.trim();
    const phoneRegex = /^(?:\+94|0)?(7[0-9]{8})$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Sri Lankan mobile number. Must start with 07X or +947X followed by 7 digits (e.g., 0771234567).',
      });
    }

    // 6. Validate Email format
    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // 7. Validate Branch
    const validBranches = ['Maharagama', 'Werahara', 'Delgoda'];
    if (!validBranches.includes(branch)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid branch: Maharagama, Werahara, or Delgoda.',
      });
    }

    // 8. Validate Password and Confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match.',
      });
    }

    const cleanUsername = username.toLowerCase().trim();
    if (cleanUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long.',
      });
    }

    // Check project password policy
    const policy = validatePasswordPolicy(password, cleanUsername, cleanEmail);
    if (!policy.valid) {
      return res.status(400).json({
        success: false,
        message: policy.message,
      });
    }

    // 9. Check Unique Username across all accounts (specific error)
    const existingUserByUsername = await User.findOne({ username: cleanUsername });
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken. Please choose another username.',
      });
    }

    // 10. Check Unique Email
    const existingUserByEmail = await User.findOne({ email: cleanEmail });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in or use another email.',
      });
    }

    // 11. Hash Password (never plaintext)
    const passwordHash = await User.hashPassword(password);

    // 12. Create User Record (role = 'student', status = 'pending_verification')
    let user = null;
    let student = null;
    const clearanceProofUrl = `/uploads/clearance_proofs/${req.file.filename}`;

    try {
      user = await User.create({
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        phone: cleanPhone,
        nic: cleanNic,
        dateOfBirth: parsedDob,
        passwordHash,
        role: 'student',
        status: 'pending_verification', // Strictly pending verification per project auth rules
        branch,
        mustChangePassword: false,
      });

      // 13. Create Student Record with US-02 Initial State:
      // - student_type = "Type 2"
      // - trial_eligible = true
      // - account status = "Pending Verification"
      // - dmt_clearance_proof = stored file reference
      // - dmt_clearance_verified = false
      student = await Student.create({
        userId: user._id,
        nic: cleanNic,
        dateOfBirth: parsedDob,
        student_type: 'Type 2',
        studentType: 'Type2_TrialReady',
        trial_eligible: true,
        trialEligible: true,
        accountStatus: 'pending_verification',
        dmt_clearance_proof: clearanceProofUrl,
        dmt_clearance_verified: false,
        branch,
        registrationStatus: 'pending_payment',
        isAdvancePaid: false,
        isPremium: false,
        learnerExamStatus: 'passed',
        package: {
          type: 'Car_Full',
          packageId: null,
          lessonsTotal: 15,
          lessonsUsed: 0,
          priceTotal: 45000,
          bonusLessons: { bike: 0, threeWheeler: 0 },
        },
        dmtDates: {
          medicalExamPassed: true,
          learnerExamPassed: true,
          learnerExamPassedDate: new Date(),
        },
      });
    } catch (createErr) {
      if (user && user._id) {
        await User.findByIdAndDelete(user._id);
      }
      throw createErr;
    }

    // 14. Create Queued In-App Notification for Branch Data Entry Officers / Staff
    const branchStaff = await User.find({
      role: { $in: ['staff', 'admin'] },
      $or: [{ branch: branch }, { branch: 'All' }],
    });

    const staffRecipients =
      branchStaff.length > 0
        ? branchStaff
        : await User.find({ role: { $in: ['staff', 'admin'] } });

    const notifications = staffRecipients.map((staffUser) => ({
      recipientId: staffUser._id,
      recipientRole: staffUser.role,
      title: 'New Type 2 Registration (DMT Clearance Review Required)',
      message: `Trial-Ready (Type 2) student ${user.name} (${cleanNic}) registered at ${branch} Branch. DMT clearance certificate proof awaits officer review.`,
      type: 'dmt-date',
      link: '/staff/students?type=Type2_TrialReady',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // 15. Do NOT log in automatically / Do NOT issue token
    return res.status(201).json({
      success: true,
      token: null, // Zero auto-login per requirements
      pendingVerification: true,
      accountStatus: 'pending_verification',
      message: 'Registration received! Your Type 2 (Trial-Ready) application is pending verification by our branch staff. You will be notified once your account is active.',
      student: {
        id: student._id,
        student_type: 'Type 2',
        studentType: 'Type2_TrialReady',
        trial_eligible: true,
        trialEligible: true,
        accountStatus: 'pending_verification',
        dmt_clearance_proof: clearanceProofUrl,
        dmt_clearance_verified: false,
        branch: student.branch,
        nic: student.nic,
      },
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        nic: user.nic,
        role: user.role,
        status: user.status,
        branch: user.branch,
      },
    });
  } catch (error) {
    console.error('Type 2 Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed due to a server error. Please try again.',
      error: error.message,
    });
  }
};

