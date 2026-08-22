const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  updateDmtDates,
  recordTrialAttempt,
  checkHeavyVehicleEligibility,
  updateStudentPackage,
} = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected Routes
router.get('/', authenticate, authorize('staff', 'admin'), getAllStudents);
router.get('/:id', authenticate, getStudentById);
router.patch('/:id/dmt-dates', authenticate, updateDmtDates);
router.patch('/:id/trial', authenticate, authorize('staff', 'admin'), recordTrialAttempt);
router.get('/:id/heavy-vehicle-eligibility', authenticate, checkHeavyVehicleEligibility);
router.patch('/:id/package', authenticate, authorize('staff', 'admin'), updateStudentPackage);

module.exports = router;
