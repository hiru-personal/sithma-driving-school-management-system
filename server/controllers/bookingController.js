const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');
const Student = require('../models/Student');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Book a practical driving lesson slot
// @route   POST /api/bookings
// @access  Student
exports.createBooking = async (req, res) => {
  try {
    const { timeSlotId, vehicleType, lessonType = 'regular' } = req.body;

    if (!timeSlotId || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide timeSlotId and vehicleType',
      });
    }

    // 1. Find Student Profile
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    // 2. Gate: Account verification
    if (student.accountStatus === 'pending_verification') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending verification by our branch officer. Booking is restricted until verified.',
      });
    }

    // 3. Gate: Type 1 (New Learner) DMT Learner's Exam Gate (US-09)
    // Type 1 students can ONLY book lessons after passing their learner exam
    const isType1 = student.studentType === 'Type1_NewLearner' || student.studentType === 'Type 1';
    if (isType1) {
      const isLearnerPassed =
        student.trialEligible ||
        student.learnerExamStatus === 'passed' ||
        Boolean(student.dmtDates?.learnerExamPassed);
      if (!isLearnerPassed) {
        return res.status(403).json({
          success: false,
          message: `DMT Requirement (US-09): As a Type 1 New Learner, practical and trial lessons can only be booked after your Learner Written Exam is officially marked 'Passed' by the branch officer. (Current status: ${
            student.learnerExamStatus === 'failed' ? 'Failed - Awaiting Retake' : 'Not Faced / In Progress'
          })`,
        });
      }
    }

    // 4. Gate: Course Package Payment Gate
    // Passed students (both Type 1 and Type 2) must have confirmed package payment or unlocked lessons before booking
    const hasConfirmedPayment = student.packagePaymentStatus === 'confirmed';
    const hasUnlockedLessons = (student.lessonsUnlocked || 0) > 0;
    if (!hasConfirmedPayment && !hasUnlockedLessons) {
      return res.status(403).json({
        success: false,
        message:
          student.packagePaymentStatus === 'pending'
            ? 'Your course package payment is pending verification by our branch officer. Lessons will unlock as soon as payment is confirmed.'
            : 'Please select and pay for your course package to unlock lessons for booking.',
      });
    }

    // 4b. Validate vehicleType against student's enrolled package
    const pkgType = student.package?.type || '';
    if (pkgType) {
      const lowerPkg = pkgType.toLowerCase();
      let isVehicleAllowed = true;
      let allowedNames = '';

      if (lowerPkg.includes('combo')) {
        isVehicleAllowed = ['Car', 'Bike', 'ThreeWheeler'].includes(vehicleType);
        allowedNames = 'Car, Bike, or Three-Wheeler';
      } else if (lowerPkg.includes('car')) {
        const hasBonusBike = (student.package?.bonusLessons?.bike || 0) > 0;
        const hasBonusThree = (student.package?.bonusLessons?.threeWheeler || 0) > 0;
        const allowed = ['Car'];
        if (hasBonusBike) allowed.push('Bike');
        if (hasBonusThree) allowed.push('ThreeWheeler');
        isVehicleAllowed = allowed.includes(vehicleType);
        allowedNames = allowed.join(', ');
      } else if (lowerPkg.includes('bike')) {
        isVehicleAllowed = vehicleType === 'Bike';
        allowedNames = 'Bike / Motorcycle';
      } else if (lowerPkg.includes('three')) {
        isVehicleAllowed = vehicleType === 'ThreeWheeler';
        allowedNames = 'Three-Wheeler';
      } else if (lowerPkg.includes('heavy')) {
        isVehicleAllowed = vehicleType === 'HeavyVehicle_Bus';
        allowedNames = 'Heavy Vehicle (Bus/Truck)';
      }

      if (!isVehicleAllowed) {
        return res.status(400).json({
          success: false,
          message: `Vehicle mismatch: Your enrolled package (${student.package?.type}) permits booking lessons for: ${allowedNames}. You selected '${vehicleType}'.`,
        });
      }
    }

    // 5. Gate: Check Lessons Balance & Single / Installment / Monthly Quota Cap
    const totalAllowed = (student.lessonsUnlocked !== undefined && student.lessonsUnlocked !== null)
      ? (student.lessonsUnlocked + (student.package?.additionalLessonsRequested || 0))
      : ((student.package?.lessonsTotal || 15) + (student.package?.additionalLessonsRequested || 0));
    const currentUsed = student.lessonsUsed !== undefined && student.lessonsUsed !== null
      ? student.lessonsUsed
      : (student.package?.lessonsUsed || 0);

    if (currentUsed >= totalAllowed) {
      if (student.paymentPlan === 'single') {
        return res.status(403).json({
          success: false,
          message: 'You have completed your single lesson quota (1 lesson). Please pay for another single lesson or upgrade to a full package on your dashboard to continue booking.',
        });
      }
      if (student.paymentPlan === 'installments' && (student.installmentsPaidCount || 0) < 3) {
        return res.status(403).json({
          success: false,
          message: `Installment limit reached: You have used all ${totalAllowed} unlocked lessons for Installment #${student.installmentsPaidCount || 1}. Please pay your next installment on your dashboard to unlock 5 more lessons.`,
        });
      }
      if (student.paymentPlan === 'monthly') {
        return res.status(403).json({
          success: false,
          message: `Monthly limit reached: You have completed all ${totalAllowed} unlocked lessons for this billing month (monthly quota: 4 lessons). Please submit payment for next month or buy additional lessons to continue booking.`,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'You have used all unlocked lessons in your course package. Please buy additional lessons on your dashboard to continue booking.',
      });
    }

    // 6. Find & Check 10-Student Lesson Capacity (Hard limit: only 10 students per lesson)
    const timeSlot = await TimeSlot.findById(timeSlotId);
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: 'Lesson session not found',
      });
    }

    if (timeSlot.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This lesson session has been cancelled by the branch or instructor.',
      });
    }

    // Check active bookings count for this lesson session
    const activeBookingsCount = await Booking.countDocuments({
      timeSlotId: timeSlot._id,
      status: { $in: ['confirmed', 'pending'] },
    });

    // Check if this student has ALREADY booked this lesson slot
    const existingSlotBooking = await Booking.findOne({
      studentId: student._id,
      timeSlotId: timeSlot._id,
      status: { $in: ['confirmed', 'pending'] },
    });

    if (existingSlotBooking) {
      return res.status(400).json({
        success: false,
        message: 'You have already booked a spot in this lesson session.',
      });
    }

    const maxCapacity = timeSlot.capacity || 10;
    if (activeBookingsCount >= maxCapacity || timeSlot.status === 'full') {
      timeSlot.status = 'full';
      timeSlot.bookedCount = activeBookingsCount;
      await timeSlot.save();
      return res.status(400).json({
        success: false,
        message: `This lesson session is full (${activeBookingsCount}/${maxCapacity} students booked). Only 10 students can book each lesson. Please choose another lesson session.`,
      });
    }

    // Check if student already has another booking at the exact same date & time
    const studentConflict = await Booking.findOne({
      studentId: student._id,
      status: { $in: ['confirmed', 'pending'] },
    }).populate({
      path: 'timeSlotId',
      match: {
        date: timeSlot.date,
        startTime: timeSlot.startTime,
      },
    });

    if (studentConflict && studentConflict.timeSlotId) {
      return res.status(400).json({
        success: false,
        message: 'You already have another lesson booked at this exact same time slot.',
      });
    }

    // 7. Update TimeSlot Booked Count & Capacity Status
    const newBookedCount = activeBookingsCount + 1;
    timeSlot.bookedCount = newBookedCount;
    if (newBookedCount >= maxCapacity) {
      timeSlot.status = 'full';
    } else {
      timeSlot.status = 'available';
    }
    await timeSlot.save();

    student.lessonsUsed = currentUsed + 1;
    if (student.package) {
      student.package.lessonsUsed = student.lessonsUsed;
    }
    student.lastActivityDate = new Date();
    await student.save();

    // 8. Create Booking Record
    const booking = await Booking.create({
      studentId: student._id,
      timeSlotId: timeSlot._id,
      branch: timeSlot.branch,
      vehicleType: vehicleType || timeSlot.vehicleType || 'Car',
      lessonType,
      status: 'confirmed',
    });

    // 9. Trigger In-App Notification to Student & Instructor
    const remainingCount = Math.max(0, totalAllowed - student.lessonsUsed);
    await Notification.create({
      recipientId: req.user._id,
      recipientRole: 'student',
      title: 'Lesson Booking Confirmed',
      message: `Your ${vehicleType || timeSlot.vehicleType} lesson on ${new Date(timeSlot.date).toDateString()} at ${timeSlot.startTime} (${timeSlot.branch} Branch) is confirmed. (${newBookedCount}/10 students booked in this session). Lessons remaining: ${remainingCount}.`,
      type: 'booking',
      link: '/student/dashboard',
    });

    if (timeSlot.instructorId) {
      await Notification.create({
        recipientId: timeSlot.instructorId,
        recipientRole: 'instructor',
        title: 'New Student Booked Your Lesson',
        message: `Student ${req.user.name} booked your ${timeSlot.lessonTitle || timeSlot.vehicleType} session on ${new Date(timeSlot.date).toDateString()} at ${timeSlot.startTime} (${newBookedCount}/10 students booked).`,
        type: 'booking',
        link: '/instructor/schedule',
      });
    }

    const populated = await Booking.findById(booking._id)
      .populate({
        path: 'timeSlotId',
        populate: { path: 'instructorId', select: 'name phone email' },
      })
      .populate('studentId');

    return res.status(201).json({
      success: true,
      message: 'Lesson slot booked successfully!',
      booking: populated,
      remainingLessons: remainingCount,
      lessonsRemaining: remainingCount,
      lessonsUsed: student.lessonsUsed,
    });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to book lesson',
    });
  }
};

// @desc    Book a free weekly theory or practical class (No lesson package deduction)
// @route   POST /api/bookings/free-class
// @access  Student
exports.bookFreeClass = async (req, res) => {
  try {
    const { timeSlotId, vehicleType } = req.body;

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const timeSlot = await TimeSlot.findById(timeSlotId);
    if (!timeSlot || timeSlot.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Time slot is not available' });
    }

    timeSlot.status = 'booked';
    timeSlot.bookedBy = student._id;
    await timeSlot.save();

    // Create free weekly class booking (does NOT increment lessonsUsed)
    const booking = await Booking.create({
      studentId: student._id,
      timeSlotId: timeSlot._id,
      branch: timeSlot.branch,
      vehicleType: vehicleType || 'Car',
      lessonType: 'free-weekly-class',
      status: 'confirmed',
    });

    await Notification.create({
      recipientId: req.user._id,
      recipientRole: 'student',
      title: 'Free Weekly Class Booked',
      message: `You booked a free weekly theory/practical session on ${new Date(timeSlot.date).toDateString()} at ${timeSlot.startTime}.`,
      type: 'booking',
    });

    return res.status(201).json({
      success: true,
      message: 'Free weekly class booked successfully at no charge!',
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to book free class',
    });
  }
};

// @desc    Get student upcoming & past lessons
// @route   GET /api/bookings/student/:id
// @access  Student, Staff, Admin
exports.getStudentBookings = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const bookings = await Booking.find({ studentId: student._id })
      .populate({
        path: 'timeSlotId',
        populate: { path: 'instructorId', select: 'name phone' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      error: error.message,
    });
  }
};

// @desc    Get all bookings for a branch (Staff/Admin)
// @route   GET /api/bookings/branch/:branchName
// @access  Staff, Admin
exports.getBranchBookings = async (req, res) => {
  try {
    const { branchName } = req.params;

    const query = {};
    if (branchName && branchName !== 'All') {
      query.branch = branchName;
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name phone email' },
      })
      .populate({
        path: 'timeSlotId',
        populate: { path: 'instructorId', select: 'name phone' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch branch bookings',
      error: error.message,
    });
  }
};

// @desc    Assign instructor to a booking's time slot (Staff/Admin)
// @route   PATCH /api/bookings/:id/assign-instructor
// @access  Staff, Admin
exports.assignInstructor = async (req, res) => {
  try {
    const { instructorId } = req.body;
    const booking = await Booking.findById(req.params.id).populate('timeSlotId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const timeSlot = await TimeSlot.findById(booking.timeSlotId._id);
    if (!timeSlot) {
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }

    timeSlot.instructorId = instructorId;
    await timeSlot.save();

    const populated = await Booking.findById(booking._id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name phone' },
      })
      .populate({
        path: 'timeSlotId',
        populate: { path: 'instructorId', select: 'name phone' },
      });

    return res.status(200).json({
      success: true,
      message: 'Instructor assigned successfully',
      booking: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign instructor',
    });
  }
};

// @desc    Request additional lessons beyond package
// @route   POST /api/students/:id/additional-lessons
// @access  Student, Staff
exports.requestAdditionalLessons = async (req, res) => {
  try {
    const { extraLessons } = req.body;
    const qty = parseInt(extraLessons, 10) || 1;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.package.additionalLessonsRequested =
      (student.package.additionalLessonsRequested || 0) + qty;
    
    // Also increment lessonsUnlocked
    const currentUnlocked =
      student.lessonsUnlocked !== undefined && student.lessonsUnlocked !== null
        ? student.lessonsUnlocked
        : (student.package?.lessonsTotal || 15);
    student.lessonsUnlocked = currentUnlocked + qty;

    await student.save();

    return res.status(200).json({
      success: true,
      message: `Added ${qty} additional lesson(s) to your balance.`,
      package: student.package,
      lessonsUnlocked: student.lessonsUnlocked,
      lessonsRemaining: Math.max(0, student.lessonsUnlocked - (student.lessonsUsed || 0)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to request additional lessons',
    });
  }
};
