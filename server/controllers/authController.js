const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Package = require('../models/Package');

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      branch: user.branch,
    },
    process.env.JWT_SECRET || 'sithma_super_secret_jwt_key_2026_ispm',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new student (Self-Registration)
// @route   POST /api/auth/register
// @access  Public
exports.registerStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      branch,
      studentType,
      packageType,
      customLessonsCount,
      lightVehicleLicenseDate,
    } = req.body;

    // 1. Validation
    if (!name || !email || !phone || !password || !branch || !packageType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, password, branch, packageType',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address is already registered',
      });
    }

    // 2. Resolve Package & Pricing
    let lessonsTotal = 15;
    let priceTotal = 45000;
    let bonusLessons = { bike: 0, threeWheeler: 0 };
    let heavyVehicleEligible = false;

    // Check Heavy Vehicle eligibility
    if (packageType === 'HeavyVehicle_Bus') {
      if (!lightVehicleLicenseDate) {
        return res.status(400).json({
          success: false,
          message: 'Heavy Vehicle (Bus) package requires providing your Light Vehicle license date (must be held for 2+ years).',
        });
      }
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      if (new Date(lightVehicleLicenseDate) > twoYearsAgo) {
        return res.status(400).json({
          success: false,
          message: 'Eligibility criteria not met: You must hold a Light Vehicle license for at least 2 years before applying for Heavy Vehicle (Bus).',
        });
      }
      heavyVehicleEligible = true;
      lessonsTotal = 15;
      priceTotal = 65000;
    } else if (packageType === 'Car_Full') {
      lessonsTotal = 15;
      priceTotal = 45000;
      bonusLessons = { bike: 2, threeWheeler: 2 };
    } else if (packageType === 'Car_Refresher') {
      lessonsTotal = 6;
      priceTotal = 15000;
    } else if (packageType === 'Bike') {
      const qty = parseInt(customLessonsCount, 10) || 5;
      lessonsTotal = qty;
      priceTotal = qty * 850;
    } else if (packageType === 'ThreeWheeler') {
      const qty = parseInt(customLessonsCount, 10) || 5;
      lessonsTotal = qty;
      priceTotal = qty * 1000;
    }

    // 3. Create User Account
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      passwordHash,
      role: 'student',
      branch,
    });

    // 4. Create Student Profile
    const student = await Student.create({
      userId: user._id,
      studentType: studentType || 'Type1_NewLearner',
      branch,
      lightVehicleLicenseDate: lightVehicleLicenseDate ? new Date(lightVehicleLicenseDate) : null,
      heavyVehicleEligible,
      package: {
        type: packageType,
        lessonsTotal,
        lessonsUsed: 0,
        priceTotal,
        bonusLessons,
      },
      registrationStatus: 'pending_payment',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully. Please proceed to upload your payment slip.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branch: user.branch,
      },
      student,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// @desc    Register Staff or Instructor Account (Admin / Manager only)
// @route   POST /api/auth/register-staff
// @access  Admin / Protected
exports.registerStaff = async (req, res) => {
  try {
    const { name, email, phone, password, role, branch } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, password, role',
      });
    }

    if (!['staff', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: staff, instructor, admin',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      passwordHash,
      role,
      branch: branch || 'Maharagama',
    });

    return res.status(201).json({
      success: true,
      message: `${role.toUpperCase()} account created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branch: user.branch,
      },
    });
  } catch (error) {
    console.error('Staff registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during staff creation',
      error: error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await Student.findOne({ userId: user._id });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branch: user.branch,
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
        email: user.email,
        phone: user.phone,
        role: user.role,
        branch: user.branch,
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
