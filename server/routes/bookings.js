const express = require('express');
const router = express.Router();
const {
  createBooking,
  bookFreeClass,
  getStudentBookings,
  getBranchBookings,
  assignInstructor,
  requestAdditionalLessons,
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');

// Student booking routes
router.post('/', authenticate, createBooking);
router.post('/free-class', authenticate, bookFreeClass);
router.get('/student/:id', authenticate, getStudentBookings);

// Staff branch bookings view & instructor assignment
router.get('/branch/:branchName', authenticate, authorize('staff', 'admin'), getBranchBookings);
router.patch('/:id/assign-instructor', authenticate, authorize('staff', 'admin'), assignInstructor);

// Additional lessons
router.post('/students/:id/additional-lessons', authenticate, requestAdditionalLessons);

module.exports = router;
