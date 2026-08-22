const express = require('express');
const router = express.Router();
const {
  getQuizQuestions,
  submitQuizAttempt,
  getStudentQuizAttempts,
  createQuizQuestion,
  deleteQuizQuestion,
} = require('../controllers/quizController');
const { authenticate, authorize } = require('../middleware/auth');

// Questions & Quiz submission
router.get('/questions', getQuizQuestions);
router.post('/attempt', authenticate, submitQuizAttempt);
router.get('/attempts/student/:id', authenticate, getStudentQuizAttempts);

// Staff Question Bank Management
router.post('/questions', authenticate, authorize('staff', 'admin'), createQuizQuestion);
router.delete('/questions/:id', authenticate, authorize('staff', 'admin'), deleteQuizQuestion);

module.exports = router;
