const CurriculumPreset = require('../models/CurriculumPreset');

const DEFAULT_PRESETS = [
  {
    title: 'Morning Highway Driving & Overtaking',
    description: 'Speed regulation, lane discipline, dual-carriageway entry/exit, overtaking maneuvers',
    topic: 'Speed regulation, lane discipline, dual-carriageway entry/exit, overtaking maneuvers',
    vehicleCategory: 'Light',
    vehicleType: 'Car',
    isDefault: true,
    createdByName: 'Standard Syllabus',
  },
  {
    title: 'Parallel Parking, Hill Start & Reverse 90°',
    description: 'Precision maneuvering, clutch bite control on steep incline, reverse bay alignment',
    topic: 'Precision maneuvering, clutch bite control on steep incline, reverse bay alignment',
    vehicleCategory: 'Light',
    vehicleType: 'Car',
    isDefault: true,
    createdByName: 'Standard Syllabus',
  },
  {
    title: 'City Traffic, Roundabouts & Complex Junctions',
    description: 'Traffic light signals, multi-lane roundabouts, pedestrian crossings, mirror-signal-maneuver',
    topic: 'Traffic light signals, multi-lane roundabouts, pedestrian crossings, mirror-signal-maneuver',
    vehicleCategory: 'Light',
    vehicleType: 'Car',
    isDefault: true,
    createdByName: 'Standard Syllabus',
  },
  {
    title: 'Motorcycle Slalom & Balance Mastery',
    description: 'Emergency braking, cone slalom weaving, figure-8 balance, tight slow-speed turns',
    topic: 'Emergency braking, cone slalom weaving, figure-8 balance, tight slow-speed turns',
    vehicleCategory: 'Light',
    vehicleType: 'Bike',
    isDefault: true,
    createdByName: 'Standard Syllabus',
  },
  {
    title: 'Three-Wheeler Practical Control & Navigation',
    description: 'Incline throttle coordination, tight turning radius maneuvers, urban obstacle handling',
    topic: 'Incline throttle coordination, tight turning radius maneuvers, urban obstacle handling',
    vehicleCategory: 'Light',
    vehicleType: 'ThreeWheeler',
    isDefault: true,
    createdByName: 'Standard Syllabus',
  },
  {
    title: 'Heavy Transport Bus Road Operation',
    description: 'Air brake operation, wide turning geometry, rear mirror navigation, blind-spot checks',
    topic: 'Air brake operation, wide turning geometry, rear mirror navigation, blind-spot checks',
    vehicleCategory: 'Heavy',
    vehicleType: 'HeavyVehicle_Bus',
    isDefault: true,
    createdByName: 'Standard Syllabus',
  },
];

// @desc    Get all curriculum presets (auto-seeds defaults if none exist in DB)
// @route   GET /api/curriculum-presets
// @access  Public / Authenticated
exports.getCurriculumPresets = async (req, res) => {
  try {
    let presets = await CurriculumPreset.find().sort({ isDefault: -1, createdAt: 1 });

    if (presets.length === 0) {
      // Auto-seed default curriculum presets
      await CurriculumPreset.insertMany(DEFAULT_PRESETS);
      presets = await CurriculumPreset.find().sort({ isDefault: -1, createdAt: 1 });
    } else {
      // Ensure all 6 default syllabus presets exist in DB
      for (const def of DEFAULT_PRESETS) {
        const exists = presets.some((p) => p.title === def.title);
        if (!exists) {
          await CurriculumPreset.create(def);
        }
      }
      presets = await CurriculumPreset.find().sort({ isDefault: -1, createdAt: 1 });
    }

    res.status(200).json({
      success: true,
      count: presets.length,
      presets,
    });
  } catch (err) {
    console.error('[CurriculumPreset] Error fetching presets:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve curriculum presets',
      error: err.message,
    });
  }
};

// @desc    Create a new curriculum lesson preset
// @route   POST /api/curriculum-presets
// @access  Instructor / Staff / Admin
exports.createCurriculumPreset = async (req, res) => {
  try {
    const { title, description, topic, vehicleType = 'Car', vehicleCategory } = req.body;

    const lessonName = title?.trim();
    const lessonDesc = (description || topic)?.trim();

    if (!lessonName) {
      return res.status(400).json({
        success: false,
        message: 'Lesson name is required',
      });
    }

    if (!lessonDesc) {
      return res.status(400).json({
        success: false,
        message: 'Lesson description is required',
      });
    }

    // Determine category
    const cat = vehicleCategory || (vehicleType === 'HeavyVehicle_Bus' ? 'Heavy' : 'Light');

    const newPreset = await CurriculumPreset.create({
      title: lessonName,
      description: lessonDesc,
      topic: lessonDesc,
      vehicleType,
      vehicleCategory: cat,
      isDefault: false,
      createdBy: req.user?._id || null,
      createdByName: req.user?.name || 'Instructor',
    });

    res.status(201).json({
      success: true,
      message: '🎉 Lesson preset created successfully and added to quick presets!',
      preset: newPreset,
    });
  } catch (err) {
    console.error('[CurriculumPreset] Error creating preset:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create lesson preset',
      error: err.message,
    });
  }
};

// @desc    Update an existing curriculum lesson preset
// @route   PUT /api/curriculum-presets/:id
// @access  Instructor / Staff / Admin
exports.updateCurriculumPreset = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, topic, vehicleType, vehicleCategory } = req.body;

    const preset = await CurriculumPreset.findById(id);
    if (!preset) {
      return res.status(404).json({
        success: false,
        message: 'Curriculum lesson preset not found',
      });
    }

    if (title && title.trim()) {
      preset.title = title.trim();
    }

    const descToUpdate = (description || topic)?.trim();
    if (descToUpdate) {
      preset.description = descToUpdate;
      preset.topic = descToUpdate;
    }

    if (vehicleType) {
      preset.vehicleType = vehicleType;
      preset.vehicleCategory = vehicleCategory || (vehicleType === 'HeavyVehicle_Bus' ? 'Heavy' : 'Light');
    } else if (vehicleCategory) {
      preset.vehicleCategory = vehicleCategory;
    }

    await preset.save();

    res.status(200).json({
      success: true,
      message: 'Lesson preset updated successfully',
      preset,
    });
  } catch (err) {
    console.error('[CurriculumPreset] Error updating preset:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update lesson preset',
      error: err.message,
    });
  }
};

// @desc    Delete a curriculum lesson preset
// @route   DELETE /api/curriculum-presets/:id
// @access  Instructor / Staff / Admin
exports.deleteCurriculumPreset = async (req, res) => {
  try {
    const { id } = req.params;

    const preset = await CurriculumPreset.findById(id);
    if (!preset) {
      return res.status(404).json({
        success: false,
        message: 'Curriculum lesson preset not found',
      });
    }

    if (preset.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Standard syllabus presets are permanent regulatory curriculum components and cannot be deleted.',
      });
    }

    await CurriculumPreset.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Lesson preset deleted successfully',
      deletedId: id,
    });
  } catch (err) {
    console.error('[CurriculumPreset] Error deleting preset:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lesson preset',
      error: err.message,
    });
  }
};
