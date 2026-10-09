const mongoose = require('mongoose');

const curriculumPresetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Lesson description is required'],
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
      default: function () {
        return this.description;
      },
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
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdByName: {
      type: String,
      default: 'Sithma Driving School',
    },
  },
  {
    timestamps: true,
  }
);

// Keep topic and description synced
curriculumPresetSchema.pre('save', function (next) {
  if (this.description && !this.topic) {
    this.topic = this.description;
  } else if (this.topic && !this.description) {
    this.description = this.topic;
  }
  next();
});

module.exports = mongoose.model('CurriculumPreset', curriculumPresetSchema);
