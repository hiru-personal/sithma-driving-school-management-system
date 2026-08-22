const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    timeSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeSlot',
      required: true,
    },
    branch: {
      type: String,
      enum: ['Maharagama', 'Werahara', 'Delgoda'],
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'ThreeWheeler', 'HeavyVehicle_Bus'],
      required: true,
    },
    lessonType: {
      type: String,
      enum: ['regular', 'free-weekly-class', 'refresher', 'trial-prep'],
      default: 'regular',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'confirmed',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
