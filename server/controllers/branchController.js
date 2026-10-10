const Branch = require('../models/Branch');
const User = require('../models/User');
const Student = require('../models/Student');
const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');

// @desc    Get all branches with search, filters, and assigned user counts
// @route   GET /api/branches
// @access  Admin, Staff
exports.getAllBranches = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && status !== 'all' && status !== 'All') {
      query.status = status;
    }

    let branches = await Branch.find(query).sort({ createdAt: -1 }).lean();

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      branches = branches.filter(
        (b) =>
          (b.name && b.name.toLowerCase().includes(q)) ||
          (b.code && b.code.toLowerCase().includes(q)) ||
          (b.address && b.address.toLowerCase().includes(q)) ||
          (b.contactPhone && b.contactPhone.toLowerCase().includes(q)) ||
          (b.email && b.email.toLowerCase().includes(q)) ||
          (b.manager && b.manager.toLowerCase().includes(q))
      );
    }

    // Attach student, instructor, and staff counts to each branch
    const branchesWithCounts = await Promise.all(
      branches.map(async (b) => {
        const [studentCount, instructorCount, staffCount] = await Promise.all([
          Student.countDocuments({ branch: b.name }),
          User.countDocuments({ branch: b.name, role: 'instructor' }),
          User.countDocuments({ branch: b.name, role: 'staff' }),
        ]);

        return {
          ...b,
          studentCount,
          instructorCount,
          staffCount,
          totalAssigned: studentCount + instructorCount + staffCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      branches: branchesWithCounts,
      total: branchesWithCounts.length,
    });
  } catch (error) {
    console.error('[BranchController] Error fetching branches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve branches from server.',
      error: error.message,
    });
  }
};

// @desc    Get active branches for public / registration / forms dropdowns
// @route   GET /api/branches/active
// @access  Public / Authenticated
exports.getActiveBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ status: 'Active' })
      .select('name code address contactPhone email manager status')
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      branches,
    });
  } catch (error) {
    console.error('[BranchController] Error fetching active branches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve active branches.',
      error: error.message,
    });
  }
};

// @desc    Get single branch by ID
// @route   GET /api/branches/:id
// @access  Admin, Staff
exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).lean();
    if (!branch) {
      return res.status(400).json({
        success: false,
        message: 'Branch not found.',
      });
    }

    const [studentCount, instructorCount, staffCount] = await Promise.all([
      Student.countDocuments({ branch: branch.name }),
      User.countDocuments({ branch: branch.name, role: 'instructor' }),
      User.countDocuments({ branch: branch.name, role: 'staff' }),
    ]);

    res.status(200).json({
      success: true,
      branch: {
        ...branch,
        studentCount,
        instructorCount,
        staffCount,
        totalAssigned: studentCount + instructorCount + staffCount,
      },
    });
  } catch (error) {
    console.error('[BranchController] Error fetching branch by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve branch details.',
      error: error.message,
    });
  }
};

// @desc    Create a new branch
// @route   POST /api/branches
// @access  Admin only
exports.createBranch = async (req, res) => {
  try {
    const { name, code, address, contactPhone, email = '', manager = '', status = 'Active' } = req.body;

    // 1. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Branch Name is required.' });
    }
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Branch Code is required.' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, message: 'Branch Address is required.' });
    }
    if (!contactPhone || !contactPhone.trim()) {
      return res.status(400).json({ success: false, message: 'Contact Number is required.' });
    }

    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase();

    // 2. Prevent duplicate Branch Code
    const existingCode = await Branch.findOne({ code: cleanCode });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: `Branch code "${cleanCode}" is already in use by "${existingCode.name}". Please enter a unique Branch Code.`,
      });
    }

    // 3. Prevent duplicate Branch Name
    const existingName = await Branch.findOne({
      name: { $regex: new RegExp(`^${cleanName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') },
    });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: `A branch named "${cleanName}" already exists. Please choose a different name.`,
      });
    }

    const branch = await Branch.create({
      name: cleanName,
      code: cleanCode,
      address: address.trim(),
      contactPhone: contactPhone.trim(),
      email: (email || '').trim().toLowerCase(),
      manager: (manager || '').trim(),
      status: status === 'Inactive' ? 'Inactive' : 'Active',
    });

    res.status(201).json({
      success: true,
      message: `Branch "${branch.name}" (${branch.code}) created successfully.`,
      branch,
    });
  } catch (error) {
    console.error('[BranchController] Error creating branch:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `Duplicate entry error: A branch with this ${field} already exists.`,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create branch.',
      error: error.message,
    });
  }
};

// @desc    Update branch details
// @route   PUT /api/branches/:id
// @access  Admin only
exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, address, contactPhone, email, manager, status } = req.body;

    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    const oldName = branch.name;
    const oldCode = branch.code;

    // 1. Validation
    if (name && !name.trim()) {
      return res.status(400).json({ success: false, message: 'Branch Name cannot be empty.' });
    }
    if (code && !code.trim()) {
      return res.status(400).json({ success: false, message: 'Branch Code cannot be empty.' });
    }
    if (address && !address.trim()) {
      return res.status(400).json({ success: false, message: 'Branch Address cannot be empty.' });
    }
    if (contactPhone && !contactPhone.trim()) {
      return res.status(400).json({ success: false, message: 'Contact Number cannot be empty.' });
    }

    const cleanName = name ? name.trim() : branch.name;
    const cleanCode = code ? code.trim().toUpperCase() : branch.code;

    // Check duplicate code if code changed
    if (cleanCode !== oldCode) {
      const existingCode = await Branch.findOne({ code: cleanCode, _id: { $ne: id } });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: `Branch code "${cleanCode}" is already in use by "${existingCode.name}".`,
        });
      }
    }

    // Check duplicate name if name changed
    if (cleanName.toLowerCase() !== oldName.toLowerCase()) {
      const existingName = await Branch.findOne({
        name: { $regex: new RegExp(`^${cleanName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') },
        _id: { $ne: id },
      });
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: `A branch named "${cleanName}" already exists.`,
        });
      }
    }

    // Update fields
    branch.name = cleanName;
    branch.code = cleanCode;
    if (address) branch.address = address.trim();
    if (contactPhone) branch.contactPhone = contactPhone.trim();
    if (email !== undefined) branch.email = email.trim().toLowerCase();
    if (manager !== undefined) branch.manager = manager.trim();
    if (status) branch.status = status === 'Inactive' ? 'Inactive' : 'Active';

    await branch.save();

    // If branch name changed, synchronize associated records
    if (cleanName !== oldName) {
      await Promise.all([
        Student.updateMany({ branch: oldName }, { branch: cleanName }),
        User.updateMany({ branch: oldName }, { branch: cleanName }),
        Booking.updateMany({ branch: oldName }, { branch: cleanName }),
        TimeSlot.updateMany({ branch: oldName }, { branch: cleanName }),
      ]);
    }

    res.status(200).json({
      success: true,
      message: `Branch "${branch.name}" updated successfully.`,
      branch,
    });
  } catch (error) {
    console.error('[BranchController] Error updating branch:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `Duplicate entry error: A branch with this ${field} already exists.`,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update branch.',
      error: error.message,
    });
  }
};

// @desc    Delete branch with safety rule (prevent if students or staff assigned)
// @route   DELETE /api/branches/:id
// @access  Admin only
exports.deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    // Check assigned students
    const studentCount = await Student.countDocuments({ branch: branch.name });
    // Check assigned staff & instructors
    const staffCount = await User.countDocuments({
      branch: branch.name,
      role: { $in: ['staff', 'instructor', 'admin'] },
    });

    const totalAssigned = studentCount + staffCount;

    // Safety rule enforcement:
    // Prevent deletion of branches with assigned students or staff; allow deactivation instead.
    if (totalAssigned > 0) {
      return res.status(400).json({
        success: false,
        canDeactivate: true,
        assignedStudents: studentCount,
        assignedStaff: staffCount,
        message: `Cannot delete branch "${branch.name}" because it currently has ${studentCount} assigned student(s) and ${staffCount} assigned staff/instructor member(s). To preserve audit logs and student history, please deactivate this branch instead.`,
      });
    }

    await Branch.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Branch "${branch.name}" (${branch.code}) has been permanently deleted.`,
    });
  } catch (error) {
    console.error('[BranchController] Error deleting branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete branch.',
      error: error.message,
    });
  }
};

// @desc    Assign students, instructors, or staff members to a specific branch
// @route   POST /api/branches/:id/assign
// @access  Admin only
exports.assignMembersToBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds = [], studentIds = [] } = req.body;

    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Target branch not found.' });
    }

    if (!Array.isArray(userIds) && !Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userIds or studentIds as an array.',
      });
    }

    let usersUpdated = 0;
    let studentsUpdated = 0;

    // Update users (staff, instructors, or students)
    if (userIds.length > 0) {
      const uRes = await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { branch: branch.name } }
      );
      usersUpdated = uRes.modifiedCount;

      // Also sync corresponding student docs if any of the users were students
      await Student.updateMany(
        { userId: { $in: userIds } },
        { $set: { branch: branch.name } }
      );
    }

    // Update students directly if studentIds provided
    if (studentIds.length > 0) {
      const sRes = await Student.updateMany(
        { _id: { $in: studentIds } },
        { $set: { branch: branch.name } }
      );
      studentsUpdated = sRes.modifiedCount;

      // Also sync user doc
      const students = await Student.find({ _id: { $in: studentIds } }, 'userId').lean();
      const associatedUserIds = students.map((s) => s.userId).filter(Boolean);
      if (associatedUserIds.length > 0) {
        await User.updateMany(
          { _id: { $in: associatedUserIds } },
          { $set: { branch: branch.name } }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully reassigned members to "${branch.name}" branch.`,
      usersUpdated,
      studentsUpdated,
    });
  } catch (error) {
    console.error('[BranchController] Error assigning members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign members to branch.',
      error: error.message,
    });
  }
};

// @desc    Get members assigned to a branch + members available to transfer
// @route   GET /api/branches/:id/members
// @access  Admin only
exports.getBranchMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findById(id).lean();
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    const [assignedUsers, assignedStudents, allUsers, allStudents] = await Promise.all([
      User.find({ branch: branch.name }).select('name email username phone role branch status verificationStatus').lean(),
      Student.find({ branch: branch.name }).populate('userId', 'name email phone').select('studentName email phone branch studentType registrationStatus').lean(),
      User.find({}).select('name email username phone role branch status').sort({ name: 1 }).lean(),
      Student.find({}).select('studentName email phone branch studentType registrationStatus').sort({ studentName: 1 }).lean(),
    ]);

    res.status(200).json({
      success: true,
      branchName: branch.name,
      branchCode: branch.code,
      assigned: {
        instructors: assignedUsers.filter((u) => u.role === 'instructor'),
        staff: assignedUsers.filter((u) => u.role === 'staff'),
        students: assignedStudents,
      },
      available: {
        users: allUsers,
        students: allStudents,
      },
    });
  } catch (error) {
    console.error('[BranchController] Error fetching branch members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branch members.',
      error: error.message,
    });
  }
};
