const express = require('express');
const router = express.Router();
const {
  upload,
  uploadPaymentSlip,
  payAdvance,
  submitPackagePayment,
  getStudentPayments,
  getPendingPayments,
  verifyPayment,
  uploadPendingSlip,
  payAdvancePending,
  registerPhysicalIntent,
  buyAdditionalLessons,
  getBankDetails,
  approveCashPayment,
} = require('../controllers/paymentController');
const { authenticate, authorize, requireVerifiedStudent } = require('../middleware/auth');

// ── Public Bank Details & Pre-Auth Payment Gateway ───
router.get('/bank-details', getBankDetails);
router.post('/upload-pending', upload.single('slipImage'), uploadPendingSlip);
router.post('/pay-advance-pending', payAdvancePending);
router.post('/register-physical-intent', registerPhysicalIntent);

// Student advance payment & slip upload (authenticated)
router.post('/pay-advance', authenticate, requireVerifiedStudent, payAdvance);
router.post('/upload', authenticate, requireVerifiedStudent, upload.single('slipImage'), uploadPaymentSlip);
router.post('/package-payment', authenticate, requireVerifiedStudent, upload.single('slipImage'), submitPackagePayment);
router.post('/buy-additional-lessons', authenticate, requireVerifiedStudent, upload.single('slipImage'), buyAdditionalLessons);

// Student payment history
router.get('/student/:id', authenticate, requireVerifiedStudent, getStudentPayments);

// Staff payment verification queue & approval
router.get('/pending', authenticate, authorize('staff', 'admin'), getPendingPayments);
router.patch('/:id/verify', authenticate, authorize('staff', 'admin'), verifyPayment);
router.post('/cash-approve', authenticate, authorize('staff', 'admin'), approveCashPayment);

module.exports = router;


