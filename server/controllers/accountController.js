const User = require('../models/User');

// Helper to validate strong password policy
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
  if (username && password.toLowerCase().includes(username.toLowerCase().trim())) {
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

// @desc    Get all staff, instructor, and admin accounts (Admin only)
// @route   GET /api/admin/accounts
// @access  Admin only
exports.getAllAccounts = async (req, res) => {
  try {
    const { role, status, branch, search } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;
    if (branch && branch !== 'All') query.branch = branch;

    let users = await User.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    if (search && search.trim() !== '') {
      const s = search.toLowerCase().trim();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.username && u.username.toLowerCase().includes(s)) ||
          (u.nic && u.nic.toLowerCase().includes(s))
      );
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve accounts',
      error: error.message,
    });
  }
};

// @desc    Admin creates a new Staff (Data Entry Officer) Account
// @route   POST /api/admin/accounts/staff
// @access  Admin only
exports.createStaffAccount = async (req, res) => {
  try {
    const { name, nic, phone, branch, username, initialPassword, email } = req.body;

    if (!name || !nic || !phone || !branch || !username || !initialPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: full name, NIC, contact phone, branch, username, initial password.',
      });
    }

    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = (email || `${cleanUsername}@sithma.lk`).toLowerCase().trim();

    // Check unique username & email
    const existing = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          existing.username === cleanUsername
            ? 'Username is already taken by another user.'
            : 'Email address is already registered in the system.',
      });
    }

    // Validate password policy
    const policy = validatePasswordPolicy(initialPassword, cleanUsername, cleanEmail);
    if (!policy.valid) {
      return res.status(400).json({ success: false, message: policy.message });
    }

    const passwordHash = await User.hashPassword(initialPassword);

    const newStaff = await User.create({
      name: name.trim(),
      nic: nic.trim(),
      phone: phone.trim(),
      branch,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      role: 'staff',
      status: 'active', // Active immediately per requirements
      mustChangePassword: true, // Must change password on first login
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: `Staff (Data Entry Officer) account '${cleanUsername}' created successfully. Forced password change is set for their first login.`,
      user: {
        id: newStaff._id,
        name: newStaff.name,
        username: newStaff.username,
        email: newStaff.email,
        phone: newStaff.phone,
        nic: newStaff.nic,
        role: newStaff.role,
        branch: newStaff.branch,
        status: newStaff.status,
        mustChangePassword: newStaff.mustChangePassword,
      },
    });
  } catch (error) {
    console.error('Create staff error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create staff account',
      error: error.message,
    });
  }
};

// @desc    Admin creates a new Instructor Account
// @route   POST /api/admin/accounts/instructor
// @access  Admin only
exports.createInstructorAccount = async (req, res) => {
  try {
    const { name, nic, phone, branch, vehicleCategories, username, initialPassword, email } = req.body;

    if (!name || !nic || !phone || !branch || !vehicleCategories || !username || !initialPassword) {
      return res.status(400).json({
        success: false,
        message:
          'All fields are required: full name, NIC, contact phone, branch, vehicle categories (Light/Heavy/Both), username, initial password.',
      });
    }

    if (!['Light', 'Heavy', 'Both'].includes(vehicleCategories)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle category. Must be one of: Light, Heavy, Both.',
      });
    }

    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = (email || `${cleanUsername}@sithma.lk`).toLowerCase().trim();

    // Check uniqueness
    const existing = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          existing.username === cleanUsername
            ? 'Username is already taken by another user.'
            : 'Email address is already registered in the system.',
      });
    }

    // Password policy
    const policy = validatePasswordPolicy(initialPassword, cleanUsername, cleanEmail);
    if (!policy.valid) {
      return res.status(400).json({ success: false, message: policy.message });
    }

    const passwordHash = await User.hashPassword(initialPassword);

    const newInstructor = await User.create({
      name: name.trim(),
      nic: nic.trim(),
      phone: phone.trim(),
      branch,
      teachingCategories: vehicleCategories,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      role: 'instructor',
      status: 'active', // Active immediately
      mustChangePassword: true, // Force change on first login
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: `Instructor account '${cleanUsername}' created successfully. Forced password change is set for their first login.`,
      user: {
        id: newInstructor._id,
        name: newInstructor.name,
        username: newInstructor.username,
        email: newInstructor.email,
        phone: newInstructor.phone,
        nic: newInstructor.nic,
        role: newInstructor.role,
        branch: newInstructor.branch,
        teachingCategories: newInstructor.teachingCategories,
        status: newInstructor.status,
        mustChangePassword: newInstructor.mustChangePassword,
      },
    });
  } catch (error) {
    console.error('Create instructor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create instructor account',
      error: error.message,
    });
  }
};

// @desc    Admin updates account status (Active / Inactive / Suspended)
// @route   PATCH /api/admin/accounts/:id/status
// @access  Admin only
exports.updateAccountStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, inactive, or suspended.',
      });
    }

    // Prevent Admin from deactivating self
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Account status updated to '${status}'.`,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update account status',
      error: error.message,
    });
  }
};

// @desc    Admin forces a password reset on any account
// @route   POST /api/admin/accounts/:id/reset-password
// @access  Admin only
exports.forceResetPassword = async (req, res) => {
  try {
    const { tempPassword } = req.body;

    if (!tempPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a temporary password for this user.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const policy = validatePasswordPolicy(tempPassword, user.username, user.email);
    if (!policy.valid) {
      return res.status(400).json({ success: false, message: policy.message });
    }

    user.passwordHash = await User.hashPassword(tempPassword);
    user.mustChangePassword = true; // Force user to change on next login
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Password for ${user.name} (${user.username || user.email}) has been reset. The user will be required to change their password on next login.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reset account password',
      error: error.message,
    });
  }
};
