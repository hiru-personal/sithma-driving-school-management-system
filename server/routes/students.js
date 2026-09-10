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
} = require('../controllers/studentController');
const { authenticate, authorize, checkStudentOwnership } = require('../middleware/auth');

// Protected Routes
router.get('/reports/summary', authenticate, authorize('staff', 'admin'), getReportsSummary);
router.get('/', authenticate, authorize('staff', 'admin'), getAllStudents);
router.post('/walk-in', authenticate, authorize('staff', 'admin'), registerWalkInStudent);

// Student profile & DMT updates: Enforce Student ownership (Student can only access/modify their own ID)
router.get('/:id', authenticate, checkStudentOwnership, getStudentById);
router.patch('/:id/dmt-dates', authenticate, checkStudentOwnership, updateDmtDates);
router.get('/:id/heavy-vehicle-eligibility', authenticate, checkStudentOwnership, checkHeavyVehicleEligibility);

// Staff/Admin only actions
router.patch('/:id/trial', authenticate, authorize('staff', 'admin'), recordTrialAttempt);
router.patch('/:id/package', authenticate, authorize('staff', 'admin'), updateStudentPackage);
router.patch('/:id/toggle-premium', authenticate, authorize('staff', 'admin'), toggleAdvancePaid);

module.exports = router;
