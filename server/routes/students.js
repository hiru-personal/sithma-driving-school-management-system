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
  uploadStudentProfilePhoto,
  markStudentPassed,
  uploadFinalLicense,
  verifyFinalLicense,
  getRegistrationCycles,
  updateStudentDetails,
} = require('../controllers/studentController');
const { authenticate, authorize, checkStudentOwnership } = require('../middleware/auth');
const dmtProofUpload = require('../middleware/dmtProofUpload');
const avatarUpload = require('../middleware/avatarUpload');
const finalLicenseUpload = require('../middleware/finalLicenseUpload');

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
router.post('/:id/profile-photo', authenticate, checkStudentOwnership, avatarUpload.single('profilePhoto'), uploadStudentProfilePhoto);
router.patch('/:id/dmt-dates', authenticate, checkStudentOwnership, updateDmtDates);
router.post('/:id/exam-attempt', authenticate, checkStudentOwnership, recordExamAttempt);
router.post('/:id/re-register', authenticate, checkStudentOwnership, reRegisterStudent);
router.get('/:id/registration-cycles', authenticate, checkStudentOwnership, getRegistrationCycles);
router.post('/:id/final-license', authenticate, checkStudentOwnership, finalLicenseUpload.single('licensePhoto'), uploadFinalLicense);
router.post('/:id/milestone-proof', authenticate, checkStudentOwnership, dmtProofUpload.single('proofDocument'), uploadMilestoneProof);
router.get('/:id/heavy-vehicle-eligibility', authenticate, checkStudentOwnership, checkHeavyVehicleEligibility);

// Student self-update & Staff/Admin action
router.post('/:id/trial-attempt', authenticate, checkStudentOwnership, recordTrialAttempt);
router.patch('/:id/trial-attempt', authenticate, checkStudentOwnership, recordTrialAttempt);
router.post('/:id/trial', authenticate, checkStudentOwnership, recordTrialAttempt);
router.patch('/:id/trial', authenticate, checkStudentOwnership, recordTrialAttempt);

// Staff/Admin only actions
router.put('/:id', authenticate, authorize('staff', 'admin'), updateStudentDetails);
router.patch('/:id', authenticate, authorize('staff', 'admin'), updateStudentDetails);
router.patch('/:id/details', authenticate, authorize('staff', 'admin'), updateStudentDetails);
router.patch('/:id/final-pass', authenticate, authorize('staff', 'admin'), markStudentPassed);
router.patch('/:id/final-license/verify', authenticate, authorize('staff', 'admin'), verifyFinalLicense);
router.patch('/:id/trial-date', authenticate, authorize('staff', 'admin'), setTrialDate);
router.post('/:id/trial-date', authenticate, authorize('staff', 'admin'), setTrialDate);
router.patch('/:id/package', authenticate, authorize('staff', 'admin'), updateStudentPackage);
router.patch('/:id/toggle-premium', authenticate, authorize('staff', 'admin'), toggleAdvancePaid);
router.patch('/:id/advance-paid', authenticate, authorize('staff', 'admin'), toggleAdvancePaid);

module.exports = router;
