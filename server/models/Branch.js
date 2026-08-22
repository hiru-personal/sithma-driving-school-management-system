const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['Maharagama', 'Werahara', 'Delgoda'],
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
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
