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
    const { timeSlotId, vehicleType, lessonType } = req.body;

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

    // 2. Check DMT Learner Pass Gate (Type 1 must pass Learner Exam before booking practicals)
    if (
      student.studentType === 'Type1_NewLearner' &&
      !student.dmtDates?.learnerExamPassed &&
      lessonType !== 'free-weekly-class'
    ) {
      return res.status(400).json({
        success: false,
        message: 'DMT Requirement: You must pass your Learner Written Exam before booking practical driving trial lessons.',
      });
    }

    // 3. Check Lessons Balance
    const totalAllowed = (student.package.lessonsTotal || 15) + (student.package.additionalLessonsRequested || 0);
    if ((student.package.lessonsUsed || 0) >= totalAllowed) {
      return res.status(400).json({
        success: false,
        message: 'You have used all lessons in your package. Please request additional lessons to continue booking.',
      });
    }

    // 4. Find & Lock TimeSlot
    const timeSlot = await TimeSlot.findById(timeSlotId);
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found',
      });
    }

    if (timeSlot.status !== 'available' || timeSlot.bookedBy) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another available time slot.',
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

    // 5. Update TimeSlot & Student Lessons Used
    timeSlot.status = 'booked';
    timeSlot.bookedBy = student._id;
    await timeSlot.save();

    student.package.lessonsUsed = (student.package.lessonsUsed || 0) + 1;
    await student.save();

    // 6. Create Booking Record
    const booking = await Booking.create({
      studentId: student._id,
      timeSlotId: timeSlot._id,
      branch: timeSlot.branch,
      vehicleType,
      lessonType: lessonType || 'regular',
      status: 'confirmed',
    });

    // 7. Trigger In-App Notification
    await Notification.create({
      recipientId: req.user._id,
      recipientRole: 'student',
      title: 'Lesson Booking Confirmed',
      message: `Your ${vehicleType} lesson on ${new Date(timeSlot.date).toDateString()} at ${timeSlot.startTime} (${timeSlot.branch} Branch) has been confirmed.`,
      type: 'booking',
    });

    const populated = await Booking.findById(booking._id)
      .populate({
        path: 'timeSlotId',
        populate: { path: 'instructorId', select: 'name phone' },
      })
      .populate('studentId');

    return res.status(201).json({
      success: true,
      message: 'Lesson slot booked successfully!',
      booking: populated,
      lessonsRemaining: totalAllowed - student.package.lessonsUsed,
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
    await student.save();

    return res.status(200).json({
      success: true,
      message: `Added ${qty} additional lesson(s) to your balance.`,
      package: student.package,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to request additional lessons',
    });
  }
};
