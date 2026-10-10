const express = require('express');
const router = express.Router();
const {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getCustomPackageTypes,
  createCustomPackageType,
  updateCustomPackageType,
  deleteCustomPackageType,
  getCurriculumGroups,
  createCurriculumGroup,
  updateCurriculumGroup,
  deleteCurriculumGroup,
  getVehicleCategories,
  createVehicleCategory,
  updateVehicleCategory,
  deleteVehicleCategory,
} = require('../controllers/packageController');
const { authenticate, authorize } = require('../middleware/auth');

// Public route to view packages
router.get('/', getAllPackages);

// Custom Package Types routes
router.get('/custom-types', getCustomPackageTypes);
router.post('/custom-types', authenticate, authorize('staff', 'admin'), createCustomPackageType);
router.put('/custom-types/:name', authenticate, authorize('staff', 'admin'), updateCustomPackageType);
router.delete('/custom-types/:name', authenticate, authorize('staff', 'admin'), deleteCustomPackageType);

// Curriculum Group routes
router.get('/curriculum-groups', getCurriculumGroups);
router.post('/curriculum-groups', authenticate, authorize('staff', 'admin'), createCurriculumGroup);
router.put('/curriculum-groups/:code', authenticate, authorize('staff', 'admin'), updateCurriculumGroup);
router.delete('/curriculum-groups/:code', authenticate, authorize('staff', 'admin'), deleteCurriculumGroup);

// Vehicle Category routes
router.get('/vehicle-categories', getVehicleCategories);
router.post('/vehicle-categories', authenticate, authorize('staff', 'admin'), createVehicleCategory);
router.put('/vehicle-categories/:key', authenticate, authorize('staff', 'admin'), updateVehicleCategory);
router.delete('/vehicle-categories/:key', authenticate, authorize('staff', 'admin'), deleteVehicleCategory);


// Staff/Admin CRUD routes
router.post('/', authenticate, authorize('staff', 'admin'), createPackage);
router.put('/:id', authenticate, authorize('staff', 'admin'), updatePackage);
router.delete('/:id', authenticate, authorize('staff', 'admin'), deletePackage);

module.exports = router;

