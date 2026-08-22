const express = require('express');
const router = express.Router();
const {
  upload,
  uploadPaymentSlip,
  getStudentPayments,
  getPendingPayments,
  verifyPayment,
} = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

// Student upload payment slip (Multer single 'slipImage')
router.post('/upload', authenticate, upload.single('slipImage'), uploadPaymentSlip);

// Student payment history
router.get('/student/:id', authenticate, getStudentPayments);

// Staff payment verification queue & approval
router.get('/pending', authenticate, authorize('staff', 'admin'), getPendingPayments);
router.patch('/:id/verify', authenticate, authorize('staff', 'admin'), verifyPayment);

module.exports = router;
