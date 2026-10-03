const mongoose = require('mongoose');

const questionListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Question List name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    language: {
      type: String,
      enum: ['Sinhala', 'Tamil', 'English'],
      required: [true, 'Question List language is required'],
      default: 'English',
    },
    vehicleCategory: {
      type: String,
      enum: ['Light', 'Heavy', 'All'],
      default: 'Light',
    },
    passingScore: {
      type: Number,
      default: 80,
      min: 1,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for questions
questionListSchema.virtual('questions', {
  ref: 'QuizQuestion',
  localField: '_id',
  foreignField: 'questionListId',
});

module.exports = mongoose.model('QuestionList', questionListSchema);
