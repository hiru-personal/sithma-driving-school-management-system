const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      validate: [
        (val) => val.length === 4,
        'Question must have exactly 4 answer options',
      ],
      required: true,
    },
    correctAnswerIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      enum: ['Sinhala', 'Tamil', 'English'],
      required: true,
      default: 'English',
    },
    vehicleCategory: {
      type: String,
      enum: ['Light', 'Heavy'],
      required: true,
      default: 'Light',
    },
    trafficSignImage: {
      type: String,
      default: null,
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

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);
