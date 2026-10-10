const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Branch code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Branch address is required'],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    manager: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    instructorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dailySessionSlots: {
      type: Number,
      default: 3,
      min: 1,
    },
    sessionDurationMinutes: {
      type: Number,
      default: 60,
    },
    defaultSlotTimes: [
      {
        startTime: String, // e.g. "08:30"
        endTime: String,   // e.g. "09:30"
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Branch', branchSchema);
