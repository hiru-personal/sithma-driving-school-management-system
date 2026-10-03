const express = require('express');
const router = express.Router();
const {
  // Question Lists
  getQuestionLists,
  getQuestionListById,
  createQuestionList,
  updateQuestionList,
  deleteQuestionList,

  // Questions
  getQuizQuestions,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,

  // Attempts & History Review
  submitQuizAttempt,
  getStudentQuizAttempts,
  getQuizAttemptById,
} = require('../controllers/quizController');
const { authenticate, authorize, requireVerifiedStudent } = require('../middleware/auth');

// Question Lists (Admin / Staff / Public read for taking practice exams)
router.get('/lists', getQuestionLists);
router.get('/lists/:id', getQuestionListById);
router.post('/lists', authenticate, authorize('staff', 'admin'), createQuestionList);
router.put('/lists/:id', authenticate, authorize('staff', 'admin'), updateQuestionList);
router.delete('/lists/:id', authenticate, authorize('staff', 'admin'), deleteQuestionList);

// Questions (Read, Create, Update, Delete)
router.get('/questions', getQuizQuestions);
router.post('/questions', authenticate, authorize('staff', 'admin'), createQuizQuestion);
router.put('/questions/:id', authenticate, authorize('staff', 'admin'), updateQuizQuestion);
router.delete('/questions/:id', authenticate, authorize('staff', 'admin'), deleteQuizQuestion);

// Student Exam Attempts & Read-Only Reviews
router.post('/attempt', authenticate, requireVerifiedStudent, submitQuizAttempt);
router.get('/attempts/student/:id', authenticate, getStudentQuizAttempts);
router.get('/attempts/:id', authenticate, getQuizAttemptById);

module.exports = router;
