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
      required: true,
      trim: true,
    },
    categoryGroup: {
      type: String,
      default: 'A',
      trim: true,
    },
    vehicleCategory: {
      type: String,
      default: 'Light',
      trim: true,
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
