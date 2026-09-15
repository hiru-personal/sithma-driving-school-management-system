const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      default: null,
    },
    paymentType: {
      type: String,
      enum: ['advance', 'package', 'monthly', 'general', 'additional_lessons'],
      default: 'advance',
    },
    payment_method: {
      type: String,
      enum: ['bank_slip', 'online_gateway', 'physical_branch'],
      default: 'bank_slip',
    },
    paymentMethod: {
      type: String,
      enum: ['bank_slip', 'online_gateway', 'physical_branch'],
      default: 'bank_slip',
    },
    payment_status: {
      type: String,
      enum: ['Pending Verification', 'Pending Branch Payment', 'Verified', 'Rejected'],
      default: 'Pending Verification',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending Verification', 'Pending Branch Payment', 'Verified', 'Rejected'],
      default: 'Pending Verification',
    },
    additionalLessonsCount: {
      type: Number,
      default: 0,
    },
    slipImageUrl: {
      type: String,
      default: null,
    },
    slip_file_reference: {
      type: String,
      default: null,
    },
    gateway_transaction_reference: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      default: 5000,
      min: 0,
    },
    bankName: {
      type: String,
      default: 'Bank of Ceylon',
    },
    transactionReference: {
      type: String,
      default: '',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'pending',
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verified_at: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    rejection_reason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to synchronize snake_case and camelCase fields
paymentSchema.pre('save', function (next) {
  if (this.studentId && !this.student_id) this.student_id = this.studentId;
  if (this.student_id && !this.studentId) this.studentId = this.student_id;
  if (this.userId && !this.user_id) this.user_id = this.userId;
  if (this.user_id && !this.userId) this.userId = this.user_id;
  if (this.payment_method && !this.paymentMethod) this.paymentMethod = this.payment_method;
  if (this.paymentMethod && !this.payment_method) this.payment_method = this.paymentMethod;
  if (this.payment_status && !this.paymentStatus) this.paymentStatus = this.payment_status;
  if (this.paymentStatus && !this.payment_status) this.payment_status = this.paymentStatus;
  if (this.slipImageUrl && !this.slip_file_reference) this.slip_file_reference = this.slipImageUrl;
  if (this.slip_file_reference && !this.slipImageUrl) this.slipImageUrl = this.slip_file_reference;
  if (this.transactionReference && !this.gateway_transaction_reference) {
    this.gateway_transaction_reference = this.transactionReference;
  }
  if (this.verifiedBy && !this.verified_by) this.verified_by = this.verifiedBy;
  if (this.verified_at && !this.verifiedAt) this.verifiedAt = this.verified_at;
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
