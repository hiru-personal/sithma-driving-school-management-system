const TimeSlot = require('../models/TimeSlot');
const Branch = require('../models/Branch');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Student = require('../models/Student');

// Daily Example Training Sessions (Curriculum for Sithma Driving School)
// Maximum 10 students can book each lesson session
const defaultDailyExampleSessions = [
  {
    startTime: '08:30',
    endTime: '09:30',
    lessonTitle: 'Morning Highway Driving & Overtaking',
    lessonTopic: 'Speed regulation, dual-carriageway lane discipline, safe overtaking techniques',
    vehicleCategory: 'Light',
    vehicleType: 'Car',
    capacity: 10,
  },
  {
    startTime: '10:00',
    endTime: '11:00',
    lessonTitle: 'Parallel Parking, Hill Start & Reverse 90°',
    lessonTopic: 'Precision maneuvering, clutch bite control on incline, reverse parking into tight bays',
    vehicleCategory: 'Light',
    vehicleType: 'Car',
    capacity: 10,
  },
  {
    startTime: '11:30',
    endTime: '12:30',
    lessonTitle: 'Motorcycle Slalom & Balance Mastery',
    lessonTopic: 'Emergency braking, cone slalom weaving, figure-8 balance, tight slow-speed turns',
    vehicleCategory: 'Light',
    vehicleType: 'Bike',
    capacity: 10,
  },
  {
    startTime: '14:00',
    endTime: '15:00',
    lessonTitle: 'Three-Wheeler Practical Control & Navigation',
    lessonTopic: 'Incline throttle coordination, turning radius maneuvers, urban obstacle handling',
    vehicleCategory: 'Light',
    vehicleType: 'ThreeWheeler',
    capacity: 10,
  },
  {
    startTime: '15:30',
    endTime: '16:30',
    lessonTitle: 'City Traffic, Roundabouts & Complex Junctions',
    lessonTopic: 'Traffic light signals, multi-lane roundabouts, pedestrian crossings, mirror-signal-maneuver',
    vehicleCategory: 'Light',
    vehicleType: 'Car',
    capacity: 10,
  },
  {
    startTime: '17:00',
    endTime: '18:00',
    lessonTitle: 'Heavy Transport & Bus Road Operations',
    lessonTopic: 'Air brake operation, wide turning geometry, blind-spot checks, reversing with mirror guides',
    vehicleCategory: 'Heavy',
    vehicleType: 'HeavyVehicle_Bus',
    capacity: 10,
  },
];

// @desc    Get available time slots for a branch & date (Auto-generates daily example lessons if none exist)
// @route   GET /api/slots
// @access  Public / Authenticated
exports.getTimeSlots = async (req, res) => {
  try {
    const { branch = 'Maharagama', date = new Date().toISOString().split('T')[0], vehicleCategory } = req.query;

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      branch,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' },
    };

    if (vehicleCategory && vehicleCategory !== 'All') {
      query.vehicleCategory = { $in: [vehicleCategory, 'All'] };
    }

    let slots = await TimeSlot.find(query)
      .populate('instructorId', 'name phone email')
      .sort({ startTime: 1 });

    // If no slots exist for this branch & date, auto-initialize the 6 daily example lessons
    if (slots.length === 0) {
      // Find default instructors for this branch
      const branchInstructors = await User.find({ role: 'instructor', branch }).select('_id name phone');
      const defaultInstructor = branchInstructors[0]?._id || null;

      const newSlotsData = defaultDailyExampleSessions.map((session, idx) => {
        const assignedInst = branchInstructors.length > 0
          ? branchInstructors[idx % branchInstructors.length]._id
          : defaultInstructor;

        return {
          branch,
          date: startOfDay,
          startTime: session.startTime,
          endTime: session.endTime,
          lessonTitle: session.lessonTitle,
          lessonTopic: session.lessonTopic,
          instructorId: assignedInst,
          vehicleCategory: session.vehicleCategory,
          vehicleType: session.vehicleType,
          capacity: session.capacity || 10,
          bookedCount: 0,
          status: 'available',
        };
      });

      await TimeSlot.insertMany(newSlotsData);
      slots = await TimeSlot.find(query)
        .populate('instructorId', 'name phone email')
        .sort({ startTime: 1 });
    }

    // Determine currently authenticated student (if any) to flag isStudentBooked
    let currentStudentId = null;
    if (req.user && req.user.role === 'student') {
      const studentDoc = await Student.findOne({ userId: req.user._id });
      if (studentDoc) currentStudentId = studentDoc._id.toString();
    }

    // Fetch all active bookings for these slots to compute live counts and booked student state
    const slotIds = slots.map((s) => s._id);
    const activeBookings = await Booking.find({
      timeSlotId: { $in: slotIds },
      status: { $in: ['confirmed', 'pending'] },
    }).select('timeSlotId studentId');

    const mappedSlots = slots.map((slot) => {
      const slotObj = slot.toObject();
      const slotBookings = activeBookings.filter(
        (b) => b.timeSlotId.toString() === slot._id.toString()
      );
      const bookedCount = slotBookings.length;
      const capacity = slot.capacity || 10;
      const remainingSpots = Math.max(0, capacity - bookedCount);
      const isFull = bookedCount >= capacity;

      const isStudentBooked = currentStudentId
        ? slotBookings.some((b) => b.studentId?.toString() === currentStudentId)
        : false;

      return {
        ...slotObj,
        capacity,
        bookedCount,
        remainingSpots,
        isFull,
        isStudentBooked,
        status: isFull ? 'full' : (slotObj.status === 'cancelled' ? 'cancelled' : 'available'),
      };
    });

    return res.status(200).json({
      success: true,
      count: mappedSlots.length,
      slots: mappedSlots,
    });
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch time slots',
      error: error.message,
    });
  }
};

// @desc    Create a new lesson time slot (Instructors, Staff, Admin)
// @route   POST /api/slots
// @access  Instructor, Staff, Admin
exports.createTimeSlot = async (req, res) => {
  try {
    const {
      branch,
      date,
      startTime,
      endTime,
      instructorId,
      vehicleCategory = 'Light',
      vehicleType = 'Car',
      lessonTitle,
      lessonTopic,
      capacity = 10,
    } = req.body;

    const resolvedBranch = branch || req.user.branch || 'Maharagama';
    const resolvedInstructorId = req.user.role === 'instructor'
      ? req.user._id
      : (instructorId || null);

    if (!resolvedBranch || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide branch, date, startTime, and endTime',
      });
    }

    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    // Double booking validation check on instructor if assigned
    if (resolvedInstructorId) {
      const existing = await TimeSlot.findOne({
        branch: resolvedBranch,
        date: slotDate,
        startTime,
        instructorId: resolvedInstructorId,
        status: { $ne: 'cancelled' },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'The selected instructor already has a session scheduled for this time slot.',
        });
      }
    }

    // Hard ceiling: only 10 students can book each lesson
    const resolvedCapacity = Math.min(10, Math.max(1, parseInt(capacity) || 10));

    const slot = await TimeSlot.create({
      branch: resolvedBranch,
      date: slotDate,
      startTime,
      endTime,
      lessonTitle: lessonTitle || `${vehicleType} Practical Training Session`,
      lessonTopic: lessonTopic || 'Dual-Control Road Training & Maneuvers',
      instructorId: resolvedInstructorId,
      vehicleCategory,
      vehicleType,
      capacity: resolvedCapacity,
      bookedCount: 0,
      status: 'available',
    });

    const populated = await TimeSlot.findById(slot._id).populate('instructorId', 'name phone email');

    return res.status(201).json({
      success: true,
      message: 'Lesson time slot created successfully',
      slot: {
        ...populated.toObject(),
        bookedCount: 0,
        remainingSpots: resolvedCapacity,
        isFull: false,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create time slot',
    });
  }
};

// @desc    Update or assign instructor to a slot (Staff, Admin, Instructor)
// @route   PUT /api/slots/:id
// @access  Staff, Admin, Instructor
exports.updateTimeSlot = async (req, res) => {
  try {
    const { instructorId, status, startTime, endTime, vehicleCategory, vehicleType, lessonTitle, lessonTopic } = req.body;

    const slot = await TimeSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }

    if (instructorId !== undefined) slot.instructorId = instructorId || null;
    if (status) slot.status = status;
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    if (vehicleCategory) slot.vehicleCategory = vehicleCategory;
    if (vehicleType) slot.vehicleType = vehicleType;
    if (lessonTitle) slot.lessonTitle = lessonTitle;
    if (lessonTopic) slot.lessonTopic = lessonTopic;

    await slot.save();

    const populated = await TimeSlot.findById(slot._id).populate('instructorId', 'name phone email');

    return res.status(200).json({
      success: true,
      message: 'Time slot updated successfully',
      slot: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update time slot',
    });
  }
};

// @desc    Delete/Cancel a time slot (Staff/Admin/Instructor)
// @route   DELETE /api/slots/:id
// @access  Staff, Admin, Instructor
exports.deleteTimeSlot = async (req, res) => {
  try {
    const slot = await TimeSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }

    const activeBookingsCount = await Booking.countDocuments({
      timeSlotId: slot._id,
      status: { $in: ['confirmed', 'pending'] },
    });

    if (activeBookingsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete session: ${activeBookingsCount} student(s) have active bookings in this lesson. Please cancel the bookings first.`,
      });
    }

    await TimeSlot.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Time slot deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete time slot',
    });
  }
};

// @desc    Get instructor schedule with full details of booked students
// @route   GET /api/slots/instructor/:instructorId
// @access  Instructor, Staff, Admin
exports.getInstructorSchedule = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { date, branch } = req.query;

    const query = {
      status: { $ne: 'cancelled' },
    };

    // If an instructorId is provided, filter by instructor or branch
    if (instructorId && instructorId !== 'all') {
      query.instructorId = instructorId;
    }

    if (branch && branch !== 'All') {
      query.branch = branch;
    }

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const slots = await TimeSlot.find(query)
      .populate('instructorId', 'name phone email')
      .sort({ date: 1, startTime: 1 });

    // For EACH slot, retrieve all booked students from Booking collection
    const detailedSlots = await Promise.all(
      slots.map(async (slot) => {
        const bookings = await Booking.find({
          timeSlotId: slot._id,
          status: { $in: ['confirmed', 'pending'] },
        })
          .populate({
            path: 'studentId',
            select: 'student_type studentType account_status branch phone nic name package paymentPlan installmentsPaidCount lessonsUnlocked lessonsUsed',
            populate: { path: 'userId', select: 'name email phone' },
          })
          .sort({ createdAt: -1 });

        const bookedStudents = bookings.map((b) => {
          const student = b.studentId || {};
          const user = student.userId || {};
          return {
            bookingId: b._id,
            bookingStatus: b.status,
            bookedAt: b.createdAt,
            lessonType: b.lessonType,
            vehicleType: b.vehicleType,
            studentId: student._id,
            name: user.name || student.name || 'Enrolled Student',
            phone: user.phone || student.phone || 'N/A',
            email: user.email || 'N/A',
            studentType: student.student_type || student.studentType || 'Type 1',
            packageType: student.package?.type || 'Standard Driving Course',
            paymentPlan: student.paymentPlan || 'full',
            lessonsUsed: student.lessonsUsed || 0,
            lessonsUnlocked: student.lessonsUnlocked || 15,
          };
        });

        const capacity = slot.capacity || 10;
        const bookedCount = bookedStudents.length;
        const remainingSpots = Math.max(0, capacity - bookedCount);
        const isFull = bookedCount >= capacity;

        return {
          ...slot.toObject(),
          capacity,
          bookedCount,
          remainingSpots,
          isFull,
          status: isFull ? 'full' : (slot.status === 'cancelled' ? 'cancelled' : 'available'),
          bookedStudents,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: detailedSlots.length,
      schedule: detailedSlots,
    });
  } catch (error) {
    console.error('Failed to fetch instructor schedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor schedule',
      error: error.message,
    });
  }
};
