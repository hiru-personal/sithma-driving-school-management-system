const mongoose = require('mongoose');

const curriculumGroupSchema = new mongoose.Schema(
  {
    code: {
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
    label: {
      type: String,
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

// Pre-save normalization: auto-generate standard label if omitted
curriculumGroupSchema.pre('save', function (next) {
  if (this.code) {
    this.code = this.code.trim();
  }
  if (!this.label) {
    if (this.code.toLowerCase() === 'other') {
      this.label = 'Group D / Other Packages';
    } else {
      this.label = `Group ${this.code} — ${this.name}`;
    }
  }
  next();
});

module.exports = mongoose.model('CurriculumGroup', curriculumGroupSchema);
