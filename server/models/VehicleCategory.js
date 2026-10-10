const mongoose = require('mongoose');

const vehicleCategorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

vehicleCategorySchema.pre('save', function (next) {
  if (this.key) {
    this.key = this.key.trim();
  }
  if (this.name) {
    this.name = this.name.trim();
  }
  next();
});

module.exports = mongoose.model('VehicleCategory', vehicleCategorySchema);
