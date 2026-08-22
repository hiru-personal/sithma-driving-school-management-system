const TimeSlot = require('../models/TimeSlot');
const Branch = require('../models/Branch');
const User = require('../models/User');

// Default session time slots (3 sessions per day, 1 hour each)
const defaultSlotTimes = [
  { startTime: '08:30', endTime: '09:30' },
  { startTime: '10:30', endTime: '11:30' },
  { startTime: '14:30', endTime: '15:30' },
];

// @desc    Get available time slots for a branch & date (Auto-generates default 3 daily slots if none exist)
// @route   GET /api/slots
// @access  Public / Authenticated
exports.getTimeSlots = async (req, res) => {
  try {
    const { branch, date, vehicleCategory } = req.query;

    if (!branch || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please specify both branch and date parameters',
      });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      branch,
      date: { $gte: startOfDay, $lte: endOfDay },
    };

    if (vehicleCategory && vehicleCategory !== 'All') {
      query.vehicleCategory = { $in: [vehicleCategory, 'All'] };
    }

    let slots = await TimeSlot.find(query)
      .populate('instructorId', 'name phone')
      .populate({
        path: 'bookedBy',
        populate: { path: 'userId', select: 'name phone email' },
      })
      .sort({ startTime: 1 });

    // If no slots exist for this branch & date, auto-initialize the 3 standard daily sessions
    if (slots.length === 0) {
      // Find default instructor for branch if available
      const branchDoc = await Branch.findOne({ name: branch }).populate('instructorIds');
      const defaultInstructor = branchDoc?.instructorIds?.[0]?._id || null;

      const newSlotsData = defaultSlotTimes.map((t) => ({
        branch,
        date: startOfDay,
        startTime: t.startTime,
        endTime: t.endTime,
        instructorId: defaultInstructor,
        vehicleCategory: 'Light',
        status: 'available',
        capacity: 1,
      }));

      slots = await TimeSlot.insertMany(newSlotsData);
      slots = await TimeSlot.find(query)
        .populate('instructorId', 'name phone')
        .sort({ startTime: 1 });
    }

    return res.status(200).json({
      success: true,
      count: slots.length,
      slots,
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

// @desc    Create a new time slot (Staff/Admin)
// @route   POST /api/slots
// @access  Staff, Admin
exports.createTimeSlot = async (req, res) => {
  try {
    const { branch, date, startTime, endTime, instructorId, vehicleCategory, capacity } = req.body;

    if (!branch || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide branch, date, startTime, and endTime',
      });
    }

    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    // Double booking validation check on instructor if assigned
    if (instructorId) {
      const existing = await TimeSlot.findOne({
        branch,
        date: slotDate,
        startTime,
        instructorId,
        status: { $ne: 'cancelled' },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'The selected instructor is already booked for this time slot at this branch.',
        });
      }
    }

    const slot = await TimeSlot.create({
      branch,
      date: slotDate,
      startTime,
      endTime,
      instructorId: instructorId || null,
      vehicleCategory: vehicleCategory || 'Light',
      capacity: capacity || 1,
      status: 'available',
    });

    const populated = await TimeSlot.findById(slot._id).populate('instructorId', 'name phone');

    return res.status(201).json({
      success: true,
      message: 'Time slot created successfully',
      slot: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create time slot',
    });
  }
};

// @desc    Update or assign instructor to a slot (Staff/Admin)
// @route   PUT /api/slots/:id
// @access  Staff, Admin
exports.updateTimeSlot = async (req, res) => {
  try {
    const { instructorId, status, startTime, endTime, vehicleCategory } = req.body;

    const slot = await TimeSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }

    if (instructorId) slot.instructorId = instructorId;
    if (status) slot.status = status;
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    if (vehicleCategory) slot.vehicleCategory = vehicleCategory;

    await slot.save();

    const populated = await TimeSlot.findById(slot._id)
      .populate('instructorId', 'name phone')
      .populate({
        path: 'bookedBy',
        populate: { path: 'userId', select: 'name phone' },
      });

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

// @desc    Delete/Cancel a time slot (Staff/Admin)
// @route   DELETE /api/slots/:id
// @access  Staff, Admin
exports.deleteTimeSlot = async (req, res) => {
  try {
    const slot = await TimeSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }

    if (slot.bookedBy) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an active booked slot. Please cancel the booking first.',
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

// @desc    Get instructor daily/weekly assigned sessions
// @route   GET /api/slots/instructor/:instructorId
// @access  Instructor, Staff, Admin
exports.getInstructorSchedule = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const slots = await TimeSlot.find({
      instructorId,
      status: 'booked',
    })
      .populate('branch')
      .populate({
        path: 'bookedBy',
        populate: { path: 'userId', select: 'name phone email' },
      })
      .sort({ date: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: slots.length,
      schedule: slots,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch instructor schedule',
      error: error.message,
    });
  }
};
