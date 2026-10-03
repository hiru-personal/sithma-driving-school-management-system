const mongoose = require('mongoose');

const quizAnswerItemSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizQuestion',
      required: true,
    },
    questionText: {
      type: String,
      default: '',
    },
    options: {
      type: [String],
      default: [],
    },
    explanation: {
      type: String,
      default: '',
    },
    selectedOption: {
      type: Number,
      required: true,
      min: -1,
      max: 3,
    },
    correctOption: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questionListId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionList',
      default: null,
    },
    questionListName: {
      type: String,
      default: 'General DMT Practice Exam',
    },
    status: {
      type: String,
      enum: ['Completed', 'In Progress', 'Abandoned'],
      default: 'Completed',
    },
    language: {
      type: String,
      enum: ['Sinhala', 'Tamil', 'English'],
      required: true,
    },
    vehicleCategory: {
      type: String,
      enum: ['Light', 'Heavy'],
      required: true,
    },
    answers: [quizAnswerItemSchema],
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    takenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
