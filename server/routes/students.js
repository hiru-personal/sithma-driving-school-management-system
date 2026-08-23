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
} = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected Routes
router.get('/reports/summary', authenticate, authorize('staff', 'admin'), getReportsSummary);
router.get('/', authenticate, authorize('staff', 'admin'), getAllStudents);
router.get('/:id', authenticate, getStudentById);
router.patch('/:id/dmt-dates', authenticate, updateDmtDates);
router.patch('/:id/trial', authenticate, authorize('staff', 'admin'), recordTrialAttempt);
router.get('/:id/heavy-vehicle-eligibility', authenticate, checkHeavyVehicleEligibility);
router.patch('/:id/package', authenticate, authorize('staff', 'admin'), updateStudentPackage);
router.patch('/:id/toggle-premium', authenticate, authorize('staff', 'admin'), toggleAdvancePaid);

module.exports = router;
