const Package = require('../models/Package');

// Default initial package seed data per Sprint 0 document
const defaultPackages = [
  {
    name: 'Car — Full License Package',
    type: 'Car_Full',
    vehicleCategory: 'Light',
    lessons: 15,
    price: 45000,
    bonusLessons: { bike: 2, threeWheeler: 2 },
    eligibilityCriteria: 'None',
    notes: 'Includes 2 free Three-Wheeler lessons and 2 free Bike lessons as a bonus.',
  },
  {
    name: 'Car — Refresher Package',
    type: 'Car_Refresher',
    vehicleCategory: 'Light',
    lessons: 6,
    price: 15000,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'Existing Car License holders',
    notes: 'For students who already hold a Car license and need refresher practice.',
  },
  {
    name: 'Bike (Standalone Lessons)',
    type: 'Bike',
    vehicleCategory: 'Light',
    lessons: 1,
    price: 850,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: 'Rs. 850 per lesson. Students can choose any number of lessons.',
  },
  {
    name: 'Three-Wheeler (Standalone Lessons)',
    type: 'ThreeWheeler',
    vehicleCategory: 'Light',
    lessons: 1,
    price: 1000,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: 'Rs. 1,000 per lesson. Students can choose any number of lessons.',
  },
  {
    name: 'Heavy Vehicle (Bus) Package',
    type: 'HeavyVehicle_Bus',
    vehicleCategory: 'Heavy',
    lessons: 15,
    price: 65000,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'Must have held Light Vehicle license for 2+ years',
    notes: '15 lessons. Strict requirement: minimum 2 years on a Light Vehicle license.',
  },
];

// @desc    Get all packages (Seeds automatically if collection is empty)
// @route   GET /api/packages
// @access  Public
exports.getAllPackages = async (req, res) => {
  try {
    let packages = await Package.find({ isActive: true }).sort({ price: 1 });

    if (packages.length === 0) {
      packages = await Package.insertMany(defaultPackages);
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
    const newPackage = await Package.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Package created successfully',
      package: newPackage,
    });
  } catch (error) {
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
