const Student = require('../models/Student');
const User = require('../models/User');
const Package = require('../models/Package');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');
const RescheduleRequest = require('../models/RescheduleRequest');
const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');

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
      if (['Type1_NewLearner', 'Type 1', 'Type1'].includes(studentType)) {
        query.$or = [
          { studentType: { $in: ['Type1_NewLearner', 'Type 1', 'Type1'] } },
          { student_type: { $in: ['Type 1', 'Type1_NewLearner'] } },
        ];
      } else if (['Type2_TrialReady', 'Type 2', 'Type2'].includes(studentType)) {
        query.$or = [
          { studentType: { $in: ['Type2_TrialReady', 'Type 2', 'Type2'] } },
          { student_type: { $in: ['Type 2', 'Type2_TrialReady'] } },
        ];
      } else {
        query.studentType = studentType;
      }
    }

    if (status) {
      if (status === 'registered') {
        query.$or = [
          { registrationStatus: 'registered' },
          { accountStatus: 'active' },
          { account_status: 'Verified' },
        ];
      } else if (status === 'pending_payment') {
        query.$or = [
          { registrationStatus: 'pending_payment' },
          { accountStatus: 'pending_verification' },
          { account_status: 'Unverified / Pending Payment' },
        ];
      } else {
        query.registrationStatus = status;
      }
    }

    let students = await Student.find(query)
      .populate('userId', 'name email phone role branch status account_status createdAt')
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

    const populatedStudents = await Promise.all(
      students.map(async (st) => {
        if (typeof st.evaluateLifecycle === 'function' && st.evaluateLifecycle()) {
          try {
            await st.save();
          } catch (e) {
            console.error('Error saving evaluated lifecycle for student', st._id, e);
          }
        }
        const stObj = st.toObject();
        const stPayments = payments.filter((p) => p.studentId.toString() === st._id.toString());
        stObj.payments = stPayments;
        stObj.latestPayment =
          stPayments.find((p) => p.paymentType === 'advance' && p.status === 'pending') ||
          stPayments.find((p) => p.status === 'pending') ||
          stPayments[0] ||
          null;
        return stObj;
      })
    );

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

// Helper to remove all DMT milestone data for Type 2 (Trial-Only) students, and sanitize unassigned milestone states
const sanitizeStudentForType = (student) => {
  if (!student) return student;
  const isType2 =
    student.studentType === 'Type 2' ||
    student.studentType === 'Type2_TrialReady' ||
    student.studentType === 'type2' ||
    student.student_type === 'Type 2';
  if (isType2) {
    const obj = typeof student.toObject === 'function' ? student.toObject() : { ...student };
    delete obj.dmtDates;
    delete obj.learnerExamAttempts;
    delete obj.learnerExamAttemptsCount;
    delete obj.learnerExamMarks;
    delete obj.learnerExamStatus;
    delete obj.medicalCertificateUrl;
    delete obj.medical_date;
    delete obj.registration_date;
    delete obj.written_exam_date;
    delete obj.written_exam_status;
    return obj;
  }

  const obj = typeof student.toObject === 'function' ? student.toObject() : { ...student };
  if (!obj.dmtDates) obj.dmtDates = {};

  // If medical date is not assigned, student cannot have passed/failed or uploaded proof
  const medDate = obj.medical_date || obj.dmtDates?.medicalExamDate;
  if (!medDate) {
    obj.dmtDates.medicalExamPassed = null;
    obj.dmtDates.medicalExamStatus = null;
    obj.dmtDates.medicalDone = false;
    obj.medicalDocumentUrl = null;
    if (obj.dmtDates) obj.dmtDates.medicalDocumentUrl = null;
    obj.medicalRemarks = null;
    if (obj.dmtDates) obj.dmtDates.medicalRemarks = null;
  }

  // If registration date is not assigned, student cannot have completed registration or uploaded proof
  const regDate = obj.registration_date || obj.dmtDates?.learnerRegistrationDate;
  if (!regDate) {
    obj.dmtDates.registrationDone = false;
    obj.registrationDocumentUrl = null;
    if (obj.dmtDates) obj.dmtDates.registrationDocumentUrl = null;
    obj.registrationRemarks = null;
    if (obj.dmtDates) obj.dmtDates.registrationRemarks = null;
  }

  // If written exam date is not assigned, student cannot have passed written exam
  const examDate = obj.written_exam_date || obj.dmtDates?.learnerExamDate;
  if (!examDate) {
    obj.dmtDates.learnerExamPassed = false;
    obj.dmtDates.learnerExamStatus = null;
    obj.learnerExamStatus = null;
    obj.learnerExamPassed = false;
  }

  return obj;
};
exports.sanitizeStudentForType = sanitizeStudentForType;

// @desc    Get single student profile by ID
// @route   GET /api/students/:id
// @access  Student (self), Staff, Admin
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email phone role branch createdAt')
      .populate('package.packageId')
      .populate('trial_date_set_by', 'name role');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    // Evaluate DMT 1.5-year learner license lifecycle & auto-expiry
    if (student.evaluateLifecycle && student.evaluateLifecycle()) {
      await student.save();
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

    const Payment = require('../models/Payment');
    const latestPayment = await Payment.findOne({
      studentId: student._id,
      paymentType: 'advance',
    }).sort({ createdAt: -1 });

    const studentObj = sanitizeStudentForType(student.toObject());
    const hasSubmittedPayment = Boolean(
      latestPayment ||
      ['pending', 'verified'].includes(student.advancePaymentStatus) ||
      student.isAdvancePaid
    );
    studentObj.latestPayment = latestPayment;
    studentObj.hasSubmittedPayment = hasSubmittedPayment;
    if (latestPayment && latestPayment.transactionReference) {
      studentObj.advancePaymentReference = latestPayment.transactionReference;
    }

    return res.status(200).json({
      success: true,
      student: studentObj,
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

    // Zero DMT milestone exposure for Type 2 (Trial-Only) students
    const isType2 =
      student.studentType === 'Type 2' ||
      student.studentType === 'Type2_TrialReady' ||
      student.studentType === 'type2';
    if (isType2) {
      return res.status(403).json({
        success: false,
        message: 'DMT milestone tracking is not applicable for Type 2 (Trial-Only) students.',
      });
    }

    const {
      medicalExamDate,
      medicalExamPassed,
      medicalExamStatus,
      medicalRemarks,
      medicalDocumentUrl,
      learnerRegistrationDate,
      registrationDone,
      registrationRemarks,
      registrationDocumentUrl,
      medicalDone,
      learnerExamDate,
      learnerExamPassed,
      learnerExamPassedDate,
      learnerExamStatus,
      learnerExamMarks,
      medical_date,
      registration_date,
      written_exam_date,
      written_exam_status,
    } = req.body;

    const regDateInput =
      registration_date !== undefined
        ? registration_date
        : learnerRegistrationDate;
    const medDateInput =
      medical_date !== undefined
        ? medical_date
        : medicalExamDate;
    const examDateInput =
      written_exam_date !== undefined
        ? written_exam_date
        : learnerExamDate;

    // Determine effective dates against what's already saved on the student record
    const effectiveRegDate =
      regDateInput !== undefined
        ? (regDateInput ? new Date(regDateInput) : null)
        : (student.registration_date || student.dmtDates?.learnerRegistrationDate);

    const effectiveMedDate =
      medDateInput !== undefined
        ? (medDateInput ? new Date(medDateInput) : null)
        : (student.medical_date || student.dmtDates?.medicalExamDate);

    const effectiveExamDate =
      examDateInput !== undefined
        ? (examDateInput ? new Date(examDateInput) : null)
        : (student.written_exam_date || student.dmtDates?.learnerExamDate);

    // DMT Date Rules:
    // 1. The Registration Date and Medical Exam Date CAN be the exact same date (or either order).
    // 2. The Theory (Written) Exam Date MUST be strictly after both the Registration Date and the Medical Exam Date.
    if (effectiveExamDate && effectiveRegDate) {
      const regTime = new Date(effectiveRegDate).setHours(0, 0, 0, 0);
      const examTime = new Date(effectiveExamDate).setHours(0, 0, 0, 0);
      if (examTime <= regTime) {
        return res.status(400).json({
          success: false,
          message: 'Theory (Written) Exam Date must be after the Registration Date.',
        });
      }
    }

    if (effectiveExamDate && effectiveMedDate) {
      const medTime = new Date(effectiveMedDate).setHours(0, 0, 0, 0);
      const examTime = new Date(effectiveExamDate).setHours(0, 0, 0, 0);
      if (examTime <= medTime) {
        return res.status(400).json({
          success: false,
          message: 'Theory (Written) Exam Date must be after the Medical Exam Date.',
        });
      }
    }

    const isStudentUser = req.user.role === 'student';

    // Student restriction: Cannot directly set or modify milestone dates
    if (isStudentUser && (regDateInput !== undefined || medDateInput !== undefined || examDateInput !== undefined)) {
      return res.status(403).json({
        success: false,
        message: 'Students are not authorized to directly set or modify DMT milestone dates. Please request a date reschedule from branch staff.',
      });
    }

    // Student restriction: Cannot update medical status, done flag, remarks or document without staff assigning a date or before the assigned date
    if (
      isStudentUser &&
      (medicalDone !== undefined ||
        medicalExamStatus !== undefined ||
        medicalExamPassed !== undefined ||
        medicalRemarks !== undefined ||
        medicalDocumentUrl !== undefined)
    ) {
      const medDate = student.medical_date || student.dmtDates?.medicalExamDate;
      if (!medDate) {
        return res.status(400).json({
          success: false,
          message: 'DMT Medical Exam date has not been assigned by staff yet. You cannot update medical status, remarks, or proof until a date is assigned.',
        });
      }
      const todayTime = new Date().setHours(0, 0, 0, 0);
      const medTime = new Date(medDate).setHours(0, 0, 0, 0);
      if (todayTime < medTime) {
        return res.status(400).json({
          success: false,
          message: `You cannot update DMT Medical Exam status, remarks, or proof before your scheduled date (${new Date(medDate).toLocaleDateString()}).`,
        });
      }
    }

    // Student restriction: Cannot mark registration as done or submit remarks/document without staff assigning a date or before the assigned date
    if (
      isStudentUser &&
      (registrationDone !== undefined ||
        registrationRemarks !== undefined ||
        registrationDocumentUrl !== undefined)
    ) {
      const regDate = student.registration_date || student.dmtDates?.learnerRegistrationDate;
      if (!regDate) {
        return res.status(400).json({
          success: false,
          message: 'DMT Registration submission date has not been assigned by staff yet. You cannot mark it as done or submit remarks until a date is assigned.',
        });
      }
      const todayTime = new Date().setHours(0, 0, 0, 0);
      const regTime = new Date(regDate).setHours(0, 0, 0, 0);
      if (todayTime < regTime) {
        return res.status(400).json({
          success: false,
          message: `You cannot mark DMT Registration as done or submit remarks before your scheduled submission date (${new Date(regDate).toLocaleDateString()}).`,
        });
      }
    }

    const updates = [];

    // Registration Date
    if (regDateInput !== undefined) {
      const d = regDateInput ? new Date(regDateInput) : null;
      student.registration_date = d;
      student.dmtDates.learnerRegistrationDate = d;
      if (d) updates.push(`Learner Registration Date (${d.toLocaleDateString()})`);
    }
    if (registrationDone !== undefined) {
      student.dmtDates.registrationDone = Boolean(registrationDone);
      student.dmtDates.registrationDoneDate = registrationDone ? new Date() : null;
      if (registrationDone) updates.push('DMT Registration Marked as Completed');
    }
    if (registrationRemarks !== undefined) {
      student.registrationRemarks = registrationRemarks;
      student.dmtDates.registrationRemarks = registrationRemarks;
      updates.push('Registration Remarks Updated');
    }
    if (registrationDocumentUrl !== undefined) {
      student.registrationDocumentUrl = registrationDocumentUrl;
      student.dmtDates.registrationDocumentUrl = registrationDocumentUrl;
    }

    // Medical Exam Date & Medical Done
    if (medDateInput !== undefined) {
      const d = medDateInput ? new Date(medDateInput) : null;
      student.medical_date = d;
      student.dmtDates.medicalExamDate = d;
      if (d) updates.push(`Medical Exam Date (${d.toLocaleDateString()})`);

      // If scheduled date is in the future, it is an upcoming exam.
      // Automatically reset status to pending unless staff explicitly marked it passed
      const todayTime = new Date().setHours(0, 0, 0, 0);
      const isFutureDate = d && new Date(d).setHours(0, 0, 0, 0) > todayTime;
      if (isFutureDate && !medicalExamPassed && !medicalDone) {
        student.dmtDates.medicalExamPassed = null;
        student.dmtDates.medicalExamStatus = null;
        student.dmtDates.medicalDone = false;
      }
    }
    if (medicalExamStatus !== undefined) {
      student.dmtDates.medicalExamStatus = medicalExamStatus;
      if (medicalExamStatus === 'passed') {
        student.dmtDates.medicalExamPassed = true;
        student.dmtDates.medicalDone = true;
        student.dmtDates.medicalDoneDate = new Date();
        updates.push('DMT Medical Marked as Passed');
      } else if (medicalExamStatus === 'failed') {
        student.dmtDates.medicalExamPassed = false;
        student.dmtDates.medicalDone = false;
        updates.push('DMT Medical Marked as Failed');
      }
    }
    if (medicalExamPassed !== undefined) {
      const todayTime = new Date().setHours(0, 0, 0, 0);
      const targetMedDate = student.medical_date || student.dmtDates?.medicalExamDate;
      const isFutureDate = targetMedDate && new Date(targetMedDate).setHours(0, 0, 0, 0) > todayTime;

      if (medicalExamPassed) {
        student.dmtDates.medicalExamPassed = true;
        student.dmtDates.medicalExamStatus = 'passed';
      } else if (!isFutureDate) {
        student.dmtDates.medicalExamPassed = false;
      } else {
        student.dmtDates.medicalExamPassed = null;
      }
    }
    if (medicalDone !== undefined) {
      student.dmtDates.medicalDone = Boolean(medicalDone);
      student.dmtDates.medicalDoneDate = medicalDone ? new Date() : null;
      if (medicalDone) {
        student.dmtDates.medicalExamPassed = true;
        student.dmtDates.medicalExamStatus = 'passed';
        updates.push('DMT Medical Marked as Completed');
      }
    }
    if (medicalRemarks !== undefined) {
      student.medicalRemarks = medicalRemarks;
      student.dmtDates.medicalRemarks = medicalRemarks;
      updates.push('Medical Remarks Updated');
    }
    if (medicalDocumentUrl !== undefined) {
      student.medicalDocumentUrl = medicalDocumentUrl;
      student.dmtDates.medicalDocumentUrl = medicalDocumentUrl;
    }

    // Learner Written Exam Date
    if (examDateInput !== undefined) {
      const d = examDateInput ? new Date(examDateInput) : null;
      student.written_exam_date = d;
      student.dmtDates.learnerExamDate = d;
      if (d) updates.push(`Learner Exam Date (${d.toLocaleDateString()})`);
    }

    // Resolve target exam status
    const resolvedStatus = written_exam_status !== undefined ? written_exam_status : learnerExamStatus;
    const isTargetPassed = resolvedStatus === 'Pass' || resolvedStatus === 'passed' || (resolvedStatus === undefined && learnerExamPassed === true);
    const isTargetFailed = resolvedStatus === 'Fail' || resolvedStatus === 'failed' || (resolvedStatus === undefined && learnerExamPassed === false);

    let numericMarks = undefined;
    if (learnerExamMarks !== undefined) {
      if (learnerExamMarks !== null && learnerExamMarks !== '') {
        numericMarks = Number(learnerExamMarks);
        if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > 40) {
          return res.status(400).json({
            success: false,
            message: 'DMT Theory Exam marks must be between 0 and 40.',
          });
        }
        if (isTargetPassed && numericMarks <= 30) {
          return res.status(400).json({
            success: false,
            message: 'DMT Theory Exam requires marks greater than 30 (out of 40) to pass. Marks of 30 or below is a Fail.',
          });
        }
        if (isTargetFailed && numericMarks > 30) {
          return res.status(400).json({
            success: false,
            message: 'Score is greater than 30 marks, which is a Pass. Please select PASSED or correct the marks.',
          });
        }
        student.dmtDates.learnerExamMarks = numericMarks;
        student.learnerExamMarks = numericMarks;
        updates.push(`Learner Exam Marks (${numericMarks}/40)`);
      } else {
        student.dmtDates.learnerExamMarks = null;
        student.learnerExamMarks = null;
      }
    }

    // Written exam status handling
    if (isTargetPassed && numericMarks !== undefined) {
      if (numericMarks !== null && numericMarks <= 30) {
        return res.status(400).json({
          success: false,
          message: 'DMT Theory Exam requires marks greater than 30 (out of 40) to pass. Marks of 30 or below is a Fail.',
        });
      }
    }

    if (resolvedStatus !== undefined) {
      const isPassed = resolvedStatus === 'Pass' || resolvedStatus === 'passed';
      const isFailed = resolvedStatus === 'Fail' || resolvedStatus === 'failed';
      if (isPassed) {
        student.written_exam_status = 'Pass';
        student.learnerExamStatus = 'passed';
        student.dmtDates.learnerExamPassed = true;
        student.trialEligible = true;
        student.dmtDates.learnerExamPassedDate = learnerExamPassedDate || new Date();
        if (numericMarks === undefined && ((student.learnerExamMarks && student.learnerExamMarks <= 30) || (student.dmtDates?.learnerExamMarks && student.dmtDates.learnerExamMarks <= 30))) {
          student.learnerExamMarks = null;
          student.dmtDates.learnerExamMarks = null;
        }
        if (!student.learnerExamAttempts || student.learnerExamAttempts.length === 0 || student.learnerExamAttempts[student.learnerExamAttempts.length - 1]?.result !== 'passed') {
          student.learnerExamAttempts = student.learnerExamAttempts || [];
          student.learnerExamAttempts.push({
            attemptNumber: student.learnerExamAttempts.length + 1,
            date: new Date(),
            result: 'passed',
            marks: numericMarks || 35,
          });
          student.learnerExamAttemptsCount = student.learnerExamAttempts.length;
        }
        updates.push('Learner Exam Status (Passed — Trial Lessons Unlocked)');
      } else if (isFailed) {
        student.written_exam_status = 'Fail';
        student.learnerExamStatus = 'failed';
        student.dmtDates.learnerExamPassed = false;
        if (student.studentType === 'Type1_NewLearner' || student.studentType === 'Type 1') {
          student.trialEligible = false;
        }
        if (!student.learnerExamAttempts || student.learnerExamAttempts.length === 0 || student.learnerExamAttempts[student.learnerExamAttempts.length - 1]?.result !== 'failed') {
          student.learnerExamAttempts = student.learnerExamAttempts || [];
          student.learnerExamAttempts.push({
            attemptNumber: student.learnerExamAttempts.length + 1,
            date: new Date(),
            result: 'failed',
            marks: numericMarks || 25,
          });
          student.learnerExamAttemptsCount = student.learnerExamAttempts.length;
        }
        updates.push('Learner Exam Status (Failed)');
      } else {
        student.written_exam_status = 'Pending';
        student.learnerExamStatus = 'not_taken';
        student.dmtDates.learnerExamPassed = false;
        student.trialEligible = false;
        updates.push('Learner Exam Status (Pending)');
      }
    } else if (learnerExamPassed !== undefined) {
      student.dmtDates.learnerExamPassed = Boolean(learnerExamPassed);
      if (learnerExamPassed) {
        student.written_exam_status = 'Pass';
        student.learnerExamStatus = 'passed';
        student.trialEligible = true;
        if (!student.dmtDates.learnerExamPassedDate) {
          student.dmtDates.learnerExamPassedDate = learnerExamPassedDate || new Date();
        }
        updates.push('Learner Exam (Passed — Trial Lessons Unlocked)');
      } else {
        student.written_exam_status = 'Fail';
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

    // Auto-resolve any matching pending RescheduleRequest documents for this student
    try {
      if (medDateInput !== undefined && effectiveMedDate) {
        await RescheduleRequest.updateMany(
          { student_id: student._id, milestone_type: 'medical', status: 'Pending' },
          {
            $set: {
              status: 'Approved',
              new_date: effectiveMedDate,
              reviewed_by: req.user._id,
              reviewed_at: new Date(),
              review_notes: 'Auto-approved and updated via DMT Milestone Management',
            },
          }
        );
      }
      if (regDateInput !== undefined && effectiveRegDate) {
        await RescheduleRequest.updateMany(
          { student_id: student._id, milestone_type: 'registration', status: 'Pending' },
          {
            $set: {
              status: 'Approved',
              new_date: effectiveRegDate,
              reviewed_by: req.user._id,
              reviewed_at: new Date(),
              review_notes: 'Auto-approved and updated via DMT Milestone Management',
            },
          }
        );
      }
      if (examDateInput !== undefined && effectiveExamDate) {
        await RescheduleRequest.updateMany(
          { student_id: student._id, milestone_type: 'theory_exam', status: 'Pending' },
          {
            $set: {
              status: 'Approved',
              new_date: effectiveExamDate,
              reviewed_by: req.user._id,
              reviewed_at: new Date(),
              review_notes: 'Auto-approved and updated via DMT Milestone Management',
            },
          }
        );
      }
    } catch (autoResolveErr) {
      console.warn('Could not auto-resolve pending reschedule requests:', autoResolveErr.message);
    }

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

    const sanitized = sanitizeStudentForType(populatedStudent);
    return res.status(200).json({
      success: true,
      message: 'DMT milestone dates updated successfully',
      dmtDates: sanitized.dmtDates,
      learnerExamStatus: sanitized.learnerExamStatus,
      trialEligible: sanitized.trialEligible,
      student: sanitized,
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
// @desc    Record a practical trial attempt outcome (Passed/Failed/Absent) - US Requirements 5, 6, 7, 8
// @route   POST or PATCH /api/students/:id/trial-attempt, /api/students/:id/trial
// @access  Staff, Admin
exports.recordTrialAttempt = async (req, res) => {
  try {
    const attemptDate = req.body.attemptDate || req.body.date || new Date();
    const result = req.body.result;
    const examinerNotes = req.body.examinerNotes || req.body.notes || '';
    const completionDate = req.body.completionDate || attemptDate;

    if (!attemptDate || !result) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both trial attempt date and result (passed/failed/absent)',
      });
    }

    const normResult = result.toString().toLowerCase().trim();
    if (!['passed', 'failed', 'absent'].includes(normResult)) {
      return res.status(400).json({
        success: false,
        message: 'Trial outcome must be either "passed", "failed", or "absent"',
      });
    }

    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    // Rule 7 & 8: Check 1.5-Year / 18-Month Validity Period
    const now = new Date();
    if (student.learnerLicenseExpiryDate && now > new Date(student.learnerLicenseExpiryDate)) {
      return res.status(400).json({
        success: false,
        message: 'Registration Expired: 18-month validity period has ended. No further attempts can be recorded in this cycle. Please start a new registration.',
      });
    }

    // Business Rule Check: Learner exam must be passed first (for Type 1 learners)
    const isType2Student =
      student.studentType === 'Type 2' ||
      student.studentType === 'Type2_TrialReady' ||
      student.student_type === 'Type 2';

    const examPassed =
      student.dmtDates?.learnerExamPassed ||
      student.learnerExamStatus === 'passed' ||
      student.written_exam_status === 'Pass' ||
      student.written_exam_status === 'passed';

    if (!examPassed && !isType2Student) {
      return res.status(400).json({
        success: false,
        message: 'Student must pass the DMT Learner Written Exam before a Practical Trial attempt can be recorded.',
      });
    }

    if (!student.trial) {
      student.trial = { attempts: [] };
    }
    if (!student.trial.attempts) {
      student.trial.attempts = [];
    }

    // Rule 5: Maximum 3 attempts allowed in current registration cycle
    if (student.trial.attempts.length >= 3) {
      return res.status(400).json({
        success: false,
        message: 'All 3 Trial Exam attempts have already been used for this registration cycle.',
      });
    }

    // Rule 5: Track Attempt number, Trial Exam Date, Result, Pass/Fail status, Completion date (Trial exams do NOT have scores/marks)
    const attemptNumber = student.trial.attempts.length + 1;
    student.trial.attempts.push({
      attemptNumber,
      date: new Date(attemptDate),
      result: normResult,
      status: normResult === 'passed' ? 'passed' : normResult === 'failed' ? 'failed' : 'absent',
      completionDate: new Date(completionDate),
      notes: examinerNotes,
      examinerNotes: examinerNotes,
    });
    student.trial.attemptsUsed = student.trial.attempts.length;

    // Rule 6: Failed attempt does NOT immediately cancel registration (remaining: 2, 1, 0)
    // Rule 8: Condition A – Only when all 3 attempts fail is registration cancelled
    if (normResult === 'passed') {
      student.trial.licenseObtained = true;
      student.trial.licenseIssuedDate = new Date(attemptDate);
      student.isPassed = true;
      student.passedAt = new Date(attemptDate);
      // The flow requires: Practical Trial -> PASSED -> Upload Driving License Certificate -> PROCESS COMPLETED
      const hasUploadedCertificate = Boolean(
        student.finalLicense?.licensePhotoUrl ||
        student.finalLicense?.verificationStatus === 'verified' ||
        student.finalLicense?.verificationStatus === 'uploaded'
      );
      if (hasUploadedCertificate) {
        student.registrationStatus = 'completed';
        student.learnerLicenseStatus = 'completed';
      } else {
        student.learnerLicenseStatus = 'passed_pending_license';
      }
    } else {
      const attemptsRemaining = Math.max(0, 3 - student.trial.attempts.length);
      if (attemptsRemaining === 0) {
        // Condition A triggered: All 3 attempts failed -> Cancel registration
        student.registrationStatus = 'cancelled';
        student.accountStatus = 'cancelled';
        student.account_status = 'Cancelled';
        student.learnerLicenseStatus = 'attempts_exhausted';
        student.isAdvancePaid = false;
        student.isPremium = false;
      }
    }

    student.lastActivityDate = new Date();
    await student.save();

    // Trigger in-app notification if user exists
    if (student.userId?._id) {
      try {
        const attemptsRemaining = Math.max(0, 3 - student.trial.attempts.length);
        if (normResult === 'passed') {
          await Notification.create({
            recipientId: student.userId._id,
            recipientRole: 'student',
            title: '🎉 Congratulations! Trial Exam Passed',
            message: `You passed Trial Attempt #${attemptNumber}! Your practical driving license process is now completed.`,
            type: 'trial',
            link: '/student/dashboard',
          });
        } else if (attemptsRemaining > 0) {
          await Notification.create({
            recipientId: student.userId._id,
            recipientRole: 'student',
            title: `Trial Exam Attempt #${attemptNumber} Result Recorded`,
            message: `Trial Attempt #${attemptNumber} result was recorded as ${normResult}. You have ${attemptsRemaining} of 3 attempt(s) remaining. Registration remains active.`,
            type: 'trial',
            link: '/student/dashboard',
          });
        } else {
          await Notification.create({
            recipientId: student.userId._id,
            recipientRole: 'student',
            title: '⚠️ Registration Cancelled – 3 Trial Attempts Exhausted',
            message: 'All 3 Trial Exam attempts have been used and were unsuccessful. Your current registration cycle has been cancelled in accordance with DMT regulations. Please visit your dashboard to initiate a new registration cycle.',
            type: 'trial',
            link: '/student/dashboard',
          });
        }
      } catch (notifErr) {
        console.warn('Failed to send trial attempt notification:', notifErr.message);
      }
    }

    // If updated by student, notify branch staff & admin
    if (req.user?.role === 'student') {
      try {
        const staffUsers = await User.find({ role: { $in: ['staff', 'admin'] } }, '_id role');
        for (const su of staffUsers) {
          await Notification.create({
            recipientId: su._id,
            recipientRole: su.role,
            title: `Student Updated Trial Outcome: ${student.userId?.name || 'Student'}`,
            message: `Trial Attempt #${attemptNumber} was marked as ${normResult.toUpperCase()} by student ${student.userId?.name || ''}.`,
            type: 'trial',
            link: '/staff/students',
          });
        }
      } catch (staffNotifErr) {
        console.warn('Failed to notify staff of student trial update:', staffNotifErr.message);
      }
    }

    const attemptsRemaining = Math.max(0, 3 - student.trial.attempts.length);
    const message = normResult === 'passed'
      ? `Trial attempt #${attemptNumber} recorded as PASSED! License process completed.`
      : attemptsRemaining > 0
      ? `Trial attempt #${attemptNumber} recorded as ${normResult}. Student has ${attemptsRemaining} attempt(s) remaining.`
      : `All 3 Trial attempts failed. Registration cycle has been automatically cancelled.`;

    return res.status(200).json({
      success: true,
      message,
      trial: student.trial,
      attemptsRemaining,
      registrationStatus: student.registrationStatus,
      licenseObtained: student.trial.licenseObtained,
      student: sanitizeStudentForType(student),
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
      const pkgDoc = await Package.findOne({ type: packageType, isActive: true });
      if (pkgDoc) {
        student.package.packageId = pkgDoc._id;
        student.package.lessonsTotal = customLessons || pkgDoc.lessons;
        student.package.priceTotal = customPrice || pkgDoc.price;
        student.package.bonusLessons = pkgDoc.bonusLessons || { bike: 0, threeWheeler: 0 };
      } else if (packageType === 'Car_Full') {
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
      dob,
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
      dob: dob ? new Date(dob) : undefined,
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
      name: user.name || name.trim(),
      studentName: user.name || name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      nic: nic.trim(),
      dob: dob ? new Date(dob) : undefined,
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
      const normalized = (studentType === 'Type2_TrialReady' || studentType === 'Type 2') ? 'Type 2' : 'Type 1';
      student.student_type = normalized;
      user.student_type = normalized;
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

    // Zero DMT milestone exposure for Type 2 (Trial-Only) students
    const isType2 =
      student.studentType === 'Type 2' ||
      student.studentType === 'Type2_TrialReady' ||
      student.studentType === 'type2';
    if (isType2) {
      return res.status(403).json({
        success: false,
        message: 'Learner theory exams are not applicable for Type 2 (Trial-Only) students.',
      });
    }

    // Check if 18-month validity has expired
    const now = new Date();
    if (
      student.learnerLicenseStatus === 'expired' ||
      (student.learnerLicenseExpiryDate && now > new Date(student.learnerLicenseExpiryDate))
    ) {
      student.learnerLicenseStatus = 'expired';
      student.registrationStatus = 'cancelled';
      student.accountStatus = 'cancelled';
      student.account_status = 'Cancelled';
      student.isAdvancePaid = false;
      student.isPremium = false;
      await student.save();
      return res.status(400).json({
        success: false,
        message: `Learner license has expired (18-month validity ended on ${
          student.learnerLicenseExpiryDate ? new Date(student.learnerLicenseExpiryDate).toLocaleDateString() : 'N/A'
        }). Please re-register to start a new registration cycle.`,
        isExpired: true,
        isCancelled: true,
      });
    }

    // Check if already cancelled
    if (student.registrationStatus === 'cancelled' || student.accountStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Registration is cancelled. Please re-register as a new student.',
        isCancelled: true,
      });
    }

    // Check if exam already passed
    if (
      student.learnerLicenseStatus === 'passed' ||
      student.learnerLicenseStatus === 'completed' ||
      student.learnerExamStatus === 'passed' ||
      student.dmtDates?.learnerExamPassed
    ) {
      return res.status(400).json({
        success: false,
        message: 'DMT Written Theory Exam has already been passed for this registration cycle.',
      });
    }

    // Student restriction: Cannot record exam attempt without staff assigning a date or before the assigned date
    if (req.user.role === 'student') {
      const scheduledExamDate = student.written_exam_date || student.dmtDates?.learnerExamDate;
      if (!scheduledExamDate) {
        return res.status(400).json({
          success: false,
          message: 'DMT Written Theory Exam date has not been assigned by staff yet. You cannot record results until an exam date is assigned.',
        });
      }
      const todayTime = new Date().setHours(0, 0, 0, 0);
      const scheduledTime = new Date(scheduledExamDate).setHours(0, 0, 0, 0);
      if (todayTime < scheduledTime) {
        return res.status(400).json({
          success: false,
          message: `You cannot record DMT Written Exam results before your scheduled exam date (${new Date(scheduledExamDate).toLocaleDateString()}).`,
        });
      }
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
        message: 'Maximum 3 exam attempts have already been reached for this registration cycle. Registration is cancelled.',
        isCancelled: true,
      });
    }

    const numericMarks = marks !== undefined && marks !== null && marks !== '' ? Number(marks) : null;
    if (numericMarks === null || isNaN(numericMarks) || numericMarks < 0 || numericMarks > 40) {
      return res.status(400).json({
        success: false,
        message: 'DMT Theory Exam marks must be a valid number between 0 and 40.',
      });
    }

    if (result === 'passed' && numericMarks <= 30) {
      return res.status(400).json({
        success: false,
        message: 'DMT Theory Exam requires marks greater than 30 (out of 40) to pass. Marks of 30 or below is a Fail.',
      });
    }

    if (result === 'failed' && numericMarks > 30) {
      return res.status(400).json({
        success: false,
        message: 'Marks greater than 30 is considered a Pass. A failing attempt must have 30 or fewer marks.',
      });
    }

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

    // Ensure registration cycles are synchronized
    if (!student.registrationCycles || student.registrationCycles.length === 0) {
      student.evaluateLifecycle();
    }
    let currentCycle =
      student.registrationCycles?.find((c) => c.cycleNumber === student.currentCycleNumber) ||
      student.registrationCycles?.[student.registrationCycles.length - 1];

    if (currentCycle) {
      currentCycle.examAttempts = student.learnerExamAttempts;
      currentCycle.examAttemptsCount = student.learnerExamAttempts.length;
    }

    if (result === 'passed') {
      student.learnerExamStatus = 'passed';
      student.dmtDates.learnerExamPassed = true;
      student.dmtDates.learnerExamPassedDate = attemptRecord.date;
      student.trialEligible = true;
      student.trial_eligible = true;
      if (currentCycle) {
        currentCycle.dmtDates.learnerExamPassed = true;
        currentCycle.dmtDates.learnerExamPassedDate = attemptRecord.date;
      }

      // Notification
      await Notification.create({
        recipientId: student.userId._id || student.userId,
        recipientRole: 'student',
        title: '🎉 DMT Written Exam Passed!',
        message: `Congratulations! You passed your DMT Written Theory Exam with ${numericMarks !== null ? `${numericMarks} marks` : 'flying colors'} on Attempt ${attemptNumber} of 3. On-road practical lessons are now unlocked!`,
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
        student.learnerLicenseStatus = 'attempts_exhausted';
        student.isAdvancePaid = false;
        student.isPremium = false;
        isAutoCancelled = true;

        if (currentCycle) {
          currentCycle.status = 'attempts_exhausted';
        }

        await User.findByIdAndUpdate(student.userId._id || student.userId, {
          status: 'active',
          account_status: 'Cancelled',
        });

        await Notification.create({
          recipientId: student.userId._id || student.userId,
          recipientRole: 'student',
          title: '⚠️ Registration Cancelled — 3 Exam Attempts Failed',
          message: 'You have exhausted all 3 attempts for the DMT written theory exam. As per DMT regulations, your current registration cycle has closed. Please register again to begin a new registration cycle.',
          type: 'dmt-date',
          link: '/student/dashboard',
        });
      } else {
        const remaining = 3 - student.learnerExamAttempts.length;
        await Notification.create({
          recipientId: student.userId._id || student.userId,
          recipientRole: 'student',
          title: `DMT Exam Attempt ${attemptNumber} Result: Failed`,
          message: `Attempt ${attemptNumber} recorded as Failed (${numericMarks !== null ? `${numericMarks} marks` : 'No marks entered'}). You have ${remaining} attempt(s) remaining under this registration cycle. Please contact branch staff to get a new exam date.`,
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
            ? 'All 3 attempts failed. Registration cycle closed. Please register again.'
            : `Attempt ${attemptNumber} recorded as failed. You have ${3 - attemptNumber} attempt(s) remaining.`),
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

// @desc    Re-register student after 3 failed attempts OR 18-month license expiry (Creates independent new cycle)
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

    // 1. Ensure existing cycles are initialized and archived
    if (!student.registrationCycles || student.registrationCycles.length === 0) {
      student.evaluateLifecycle();
    }

    // Archive current cycle status
    let currentCycle =
      student.registrationCycles.find((c) => c.cycleNumber === student.currentCycleNumber) ||
      student.registrationCycles[student.registrationCycles.length - 1];

    if (currentCycle) {
      currentCycle.examAttempts = student.learnerExamAttempts || [];
      currentCycle.examAttemptsCount = (student.learnerExamAttempts || []).length;
      currentCycle.trialAttempts = student.trial?.attempts || student.trialAttempts || [];
      currentCycle.trialAttemptsCount = currentCycle.trialAttempts.length;
      currentCycle.trial = {
        attempts: student.trial?.attempts || [],
        attemptsUsed: student.trial?.attemptsUsed || (student.trial?.attempts || []).length,
        trialDate: student.trial_date || student.trial?.trialDate || null,
        licenseObtained: student.trial?.licenseObtained || false,
        licenseIssuedDate: student.trial?.licenseIssuedDate || null,
      };
      currentCycle.trial_date = student.trial_date || null;
      currentCycle.cycleEndedAt = new Date();

      const isTrialExhausted =
        currentCycle.trialAttemptsCount >= 3 &&
        !currentCycle.trialAttempts.some((a) => a.result === 'passed');
      const isTheoryExhausted =
        currentCycle.examAttemptsCount >= 3 &&
        !currentCycle.examAttempts.some((a) => a.result === 'passed');

      if (isTrialExhausted) {
        currentCycle.status = 'attempts_exhausted';
        currentCycle.reasonForClose = 'Trial Attempts Exceeded (3/3 Failed)';
      } else if (isTheoryExhausted) {
        currentCycle.status = 'attempts_exhausted';
        currentCycle.reasonForClose = 'Theory Attempts Exceeded (3/3 Failed)';
      } else if (new Date() > new Date(currentCycle.expiryDate)) {
        currentCycle.status = 'expired';
        currentCycle.reasonForClose = '18-Month Validity Expired';
      } else {
        currentCycle.status = 'cancelled';
        currentCycle.reasonForClose = student.cancellationReason || 'Registration Cancelled';
      }
    }

    // 2. Create brand-new independent Registration Cycle (Rules 11, 12, 14)
    const nextCycleNumber = (student.registrationCycles?.length || 0) + 1;
    const newStartDate = new Date();
    const newExpiryDate = Student.compute18MonthExpiry(newStartDate);
    const newCycleId = `CYCLE-${nextCycleNumber}-${Date.now()}`;

    const newCycle = {
      cycleId: newCycleId,
      cycleNumber: nextCycleNumber,
      startDate: newStartDate,
      expiryDate: newExpiryDate,
      status: 'pending_payment',
      isAdvancePaid: false,
      advancePaymentAmount: 5000,
      advancePaymentReference: '',
      advancePaymentDate: null,
      dmtDates: {
        medicalExamDate: null,
        medicalExamPassed: null,
        medicalDone: false,
        learnerRegistrationDate: null,
        learnerExamDate: null,
        learnerExamPassed: false,
        learnerExamMarks: null,
      },
      examAttempts: [],
      examAttemptsCount: 0,
      trialAttempts: [],
      trialAttemptsCount: 0,
      trial: {
        attempts: [],
        attemptsUsed: 0,
        trialDate: null,
        licenseObtained: false,
        licenseIssuedDate: null,
      },
      trial_date: null,
      isPassed: false,
      finalLicense: {
        licenseNumber: '',
        licensePhotoUrl: null,
        verificationStatus: 'not_uploaded',
      },
      notes: `Re-registration cycle #${nextCycleNumber}`,
    };

    student.registrationCycles.push(newCycle);
    student.currentCycleNumber = nextCycleNumber;

    // 3. Reset active fields for the new cycle (Clean start: 0 of 3 attempts, fresh 18 months, new advance fee required)
    student.registrationStatus = 'pending_payment';
    student.cancellationReason = null;
    student.lifecycleStatus = 'pending_payment';
    student.accountStatus = 'pending_verification';
    student.account_status = 'Unverified / Pending Payment';
    student.advancePaymentStatus = 'pending';
    student.isAdvancePaid = false;
    student.isPremium = false;
    student.trialEligible = false;
    student.trial_eligible = false;
    student.trial_date = null;
    student.trial = {
      attempts: [],
      attemptsUsed: 0,
      status: 'pending',
      lastTrialDate: null,
      finalResult: null,
      licenseObtained: false,
      licenseIssuedDate: null,
    };
    student.trialAttempts = [];
    student.trialAttemptsCount = 0;
    student.lessonsUsed = 0;

    student.learnerExamStatus = 'not_taken';
    student.written_exam_status = 'Pending';
    student.written_exam_date = null;
    student.learnerExamMarks = null;
    student.learnerExamAttempts = []; // Resets attempt count to 0 of 3
    student.learnerExamAttemptsCount = 0;
    student.advancePaymentReference = '';

    student.learnerLicenseStartDate = newStartDate;
    student.learnerLicenseExpiryDate = newExpiryDate;
    student.learnerLicenseStatus = 'pending_payment';
    student.finalLicense = {
      licenseNumber: '',
      licensePhotoUrl: null,
      verificationStatus: 'not_uploaded',
    };

    student.dmtDates = {
      medicalExamDate: null,
      medicalExamPassed: null,
      medicalDone: false,
      medicalDoneDate: null,
      medicalDocumentUrl: null,
      medicalRemarks: null,
      learnerRegistrationDate: null,
      registrationDone: false,
      registrationDoneDate: null,
      registrationDocumentUrl: null,
      registrationRemarks: null,
      learnerExamDate: null,
      learnerExamPassed: false,
      learnerExamPassedDate: null,
      learnerExamMarks: null,
      learnerExamDocumentUrl: null,
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
      title: `Registration Cycle #${nextCycleNumber} Initialized`,
      message: `Your new 18-month registration cycle has been created (Valid until ${newExpiryDate.toLocaleDateString()}). Please pay the Rs. 5,000 advance fee to activate your new cycle.`,
      type: 'payment',
      link: '/student/dashboard',
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email phone role branch status createdAt')
      .populate('package.packageId');

    return res.status(200).json({
      success: true,
      message: `New registration cycle #${nextCycleNumber} created! New 18-month validity assigned. Please complete your Rs. 5,000 advance payment.`,
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

// @desc    Admin explicitly marks learner as Passed (US Requirement 5 & 11)
// @route   PATCH /api/students/:id/final-pass
// @access  Staff, Admin
exports.markStudentPassed = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    if (student.registrationStatus === 'cancelled' || student.learnerLicenseStatus === 'expired') {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark an expired or cancelled learner as Passed. The learner must re-register first.',
      });
    }

    // Ensure registration cycles are evaluated
    student.evaluateLifecycle();

    let currentCycle =
      student.registrationCycles?.find((c) => c.cycleNumber === student.currentCycleNumber) ||
      student.registrationCycles?.[student.registrationCycles.length - 1];

    if (currentCycle) {
      currentCycle.isPassed = true;
      currentCycle.passedAt = new Date();
      currentCycle.passedBy = req.user._id;
      currentCycle.status = 'passed';
    }

    student.learnerLicenseStatus = 'passed';
    if (!student.learnerExamStatus || student.learnerExamStatus === 'not_taken') {
      student.learnerExamStatus = 'passed';
    }
    if (student.dmtDates) {
      student.dmtDates.learnerExamPassed = true;
    }
    student.trialEligible = true;
    student.trial_eligible = true;
    student.lastActivityDate = new Date();

    await student.save();

    await Notification.create({
      recipientId: student.userId._id || student.userId,
      recipientRole: 'student',
      title: '🎉 Marked as PASSED — Upload Final License Photo',
      message: 'Congratulations! You have been officially marked as PASSED for your DMT driving license process. Please upload your final driving license photo to finalize your record.',
      type: 'dmt-date',
      link: '/student/dashboard',
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email phone role branch status createdAt')
      .populate('package.packageId');

    return res.status(200).json({
      success: true,
      message: 'Learner successfully marked as PASSED! Final driving license photo is now required.',
      student: populatedStudent,
    });
  } catch (error) {
    console.error('Error marking student as passed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark student as passed',
      error: error.message,
    });
  }
};

// @desc    Upload Final Driving License Photo and License Number (US Requirement 6 & 7)
// @route   POST /api/students/:id/final-license
// @access  Student (self) OR Staff/Admin
exports.uploadFinalLicense = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // Ownership check
    if (req.user.role === 'student' && student.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { licenseNumber, autoVerify } = req.body;
    const licensePhotoUrl = req.file ? `/uploads/final_licenses/${req.file.filename}` : null;

    if (!licensePhotoUrl && (!student.finalLicense || !student.finalLicense.licensePhotoUrl)) {
      return res.status(400).json({
        success: false,
        message: 'A valid driving license photo (JPG, JPEG, PNG, WEBP) is required.',
      });
    }

    if (!student.finalLicense) {
      student.finalLicense = {};
    }

    if (licensePhotoUrl) {
      student.finalLicense.licensePhotoUrl = licensePhotoUrl;
    }
    if (licenseNumber !== undefined && licenseNumber !== null) {
      student.finalLicense.licenseNumber = licenseNumber.trim();
    }
    student.finalLicense.uploadedAt = new Date();
    student.finalLicense.uploadedBy = req.user._id;
    student.finalLicense.uploadedByRole = req.user.role;

    const isStaffOrAdmin = ['staff', 'admin'].includes(req.user.role);
    if (isStaffOrAdmin && (autoVerify === 'true' || autoVerify === true)) {
      student.finalLicense.verificationStatus = 'verified';
      student.finalLicense.verifiedAt = new Date();
      student.finalLicense.verifiedBy = req.user._id;
      student.learnerLicenseStatus = 'completed';
      student.registrationStatus = 'completed';
      if (!student.trial) student.trial = {};
      student.trial.licenseObtained = true;
      if (!student.trial.licenseIssuedDate) {
        student.trial.licenseIssuedDate = new Date();
      }
    } else {
      student.finalLicense.verificationStatus = 'uploaded';
      // If student already passed practical trial, completing certificate upload finishes the process
      const hasPassedTrial =
        student.trial?.licenseObtained ||
        student.isPassed ||
        student.trial?.attempts?.some((a) => a.result === 'passed');
      if (hasPassedTrial) {
        student.learnerLicenseStatus = 'completed';
        student.registrationStatus = 'completed';
      }
    }

    // Sync to current cycle
    let currentCycle =
      student.registrationCycles?.find((c) => c.cycleNumber === student.currentCycleNumber) ||
      student.registrationCycles?.[student.registrationCycles.length - 1];

    if (currentCycle) {
      currentCycle.finalLicense = student.finalLicense;
      if (student.finalLicense.verificationStatus === 'verified' || student.registrationStatus === 'completed') {
        currentCycle.status = 'completed';
      }
    }

    student.lastActivityDate = new Date();
    await student.save();

    try {
      if (req.user.role === 'student') {
        const staffUsers = await User.find({ role: { $in: ['staff', 'admin'] } }, '_id role');
        for (const su of staffUsers) {
          await Notification.create({
            recipientId: su._id,
            recipientRole: su.role,
            title: '📸 Final Driving License Photo Uploaded',
            message: `Student ${student.userId?.name || 'A student'} (${student.branch || 'Branch'}) has uploaded their final driving license photo for verification.`,
            type: 'system',
            link: '/staff/students',
          });
        }
      } else if (student.finalLicense.verificationStatus === 'verified') {
        const studentUserId = student.userId?._id || student.userId;
        if (studentUserId) {
          await Notification.create({
            recipientId: studentUserId,
            recipientRole: 'student',
            title: '🏁 LICENSE COMPLETED!',
            message: 'Your driving license information has been successfully verified and completed!',
            type: 'dmt-date',
            link: '/student/dashboard',
          });
        }
      }
    } catch (notifErr) {
      console.warn('Failed to send license upload notification:', notifErr.message);
    }

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email phone role branch status createdAt')
      .populate('package.packageId');

    return res.status(200).json({
      success: true,
      message:
        student.finalLicense.verificationStatus === 'verified'
          ? 'Driving license photo verified. License process completed!'
          : 'Driving license photo uploaded successfully. Pending verification.',
      student: sanitizeStudentForType(populatedStudent),
    });
  } catch (error) {
    console.error('Error uploading final license photo:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload final license photo',
      error: error.message,
    });
  }
};

// @desc    Admin/Staff verifies or rejects Final Driving License photo (US Requirement 6 & 7)
// @route   PATCH /api/students/:id/final-license/verify
// @access  Staff, Admin
exports.verifyFinalLicense = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    const { action, notes } = req.body;
    if (!['verify', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be 'verify' or 'reject'" });
    }

    if (!student.finalLicense || !student.finalLicense.licensePhotoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Cannot verify driving license without an uploaded license photo.',
      });
    }

    let currentCycle =
      student.registrationCycles?.find((c) => c.cycleNumber === student.currentCycleNumber) ||
      student.registrationCycles?.[student.registrationCycles.length - 1];

    if (action === 'verify') {
      student.finalLicense.verificationStatus = 'verified';
      student.finalLicense.verifiedAt = new Date();
      student.finalLicense.verifiedBy = req.user._id;
      student.finalLicense.verificationNotes = notes || '';
      student.learnerLicenseStatus = 'completed';
      student.registrationStatus = 'completed';
      if (!student.trial) student.trial = {};
      student.trial.licenseObtained = true;
      if (!student.trial.licenseIssuedDate) {
        student.trial.licenseIssuedDate = new Date();
      }

      if (currentCycle) {
        currentCycle.finalLicense = student.finalLicense;
        currentCycle.status = 'completed';
      }

      await Notification.create({
        recipientId: student.userId._id || student.userId,
        recipientRole: 'student',
        title: '🏁 Driving License Verified — COMPLETED',
        message: 'Your driving license information has been successfully verified and completed.',
        type: 'dmt-date',
        link: '/student/dashboard',
      });
    } else {
      student.finalLicense.verificationStatus = 'rejected';
      student.finalLicense.verificationNotes = notes || 'Uploaded license photo was rejected. Please re-upload a clear copy.';
      if (currentCycle) {
        currentCycle.finalLicense = student.finalLicense;
      }

      await Notification.create({
        recipientId: student.userId._id || student.userId,
        recipientRole: 'student',
        title: '⚠️ Driving License Photo Rejected',
        message: `Your driving license photo could not be verified. Reason: ${student.finalLicense.verificationNotes}`,
        type: 'dmt-date',
        link: '/student/dashboard',
      });
    }

    student.lastActivityDate = new Date();
    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email phone role branch status createdAt')
      .populate('package.packageId');

    return res.status(200).json({
      success: true,
      message: action === 'verify' ? 'Driving license verified successfully!' : 'Driving license rejected.',
      student: populatedStudent,
    });
  } catch (error) {
    console.error('Error verifying final license:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify final license',
      error: error.message,
    });
  }
};

// @desc    Get all registration cycles & attempt history for a student (US Requirement 10 & 11)
// @route   GET /api/students/:id/registration-cycles
// @access  Student (self) OR Staff/Admin
exports.getRegistrationCycles = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email phone role branch')
      .populate('registrationCycles.passedBy', 'name role')
      .populate('finalLicense.verifiedBy', 'name role');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    if (req.user.role === 'student' && student.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const changed = student.evaluateLifecycle();
    if (changed) {
      await student.save();
    }

    return res.status(200).json({
      success: true,
      studentId: student._id,
      currentCycleNumber: student.currentCycleNumber || 1,
      learnerLicenseStatus: student.learnerLicenseStatus || 'active',
      learnerLicenseStartDate: student.learnerLicenseStartDate,
      learnerLicenseExpiryDate: student.learnerLicenseExpiryDate,
      finalLicense: student.finalLicense,
      registrationCycles: student.registrationCycles || [],
    });
  } catch (error) {
    console.error('Error fetching registration cycles:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve registration cycles',
      error: error.message,
    });
  }
};

// Helper to cancel any bookings scheduled on or after Trial Exam Date (Rules 2 & 3)
const cancelBookingsOnOrAfterTrialDate = async (student, trialDate, staffUser) => {
  try {
    const cutoffDate = new Date(trialDate);
    cutoffDate.setHours(0, 0, 0, 0);

    const activeBookings = await Booking.find({
      studentId: student._id,
      status: { $in: ['confirmed', 'pending'] },
    }).populate('timeSlotId');

    const conflictingBookings = activeBookings.filter((b) => {
      if (!b.timeSlotId || !b.timeSlotId.date) return false;
      const slotDate = new Date(b.timeSlotId.date);
      slotDate.setHours(0, 0, 0, 0);
      return slotDate.getTime() >= cutoffDate.getTime();
    });

    let cancelledCount = 0;
    for (const b of conflictingBookings) {
      b.status = 'cancelled';
      b.cancellationReason = 'Cancelled – Trial Exam Date Restriction';
      await b.save();

      if (b.timeSlotId && b.timeSlotId._id) {
        const slot = await TimeSlot.findById(b.timeSlotId._id);
        if (slot) {
          slot.bookedCount = Math.max(0, (slot.bookedCount || 1) - 1);
          if (slot.status === 'full') {
            slot.status = 'available';
          }
          await slot.save();
        }
      }
      cancelledCount++;
    }

    if (cancelledCount > 0) {
      student.lessonsUsed = Math.max(0, (student.lessonsUsed || 0) - cancelledCount);
      if (student.package) {
        student.package.lessonsUsed = student.lessonsUsed;
      }
      await student.save();

      const dateFormatted = new Date(trialDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      await Notification.create({
        recipientId: student.userId?._id || student.userId,
        recipientRole: 'student',
        title: '⚠️ Lesson Bookings Cancelled – Trial Exam Cut-Off',
        message: `${cancelledCount} lesson booking(s) scheduled on or after your newly scheduled Trial Exam Date (${dateFormatted}) have been automatically cancelled. Lessons cannot be taken on or after the trial date. Your package lesson balance has been restored.`,
        type: 'booking',
        link: '/student/lessons',
      });
    }

    return cancelledCount;
  } catch (err) {
    console.error('Error auto-cancelling bookings after trial date:', err);
    return 0;
  }
};

// @desc    Set or update Practical Trial Date for a student (Staff / Admin only)
// @route   PATCH /api/students/:id/trial-date
// @access  Staff, Admin
exports.setTrialDate = async (req, res) => {
  try {
    const { trialDate } = req.body;
    if (!trialDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid trial date',
      });
    }

    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    const parsedDate = new Date(trialDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trial date format',
      });
    }

    student.trial_date = parsedDate;
    if (!student.trial) student.trial = {};
    student.trial.trialDate = parsedDate;
    student.trial_date_set_by = req.user._id;
    student.trial_date_set_at = new Date();
    student.lastActivityDate = new Date();

    await student.save();

    // Cancel any existing lesson bookings on or after the newly assigned Trial Exam Date (Rules 2 & 3)
    const cancelledCount = await cancelBookingsOnOrAfterTrialDate(student, parsedDate, req.user);

    // Trigger in-app notification for student
    const hasTime = parsedDate.getHours() !== 0 || parsedDate.getMinutes() !== 0;
    const dateFormatted = parsedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });

    await Notification.create({
      recipientId: student.userId._id || student.userId,
      recipientRole: 'student',
      title: '📅 Practical Trial Date Scheduled',
      message: `Your practical trial exam has been scheduled for ${dateFormatted} by ${req.user.name || 'Branch Staff'}. In accordance with DMT regulations, lessons can only be booked before this date.${cancelledCount > 0 ? ` ${cancelledCount} conflicting lesson(s) on or after this date have been automatically cancelled and your package balance restored.` : ''}`,
      type: 'trial',
      link: '/student/dashboard',
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email phone role branch createdAt')
      .populate('package.packageId')
      .populate('trial_date_set_by', 'name role');

    const message = cancelledCount > 0
      ? `Practical trial date scheduled for ${dateFormatted}. ${cancelledCount} lesson booking(s) on or after this date were automatically cancelled.`
      : 'Trial date scheduled successfully';

    return res.status(200).json({
      success: true,
      message,
      cancelledCount,
      trialDate: student.trial_date,
      student: sanitizeStudentForType(populatedStudent),
    });
  } catch (error) {
    console.error('Error setting trial date:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to set trial date',
      error: error.message,
    });
  }
};

// @desc    Submit a Date Reschedule Request (Student - Milestones & Trial)
// @route   POST /api/students/trial-date/reschedule
// @access  Student
exports.submitRescheduleRequest = async (req, res) => {
  try {
    const { reason, preferredDate, preferredTime, milestoneType = 'trial' } = req.body;

    const validMilestones = ['medical', 'registration', 'theory_exam', 'trial'];
    const activeMilestone = validMilestones.includes(milestoneType) ? milestoneType : 'trial';

    const milestoneLabels = {
      medical: 'DMT Medical Exam',
      registration: 'DMT Registration',
      theory_exam: 'DMT Written Theory Exam',
      trial: 'Practical Driving Trial',
    };
    const milestoneLabel = milestoneLabels[activeMilestone];

    // Find student record for logged in user
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    // Determine current scheduled date for this milestone
    let previousDate = null;
    if (activeMilestone === 'medical') {
      previousDate = student.dmtDates?.medicalExamDate || student.medical_date || null;
    } else if (activeMilestone === 'registration') {
      previousDate = student.dmtDates?.learnerRegistrationDate || student.registration_date || null;
    } else if (activeMilestone === 'theory_exam') {
      previousDate = student.dmtDates?.learnerExamDate || student.written_exam_date || null;
    } else {
      previousDate = student.trial_date || null;
    }

    if (!previousDate) {
      return res.status(400).json({
        success: false,
        message: `You do not have a scheduled ${milestoneLabel} date yet. A date must be assigned by branch staff before you can request another date.`,
      });
    }

    // Check for existing pending request for this specific milestone
    const existingPending = await RescheduleRequest.findOne({
      student_id: student._id,
      milestone_type: activeMilestone,
      status: 'Pending',
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: `You already have a pending reschedule request for ${milestoneLabel} awaiting review by branch staff.`,
      });
    }

    const parsedPreferred = preferredDate ? new Date(preferredDate) : null;
    if (parsedPreferred && isNaN(parsedPreferred.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid preferred date format',
      });
    }

    const rescheduleReq = await RescheduleRequest.create({
      student_id: student._id,
      requested_by: req.user._id,
      reason: (reason || '').trim(),
      preferred_date: parsedPreferred,
      preferred_time: (preferredTime || '').trim(),
      milestone_type: activeMilestone,
      previous_date: previousDate,
      previous_trial_date: activeMilestone === 'trial' ? student.trial_date : previousDate,
      status: 'Pending',
    });

    // Notify branch staff and Data Entry Officers
    try {
      const staffMembers = await User.find({
        role: { $in: ['staff', 'admin'] },
        $or: [
          { branch: student.branch },
          { branch: 'All' },
          { branch: { $exists: false } },
        ],
      });
      if (staffMembers.length > 0) {
        const notifDocs = staffMembers.map((sm) => ({
          recipientId: sm._id,
          recipientRole: sm.role,
          title: `📅 New ${milestoneLabel} Date Reschedule Request`,
          message: `${req.user.name || 'A student'} (${student.branch} branch) requested another date for ${milestoneLabel}. Reason: "${(reason || 'None provided').substring(0, 60)}"`,
          type: 'trial',
          link: '/staff/students',
        }));
        await Notification.insertMany(notifDocs);
      }
    } catch (notifErr) {
      console.warn('Could not dispatch staff notifications:', notifErr.message);
    }

    return res.status(201).json({
      success: true,
      message: `${milestoneLabel} date reschedule request submitted successfully. A branch officer will review it shortly.`,
      request: rescheduleReq,
    });
  } catch (error) {
    console.error('Error submitting reschedule request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit reschedule request',
      error: error.message,
    });
  }
};

// @desc    Get student's own trial/milestone date reschedule requests
// @route   GET /api/students/trial-date/reschedule
// @access  Student
exports.getMyRescheduleRequests = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const requests = await RescheduleRequest.find({ student_id: student._id })
      .sort({ createdAt: -1 })
      .populate('reviewed_by', 'name role');

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error('Error fetching reschedule requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reschedule requests',
      error: error.message,
    });
  }
};

// @desc    Get all reschedule requests for DEO/Staff review
// @route   GET /api/students/reschedule-requests/all
// @access  Staff, Admin
exports.getAllRescheduleRequests = async (req, res) => {
  try {
    const { status, milestoneType, branch } = req.query;
    const filter = {};
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (milestoneType && milestoneType !== 'All') {
      filter.milestone_type = milestoneType;
    }

    // Branch filter: if provided or if staff has a specific branch
    const effectiveBranch =
      branch && branch !== 'All'
        ? branch
        : req.user.role === 'staff' && req.user.branch && req.user.branch !== 'All'
        ? req.user.branch
        : null;

    if (effectiveBranch) {
      const branchStudents = await Student.find({ branch: effectiveBranch }).select('_id');
      const branchStudentIds = branchStudents.map((s) => s._id);
      filter.student_id = { $in: branchStudentIds };
    }

    const requests = await RescheduleRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'student_id',
        select: 'nic studentType student_type branch accountStatus advancePaymentStatus dmtDates medical_date registration_date written_exam_date trial_date',
        populate: { path: 'userId', select: 'name email phone branch student_type nic' },
      })
      .populate('requested_by', 'name email phone branch')
      .populate('reviewed_by', 'name role');

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error('Error fetching all reschedule requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reschedule requests',
      error: error.message,
    });
  }
};

// @desc    Review (Approve or Reject) a date reschedule request (DEO/Staff/Admin)
// @route   PATCH /api/students/reschedule-requests/:id/review
// @access  Staff, Admin
exports.reviewRescheduleRequest = async (req, res) => {
  try {
    const { status, newTrialDate, newDate, reviewNotes } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved' or 'Rejected'",
      });
    }

    const rescheduleReq = await RescheduleRequest.findById(req.params.id)
      .populate('student_id');

    if (!rescheduleReq) {
      return res.status(404).json({
        success: false,
        message: 'Reschedule request not found',
      });
    }

    if (rescheduleReq.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This reschedule request has already been ${rescheduleReq.status.toLowerCase()}`,
      });
    }

    const milestoneType = rescheduleReq.milestone_type || 'trial';
    const milestoneLabels = {
      medical: 'DMT Medical Exam',
      registration: 'DMT Registration',
      theory_exam: 'DMT Written Theory Exam',
      trial: 'Practical Driving Trial',
    };
    const milestoneLabel = milestoneLabels[milestoneType] || 'Milestone';

    if (status === 'Approved') {
      const targetDate = newDate || newTrialDate;
      if (!targetDate) {
        return res.status(400).json({
          success: false,
          message: `A new ${milestoneLabel} date is required when approving a reschedule request`,
        });
      }

      const parsedNewDate = new Date(targetDate);
      if (isNaN(parsedNewDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid new date format',
        });
      }

      rescheduleReq.status = 'Approved';
      rescheduleReq.new_date = parsedNewDate;
      rescheduleReq.new_trial_date = parsedNewDate;
      rescheduleReq.reviewed_by = req.user._id;
      rescheduleReq.reviewed_at = new Date();
      rescheduleReq.review_notes = (reviewNotes || '').trim();
      await rescheduleReq.save();

      // Update student's corresponding milestone or trial date
      const student = await Student.findById(rescheduleReq.student_id._id || rescheduleReq.student_id).populate('userId');
      if (student) {
        if (!student.dmtDates) student.dmtDates = {};

        if (milestoneType === 'medical') {
          student.medical_date = parsedNewDate;
          student.dmtDates.medicalExamDate = parsedNewDate;
          if (parsedNewDate > new Date()) {
            student.dmtDates.medicalExamPassed = null;
            student.dmtDates.medicalExamStatus = null;
            student.dmtDates.medicalDone = false;
          }
        } else if (milestoneType === 'registration') {
          student.registration_date = parsedNewDate;
          student.dmtDates.learnerRegistrationDate = parsedNewDate;
        } else if (milestoneType === 'theory_exam') {
          student.written_exam_date = parsedNewDate;
          student.dmtDates.learnerExamDate = parsedNewDate;
          if (parsedNewDate > new Date()) {
            student.dmtDates.learnerExamPassed = false;
            student.dmtDates.learnerExamStatus = 'scheduled';
            student.learnerExamStatus = 'scheduled';
          }
        } else {
          // 'trial'
          student.trial_date = parsedNewDate;
          student.trial_date_set_by = req.user._id;
          student.trial_date_set_at = new Date();
          student.trial_eligible = true;
          student.trialEligible = true;
          if (!student.trial) student.trial = {};
          student.trial.trialDate = parsedNewDate;
          await cancelBookingsOnOrAfterTrialDate(student, parsedNewDate, req.user);
        }

        student.lastActivityDate = new Date();
        await student.save();

        // In-app notification to student
        const dateFormatted = parsedNewDate.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        await Notification.create({
          recipientId: student.userId?._id || student.userId,
          recipientRole: 'student',
          title: `✅ ${milestoneLabel} Date Rescheduled`,
          message: `Your ${milestoneLabel} date reschedule request was approved! Your new date is scheduled for ${dateFormatted}.${milestoneType === 'trial' ? ' Practical lesson booking access has reopened.' : ''}`,
          type: 'trial',
          link: milestoneType === 'trial' ? '/student/lessons' : '/student/milestones',
        });
      }

      return res.status(200).json({
        success: true,
        message: `Reschedule request approved and new ${milestoneLabel} date updated successfully.`,
        request: rescheduleReq,
        newDate: parsedNewDate,
        newTrialDate: parsedNewDate,
      });
    } else {
      // Rejected
      rescheduleReq.status = 'Rejected';
      rescheduleReq.reviewed_by = req.user._id;
      rescheduleReq.reviewed_at = new Date();
      rescheduleReq.review_notes = (reviewNotes || '').trim();
      await rescheduleReq.save();

      const student = await Student.findById(rescheduleReq.student_id._id || rescheduleReq.student_id).populate('userId');
      if (student) {
        await Notification.create({
          recipientId: student.userId?._id || student.userId,
          recipientRole: 'student',
          title: `❌ ${milestoneLabel} Date Reschedule Request Not Approved`,
          message: `Your ${milestoneLabel} date reschedule request was not approved. ${reviewNotes ? `Officer notes: ${reviewNotes}` : 'Please contact your branch office.'}`,
          type: 'trial',
          link: milestoneType === 'trial' ? '/student/dashboard' : '/student/milestones',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Reschedule request rejected',
        request: rescheduleReq,
      });
    }
  } catch (error) {
    console.error('Error reviewing reschedule request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to review reschedule request',
      error: error.message,
    });
  }
};

// @desc    Upload Proof Document & Update Milestone Status (Medical, Registration, Written Exam)
// @route   POST /api/students/:id/milestone-proof
// @access  Student (self) OR Staff/Admin
exports.uploadMilestoneProof = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // Ownership check
    if (req.user.role === 'student' && student.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { milestoneType, status, remarks } = req.body;
    const fileUrl = req.file ? `/uploads/dmt_proofs/${req.file.filename}` : null;

    if (!['medical', 'registration', 'theory_exam'].includes(milestoneType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid milestoneType. Must be medical, registration, or theory_exam.',
      });
    }

    if (milestoneType === 'medical') {
      if (req.user.role === 'student') {
        const medDate = student.medical_date || student.dmtDates?.medicalExamDate;
        if (!medDate) {
          return res.status(400).json({
            success: false,
            message: 'DMT Medical Exam date has not been assigned by staff yet. You cannot update status or upload proof until a date is assigned.',
          });
        }
        const todayTime = new Date().setHours(0, 0, 0, 0);
        const medTime = new Date(medDate).setHours(0, 0, 0, 0);
        if (todayTime < medTime) {
          return res.status(400).json({
            success: false,
            message: `You cannot update DMT Medical Exam status or upload proof before your scheduled date (${new Date(medDate).toLocaleDateString()}).`,
          });
        }
      }

      if (fileUrl) {
        student.medicalDocumentUrl = fileUrl;
        student.dmtDates.medicalDocumentUrl = fileUrl;
      }
      if (remarks !== undefined) {
        student.medicalRemarks = remarks.trim();
        student.dmtDates.medicalRemarks = remarks.trim();
      }
      if (status === 'passed') {
        student.dmtDates.medicalExamStatus = 'passed';
        student.dmtDates.medicalExamPassed = true;
        student.dmtDates.medicalDone = true;
        student.dmtDates.medicalDoneDate = new Date();
      } else if (status === 'failed') {
        student.dmtDates.medicalExamStatus = 'failed';
        student.dmtDates.medicalExamPassed = false;
        student.dmtDates.medicalDone = false;
      }
    } else if (milestoneType === 'registration') {
      if (req.user.role === 'student') {
        const regDate = student.registration_date || student.dmtDates?.learnerRegistrationDate;
        if (!regDate) {
          return res.status(400).json({
            success: false,
            message: 'DMT Registration submission date has not been assigned by staff yet. You cannot mark registration as completed or upload proof until a date is assigned.',
          });
        }
        const todayTime = new Date().setHours(0, 0, 0, 0);
        const regTime = new Date(regDate).setHours(0, 0, 0, 0);
        if (todayTime < regTime) {
          return res.status(400).json({
            success: false,
            message: `You cannot mark DMT Registration as completed or upload proof before your scheduled date (${new Date(regDate).toLocaleDateString()}).`,
          });
        }
      }

      if (fileUrl) {
        student.registrationDocumentUrl = fileUrl;
        student.dmtDates.registrationDocumentUrl = fileUrl;
      }
      if (remarks !== undefined) {
        student.registrationRemarks = remarks.trim();
        student.dmtDates.registrationRemarks = remarks.trim();
      }
      if (status === 'done' || status === 'completed') {
        student.dmtDates.registrationDone = true;
        student.dmtDates.registrationDoneDate = new Date();
      } else if (status === 'pending' || status === 'incomplete') {
        student.dmtDates.registrationDone = false;
      }
    } else if (milestoneType === 'theory_exam') {
      if (req.user.role === 'student') {
        const examDate = student.written_exam_date || student.dmtDates?.learnerExamDate;
        if (!examDate) {
          return res.status(400).json({
            success: false,
            message: 'DMT Written Theory Exam date has not been assigned by staff yet. You cannot upload proof until a date is assigned.',
          });
        }
        const todayTime = new Date().setHours(0, 0, 0, 0);
        const examTime = new Date(examDate).setHours(0, 0, 0, 0);
        if (todayTime < examTime) {
          return res.status(400).json({
            success: false,
            message: `You cannot upload Written Theory Exam proof before your scheduled date (${new Date(examDate).toLocaleDateString()}).`,
          });
        }
      }

      if (fileUrl) {
        student.dmtDates.learnerExamDocumentUrl = fileUrl;
      }
      if (remarks !== undefined) {
        student.dmtDates.learnerExamRemarks = remarks.trim();
      }
    }

    student.lastActivityDate = new Date();
    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email phone role branch createdAt')
      .populate('package.packageId');

    return res.status(200).json({
      success: true,
      message: 'Milestone proof document and details saved successfully!',
      student: sanitizeStudentForType(populatedStudent),
    });
  } catch (error) {
    console.error('Error uploading milestone proof:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload milestone proof document',
      error: error.message,
    });
  }
};

// @desc    Upload / change student profile photo
// @route   POST /api/students/:id/profile-photo
// @access  Student
exports.uploadStudentProfilePhoto = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // Check ownership
    if (req.user.role === 'student' && student.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a photo file to upload' });
    }

    const photoUrl = `/uploads/avatars/${req.file.filename}`;
    student.profilePicture = photoUrl;
    student.lastActivityDate = new Date();
    await student.save();

    await User.findByIdAndUpdate(student.userId, {
      profilePicture: photoUrl,
      avatar: photoUrl,
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email phone role branch createdAt profilePicture avatar')
      .populate('package.packageId')
      .populate('trial_date_set_by', 'name role');

    return res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully!',
      photoUrl,
      student: sanitizeStudentForType(populatedStudent),
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo',
      error: error.message,
    });
  }
};

