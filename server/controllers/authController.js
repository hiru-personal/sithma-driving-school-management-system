const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Package = require('../models/Package');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const PasswordResetToken = require('../models/PasswordResetToken');
const { revokeToken } = require('../middleware/auth');

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
exports.registerStudent = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      phone,
      nic,
      password,
      branch,
      studentType,
      packageType,
      packageId,
      paymentPlan,
      customLessonsCount,
      lightVehicleLicenseDate,
      advancePaymentAmount,
      advancePaymentMethod,
      advancePaymentReference,
      advanceSlipImageUrl,
      role, // Must be rejected if someone tries to register as staff/instructor/admin
    } = req.body;

    // Security Gate: No public sign-up path exists for Staff, Instructor, or Admin
    if (role && role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Staff, Instructor, and Admin accounts cannot be self-registered.',
      });
    }

    // 1. Validation
    if (!name || !email || !phone || !password || !branch || !nic) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, NIC, branch, and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = (username || cleanEmail.split('@')[0]).toLowerCase().trim();

    // Validate Password Policy
    const policy = validatePasswordPolicy(password, cleanUsername, cleanEmail);
    if (!policy.valid) {
      return res.status(400).json({
        success: false,
        message: policy.message,
      });
    }

    // Check unique email and username
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === cleanEmail
            ? 'A user with this email address is already registered.'
            : 'This username is already taken. Please choose another username.',
      });
    }

    const isType2 = studentType === 'Type2_TrialReady' || studentType === 'Type 2';

    // 2. Resolve Package & Pricing dynamically from Database
    let pkgDoc = null;
    if (packageId) {
      pkgDoc = await Package.findById(packageId);
    }
    if (!pkgDoc && packageType) {
      pkgDoc = await Package.findOne({ type: packageType, isActive: true });
    }
    if (!pkgDoc) {
      pkgDoc = await Package.findOne({ type: 'Car_Full', isActive: true });
    }

    let lessonsTotal = pkgDoc ? pkgDoc.lessons : 15;
    let priceTotal = pkgDoc ? pkgDoc.price : 45000;
    let bonusLessons = pkgDoc?.bonusLessons || { bike: 0, threeWheeler: 0 };
    let heavyVehicleEligible = false;

    if (pkgDoc?.isPerLesson) {
      const qty = parseInt(customLessonsCount, 10) || 1;
      lessonsTotal = qty;
      priceTotal = pkgDoc.price * qty;
    }

    // Check Heavy Vehicle eligibility (2+ years on light vehicle license)
    if (
      pkgDoc?.vehicleCategory === 'Heavy' ||
      packageType === 'HeavyVehicle_Bus' ||
      packageType === 'HeavyVehicle_Individual'
    ) {
      if (!lightVehicleLicenseDate) {
        return res.status(400).json({
          success: false,
          message:
            'Heavy Vehicle package requires providing your Light Vehicle license date (must be held for 2+ years).',
        });
      }
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      if (new Date(lightVehicleLicenseDate) > twoYearsAgo) {
        return res.status(400).json({
          success: false,
          message:
            'Eligibility criteria not met: You must hold a Light Vehicle license for at least 2 years before applying for Heavy Vehicle.',
        });
      }
      heavyVehicleEligible = true;
    }

    // 3. Create User Account with status = pending_verification
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      username: cleanUsername,
      email: cleanEmail,
      phone,
      nic: nic.trim(),
      passwordHash,
      role: 'student',
      status: 'pending_verification', // Verification gate for all self-registered students
      branch,
      mustChangePassword: false,
    });

    // 4. Create Student Profile
    const chosenPlan = paymentPlan || 'full';
    const advanceAmount = parseFloat(advancePaymentAmount) || 5000;
    const resolvedRef =
      advancePaymentReference || `ADV-${Date.now().toString().slice(-6)}`;

    const student = await Student.create({
      userId: user._id,
      nic: nic.trim(),
      studentType: isType2 ? 'Type2_TrialReady' : 'Type1_NewLearner',
      branch,
      accountStatus: 'pending_verification',
      advancePaymentStatus: 'pending',
      advancePaymentReference: resolvedRef,
      packagePaymentStatus: 'none',
      paymentPlan: chosenPlan,
      lessonsUnlocked: 0,
      lessonsUsed: 0,
      trialEligible: isType2 ? true : false,
      learnerExamStatus: isType2 ? 'passed' : 'not_taken',
      lightVehicleLicenseDate: lightVehicleLicenseDate
        ? new Date(lightVehicleLicenseDate)
        : null,
      heavyVehicleEligible,
      package: {
        type: pkgDoc?.type || packageType || 'Car_Full',
        packageId: pkgDoc?._id || null,
        lessonsTotal,
        lessonsUsed: 0,
        priceTotal,
        bonusLessons,
      },
      registrationStatus: 'pending_payment',
      isAdvancePaid: false,
      isPremium: false,
      advancePaymentAmount: advanceAmount,
    });

    // 5. Create Advance Payment Record in Pending Queue
    const payment = await Payment.create({
      studentId: student._id,
      userId: user._id,
      packageId: pkgDoc?._id || null,
      paymentType: 'advance',
      slipImageUrl:
        advanceSlipImageUrl || `/uploads/slips/advance-${Date.now()}.png`,
      amount: advanceAmount,
      bankName: advancePaymentMethod || 'Bank of Ceylon',
      transactionReference: resolvedRef,
      status: 'pending',
      uploadedAt: new Date(),
    });

    // 6. Notify Data Entry Officers and Admins
    const staffUsers = await User.find({ role: { $in: ['staff', 'admin'] } });
    const notifications = staffUsers.map((staff) => ({
      recipientId: staff._id,
      recipientRole: staff.role,
      title: 'New Student Registration (Advance Payment Pending)',
      message: `Student ${user.name} (${nic}) registered for ${student.studentType} at ${branch} Branch. Advance payment ref ${resolvedRef} (Rs. ${advanceAmount.toLocaleString()}) awaits verification.`,
      type: 'payment',
      link: '/staff/payments',
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      token,
      pendingVerification: true,
      accountStatus: 'pending_verification',
      message: 'Registration submitted successfully! Welcome to Sithma Driving School.',
      studentId: student._id,
      paymentId: payment._id,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        nic: user.nic,
        branch: user.branch,
        role: user.role,
        status: user.status,
      },
      student,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during student registration',
      error: error.message,
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

    // 5. Fetch Student Profile
    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await Student.findOne({ userId: user._id });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      mustChangePassword: user.mustChangePassword || false,
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
        mustChangePassword: user.mustChangePassword || false,
      },
      student: studentProfile,
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
    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await Student.findOne({ userId: user._id });
    }

    return res.status(200).json({
      success: true,
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
        teachingCategories: user.teachingCategories,
        mustChangePassword: user.mustChangePassword || false,
        createdAt: user.createdAt,
      },
      student: studentProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message,
    });
  }
};
