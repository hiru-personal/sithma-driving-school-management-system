const express = require('express');
const router = express.Router();
const {
  getCurriculumPresets,
  createCurriculumPreset,
  updateCurriculumPreset,
  deleteCurriculumPreset,
} = require('../controllers/curriculumPresetController');
const { authenticate, authorize } = require('../middleware/auth');

// Public or Authenticated GET
router.get('/', getCurriculumPresets);

// Instructor / Staff / Admin CRUD
router.post('/', authenticate, authorize('instructor', 'staff', 'admin'), createCurriculumPreset);
router.put('/:id', authenticate, authorize('instructor', 'staff', 'admin'), updateCurriculumPreset);
router.delete('/:id', authenticate, authorize('instructor', 'staff', 'admin'), deleteCurriculumPreset);

module.exports = router;
