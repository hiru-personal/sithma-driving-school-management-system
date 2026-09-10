const express = require('express');
const router = express.Router();
const { getAdminAnalytics } = require('../controllers/adminController');
const {
  getAllAccounts,
  createStaffAccount,
  createInstructorAccount,
  updateAccountStatus,
  forceResetPassword,
} = require('../controllers/accountController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Analytics accessible by Admin and Staff
router.get('/analytics', authorize('admin', 'staff'), getAdminAnalytics);

// Account Management routes accessible ONLY by Admin
router.get('/accounts', authorize('admin'), getAllAccounts);
router.post('/accounts/staff', authorize('admin'), createStaffAccount);
router.post('/accounts/instructor', authorize('admin'), createInstructorAccount);
router.patch('/accounts/:id/status', authorize('admin'), updateAccountStatus);
router.post('/accounts/:id/reset-password', authorize('admin'), forceResetPassword);

module.exports = router;
