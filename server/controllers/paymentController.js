const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Configure Multer Storage for Payment Slips
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'slips');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `slip-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP) or PDFs are allowed for payment slips.'));
  }
};

exports.upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter,
});

// @desc    Upload a payment slip (Student)
// @route   POST /api/payments/upload
// @access  Student
exports.uploadPaymentSlip = async (req, res) => {
  try {
    const { amount, bankName, transactionReference } = req.body;

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const slipUrl = req.file
      ? `/uploads/slips/${req.file.filename}`
      : `https://placehold.co/600x400/1e1035/FFFFFF?text=Dummy+Bank+Deposit+Slip+Rs.+${amount || 5000}`;

    const payment = await Payment.create({
      studentId: student._id,
      userId: req.user._id,
      packageId: student.package?.packageId || null,
      slipImageUrl: slipUrl,
      amount: parseFloat(amount) || student.package?.priceTotal || 0,
      bankName: bankName || 'Bank of Ceylon',
      transactionReference: transactionReference || '',
      status: 'pending',
      uploadedAt: new Date(),
    });

    student.registrationStatus = 'pending_payment';
    await student.save();

    // Trigger Notification to Staff & Admins
    const staffUsers = await User.find({ role: { $in: ['staff', 'admin'] } });
    const notifications = staffUsers.map((staff) => ({
      recipientId: staff._id,
      recipientRole: staff.role,
      title: 'New Payment Slip Uploaded',
      message: `Student ${req.user.name} (${student.branch} Branch) uploaded a payment slip of Rs. ${payment.amount?.toLocaleString()}.`,
      type: 'payment',
      link: '/staff/payments',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return res.status(201).json({
      success: true,
      message: 'Payment slip uploaded successfully. Our branch office will verify it shortly.',
      payment,
    });
  } catch (error) {
    console.error('Payment upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload payment slip',
    });
  }
};

// @desc    Process advance payment to activate Premium User status (Student)
// @route   POST /api/payments/pay-advance
// @access  Student
exports.payAdvance = async (req, res) => {
  try {
    const { amount = 5000, bankName = 'Sithma Direct Online Advance', transactionReference } = req.body;

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const payAmount = parseFloat(amount) || 5000;

    const payment = await Payment.create({
      studentId: student._id,
      userId: req.user._id,
      packageId: student.package?.packageId || null,
      slipImageUrl: '/uploads/slips/advance-payment-confirmed.png',
      amount: payAmount,
      bankName: bankName,
      transactionReference: transactionReference || `ADV-${Date.now()}`,
      status: 'confirmed',
      verifiedAt: new Date(),
      uploadedAt: new Date(),
    });

    student.isAdvancePaid = true;
    student.isPremium = true;
    student.registrationStatus = 'registered';
    await student.save();

    await Notification.create({
      recipientId: req.user._id,
      recipientRole: 'student',
      title: '👑 Premium User Access Activated!',
      message: `Advance payment of Rs. ${payAmount.toLocaleString()} received. Your account is now upgraded to Premium User!`,
      type: 'payment',
      link: '/student/dashboard',
    });

    return res.status(200).json({
      success: true,
      message: 'Advance payment confirmed! You are now a Premium User with full system access.',
      payment,
      student,
    });
  } catch (error) {
    console.error('Advance payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process advance payment',
    });
  }
};

// @desc    Get student's payment history
// @route   GET /api/payments/student/:id
// @access  Student, Staff, Admin
exports.getStudentPayments = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const payments = await Payment.find({ studentId: student._id })
      .populate('verifiedBy', 'name')
      .sort({ uploadedAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payments',
      error: error.message,
    });
  }
};

// @desc    Get all pending payment slips (Staff Verification Queue)
// @route   GET /api/payments/pending
// @access  Staff, Admin
exports.getPendingPayments = async (req, res) => {
  try {
    const { branch } = req.query;

    let payments = await Payment.find({ status: 'pending' })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email phone branch' },
      })
      .sort({ uploadedAt: -1 });

    if (branch && branch !== 'All') {
      payments = payments.filter((p) => p.studentId?.branch === branch);
    }

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load payment verification queue',
      error: error.message,
    });
  }
};

// @desc    Verify or Reject Payment Slip (Staff/Admin)
// @route   PATCH /api/payments/:id/verify
// @access  Staff, Admin
exports.verifyPayment = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be confirmed or rejected.',
      });
    }

    const payment = await Payment.findById(req.params.id)
      .populate('studentId')
      .populate('userId');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    payment.status = status;
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();
    if (status === 'rejected') {
      payment.rejectionReason = rejectionReason || 'Payment slip illegible or amount mismatched.';
    }
    await payment.save();

    // Update Student registration status and Premium status
    const student = await Student.findById(payment.studentId._id);
    if (student) {
      if (status === 'confirmed') {
        student.registrationStatus = 'registered';
        student.isAdvancePaid = true;
        student.isPremium = true;
      } else {
        student.registrationStatus = 'pending_payment';
        student.isAdvancePaid = false;
        student.isPremium = false;
      }
      await student.save();
    }

    // Trigger In-App Notification to Student
    await Notification.create({
      recipientId: payment.userId._id,
      recipientRole: 'student',
      title: status === 'confirmed' ? '👑 Bank Slip Verified — Premium User Activated!' : '⚠️ Payment Slip Verification Rejected',
      message:
        status === 'confirmed'
          ? `Your bank deposit slip for Rs. ${payment.amount?.toLocaleString()} has been verified by staff (${req.user.name}). Your account is now a Premium User with full system access!`
          : `Your payment slip was rejected. Reason: ${payment.rejectionReason}. Please upload a valid bank slip.`,
      type: 'payment',
      link: '/student/dashboard',
    });

    return res.status(200).json({
      success: true,
      message: status === 'confirmed' 
        ? 'Payment slip verified! Student upgraded to Premium User.' 
        : 'Payment slip rejected.',
      payment,
      student,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment',
    });
  }
};
