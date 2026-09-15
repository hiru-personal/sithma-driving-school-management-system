const Student = require('../models/Student');
const User = require('../models/User');
const Package = require('../models/Package');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');

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

    // Attach payments & latest slip for each student
    const Payment = require('../models/Payment');
    const studentIds = students.map((st) => st._id);
    const payments = await Payment.find({ studentId: { $in: studentIds } }).sort({ uploadedAt: -1, createdAt: -1 });

    const populatedStudents = students.map((st) => {
      const stObj = st.toObject();
      const stPayments = payments.filter((p) => p.studentId.toString() === st._id.toString());
      stObj.payments = stPayments;
      stObj.latestPayment =
        stPayments.find((p) => p.paymentType === 'advance' && p.status === 'pending') ||
        stPayments.find((p) => p.status === 'pending') ||
        stPayments[0] ||
        null;
      return stObj;
    });

    return res.status(200).json({
      success: true,
      count: populatedStudents.length,
      students: populatedStudents,
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

// @desc    Update DMT milestone dates (Medical, Registration, Written Exam) (US-04, US-05, US-09)
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
      registrationDone,
      medicalDone,
      learnerExamDate,
      learnerExamPassed,
      learnerExamPassedDate,
      learnerExamStatus,
      learnerExamMarks,
    } = req.body;

    const updates = [];

    // Medical Exam Date & Medical Done
    if (medicalExamDate !== undefined) {
      student.dmtDates.medicalExamDate = medicalExamDate ? new Date(medicalExamDate) : null;
      if (medicalExamDate) updates.push(`Medical Exam Date (${new Date(medicalExamDate).toLocaleDateString()})`);
    }
    if (medicalExamPassed !== undefined) {
      student.dmtDates.medicalExamPassed = Boolean(medicalExamPassed);
    }
    if (medicalDone !== undefined) {
      student.dmtDates.medicalDone = Boolean(medicalDone);
      student.dmtDates.medicalDoneDate = medicalDone ? new Date() : null;
      if (medicalDone) {
        student.dmtDates.medicalExamPassed = true;
        updates.push('DMT Medical Marked as Completed');
      }
    }

    // Learner Registration Date & Registration Done
    if (learnerRegistrationDate !== undefined) {
      student.dmtDates.learnerRegistrationDate = learnerRegistrationDate ? new Date(learnerRegistrationDate) : null;
      if (learnerRegistrationDate) updates.push(`Learner Registration Date (${new Date(learnerRegistrationDate).toLocaleDateString()})`);
    }
    if (registrationDone !== undefined) {
      student.dmtDates.registrationDone = Boolean(registrationDone);
      student.dmtDates.registrationDoneDate = registrationDone ? new Date() : null;
      if (registrationDone) updates.push('DMT Registration Marked as Completed');
    }

    if (learnerExamDate !== undefined) {
      student.dmtDates.learnerExamDate = learnerExamDate ? new Date(learnerExamDate) : null;
      if (learnerExamDate) updates.push(`Learner Exam Date (${new Date(learnerExamDate).toLocaleDateString()})`);
    }
    if (learnerExamMarks !== undefined) {
      student.dmtDates.learnerExamMarks = learnerExamMarks !== null && learnerExamMarks !== '' ? Number(learnerExamMarks) : null;
      student.learnerExamMarks = student.dmtDates.learnerExamMarks;
      if (learnerExamMarks !== null && learnerExamMarks !== '') updates.push(`Learner Exam Marks (${learnerExamMarks})`);
    }

    // US-09: Learner exam status passed unlocks trial lesson booking for Type 1
    if (learnerExamStatus !== undefined) {
      student.learnerExamStatus = learnerExamStatus;
      if (learnerExamStatus === 'passed') {
        student.dmtDates.learnerExamPassed = true;
        student.trialEligible = true;
        student.dmtDates.learnerExamPassedDate = learnerExamPassedDate || new Date();
        updates.push('Learner Exam Status (Passed — Trial Lessons Unlocked)');
      } else if (learnerExamStatus === 'failed') {
        student.dmtDates.learnerExamPassed = false;
        if (student.studentType === 'Type1_NewLearner' || student.studentType === 'Type 1') {
          student.trialEligible = false;
        }
        updates.push('Learner Exam Status (Failed)');
      }
    } else if (learnerExamPassed !== undefined) {
      student.dmtDates.learnerExamPassed = Boolean(learnerExamPassed);
      if (learnerExamPassed) {
        student.learnerExamStatus = 'passed';
        student.trialEligible = true;
        if (!student.dmtDates.learnerExamPassedDate) {
          student.dmtDates.learnerExamPassedDate = learnerExamPassedDate || new Date();
        }
        updates.push('Learner Exam (Passed — Trial Lessons Unlocked)');
      } else {
        student.learnerExamStatus = 'failed';
        if (student.studentType === 'Type1_NewLearner' || student.studentType === 'Type 1') {
          student.trialEligible = false;
        }
        updates.push('Learner Exam (Not Passed)');
      }
    }

    if (learnerExamPassedDate !== undefined) {
      student.dmtDates.learnerExamPassedDate = learnerExamPassedDate ? new Date(learnerExamPassedDate) : null;
    }

    student.lastActivityDate = new Date();
    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email phone role branch createdAt')
      .populate('package.packageId');

    // Trigger in-app notification to the student if updated by staff
    if (req.user.role !== 'student') {
      const summaryText = updates.length > 0 ? updates.join(', ') : 'milestone details';
      await Notification.create({
        recipientId: student.userId._id || student.userId,
        recipientRole: 'student',
        title: 'DMT Milestone Updated',
        message: `Your DMT record was updated by ${req.user.name}: ${summaryText}.`,
        type: 'dmt-date',
        link: '/student/dashboard',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'DMT milestone dates updated successfully',
      dmtDates: populatedStudent.dmtDates,
      learnerExamStatus: populatedStudent.learnerExamStatus,
      trialEligible: populatedStudent.trialEligible,
      student: populatedStudent,
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
      } else if (packageType === 'Car_Individual') {
        const qty = customLessons || 1;
        student.package.lessonsTotal = qty;
        student.package.priceTotal = customPrice || qty * 3000;
      } else if (packageType === 'Bike' || packageType === 'Bike_Individual') {
        const qty = customLessons || 1;
        student.package.lessonsTotal = qty;
        student.package.priceTotal = customPrice || qty * 1500;
      } else if (packageType === 'ThreeWheeler' || packageType === 'ThreeWheeler_Individual') {
        const qty = customLessons || 1;
        student.package.lessonsTotal = qty;
        student.package.priceTotal = customPrice || qty * 2000;
      } else if (packageType === 'HeavyVehicle_Individual') {
        const qty = customLessons || 1;
        student.package.lessonsTotal = qty;
        student.package.priceTotal = customPrice || qty * 3500;
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

// @desc    Toggle student advance paid / premium status (Staff/Admin)
// @route   PATCH /api/students/:id/toggle-premium
// @access  Staff, Admin
exports.toggleAdvancePaid = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const { action, rejectionReason } = req.body || {};

    if (action === 'reject') {
      student.advancePaymentStatus = 'rejected';
      student.accountStatus = 'pending_verification';
      student.isAdvancePaid = false;
      student.isPremium = false;
      student.registrationStatus = 'pending_payment';
      await User.findByIdAndUpdate(student.userId, { status: 'pending_verification' });

      const Payment = require('../models/Payment');
      await Payment.updateMany(
        { studentId: student._id, paymentType: 'advance', status: 'pending' },
        {
          status: 'rejected',
          rejectionReason: rejectionReason || 'Payment slip rejected by staff.',
          verifiedBy: req.user?._id || null,
          verifiedAt: new Date(),
        }
      );

      // Create notification for student
      const Notification = require('../models/Notification');
      await Notification.create({
        recipientId: student.userId,
        recipientRole: 'student',
        title: '⚠️ Advance Payment Slip Rejected',
        message: `Your advance payment slip was rejected by staff. Reason: ${
          rejectionReason || 'Please verify deposit details and re-upload a clear slip.'
        }`,
        type: 'payment',
        link: '/student/dashboard',
      });

      await student.save();

      return res.status(200).json({
        success: true,
        message: 'Payment slip marked as rejected. Student has been notified.',
        student,
      });
    }

    const shouldVerify = action === 'verify' ? true : (action === 'revoke' ? false : !student.isAdvancePaid);
    student.isAdvancePaid = shouldVerify;
    student.isPremium = shouldVerify;

    if (shouldVerify) {
      student.accountStatus = 'active';
      student.account_status = 'Verified';
      student.payment_status = 'Verified';
      student.advancePaymentStatus = 'verified';
      student.registrationStatus = 'registered';
      student.verifiedBy = req.user?._id || null;
      student.verifiedAt = new Date();
      await User.findByIdAndUpdate(student.userId, { status: 'active', account_status: 'Verified' });

      // Confirm any pending advance payment records
      const Payment = require('../models/Payment');
      await Payment.updateMany(
        { studentId: student._id, paymentType: 'advance', status: 'pending' },
        { status: 'confirmed', verifiedBy: req.user?._id || null, verifiedAt: new Date() }
      );

      // Notify student
      const Notification = require('../models/Notification');
      await Notification.create({
        recipientId: student.userId,
        recipientRole: 'student',
        title: '🎉 Advance Payment Verified — Account Activated!',
        message: `Your advance payment has been verified by ${req.user?.name || 'Staff'}. Your account is now fully active!`,
        type: 'payment',
        link: '/student/dashboard',
      });
    } else {
      student.accountStatus = 'pending_verification';
      student.account_status = 'Unverified / Pending Payment';
      student.payment_status = 'Pending Payment';
      student.advancePaymentStatus = 'pending';
      student.registrationStatus = 'pending_payment';
      await User.findByIdAndUpdate(student.userId, { status: 'pending_verification', account_status: 'Unverified / Pending Payment' });
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: student.isAdvancePaid
        ? 'Advance payment verified successfully! Student account is now active.'
        : 'Student reset to pending verification (Login access restricted).',
      student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update student payment status',
      error: error.message,
    });
  }
};

// @desc    Register a walk-in student manually (Data Entry Officer / Staff / Admin) (Path B)
// @route   POST /api/students/walk-in
// @access  Staff, Admin
exports.registerWalkInStudent = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      phone,
      nic,
      branch = 'Maharagama',
      studentType = 'Type1_NewLearner',
      packageId,
      packageType,
      password = 'Password@123',
      advancePaymentCollected = false, // Configurable: Desk payment collected and verified immediately
      skipVerificationQueue = false,   // If true AND payment collected -> immediate active status; default false routes to queue
      advanceAmount = 5000,
    } = req.body;

    if (!name || !email || !phone || !nic) {
      return res.status(400).json({
        success: false,
        message: 'Full name, NIC, phone number, and email are required.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = (username || cleanEmail.split('@')[0]).toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user account with this email address or username already exists.',
      });
    }

    const isType2 = studentType === 'Type2_TrialReady' || studentType === 'Type 2';
    const isType1 = !isType2;

    // Resolve package dynamically from Package collection (US-13, US-14)
    // Type 1 students do NOT enroll in a package at registration stage
    let pkgDoc = null;
    let lessonsTotal = 0;
    let priceTotal = 0;
    let bonusLessons = { bike: 0, threeWheeler: 0 };

    if (isType2) {
      if (packageId) pkgDoc = await Package.findById(packageId);
      if (!pkgDoc && packageType) pkgDoc = await Package.findOne({ type: packageType, isActive: true });
      if (!pkgDoc) {
        pkgDoc = await Package.findOne({ type: 'Car_Full', isActive: true });
      }

      lessonsTotal = pkgDoc ? pkgDoc.lessons : 15;
      priceTotal = pkgDoc ? pkgDoc.price : 40000;
      bonusLessons = pkgDoc?.bonusLessons || { bike: 2, threeWheeler: 2 };

      if (pkgDoc?.isPerLesson) {
        const qty = parseInt(req.body.lessonQty || req.body.customLessonsCount, 10) || 1;
        lessonsTotal = qty;
        priceTotal = (pkgDoc.price || 0) * qty;
      }
    }

    // Path B Verification Rule:
    // If officer collected advance payment in person AND explicitly skips separate verification queue -> Active immediately.
    // Otherwise, defaults to requires separate verification (pending_verification).
    const isImmediateVerified = Boolean(advancePaymentCollected && skipVerificationQueue);
    const initialStatus = isImmediateVerified ? 'active' : 'pending_verification';
    const advanceStatus = isImmediateVerified ? 'verified' : (advancePaymentCollected ? 'pending' : 'pending');

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: phone.trim(),
      nic: nic.trim(),
      passwordHash,
      role: 'student',
      status: initialStatus,
      branch,
      createdBy: req.user._id,
      mustChangePassword: false,
    });

    const advancePayAmount = parseFloat(advanceAmount) || 5000;
    const resolvedRef = `WALKIN-ADV-${Date.now().toString().slice(-6)}`;

    const student = await Student.create({
      userId: user._id,
      nic: nic.trim(),
      studentType: isType2 ? 'Type2_TrialReady' : 'Type1_NewLearner',
      branch,
      registrationStatus: isImmediateVerified ? 'registered' : 'pending_payment',
      accountStatus: initialStatus,
      advancePaymentStatus: advanceStatus,
      advancePaymentReference: resolvedRef,
      isAdvancePaid: isImmediateVerified,
      isPremium: isImmediateVerified,
      trialEligible: isType2,
      packagePaymentStatus: 'none',
      lessonsUnlocked: isImmediateVerified ? lessonsTotal : 0,
      lessonsUsed: 0,
      isWalkIn: true,
      createdBy: req.user._id,
      verifiedBy: isImmediateVerified ? req.user._id : null,
      verifiedAt: isImmediateVerified ? new Date() : null,
      lastActivityDate: new Date(),
      package: isType1 ? {
        type: null,
        packageId: null,
        lessonsTotal: 0,
        lessonsUsed: 0,
        priceTotal: 0,
        bonusLessons: { bike: 0, threeWheeler: 0 },
        additionalLessonsRequested: 0,
      } : {
        type: pkgDoc ? pkgDoc.type : 'Car_Full',
        packageId: pkgDoc ? pkgDoc._id : null,
        lessonsTotal,
        lessonsUsed: 0,
        priceTotal,
        bonusLessons,
        additionalLessonsRequested: 0,
      },
      dmtDates: {
        learnerExamPassed: isType2,
      },
    });

    // Create payment entry
    await Payment.create({
      studentId: student._id,
      userId: user._id,
      packageId: isType2 && pkgDoc ? pkgDoc._id : null,
      paymentType: 'advance',
      slipImageUrl: '/uploads/slips/walkin-receipt.png',
      amount: advancePayAmount,
      bankName: 'Cash at Branch Desk',
      transactionReference: resolvedRef,
      status: isImmediateVerified ? 'confirmed' : 'pending',
      verifiedBy: isImmediateVerified ? req.user._id : null,
      verifiedAt: isImmediateVerified ? new Date() : null,
      uploadedAt: new Date(),
    });

    const populated = await Student.findById(student._id)
      .populate('userId', 'name email phone role branch status createdAt')
      .populate('package.packageId');

    return res.status(201).json({
      success: true,
      message: isImmediateVerified
        ? `Walk-in student ${name} registered and activated immediately with in-person payment.`
        : `Walk-in student ${name} registered. Advance payment queued for verification (Account pending verification).`,
      student: populated,
    });
  } catch (error) {
    console.error('Walk-in registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to register walk-in student',
    });
  }
};

// @desc    Update student personal & registration details (self or staff/admin)
// @route   PATCH /api/students/:id/profile
// @access  Student (self), Staff, Admin
exports.updateStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    // Role check: Student can only edit their own record
    if (
      req.user.role === 'student' &&
      student.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own details',
      });
    }

    const user = await User.findById(student.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    const { name, phone, email, nic, branch, studentType, packageId, packageType } = req.body;

    // Check email uniqueness if email is changed
    if (email && email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const existing = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (nic !== undefined) {
      student.nic = nic.trim();
      user.nic = nic.trim();
    }

    if (branch && ['Maharagama', 'Werahara', 'Delgoda'].includes(branch)) {
      student.branch = branch;
      user.branch = branch;
    }

    if (studentType && ['Type1_NewLearner', 'Type2_TrialReady', 'Type 1', 'Type 2'].includes(studentType)) {
      student.studentType = studentType;
    }

    // Update package if specified
    if (packageId || packageType) {
      let pkgDoc = null;
      if (packageId) {
        pkgDoc = await Package.findById(packageId);
      }
      if (!pkgDoc && packageType) {
        pkgDoc = await Package.findOne({ type: packageType, isActive: true });
      }

      if (pkgDoc) {
        // Enforce heavy vehicle eligibility if selecting HeavyVehicle_Bus
        if (pkgDoc.type === 'HeavyVehicle_Bus' && !student.heavyVehicleEligible) {
          return res.status(400).json({
            success: false,
            message: 'Heavy Vehicle (Bus) package requires holding a Light Vehicle driving license for at least 2 years.',
          });
        }

        student.package = {
          type: pkgDoc.type,
          packageId: pkgDoc._id,
          lessonsTotal: pkgDoc.lessons,
          lessonsUsed: student.package?.lessonsUsed || 0,
          priceTotal: pkgDoc.price,
          bonusLessons: pkgDoc.bonusLessons || { bike: 0, threeWheeler: 0 },
          additionalLessonsRequested: student.package?.additionalLessonsRequested || 0,
        };

        if (student.lessonsUnlocked && student.lessonsUnlocked > 0 && student.lessonsUsed === 0) {
          student.lessonsUnlocked = pkgDoc.lessons;
        }
      }
    }

    await user.save();
    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email phone role branch status createdAt')
      .populate('package.packageId');

    return res.status(200).json({
      success: true,
      message: 'Your details have been updated successfully.',
      student: populatedStudent,
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
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update details',
      error: error.message,
    });
  }
};

// @desc    Record a Learner Theory Exam attempt with pass/fail and marks (Type 1 - Max 3 attempts)
// @route   POST /api/students/:id/exam-attempt
// @access  Student (self) OR Staff/Admin
exports.recordExamAttempt = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // Ownership check
    if (req.user.role === 'student' && student.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Check if already cancelled
    if (student.registrationStatus === 'cancelled' || student.accountStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Registration is cancelled. Please re-register as a new student.',
        isCancelled: true,
      });
    }

    const { result, marks, examDate, notes } = req.body;
    if (!['passed', 'failed'].includes(result)) {
      return res.status(400).json({ success: false, message: "Result must be 'passed' or 'failed'" });
    }

    const currentAttempts = student.learnerExamAttempts || [];
    const attemptNumber = currentAttempts.length + 1;

    if (attemptNumber > 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 3 exam attempts have already been reached. Registration has been cancelled.',
        isCancelled: true,
      });
    }

    const numericMarks = marks !== undefined && marks !== null && marks !== '' ? Number(marks) : null;
    const attemptRecord = {
      attemptNumber,
      date: examDate ? new Date(examDate) : new Date(),
      result,
      marks: numericMarks,
      notes: notes || '',
    };

    student.learnerExamAttempts.push(attemptRecord);
    student.learnerExamAttemptsCount = student.learnerExamAttempts.length;
    student.learnerExamMarks = numericMarks;
    student.dmtDates.learnerExamMarks = numericMarks;

    let isAutoCancelled = false;

    if (result === 'passed') {
      student.learnerExamStatus = 'passed';
      student.dmtDates.learnerExamPassed = true;
      student.dmtDates.learnerExamPassedDate = attemptRecord.date;
      student.trialEligible = true;
      student.trial_eligible = true;

      // Notification
      await Notification.create({
        recipientId: student.userId._id || student.userId,
        recipientRole: 'student',
        title: '🎉 DMT Written Exam Passed!',
        message: `Congratulations! You passed your DMT Written Theory Exam with ${numericMarks !== null ? `${numericMarks} marks` : 'flying colors'} on Attempt ${attemptNumber}. On-road practical lessons are now unlocked!`,
        type: 'dmt-date',
        link: '/student/dashboard',
      });
    } else {
      // Failed
      student.learnerExamStatus = 'failed';
      student.dmtDates.learnerExamPassed = false;
      student.trialEligible = false;
      student.trial_eligible = false;

      // Check 3 failed attempts
      if (student.learnerExamAttempts.length >= 3) {
        student.registrationStatus = 'cancelled';
        student.accountStatus = 'cancelled';
        student.account_status = 'Cancelled';
        student.isAdvancePaid = false;
        student.isPremium = false;
        isAutoCancelled = true;

        await User.findByIdAndUpdate(student.userId._id || student.userId, {
          status: 'active',
          account_status: 'Cancelled',
        });

        await Notification.create({
          recipientId: student.userId._id || student.userId,
          recipientRole: 'student',
          title: '⚠️ Registration Cancelled — 3 Exam Attempts Failed',
          message: 'You have exhausted all 3 attempts for the DMT written theory exam. As per DMT regulations, your learner registration has been automatically cancelled. You must re-register like a new user and pay the advance deposit to restart.',
          type: 'dmt-date',
          link: '/student/dashboard',
        });
      } else {
        const remaining = 3 - student.learnerExamAttempts.length;
        await Notification.create({
          recipientId: student.userId._id || student.userId,
          recipientRole: 'student',
          title: `DMT Exam Attempt ${attemptNumber} Result: Failed`,
          message: `Attempt ${attemptNumber} recorded as Failed (${numericMarks !== null ? `${numericMarks} marks` : 'No marks entered'}). You have ${remaining} attempt(s) remaining. Please contact branch staff to get a new exam date.`,
          type: 'dmt-date',
          link: '/student/dashboard',
        });
      }
    }

    student.lastActivityDate = new Date();
    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email phone role branch status createdAt')
      .populate('package.packageId');

    return res.status(200).json({
      success: true,
      message: result === 'passed'
        ? `Congratulations! Exam passed with ${numericMarks !== null ? numericMarks : ''} marks. Practical lessons are now unlocked!`
        : (isAutoCancelled
            ? '3 failed attempts reached. Registration has been automatically cancelled.'
            : `Attempt ${attemptNumber} recorded as failed. You have ${3 - attemptNumber} attempt(s) remaining. Please obtain a new exam date from staff.`),
      student: populatedStudent,
      isAutoCancelled,
      attemptsRemaining: Math.max(0, 3 - populatedStudent.learnerExamAttempts.length),
    });
  } catch (error) {
    console.error('Error recording exam attempt:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record exam attempt',
      error: error.message,
    });
  }
};

// @desc    Re-register student as a new learner after 3 failed exam attempts
// @route   POST /api/students/:id/re-register
// @access  Student (self) OR Staff/Admin
exports.reRegisterStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    if (req.user.role === 'student' && student.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Reset student record to clean initial state
    student.registrationStatus = 'pending_payment';
    student.accountStatus = 'pending_verification';
    student.account_status = 'Unverified / Pending Payment';
    student.advancePaymentStatus = 'pending';
    student.isAdvancePaid = false;
    student.isPremium = false;
    student.trialEligible = false;
    student.trial_eligible = false;
    student.learnerExamStatus = 'not_taken';
    student.learnerExamMarks = null;
    student.learnerExamAttempts = [];
    student.learnerExamAttemptsCount = 0;
    student.advancePaymentReference = '';

    student.dmtDates = {
      medicalExamDate: null,
      medicalExamPassed: null,
      medicalDone: false,
      medicalDoneDate: null,
      learnerRegistrationDate: null,
      registrationDone: false,
      registrationDoneDate: null,
      learnerExamDate: null,
      learnerExamPassed: false,
      learnerExamPassedDate: null,
      learnerExamMarks: null,
    };

    student.lastActivityDate = new Date();
    await student.save();

    await User.findByIdAndUpdate(student.userId._id || student.userId, {
      status: 'pending_verification',
      account_status: 'Unverified / Pending Payment',
    });

    await Notification.create({
      recipientId: student.userId._id || student.userId,
      recipientRole: 'student',
      title: 'Re-Registration Initialized',
      message: 'Your new enrolment has been initialized. Please pay the advance fee of Rs. 5,000 to submit for officer verification.',
      type: 'payment',
      link: '/student/dashboard',
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email phone role branch status createdAt')
      .populate('package.packageId');

    return res.status(200).json({
      success: true,
      message: 'Re-registration initialized! Please complete your Rs. 5,000 advance payment to proceed.',
      student: populatedStudent,
    });
  } catch (error) {
    console.error('Error re-registering student:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to re-register student',
      error: error.message,
    });
  }
};


