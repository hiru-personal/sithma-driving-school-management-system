const mongoose = require('mongoose');

const customPackageTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save normalization: ensure clean identifier
customPackageTypeSchema.pre('save', function (next) {
  if (this.name) {
    this.name = this.name.trim();
  }
  if (!this.label && this.name) {
    this.label = this.name.replace(/_/g, ' ');
  }
  next();
});

module.exports = mongoose.model('CustomPackageType', customPackageTypeSchema);
