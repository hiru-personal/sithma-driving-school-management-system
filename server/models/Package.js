const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Car_Full', 'Car_Refresher', 'Bike', 'ThreeWheeler', 'HeavyVehicle_Bus'],
      required: true,
      unique: true,
    },
    vehicleCategory: {
      type: String,
      enum: ['Light', 'Heavy'],
      required: true,
      default: 'Light',
    },
    lessons: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isPerLesson: {
      type: Boolean,
      default: false,
    },
    bonusLessons: {
      bike: { type: Number, default: 0 },
      threeWheeler: { type: Number, default: 0 },
    },
    eligibilityCriteria: {
      type: String,
      default: 'None',
    },
    notes: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Package', packageSchema);
