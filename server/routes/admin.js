const express = require('express');
const router = express.Router();
const { getAdminAnalytics } = require('../controllers/adminController');
const {
  getAllAccounts,
  createStaffAccount,
  createInstructorAccount,
  createUserAccount,
  updateAccountStatus,
  forceResetPassword,
  deleteAccount,
} = require('../controllers/accountController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Analytics accessible by Admin and Staff
router.get('/analytics', authorize('admin', 'staff'), getAdminAnalytics);

// Account Management routes accessible ONLY by Admin
router.get('/accounts', authorize('admin'), getAllAccounts);
router.post('/accounts', authorize('admin'), createUserAccount);
router.post('/accounts/user', authorize('admin'), createUserAccount);
router.post('/users', authorize('admin'), createUserAccount);
router.post('/accounts/staff', authorize('admin'), createStaffAccount);
router.post('/accounts/instructor', authorize('admin'), createInstructorAccount);
router.patch('/accounts/:id/status', authorize('admin'), updateAccountStatus);
router.post('/accounts/:id/reset-password', authorize('admin'), forceResetPassword);
router.delete('/accounts/:id', authorize('admin'), deleteAccount);

module.exports = router;
