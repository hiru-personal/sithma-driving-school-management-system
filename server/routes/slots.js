const express = require('express');
const router = express.Router();
const {
  getTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getInstructorSchedule,
} = require('../controllers/slotController');
const { authenticate, authorize } = require('../middleware/auth');

// Available time slots (Authenticated or Public)
router.get('/', getTimeSlots);

// Staff/Admin/Instructor time slot management
router.post('/', authenticate, authorize('instructor', 'staff', 'admin'), createTimeSlot);
router.put('/:id', authenticate, authorize('instructor', 'staff', 'admin'), updateTimeSlot);
router.delete('/:id', authenticate, authorize('instructor', 'staff', 'admin'), deleteTimeSlot);

// Instructor schedule
router.get('/instructor/:instructorId', authenticate, getInstructorSchedule);

module.exports = router;
