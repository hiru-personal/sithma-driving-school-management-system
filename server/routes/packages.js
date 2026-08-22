const express = require('express');
const router = express.Router();
const {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
} = require('../controllers/packageController');
const { authenticate, authorize } = require('../middleware/auth');

// Public route to view packages
router.get('/', getAllPackages);

// Staff/Admin CRUD routes
router.post('/', authenticate, authorize('staff', 'admin'), createPackage);
router.put('/:id', authenticate, authorize('staff', 'admin'), updatePackage);
router.delete('/:id', authenticate, authorize('staff', 'admin'), deletePackage);

module.exports = router;
