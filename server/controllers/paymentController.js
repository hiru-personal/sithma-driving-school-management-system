const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { ADVANCE_PAYMENT_AMOUNT } = require('../config/constants');
const { PRECONFIGURED_BANKS } = require('../config/bankDetails');

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
    const { amount, bankName, transactionReference, paymentType = 'general', packageId, paymentPlan } = req.body;

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const slipUrl = req.file
      ? `/uploads/slips/${req.file.filename}`
      : `https://placehold.co/600x400/1e1035/FFFFFF?text=Bank+Deposit+Slip+Rs.+${amount || 5000}`;

    let resolvedPackageId = packageId || student.package?.packageId || null;
    if (paymentPlan) {
      student.paymentPlan = paymentPlan;
    }

    if (paymentType === 'package' || paymentType === 'monthly') {
      student.packagePaymentStatus = 'pending';
    } else if (paymentType === 'advance') {
      student.advancePaymentStatus = 'pending';
    }

    const payment = await Payment.create({
      studentId: student._id,
      userId: req.user._id,
      packageId: resolvedPackageId,
      paymentType,
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
      title: `New ${paymentType.toUpperCase()} Payment Slip Uploaded`,
      message: `Student ${req.user.name} (${student.branch} Branch) uploaded a ${paymentType} payment slip of Rs. ${payment.amount?.toLocaleString()}.`,
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

// @desc    Submit Package Selection & Payment (Student Step 5)
// @route   POST /api/payments/package-payment
// @access  Student
exports.submitPackagePayment = async (req, res) => {
  try {
    const { packageId, packageType, paymentPlan = 'full', amount, bankName, transactionReference, slipImageUrl } = req.body;

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Resolve package dynamically from Package model (US-13, US-14)
    const Package = require('../models/Package');
    let pkgDoc = null;
    if (packageId) pkgDoc = await Package.findById(packageId);
    if (!pkgDoc && packageType) pkgDoc = await Package.findOne({ type: packageType, isActive: true });
    if (!pkgDoc) {
      return res.status(400).json({ success: false, message: 'Invalid course package selected.' });
    }

    const payAmount = parseFloat(amount) || (paymentPlan === 'monthly' ? Math.round(pkgDoc.price / 3) : pkgDoc.price);

    student.package = {
      type: pkgDoc.type,
      packageId: pkgDoc._id,
      lessonsTotal: pkgDoc.lessons,
      lessonsUsed: student.lessonsUsed || 0,
      priceTotal: pkgDoc.price,
      bonusLessons: pkgDoc.bonusLessons || { bike: 0, threeWheeler: 0 },
      additionalLessonsRequested: student.package?.additionalLessonsRequested || 0,
    };
    student.paymentPlan = paymentPlan;
    student.packagePaymentStatus = 'pending';
    await student.save();

    const slip = req.file ? `/uploads/slips/${req.file.filename}` : (slipImageUrl || `/uploads/slips/package-${Date.now()}.png`);

    const payment = await Payment.create({
      studentId: student._id,
      userId: req.user._id,
      packageId: pkgDoc._id,
      paymentType: paymentPlan === 'monthly' ? 'monthly' : 'package',
      slipImageUrl: slip,
      amount: payAmount,
      bankName: bankName || 'Bank of Ceylon',
      transactionReference: transactionReference || `PKG-${Date.now()}`,
      status: 'pending',
      uploadedAt: new Date(),
    });

    // Notify Data Entry Officers
    const staffUsers = await User.find({ role: { $in: ['staff', 'admin'] } });
    const notifications = staffUsers.map((staff) => ({
      recipientId: staff._id,
      recipientRole: staff.role,
      title: 'New Package Payment Uploaded',
      message: `Student ${req.user.name} submitted package payment of Rs. ${payAmount.toLocaleString()} (${paymentPlan} plan for ${pkgDoc.name}) for verification.`,
      type: 'payment',
      link: '/staff/payments',
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return res.status(200).json({
      success: true,
      message: 'Package payment submitted successfully. Your lesson balance will unlock once verified by our branch officer.',
      payment,
      student,
    });
  } catch (error) {
    console.error('Submit package payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit package payment',
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
      paymentType: 'advance',
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
    student.accountStatus = 'active';
    student.advancePaymentStatus = 'verified';
    student.registrationStatus = 'registered';
    await student.save();

    await Notification.create({
      recipientId: req.user._id,
      recipientRole: 'student',
      title: 'Advance Payment Verified!',
      message: `Advance payment of Rs. ${payAmount.toLocaleString()} received. Your account is activated and ready for package selection!`,
      type: 'payment',
      link: '/student/dashboard',
    });

    return res.status(200).json({
      success: true,
      message: 'Advance payment confirmed! You now have active access to the portal.',
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

// @desc    Get preconfigured bank details & advance payment fee (Public/Student)
// @route   GET /api/payments/bank-details
// @access  Public
exports.getBankDetails = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      banks: PRECONFIGURED_BANKS,
      advanceAmount: ADVANCE_PAYMENT_AMOUNT,
    });
  } catch (error) {
    console.error('Get bank details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bank details',
    });
  }
};

// @desc    Get all pending payment slips (Staff Verification Queue)
// @route   GET /api/payments/pending
// @access  Staff, Admin
exports.getPendingPayments = async (req, res) => {
  try {
    const { branch } = req.query;

    let payments = await Payment.find({
      $or: [
        { status: 'pending' },
        { payment_status: { $in: ['Pending Verification', 'Pending Branch Payment'] } },
      ],
    })
      .populate({
        path: 'studentId',
        select: 'student_type studentType account_status accountStatus trial_eligible trialEligible branch phone nic name isAdvancePaid payment_method payment_status',
        populate: { path: 'userId', select: 'name email phone nic branch account_status' },
      })
      .populate('userId', 'name email phone nic branch account_status')
      .populate('verifiedBy', 'name')
      .populate('verified_by', 'name')
      .sort({ createdAt: -1, uploadedAt: -1 });

    if (branch && branch !== 'All') {
      payments = payments.filter((p) => (p.studentId?.branch === branch || p.userId?.branch === branch));
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

    const normalizedStatus = (status || '').toLowerCase();
    const isApproved = normalizedStatus === 'confirmed' || normalizedStatus === 'verified';
    const isRejected = normalizedStatus === 'rejected';

    if (!isApproved && !isRejected) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be confirmed/verified or rejected.',
      });
    }

    const payment = await Payment.findById(req.params.id)
      .populate('studentId')
      .populate('userId');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    payment.status = isApproved ? 'confirmed' : 'rejected';
    payment.payment_status = isApproved ? 'Verified' : 'Rejected';
    payment.verifiedBy = req.user._id;
    payment.verified_by = req.user._id;
    payment.verifiedAt = new Date();
    payment.verified_at = new Date();
    if (isRejected) {
      payment.rejectionReason = rejectionReason || 'Payment slip illegible or amount mismatched.';
    }
    await payment.save();

    const student = await Student.findById(payment.studentId?._id || payment.studentId);
    let notificationMessage = '';
    let notificationTitle = '';

    if (student) {
      const isAdvance =
        payment.paymentType === 'advance' ||
        student.accountStatus === 'pending_verification' ||
        student.account_status === 'Unverified / Pending Payment' ||
        payment.amount === ADVANCE_PAYMENT_AMOUNT;

      if (isApproved) {
        if (isAdvance) {
          // Advance payment verified -> activate account and mark verified
          student.account_status = 'Verified';
          student.accountStatus = 'active';
          student.payment_status = 'Verified';
          student.advancePaymentStatus = 'verified';
          student.isAdvancePaid = true;
          student.isPremium = true;
          student.registrationStatus = 'registered';
          student.verifiedBy = req.user._id;
          student.verified_by = req.user._id;
          student.verifiedAt = new Date();
          student.verified_at = new Date();

          // Type 2 students are already DMT-cleared and can directly book trial lessons
          if (student.student_type === 'Type 2' || student.studentType === 'Type 2') {
            student.trial_eligible = true;
            student.trialEligible = true;
          }

          // Also activate User account status so login succeeds and user is Verified
          const targetUserId = payment.userId?._id || payment.userId || student.userId;
          await User.findByIdAndUpdate(targetUserId, {
            status: 'active',
            account_status: 'Verified',
          });

          notificationTitle = 'Advance Payment Verified — Account Activated!';
          notificationMessage = `Your advance payment of Rs. ${payment.amount?.toLocaleString()} has been verified by ${req.user.name}. Your account is now active!`;
        } else if (payment.paymentType === 'additional_lessons') {
          // Additional Lessons Payment Confirmed
          const extraQty = payment.additionalLessonsCount || Math.round(payment.amount / 2500) || 1;
          student.package.additionalLessonsRequested =
            (student.package.additionalLessonsRequested || 0) + extraQty;
          const currentUnlocked =
            student.lessonsUnlocked !== undefined && student.lessonsUnlocked !== null
              ? student.lessonsUnlocked
              : (student.package?.lessonsTotal || 15);
          student.lessonsUnlocked = currentUnlocked + extraQty;

          notificationTitle = 'Additional Lessons Payment Verified!';
          notificationMessage = `Your payment of Rs. ${payment.amount?.toLocaleString()} for ${extraQty} additional practical lesson(s) has been confirmed. Lessons available to book: ${Math.max(
            0,
            student.lessonsUnlocked - (student.lessonsUsed || 0)
          )}.`;
        } else {
          // Package payment confirmed -> unlock lesson balance
          student.packagePaymentStatus = 'confirmed';
          const totalPackageLessons = student.package?.lessonsTotal || 15;

          if (student.paymentPlan === 'monthly' || payment.paymentType === 'monthly') {
            student.lessonsUnlocked = Math.min((student.lessonsUsed || 0) + 4, totalPackageLessons);
            notificationTitle = 'Monthly Package Payment Confirmed!';
            notificationMessage = `Your monthly payment has been confirmed. 4 lessons have been unlocked for this billing month (Total unlocked: ${student.lessonsUnlocked}/${totalPackageLessons}).`;
          } else {
            student.lessonsUnlocked = totalPackageLessons;
            notificationTitle = 'Full Course Package Payment Confirmed!';
            notificationMessage = `Your full package payment of Rs. ${payment.amount?.toLocaleString()} has been confirmed. All ${totalPackageLessons} lessons are now unlocked!`;
          }
        }
      } else {
        // Rejected
        if (isAdvance) {
          student.advancePaymentStatus = 'rejected';
          student.payment_status = 'Rejected';
          student.account_status = 'Unverified / Pending Payment';
          student.accountStatus = 'pending_verification';
          student.isAdvancePaid = false;
          notificationTitle = 'Advance Payment Verification Rejected';
          notificationMessage = `Your advance payment slip was rejected. Reason: ${payment.rejectionReason}. Please re-upload a valid bank deposit slip.`;
        } else if (payment.paymentType === 'additional_lessons') {
          notificationTitle = 'Additional Lessons Payment Slip Rejected';
          notificationMessage = `Your additional lessons payment slip was rejected. Reason: ${payment.rejectionReason}. Please re-submit your payment.`;
        } else {
          student.packagePaymentStatus = 'none';
          notificationTitle = 'Package Payment Verification Rejected';
          notificationMessage = `Your package payment slip was rejected. Reason: ${payment.rejectionReason}. Please re-submit your payment.`;
        }
      }

      await student.save();
    }

    // Trigger In-App Notification to Student
    const targetRecipientId = payment.userId?._id || payment.userId;
    if (targetRecipientId) {
      await Notification.create({
        recipientId: targetRecipientId,
        recipientRole: 'student',
        title: notificationTitle || (isApproved ? 'Payment Verified' : 'Payment Rejected'),
        message: notificationMessage || `Your payment for Rs. ${payment.amount?.toLocaleString()} was ${isApproved ? 'verified' : 'rejected'}.`,
        type: 'payment',
        link: '/student/dashboard',
      });
    }

    return res.status(200).json({
      success: true,
      message: isApproved ? 'Payment verified successfully.' : 'Payment rejected.',
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

// @desc    Data Entry Officer On-The-Spot Cash Payment Approval
// @route   POST /api/payments/cash-approve
// @access  Staff, Admin
exports.approveCashPayment = async (req, res) => {
  try {
    const { studentId, branch, notes } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required.' });
    }

    const student = await Student.findById(studentId).populate('userId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const txRef = `CASH-${Date.now().toString().slice(-8)}`;

    // Create or find existing pending advance payment
    let payment = await Payment.findOne({
      studentId: student._id,
      paymentType: 'advance',
      status: 'pending',
    });

    if (payment) {
      payment.payment_method = 'physical_branch';
      payment.paymentMethod = 'physical_branch';
      payment.payment_status = 'Verified';
      payment.status = 'confirmed';
      payment.amount = ADVANCE_PAYMENT_AMOUNT;
      payment.verified_by = req.user._id;
      payment.verifiedBy = req.user._id;
      payment.verified_at = new Date();
      payment.verifiedAt = new Date();
      payment.transactionReference = txRef;
      await payment.save();
    } else {
      payment = await Payment.create({
        studentId: student._id,
        userId: student.userId?._id || student.userId,
        paymentType: 'advance',
        payment_method: 'physical_branch',
        paymentMethod: 'physical_branch',
        payment_status: 'Verified',
        status: 'confirmed',
        amount: ADVANCE_PAYMENT_AMOUNT,
        bankName: `Cash at Branch — ${branch || student.branch || 'Maharagama'}`,
        transactionReference: txRef,
        verified_by: req.user._id,
        verifiedBy: req.user._id,
        verified_at: new Date(),
        verifiedAt: new Date(),
        uploadedAt: new Date(),
      });
    }

    // Activate student
    student.account_status = 'Verified';
    student.accountStatus = 'active';
    student.payment_status = 'Verified';
    student.payment_method = 'physical_branch';
    student.advancePaymentStatus = 'verified';
    student.isAdvancePaid = true;
    student.isPremium = true;
    student.registrationStatus = 'registered';
    student.verifiedBy = req.user._id;
    student.verified_by = req.user._id;
    student.verifiedAt = new Date();
    student.verified_at = new Date();

    if (student.student_type === 'Type 2' || student.studentType === 'Type 2') {
      student.trial_eligible = true;
      student.trialEligible = true;
    }
    await student.save();

    // Activate User
    const targetUserId = student.userId?._id || student.userId;
    if (targetUserId) {
      await User.findByIdAndUpdate(targetUserId, {
        status: 'active',
        account_status: 'Verified',
      });

      // Notify student
      await Notification.create({
        recipientId: targetUserId,
        recipientRole: 'student',
        title: 'Cash Payment Received — Account Activated!',
        message: `Your physical advance cash payment of Rs. ${ADVANCE_PAYMENT_AMOUNT.toLocaleString()} was received and verified by ${req.user.name}. Your account is now fully active!`,
        type: 'payment',
        link: '/student/dashboard',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cash payment recorded and student account verified successfully.',
      payment,
      student,
    });
  } catch (error) {
    console.error('Approve cash payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve cash payment',
    });
  }
};



// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC PRE-AUTH PAYMENT ENDPOINTS (No JWT required — pending students)
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Upload advance payment slip BEFORE login verification (Pre-auth gateway)
// @route   POST /api/payments/upload-pending
// @access  Public (unverified student submits by pendingUserId or userId)
exports.uploadPendingSlip = async (req, res) => {
  try {
    const { pendingUserId, userId, studentId, amount, bankName, transactionReference } = req.body;
    const targetRef = pendingUserId || userId || studentId;

    if (!targetRef) {
      return res.status(400).json({ success: false, message: 'Student reference is required.' });
    }

    let user = await User.findById(targetRef).catch(() => null);
    let student = null;

    if (user && user.role === 'student') {
      student = await Student.findOne({ userId: user._id });
    } else {
      student = await Student.findById(targetRef).catch(() => null);
      if (student) {
        user = await User.findById(student.userId).catch(() => null);
      }
    }

    if (!user || !student) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    const payAmount = parseFloat(amount) || ADVANCE_PAYMENT_AMOUNT;
    const slipUrl = req.file
      ? `/uploads/slips/${req.file.filename}`
      : `https://placehold.co/600x400/1e1035/FFFFFF?text=Bank+Deposit+Slip+Rs.+${payAmount}`;

    const txRef = transactionReference || `SLIP-${Date.now().toString().slice(-6)}`;

    const payment = await Payment.create({
      studentId: student._id,
      userId: user._id,
      paymentType: 'advance',
      payment_method: 'bank_slip',
      paymentMethod: 'bank_slip',
      slipImageUrl: slipUrl,
      slip_file_reference: slipUrl,
      amount: payAmount,
      bankName: bankName || 'Bank of Ceylon (BOC)',
      transactionReference: txRef,
      status: 'pending',
      payment_status: 'Pending Verification',
      uploadedAt: new Date(),
    });

    student.advancePaymentStatus = 'pending';
    student.payment_method = 'bank_slip';
    student.payment_status = 'Pending Verification';
    student.account_status = 'Unverified / Pending Payment';
    await student.save();

    user.account_status = 'Unverified / Pending Payment';
    await user.save();

    // Notify branch staff
    const staffUsers = await User.find({ role: { $in: ['staff', 'admin'] } });
    if (staffUsers.length > 0) {
      await Notification.insertMany(
        staffUsers.map((s) => ({
          recipientId: s._id,
          recipientRole: s.role,
          title: '📋 New Advance Payment Slip Uploaded',
          message: `${user.name} (${student.branch} Branch - ${student.student_type || student.studentType || 'Student'}) uploaded an advance payment slip of Rs. ${payAmount.toLocaleString()} — pending verification.`,
          type: 'payment',
          link: '/staff/payments',
        }))
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Payment slip uploaded successfully. Our branch officer will verify it shortly.',
      payment: { ...payment.toObject(), transactionReference: txRef },
      account_status: student.account_status,
      payment_method: student.payment_method,
      payment_status: student.payment_status,
    });
  } catch (error) {
    console.error('Pending slip upload error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
};

// @desc    Simulate online card payment before login (Pre-auth gateway)
// @route   POST /api/payments/pay-advance-pending
// @access  Public (simulated gateway — no real charges)
exports.payAdvancePending = async (req, res) => {
  try {
    const { pendingUserId, userId, studentId, amount, bankName, transactionReference, cardLast4 } = req.body;
    const targetRef = pendingUserId || userId || studentId;

    if (!targetRef) {
      return res.status(400).json({ success: false, message: 'Student reference is required.' });
    }

    let user = await User.findById(targetRef).catch(() => null);
    let student = null;

    if (user && user.role === 'student') {
      student = await Student.findOne({ userId: user._id });
    } else {
      student = await Student.findById(targetRef).catch(() => null);
      if (student) {
        user = await User.findById(student.userId).catch(() => null);
      }
    }

    if (!user || !student) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }


    const txRef = transactionReference || `ONPAY-${Date.now().toString().slice(-8)}`;
    const payAmount = parseFloat(amount) || ADVANCE_PAYMENT_AMOUNT;

    // Online advance payment requires Data Entry Officer verification before activation
    const payment = await Payment.create({
      studentId: student._id,
      userId: user._id,
      paymentType: 'advance',
      payment_method: 'online_gateway',
      paymentMethod: 'online_gateway',
      slipImageUrl: `https://placehold.co/600x400/1e1035/FFFFFF?text=Online+Payment+Card+****${cardLast4 || '0000'}`,
      gateway_transaction_reference: txRef,
      amount: payAmount,
      bankName: bankName || 'Sithma Pay Online Gateway',
      transactionReference: txRef,
      status: 'pending',
      payment_status: 'Pending Verification',
      uploadedAt: new Date(),
    });

    // Account remains pending verification until Data Entry Officer approves
    student.accountStatus = 'pending_verification';
    student.account_status = 'Unverified / Pending Payment';
    student.payment_method = 'online_gateway';
    student.payment_status = 'Pending Verification';
    student.advancePaymentStatus = 'pending';
    student.isAdvancePaid = false;
    student.isPremium = false;
    student.registrationStatus = 'pending_payment';
    await student.save();

    user.account_status = 'Unverified / Pending Payment';
    await user.save();

    // Notify branch staff and Data Entry Officers
    const staffUsers = await User.find({ role: { $in: ['staff', 'admin'] } });
    if (staffUsers.length > 0) {
      await Notification.insertMany(
        staffUsers.map((s) => ({
          recipientId: s._id,
          recipientRole: s.role,
          title: '💳 Online Advance Payment Received (Pending Verification)',
          message: `${user.name} (${student.branch} Branch - ${student.student_type || student.studentType || 'Student'}) paid Rs. ${payAmount.toLocaleString()} via online card (Ref: ${txRef}). Verification required before account activation.`,
          type: 'payment',
          link: '/staff/payments',
        }))
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Online payment received successfully! Your account will be activated once verified by our Data Entry Officer.',
      payment: { ...payment.toObject(), transactionReference: txRef },
      activated: false,
      account_status: student.account_status,
      payment_method: student.payment_method,
      payment_status: student.payment_status,
    });
  } catch (error) {
    console.error('Pending online payment error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Payment failed' });
  }
};

// @desc    Register intent to pay physically at branch (Pre-auth)
// @route   POST /api/payments/register-physical-intent
// @access  Public
exports.registerPhysicalIntent = async (req, res) => {
  try {
    const { pendingUserId, userId, studentId, branch, amount } = req.body;
    const targetRef = pendingUserId || userId || studentId;

    if (targetRef) {
      let user = await User.findById(targetRef).catch(() => null);
      let student = null;

      if (user && user.role === 'student') {
        student = await Student.findOne({ userId: user._id });
      } else {
        student = await Student.findById(targetRef).catch(() => null);
        if (student) {
          user = await User.findById(student.userId).catch(() => null);
        }
      }

      if (student && user) {

        const payAmount = parseFloat(amount) || ADVANCE_PAYMENT_AMOUNT;
        const txRef = `PHYS-${Date.now().toString().slice(-6)}`;

        // Create a placeholder payment record for the physical intent
        await Payment.create({
          studentId: student._id,
          userId: user._id,
          paymentType: 'advance',
          payment_method: 'physical_branch',
          paymentMethod: 'physical_branch',
          slipImageUrl: `https://placehold.co/600x400/1e1035/FFFFFF?text=Physical+Payment+Pending+${branch || student.branch || 'Branch'}`,
          amount: payAmount,
          bankName: `Branch Office — ${branch || student.branch || 'Maharagama'}`,
          transactionReference: txRef,
          status: 'pending',
          payment_status: 'Pending Branch Payment',
          uploadedAt: new Date(),
        });

        student.payment_method = 'physical_branch';
        student.payment_status = 'Pending Branch Payment';
        student.account_status = 'Unverified / Pending Payment';
        student.advancePaymentStatus = 'pending';
        await student.save();

        user.account_status = 'Unverified / Pending Payment';
        await user.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: `Physical payment intent recorded for ${branch || 'your selected'} branch. Please visit to complete payment.`,
    });
  } catch (error) {
    console.error('Physical intent error:', error);
    return res.status(200).json({ success: true, message: 'Intent recorded.' });
  }
};



// ─────────────────────────────────────────────────────────────
// @desc    Buy Additional Lessons (Student Profile)
// @route   POST /api/payments/buy-additional-lessons
// @access  Student
// ─────────────────────────────────────────────────────────────
exports.buyAdditionalLessons = async (req, res) => {
  try {
    const {
      lessonCount = 1,
      paymentMethod = 'online', // 'online' | 'slip'
      bankName = 'Bank of Ceylon',
      transactionReference,
      slipImageUrl,
    } = req.body;

    const qty = Math.max(1, parseInt(lessonCount, 10) || 1);
    const pricePerLesson = 2500;
    // Discount for 5+ lessons: Rs. 11,500 for 5 instead of 12,500
    const totalAmount = qty === 5 ? 11500 : qty * pricePerLesson;

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (paymentMethod === 'online') {
      // Instant card/gateway payment: Automatically confirmed and unlocked immediately!
      const payment = await Payment.create({
        studentId: student._id,
        userId: req.user._id,
        packageId: student.package?.packageId || null,
        paymentType: 'additional_lessons',
        additionalLessonsCount: qty,
        slipImageUrl: '/uploads/slips/online-additional-lessons.png',
        amount: totalAmount,
        bankName: 'Sithma Online Payment Gateway',
        transactionReference: transactionReference || `ADDL-ONLINE-${Date.now()}`,
        status: 'confirmed',
        verifiedAt: new Date(),
        uploadedAt: new Date(),
      });

      // Update student balance
      student.package.additionalLessonsRequested =
        (student.package.additionalLessonsRequested || 0) + qty;
      const currentUnlocked =
        student.lessonsUnlocked !== undefined && student.lessonsUnlocked !== null
          ? student.lessonsUnlocked
          : (student.package?.lessonsTotal || 15);
      student.lessonsUnlocked = currentUnlocked + qty;
      await student.save();

      // Trigger In-App Notification
      const remainingCount = Math.max(0, student.lessonsUnlocked - (student.lessonsUsed || 0));
      await Notification.create({
        recipientId: req.user._id,
        recipientRole: 'student',
        title: 'Additional Lessons Unlocked!',
        message: `Payment of Rs. ${totalAmount.toLocaleString()} confirmed for ${qty} additional practical lesson(s). You now have ${remainingCount} total lessons available to book!`,
        type: 'booking',
        link: '/student/lessons/book',
      });

      return res.status(200).json({
        success: true,
        message: `Successfully purchased ${qty} additional practical lesson(s)! They are ready to book now.`,
        payment,
        student,
        lessonsUnlocked: student.lessonsUnlocked,
        lessonsRemaining: remainingCount,
      });
    } else {
      // Bank Deposit Slip Upload: Pending Officer Verification
      const slip = req.file
        ? `/uploads/slips/${req.file.filename}`
        : (slipImageUrl || `/uploads/slips/additional-lessons-${Date.now()}.png`);

      const payment = await Payment.create({
        studentId: student._id,
        userId: req.user._id,
        packageId: student.package?.packageId || null,
        paymentType: 'additional_lessons',
        additionalLessonsCount: qty,
        slipImageUrl: slip,
        amount: totalAmount,
        bankName: bankName || 'Bank of Ceylon',
        transactionReference: transactionReference || `ADDL-SLIP-${Date.now()}`,
        status: 'pending',
        uploadedAt: new Date(),
      });

      // Notify Staff
      const staffUsers = await User.find({ role: { $in: ['staff', 'admin'] } });
      const notifications = staffUsers.map((staff) => ({
        recipientId: staff._id,
        recipientRole: staff.role,
        title: 'Additional Lessons Slip Uploaded',
        message: `Student ${req.user.name} submitted a slip for ${qty} additional lessons (Rs. ${totalAmount.toLocaleString()}) for verification.`,
        type: 'payment',
        link: '/staff/payments',
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      return res.status(200).json({
        success: true,
        message: `Deposit slip for ${qty} additional lessons submitted! Your lessons will unlock once verified by our branch officer.`,
        payment,
        student,
      });
    }
  } catch (error) {
    console.error('Buy additional lessons error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to purchase additional lessons',
    });
  }
};

