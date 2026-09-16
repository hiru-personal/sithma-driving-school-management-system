const mongoose = require('mongoose');

const rescheduleRequestSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    requested_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requested_at: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    preferred_date: {
      type: Date,
      default: null,
    },
    milestone_type: {
      type: String,
      enum: ['medical', 'registration', 'theory_exam', 'trial'],
      default: 'trial',
    },
    previous_date: {
      type: Date,
      default: null,
    },
    new_date: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewed_at: {
      type: Date,
      default: null,
    },
    review_notes: {
      type: String,
      trim: true,
      default: '',
    },
    previous_trial_date: {
      type: Date,
      default: null,
    },
    new_trial_date: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RescheduleRequest', rescheduleRequestSchema);
