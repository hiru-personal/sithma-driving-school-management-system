const Package = require('../models/Package');

// Default initial package seed data per Sithma Driving School curriculum
const defaultPackages = [
  // =========================================================================
  // A. Individual / Private Single Lessons (Pay-Per-Lesson)
  // =========================================================================
  {
    name: 'Bike (Individual / Private)',
    type: 'Bike_Individual',
    categoryGroup: 'A',
    vehicleCategory: 'Light',
    lessons: 1,
    price: 2000,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: 'Individual / Private single lesson. LKR 2,000 / lesson.',
  },
  {
    name: 'Three-Wheel (Individual / Private)',
    type: 'ThreeWheeler_Individual',
    categoryGroup: 'A',
    vehicleCategory: 'Light',
    lessons: 1,
    price: 2500,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: 'Individual / Private single lesson. LKR 2,500 / lesson.',
  },
  {
    name: 'Car (Auto / Manual — Individual / Private)',
    type: 'Car_Individual',
    categoryGroup: 'A',
    vehicleCategory: 'Light',
    lessons: 1,
    price: 3000,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: 'Car (Auto / Manual) individual private lesson. LKR 3,000 / lesson.',
  },
  {
    name: 'Heavy Vehicle (Individual / Private)',
    type: 'HeavyVehicle_Individual',
    categoryGroup: 'A',
    vehicleCategory: 'Heavy',
    lessons: 1,
    price: 3500,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'Must have held Light Vehicle license for 2+ years',
    notes: 'Heavy Vehicle individual private lesson. LKR 3,500 / lesson.',
  },

  // =========================================================================
  // B. Standard Single Lessons (Pay-Per-Lesson)
  // =========================================================================
  {
    name: 'Bike (Standard Single Lesson)',
    type: 'Bike_Standard',
    categoryGroup: 'B',
    vehicleCategory: 'Light',
    lessons: 1,
    price: 800,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: 'Standard single lesson. LKR 800 / lesson.',
  },
  {
    name: 'Three-Wheel (Standard Single Lesson)',
    type: 'ThreeWheeler_Standard',
    categoryGroup: 'B',
    vehicleCategory: 'Light',
    lessons: 1,
    price: 1500,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: 'Standard single lesson. LKR 1,500 / lesson.',
  },
  {
    name: 'Car (Standard Single Lesson)',
    type: 'Car_Standard',
    categoryGroup: 'B',
    vehicleCategory: 'Light',
    lessons: 1,
    price: 2000,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: 'Car standard single lesson (Auto/Manual). LKR 2,000 / lesson.',
  },
  {
    name: 'Heavy Vehicle (Standard Single Lesson)',
    type: 'HeavyVehicle_Standard',
    categoryGroup: 'B',
    vehicleCategory: 'Heavy',
    lessons: 1,
    price: 2500,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'Must have held Light Vehicle license for 2+ years',
    notes: 'Heavy Vehicle standard single lesson. LKR 2,500 / lesson.',
  },

  // =========================================================================
  // C. Full Course Packages (Includes 15 Standard Lessons)
  // =========================================================================
  {
    name: 'Car Package (Auto Car OR Manual Car)',
    type: 'Car_Full',
    categoryGroup: 'C',
    vehicleCategory: 'Light',
    lessons: 15,
    price: 40000,
    isPerLesson: false,
    bonusLessons: { bike: 2, threeWheeler: 2 },
    eligibilityCriteria: 'None',
    notes: 'Includes 15 standard lessons + 2 FREE Bike lessons + 2 FREE Three-Wheel lessons bonus.',
  },
  {
    name: 'Combo Package (Car + Bike + Three-Wheel)',
    type: 'Combo_Full',
    categoryGroup: 'C',
    vehicleCategory: 'Light',
    lessons: 15,
    price: 65000,
    isPerLesson: false,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: 'Includes full access to 15 standard lessons across all three categories.',
  },
  {
    name: 'Heavy Vehicle Full Package',
    type: 'HeavyVehicle_Full',
    categoryGroup: 'C',
    vehicleCategory: 'Heavy',
    lessons: 15,
    price: 70000,
    isPerLesson: false,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'Must have held Light Vehicle license for 2+ years',
    notes: 'Includes 15 standard heavy vehicle training lessons.',
  },
];

// @desc    Get all packages (Seeds/syncs automatically)
// @route   GET /api/packages
// @access  Public
exports.getAllPackages = async (req, res) => {
  try {
    let packages = await Package.find({ isActive: true }).sort({ categoryGroup: 1, price: 1 });

    if (packages.length === 0) {
      packages = await Package.insertMany(defaultPackages);
    } else {
      // Ensure all packages across groups A, B, and C are present and up to date
      for (const defPkg of defaultPackages) {
        const exists = await Package.findOne({ type: defPkg.type });
        if (!exists) {
          await Package.create(defPkg);
        } else {
          exists.name = defPkg.name;
          exists.price = defPkg.price;
          exists.lessons = defPkg.lessons;
          exists.notes = defPkg.notes;
          exists.isPerLesson = defPkg.isPerLesson;
          exists.bonusLessons = defPkg.bonusLessons;
          exists.categoryGroup = defPkg.categoryGroup;
          if (defPkg.vehicleCategory) exists.vehicleCategory = defPkg.vehicleCategory;
          await exists.save();
        }
      }
      packages = await Package.find({ isActive: true }).sort({ categoryGroup: 1, price: 1 });
    }

    return res.status(200).json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch packages',
      error: error.message,
    });
  }
};

// @desc    Create a new package (Staff/Admin)
// @route   POST /api/packages
// @access  Staff, Admin
exports.createPackage = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.categoryGroup) {
      payload.categoryGroup = payload.isPerLesson ? 'A' : (payload.lessons >= 10 ? 'C' : 'B');
    }
    const newPackage = await Package.create(payload);
    return res.status(201).json({
      success: true,
      message: 'Package created successfully',
      package: newPackage,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A package with this identifier already exists. Please choose a different package name or type.',
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create package',
    });
  }
};

// @desc    Update a package (Staff/Admin)
// @route   PUT /api/packages/:id
// @access  Staff, Admin
exports.updatePackage = async (req, res) => {
  try {
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Package updated successfully',
      package: updatedPackage,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update package',
    });
  }
};

// @desc    Soft-delete/deactivate a package (Staff/Admin)
// @route   DELETE /api/packages/:id
// @access  Staff, Admin
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Package deactivated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete package',
    });
  }
};
