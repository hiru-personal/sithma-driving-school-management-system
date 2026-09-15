const express = require('express');
const router = express.Router();
const {
  registerStudent,
  registerType2Student,
  checkUsernameAvailability,
  login,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const clearanceUpload = require('../middleware/clearanceUpload');

// Public authentication routes
router.post('/register', registerStudent);
router.get('/check-username', checkUsernameAvailability);
router.post('/register-type2', clearanceUpload.single('clearanceProof'), registerType2Student);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected authentication routes
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
router.post('/change-password', authenticate, changePassword);

module.exports = router;
