const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  updateDmtDates,
  recordTrialAttempt,
  checkHeavyVehicleEligibility,
  updateStudentPackage,
  getReportsSummary,
  toggleAdvancePaid,
  registerWalkInStudent,
  updateStudentProfile,
  recordExamAttempt,
  reRegisterStudent,
  setTrialDate,
  submitRescheduleRequest,
  getMyRescheduleRequests,
  getAllRescheduleRequests,
  reviewRescheduleRequest,
  uploadMilestoneProof,
} = require('../controllers/studentController');
const { authenticate, authorize, checkStudentOwnership } = require('../middleware/auth');
const dmtProofUpload = require('../middleware/dmtProofUpload');

// Protected Routes
router.get('/reports/summary', authenticate, authorize('staff', 'admin'), getReportsSummary);
router.get('/', authenticate, authorize('staff', 'admin'), getAllStudents);
router.post('/walk-in', authenticate, authorize('staff', 'admin'), registerWalkInStudent);

// Reschedule Requests (Student & Staff)
router.post('/trial-date/reschedule', authenticate, submitRescheduleRequest);
router.get('/trial-date/reschedule', authenticate, getMyRescheduleRequests);
router.get('/reschedule-requests/all', authenticate, authorize('staff', 'admin'), getAllRescheduleRequests);
router.patch('/reschedule-requests/:id/review', authenticate, authorize('staff', 'admin'), reviewRescheduleRequest);

// Student profile & DMT updates: Enforce Student ownership (Student can only access/modify their own ID)
router.get('/:id', authenticate, checkStudentOwnership, getStudentById);
router.patch('/:id/profile', authenticate, checkStudentOwnership, updateStudentProfile);
router.patch('/:id/dmt-dates', authenticate, checkStudentOwnership, updateDmtDates);
router.post('/:id/exam-attempt', authenticate, checkStudentOwnership, recordExamAttempt);
router.post('/:id/re-register', authenticate, checkStudentOwnership, reRegisterStudent);
router.post('/:id/milestone-proof', authenticate, checkStudentOwnership, dmtProofUpload.single('proofDocument'), uploadMilestoneProof);
router.get('/:id/heavy-vehicle-eligibility', authenticate, checkStudentOwnership, checkHeavyVehicleEligibility);

// Staff/Admin only actions
router.patch('/:id/trial-date', authenticate, authorize('staff', 'admin'), setTrialDate);
router.patch('/:id/trial', authenticate, authorize('staff', 'admin'), recordTrialAttempt);
router.patch('/:id/package', authenticate, authorize('staff', 'admin'), updateStudentPackage);
router.patch('/:id/toggle-premium', authenticate, authorize('staff', 'admin'), toggleAdvancePaid);
router.patch('/:id/advance-paid', authenticate, authorize('staff', 'admin'), toggleAdvancePaid);

module.exports = router;
