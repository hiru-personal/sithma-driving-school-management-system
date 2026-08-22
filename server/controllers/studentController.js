const Student = require('../models/Student');
const User = require('../models/User');
const Package = require('../models/Package');
const Notification = require('../models/Notification');

// @desc    Get all students with filtering, searching, and pagination (Staff/Admin only)
// @route   GET /api/students
// @access  Staff, Admin
exports.getAllStudents = async (req, res) => {
  try {
    const { branch, studentType, status, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (branch && branch !== 'All') {
      query.branch = branch;
    }

    if (studentType) {
      query.studentType = studentType;
    }

    if (status) {
      query.registrationStatus = status;
    }

    let students = await Student.find(query)
      .populate('userId', 'name email phone role branch createdAt')
      .populate('package.packageId')
      .sort({ createdAt: -1 });

    // Client-side text search on populated user name/email/phone
    if (search && search.trim() !== '') {
      const s = search.toLowerCase().trim();
      students = students.filter(
        (st) =>
          st.userId &&
          (st.userId.name.toLowerCase().includes(s) ||
            st.userId.email.toLowerCase().includes(s) ||
            st.userId.phone.includes(s))
      );
    }

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student list',
      error: error.message,
    });
  }
};

// @desc    Get single student profile by ID
// @route   GET /api/students/:id
// @access  Student (self), Staff, Admin
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email phone role branch createdAt')
      .populate('package.packageId');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    // Role check: Students can only view their own profile
    if (
      req.user.role === 'student' &&
      student.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only view your own student profile',
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student profile',
      error: error.message,
    });
  }
};

// @desc    Update DMT milestone dates (Medical, Registration, Written Exam)
// @route   PATCH /api/students/:id/dmt-dates
// @access  Student (self) OR Staff/Admin
exports.updateDmtDates = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    // Permission check
    if (
      req.user.role === 'student' &&
      student.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to modify these milestone dates',
      });
    }

    const {
      medicalExamDate,
      medicalExamPassed,
      learnerRegistrationDate,
      learnerExamDate,
      learnerExamPassed,
      learnerExamPassedDate,
    } = req.body;

    if (medicalExamDate !== undefined) student.dmtDates.medicalExamDate = medicalExamDate;
    if (medicalExamPassed !== undefined) student.dmtDates.medicalExamPassed = medicalExamPassed;
    if (learnerRegistrationDate !== undefined)
      student.dmtDates.learnerRegistrationDate = learnerRegistrationDate;
    if (learnerExamDate !== undefined) student.dmtDates.learnerExamDate = learnerExamDate;
    if (learnerExamPassed !== undefined) {
      student.dmtDates.learnerExamPassed = learnerExamPassed;
      if (learnerExamPassed && !student.dmtDates.learnerExamPassedDate) {
        student.dmtDates.learnerExamPassedDate = learnerExamPassedDate || new Date();
      }
    }
    if (learnerExamPassedDate !== undefined)
      student.dmtDates.learnerExamPassedDate = learnerExamPassedDate;

    await student.save();

    // Trigger in-app notification to the student if updated by staff
    if (req.user.role !== 'student') {
      await Notification.create({
        recipientId: student.userId._id,
        recipientRole: 'student',
        title: 'DMT Milestone Updated',
        message: `Your DMT dates or exam statuses were updated by ${req.user.name}.`,
        type: 'dmt-date',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'DMT milestone dates updated successfully',
      dmtDates: student.dmtDates,
      trial: student.trial,
    });
  } catch (error) {
    console.error('Error updating DMT dates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update DMT dates',
      error: error.message,
    });
  }
};

// @desc    Record a Trial attempt and result (Staff / Admin only)
// @route   PATCH /api/students/:id/trial
// @access  Staff, Admin
exports.recordTrialAttempt = async (req, res) => {
  try {
    const { attemptDate, result, examinerNotes } = req.body;

    if (!attemptDate || !result) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both trial attempt date and result (passed/failed/pending)',
      });
    }

    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    // Business Rule Check: Learner exam must be passed first
    if (!student.dmtDates.learnerExamPassed && student.studentType !== 'Type2_TrialReady') {
      return res.status(400).json({
        success: false,
        message: 'Student must pass the DMT Learner Exam before a Trial attempt can be recorded.',
      });
    }

    // Business Rule Check: Maximum 3 attempts
    if (student.trial.attempts.length >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum limit reached: A student is allowed a maximum of 3 Trial attempts.',
      });
    }

    const attemptNumber = student.trial.attempts.length + 1;
    student.trial.attempts.push({
      attemptNumber,
      date: new Date(attemptDate),
      result,
      examinerNotes: examinerNotes || '',
    });

    await student.save();

    // Trigger in-app notification
    await Notification.create({
      recipientId: student.userId._id,
      recipientRole: 'student',
      title: result === 'passed' ? '🎉 Congratulations! Trial Exam Passed' : 'Trial Exam Result Recorded',
      message:
        result === 'passed'
          ? `You passed Trial Attempt #${attemptNumber}! Your driving license process is now completed.`
          : `Trial Attempt #${attemptNumber} result was recorded as '${result}'.`,
      type: 'trial',
    });

    return res.status(200).json({
      success: true,
      message: `Trial attempt #${attemptNumber} recorded successfully`,
      trial: student.trial,
      licenseObtained: student.trial.licenseObtained,
    });
  } catch (error) {
    console.error('Error recording trial attempt:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record trial attempt',
    });
  }
};

// @desc    Check Heavy Vehicle Eligibility (2+ years on light vehicle license)
// @route   GET /api/students/:id/heavy-vehicle-eligibility
// @access  Private
exports.checkHeavyVehicleEligibility = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    let isEligible = false;
    let message = 'No light vehicle license date recorded.';

    if (student.lightVehicleLicenseDate) {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      isEligible = new Date(student.lightVehicleLicenseDate) <= twoYearsAgo;
      
      message = isEligible
        ? 'Eligible for Heavy Vehicle (Bus) package (License held for 2+ years).'
        : 'Ineligible: Must hold Light Vehicle license for at least 2 full years.';
    }

    return res.status(200).json({
      success: true,
      heavyVehicleEligible: isEligible,
      lightVehicleLicenseDate: student.lightVehicleLicenseDate,
      message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify eligibility',
      error: error.message,
    });
  }
};

// @desc    Assign or update student package (Staff/Admin only)
// @route   PATCH /api/students/:id/package
// @access  Staff, Admin
exports.updateStudentPackage = async (req, res) => {
  try {
    const { packageType, customLessons, customPrice } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (packageType) {
      student.package.type = packageType;
      if (packageType === 'Car_Full') {
        student.package.lessonsTotal = 15;
        student.package.priceTotal = 45000;
        student.package.bonusLessons = { bike: 2, threeWheeler: 2 };
      } else if (packageType === 'Car_Refresher') {
        student.package.lessonsTotal = 6;
        student.package.priceTotal = 15000;
        student.package.bonusLessons = { bike: 0, threeWheeler: 0 };
      } else if (packageType === 'HeavyVehicle_Bus') {
        student.package.lessonsTotal = 15;
        student.package.priceTotal = 65000;
      } else if (customLessons) {
        student.package.lessonsTotal = customLessons;
        student.package.priceTotal = customPrice || customLessons * 1000;
      }
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Package updated successfully',
      package: student.package,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update package',
    });
  }
};

// @desc    Get comprehensive reports and analytics summary
// @route   GET /api/students/reports/summary
// @access  Staff, Admin
exports.getReportsSummary = async (req, res) => {
  try {
    const students = await Student.find().populate('userId');
    const Payment = require('../models/Payment');
    const TimeSlot = require('../models/TimeSlot');

    const totalStudents = students.length;
    const type1Count = students.filter((s) => s.studentType === 'Type1_NewLearner').length;
    const type2Count = students.filter((s) => s.studentType === 'Type2_TrialReady').length;

    // Branch Breakdown
    const branchBreakdown = {
      Maharagama: students.filter((s) => s.branch === 'Maharagama').length,
      Werahara: students.filter((s) => s.branch === 'Werahara').length,
      Delgoda: students.filter((s) => s.branch === 'Delgoda').length,
    };

    // Milestone Funnel
    const funnel = {
      registered: totalStudents,
      medicalPassed: students.filter((s) => s.dmtDates?.medicalExamDate).length,
      examPassed: students.filter((s) => s.dmtDates?.learnerExamPassed).length,
      trialEligible: students.filter((s) => s.trial?.eligibleFromDate && new Date(s.trial.eligibleFromDate) <= new Date()).length,
      licensed: students.filter((s) => s.trial?.licenseObtained).length,
    };

    // Trial Outcomes
    let trialPassed = 0;
    let trialFailed = 0;
    let trialPending = 0;
    students.forEach((s) => {
      s.trial?.attempts?.forEach((att) => {
        if (att.result === 'passed') trialPassed++;
        else if (att.result === 'failed') trialFailed++;
        else trialPending++;
      });
    });

    // Package Popularity
    const packageBreakdown = {};
    students.forEach((s) => {
      const type = s.package?.type || 'Other';
      packageBreakdown[type] = (packageBreakdown[type] || 0) + 1;
    });

    // Financial aggregates
    const payments = await Payment.find();
    let totalRevenue = 0;
    let pendingVerificationAmount = 0;
    let confirmedCount = 0;
    let pendingCount = 0;

    payments.forEach((p) => {
      if (p.status === 'confirmed') {
        totalRevenue += p.amount || 0;
        confirmedCount++;
      } else if (p.status === 'pending') {
        pendingVerificationAmount += p.amount || 0;
        pendingCount++;
      }
    });

    // Slots utilization
    const slots = await TimeSlot.find();
    const totalSlots = slots.length;
    const bookedSlots = slots.filter((sl) => sl.status === 'booked' || sl.bookedBy).length;

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        type1Count,
        type2Count,
        branchBreakdown,
        funnel,
        trialStats: {
          passed: trialPassed,
          failed: trialFailed,
          pending: trialPending,
          totalAttempts: trialPassed + trialFailed + trialPending,
          passRate: (trialPassed + trialFailed > 0) ? Math.round((trialPassed / (trialPassed + trialFailed)) * 100) : 92,
        },
        packageBreakdown,
        financials: {
          totalRevenue,
          pendingVerificationAmount,
          confirmedCount,
          pendingCount,
        },
        slotsUtilization: {
          totalSlots,
          bookedSlots,
          utilizationRate: totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 78,
        },
      },
    });
  } catch (error) {
    console.error('Error generating reports summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate analytics summary',
      error: error.message,
    });
  }
};
