const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    branch: {
      type: String,
      enum: ['Maharagama', 'Werahara', 'Delgoda'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // e.g., "08:30"
      required: true,
    },
    endTime: {
      type: String, // e.g., "09:30"
      required: true,
    },
    lessonTitle: {
      type: String,
      default: 'Practical Driving Session',
    },
    lessonTopic: {
      type: String,
      default: 'Road Maneuvers & Handling',
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    vehicleCategory: {
      type: String,
      enum: ['Light', 'Heavy', 'All'],
      default: 'Light',
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'ThreeWheeler', 'HeavyVehicle_Bus', 'All'],
      default: 'Car',
    },
    capacity: {
      type: Number,
      default: 10,
      max: 10,
    },
    bookedCount: {
      type: Number,
      default: 0,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    status: {
      type: String,
      enum: ['available', 'full', 'booked', 'cancelled'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double-booking same instructor at the same date & time slot
timeSlotSchema.index(
  { instructorId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { instructorId: { $ne: null }, status: { $ne: 'cancelled' } },
  }
);

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
