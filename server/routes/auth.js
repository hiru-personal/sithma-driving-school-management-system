const express = require('express');
const router = express.Router();
const {
  registerStudent,
  registerStaff,
  login,
  getMe,
} = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', registerStudent);
router.post('/login', login);

// Admin-only route for creating staff & instructors (or initial bootstrap)
router.post('/register-staff', registerStaff);

// Protected routes
router.get('/me', authenticate, getMe);

module.exports = router;
