const User = require('../models/User');
const Student = require('../models/Student');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const QuizAttempt = require('../models/QuizAttempt');
const PasswordResetToken = require('../models/PasswordResetToken');
const Notification = require('../models/Notification');

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
          (u.name && u.name.toLowerCase().includes(s)) ||
          (u.email && u.email.toLowerCase().includes(s)) ||
          (u.username && u.username.toLowerCase().includes(s)) ||
          (u.nic && u.nic.toLowerCase().includes(s)) ||
          (u.phone && u.phone.includes(s))
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
      account_status: 'Verified',
      mustChangePassword: true, // Must change password on first login
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: `Staff (Data Entry Officer) account '${cleanUsername}' created successfully. Forced password change is set for their first login.`,
      user: {
        _id: newStaff._id,
        id: newStaff._id,
        name: newStaff.name,
        username: newStaff.username,
        email: newStaff.email,
        phone: newStaff.phone,
        nic: newStaff.nic,
        role: newStaff.role,
        branch: newStaff.branch,
        status: newStaff.status,
        account_status: newStaff.account_status,
        mustChangePassword: newStaff.mustChangePassword,
        createdAt: newStaff.createdAt,
        updatedAt: newStaff.updatedAt,
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
      account_status: 'Verified',
      mustChangePassword: true, // Force change on first login
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: `Instructor account '${cleanUsername}' created successfully. Forced password change is set for their first login.`,
      user: {
        _id: newInstructor._id,
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
        account_status: newInstructor.account_status,
        mustChangePassword: newInstructor.mustChangePassword,
        createdAt: newInstructor.createdAt,
        updatedAt: newInstructor.updatedAt,
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

// @desc    Admin creates any user account (Staff, Instructor, Student, Admin)
// @route   POST /api/admin/accounts or POST /api/admin/accounts/user or POST /api/admin/users
// @access  Admin only
exports.createUserAccount = async (req, res) => {
  try {
    const {
      name,
      nic,
      phone,
      branch = 'Maharagama',
      role = 'staff',
      username,
      email,
      initialPassword,
      password,
      vehicleCategories,
      teachingCategories,
      dob,
      dateOfBirth,
      studentType = 'Type 1',
    } = req.body;

    const pwd = initialPassword || password;

    if (!name || !nic || !phone || !branch || !username || !pwd) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: Full name, NIC, phone number, branch, username, and initial password.',
      });
    }

    const validRoles = ['staff', 'instructor', 'student', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    const cleanUsername = username.toLowerCase().trim();
    const defaultDomain = role === 'student' ? '@gmail.com' : '@sithma.lk';
    const cleanEmail = (email || `${cleanUsername}${defaultDomain}`).toLowerCase().trim();

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
    const policy = validatePasswordPolicy(pwd, cleanUsername, cleanEmail);
    if (!policy.valid) {
      return res.status(400).json({ success: false, message: policy.message });
    }

    const resolvedCategories = vehicleCategories || teachingCategories || 'Light';
    const passwordHash = await User.hashPassword(pwd);

    const birthDate = (dob || dateOfBirth) ? new Date(dob || dateOfBirth) : null;
    let computedAge = null;
    if (birthDate && !isNaN(birthDate.getTime())) {
      const today = new Date();
      computedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        computedAge--;
      }
    }

    const newUser = await User.create({
      name: name.trim(),
      nic: nic.trim(),
      phone: phone.trim(),
      branch,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      role,
      status: 'active',
      account_status: 'Verified',
      teachingCategories: role === 'instructor' ? resolvedCategories : undefined,
      dateOfBirth: birthDate,
      dob: birthDate,
      age: computedAge,
      student_type: role === 'student' ? (studentType === 'Type 2' ? 'Type 2' : 'Type 1') : undefined,
      mustChangePassword: role !== 'student',
      createdBy: req.user._id,
    });

    let createdStudent = null;
    if (role === 'student') {
      const isType2 = studentType === 'Type 2' || studentType === 'Type2_TrialReady';
      createdStudent = await Student.create({
        userId: newUser._id,
        name: newUser.name,
        studentName: newUser.name,
        email: cleanEmail,
        phone: phone.trim(),
        nic: nic.trim(),
        dob: birthDate,
        dateOfBirth: birthDate,
        age: computedAge,
        studentType: isType2 ? 'Type2_TrialReady' : 'Type1_NewLearner',
        student_type: isType2 ? 'Type 2' : 'Type 1',
        branch,
        registrationStatus: 'registered',
        accountStatus: 'active',
        account_status: 'Verified',
        advancePaymentStatus: 'verified',
        isAdvancePaid: true,
        isPremium: true,
        trialEligible: isType2,
        createdBy: req.user._id,
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
      });
    }

    return res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account '${cleanUsername}' created and saved to database successfully.`,
      user: {
        _id: newUser._id,
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        nic: newUser.nic,
        role: newUser.role,
        branch: newUser.branch,
        status: newUser.status,
        account_status: newUser.account_status,
        teachingCategories: newUser.teachingCategories,
        mustChangePassword: newUser.mustChangePassword,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
      student: createdStudent,
    });
  } catch (error) {
    console.error('Create user account error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user account in database',
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
    if (status === 'inactive' || status === 'suspended') {
      user.account_status = 'Deactivated';
    } else if (status === 'active') {
      user.account_status = 'Verified';
    }
    await user.save();

    // Synchronize Student record if this user has one
    await Student.updateMany(
      { userId: user._id },
      {
        $set: {
          accountStatus: status === 'active' ? 'active' : 'inactive',
          account_status: status === 'active' ? 'Verified' : 'Deactivated',
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: `Account status updated to '${status}'.`,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        account_status: user.account_status,
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

// @desc    Admin permanently deletes an account (Student, Staff, Instructor)
// @route   DELETE /api/admin/accounts/:id
// @access  Admin only
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be deleted.',
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    // Cascade delete student-related documents
    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        await Booking.deleteMany({ studentId: student._id });
        await Payment.deleteMany({ $or: [{ studentId: student._id }, { userId: user._id }] });
        await QuizAttempt.deleteMany({ $or: [{ studentId: student._id }, { userId: user._id }] });
        await Student.findByIdAndDelete(student._id);
      } else {
        await Student.deleteMany({ userId: user._id });
      }
    }

    // Delete password reset tokens and notifications
    await PasswordResetToken.deleteMany({ userId: user._id });
    await Notification.deleteMany({ userId: user._id });

    // Delete the user record
    await User.findByIdAndDelete(user._id);

    return res.status(200).json({
      success: true,
      message: `Account for ${user.name} (${user.role}) has been permanently deleted.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message,
    });
  }
};

// @desc    Admin verifies a student account
// @route   PATCH /api/admin/students/:id/verify or PATCH /api/admin/accounts/:id/verify-student
// @access  Admin only
exports.verifyStudentAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'Verified' } = req.body;

    // Resolve student and user
    let student = await Student.findById(id);
    let user = null;

    if (student) {
      user = await User.findById(student.userId);
    } else {
      user = await User.findById(id);
      if (user) {
        student = await Student.findOne({ userId: user._id });
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found.',
      });
    }

    const nextStatus = status === 'Verified' ? 'Verified' : 'Pending Verification';
    const isNowVerified = nextStatus === 'Verified';

    user.verificationStatus = nextStatus;
    if (isNowVerified) {
      user.account_status = 'Verified';
      user.status = 'active';
      user.verifiedBy = req.user._id;
      user.verifiedAt = new Date();
    } else {
      user.account_status = 'Unverified / Pending Payment';
      user.status = 'pending_verification';
      user.verifiedBy = null;
      user.verifiedAt = null;
    }
    await user.save();

    if (student) {
      student.verificationStatus = nextStatus;
      if (isNowVerified) {
        student.account_status = 'Verified';
        student.accountStatus = 'active';
        student.verifiedBy = req.user._id;
        student.verifiedAt = new Date();
      } else {
        student.account_status = 'Unverified / Pending Payment';
        student.accountStatus = 'pending_verification';
        student.verifiedBy = null;
        student.verifiedAt = null;
      }
      await student.save();
    }

    // Create system notification for student
    if (isNowVerified) {
      try {
        await Notification.create({
          recipientId: user._id,
          recipientRole: 'student',
          title: 'Account Verified by Admin',
          message:
            'Your student account has been approved and verified by the Admin. You now have full access to your student portal.',
          type: 'system',
          read: false,
          createdAt: new Date(),
        });
      } catch (notifErr) {
        console.warn('Could not create verification notification:', notifErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Student account for ${user.name} has been successfully ${isNowVerified ? 'verified' : 'marked as Pending Verification'}.`,
      verificationStatus: nextStatus,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        verificationStatus: user.verificationStatus,
        account_status: user.account_status,
        status: user.status,
      },
      student: student
        ? {
            _id: student._id,
            name: student.name,
            verificationStatus: student.verificationStatus,
            account_status: student.account_status,
          }
        : null,
    });
  } catch (error) {
    console.error('Error verifying student account:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update student verification status',
      error: error.message,
    });
  }
};

// @desc    Admin updates user account details
// @route   PUT /api/admin/accounts/:id or PATCH /api/admin/accounts/:id
// @access  Admin only
exports.updateUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    const {
      name,
      username,
      email,
      phone,
      nic,
      branch,
      role,
      status,
      account_status,
      teachingCategories,
      studentType,
      student_type,
      dob,
      dateOfBirth,
    } = req.body;

    // Check unique username if changing
    if (username && username.toLowerCase().trim() !== (user.username || '').toLowerCase()) {
      const cleanUsername = username.toLowerCase().trim();
      const existingUser = await User.findOne({ username: cleanUsername, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken by another account.',
        });
      }
      user.username = cleanUsername;
    }

    // Check unique email if changing
    if (email && email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const cleanEmail = email.toLowerCase().trim();
      const existingEmail = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already registered to another account.',
        });
      }
      user.email = cleanEmail;
    }

    if (name && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (nic !== undefined) user.nic = nic.trim();
    if (branch && ['Maharagama', 'Werahara', 'Delgoda', 'All'].includes(branch)) {
      user.branch = branch;
    }

    // Role check: prevent removing admin status from oneself
    if (role && ['staff', 'instructor', 'student', 'admin'].includes(role)) {
      if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'You cannot remove administrative privileges from your own account.',
        });
      }
      user.role = role;
    }

    if (status && ['active', 'inactive', 'pending_verification', 'suspended', 'cancelled'].includes(status)) {
      user.status = status;
      if (status === 'active' && (!account_status || account_status === 'Deactivated')) {
        user.account_status = 'Verified';
      } else if ((status === 'inactive' || status === 'suspended') && (!account_status || account_status === 'Verified')) {
        user.account_status = 'Deactivated';
      }
    }

    if (account_status && ['Unverified / Pending Payment', 'Verified', 'Deactivated', 'Cancelled'].includes(account_status)) {
      user.account_status = account_status;
    }

    if (teachingCategories && ['Light', 'Heavy', 'Both'].includes(teachingCategories)) {
      user.teachingCategories = teachingCategories;
    }

    const resolvedStudentType = studentType || student_type;
    if (resolvedStudentType) {
      const normalized = (resolvedStudentType === 'Type 2' || resolvedStudentType === 'Type2_TrialReady') ? 'Type 2' : 'Type 1';
      user.student_type = normalized;
    }

    const birthDateVal = dob || dateOfBirth;
    if (birthDateVal) {
      const parsedDob = new Date(birthDateVal);
      if (!isNaN(parsedDob.getTime())) {
        user.dob = parsedDob;
        user.dateOfBirth = parsedDob;
        const today = new Date();
        let computedAge = today.getFullYear() - parsedDob.getFullYear();
        const monthDiff = today.getMonth() - parsedDob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDob.getDate())) {
          computedAge--;
        }
        user.age = computedAge >= 0 ? computedAge : null;
      }
    }

    await user.save();

    // Cascading sync to Student record if role is student or student record exists
    let syncedStudent = null;
    const existingStudent = await Student.findOne({ userId: user._id });
    if (existingStudent) {
      existingStudent.name = user.name;
      existingStudent.studentName = user.name;
      existingStudent.email = user.email;
      existingStudent.phone = user.phone;
      existingStudent.nic = user.nic;
      if (user.branch && user.branch !== 'All') {
        existingStudent.branch = user.branch;
      }
      if (user.dob) {
        existingStudent.dob = user.dob;
        existingStudent.dateOfBirth = user.dateOfBirth;
        existingStudent.age = user.age;
      }
      if (resolvedStudentType) {
        existingStudent.student_type = (resolvedStudentType === 'Type 2' || resolvedStudentType === 'Type2_TrialReady') ? 'Type 2' : 'Type 1';
        existingStudent.studentType = (resolvedStudentType === 'Type 2' || resolvedStudentType === 'Type2_TrialReady') ? 'Type2_TrialReady' : 'Type1_NewLearner';
      }
      if (user.status) {
        existingStudent.accountStatus = user.status;
      }
      if (user.account_status) {
        existingStudent.account_status = user.account_status;
      }
      await existingStudent.save();
      syncedStudent = existingStudent;
    }

    return res.status(200).json({
      success: true,
      message: `User account '${user.name}' updated successfully in database.`,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        nic: user.nic,
        branch: user.branch,
        role: user.role,
        status: user.status,
        account_status: user.account_status,
        teachingCategories: user.teachingCategories,
        student_type: user.student_type,
        dob: user.dob,
        dateOfBirth: user.dateOfBirth,
        age: user.age,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      student: syncedStudent,
    });
  } catch (error) {
    console.error('Update user account error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user account in database',
    });
  }
};
