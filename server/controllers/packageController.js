const Package = require('../models/Package');

// Default initial package seed data per Sprint 0 document
const defaultPackages = [
  {
    name: 'Car — Full License Package',
    type: 'Car_Full',
    vehicleCategory: 'Light',
    lessons: 15,
    price: 45000,
    isPerLesson: false,
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
    isPerLesson: false,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'Existing Car License holders',
    notes: 'For students who already hold a Car license and need refresher practice.',
  },
  {
    name: 'Heavy Vehicle (Bus) Package',
    type: 'HeavyVehicle_Bus',
    vehicleCategory: 'Heavy',
    lessons: 15,
    price: 65000,
    isPerLesson: false,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'Must have held Light Vehicle license for 2+ years',
    notes: '15 lessons. Strict requirement: minimum 2 years on a Light Vehicle license.',
  },
  {
    name: 'Bike (Standalone)',
    type: 'Bike',
    vehicleCategory: 'Light',
    lessons: 1,
    price: 850,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: 'Priced per lesson, Rs. 850/lesson, flexible quantity.',
  },
  {
    name: 'Three-Wheeler (Standalone)',
    type: 'ThreeWheeler',
    vehicleCategory: 'Light',
    lessons: 1,
    price: 1000,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: 'Priced per lesson, Rs. 1,000/lesson, flexible quantity.',
  },
  {
    name: 'Car (Auto/Manual) — Individual Package',
    type: 'Car_Individual',
    vehicleCategory: 'Light',
    lessons: 1,
    price: 3000,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: 'Car(Auto/Manual) one lesson per hour - Rs.3000.00. Flexible individual hourly sessions.',
  },
  {
    name: 'Bike — Individual Package',
    type: 'Bike_Individual',
    vehicleCategory: 'Light',
    lessons: 1,
    price: 1500,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: 'Bike one lesson per hour - Rs.1500.00. Balance, clutch control, and Figure-8 training.',
  },
  {
    name: 'Three Wheel — Individual Package',
    type: 'ThreeWheeler_Individual',
    vehicleCategory: 'Light',
    lessons: 1,
    price: 2000,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: 'Three Wheel one lesson per hour - Rs.2000.00. Steering, tight cornering, and reverse bay parking.',
  },
  {
    name: 'Heavy Vehicle — Individual Package',
    type: 'HeavyVehicle_Individual',
    vehicleCategory: 'Heavy',
    lessons: 1,
    price: 3500,
    isPerLesson: true,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'Must have held Light Vehicle license for 2+ years',
    notes: 'Heavy Vehicle one lesson per hour - Rs.3500. Commercial bus/lorry handling and air brake mechanics.',
  },
];

// @desc    Get all packages (Seeds/syncs automatically)
// @route   GET /api/packages
// @access  Public
exports.getAllPackages = async (req, res) => {
  try {
    let packages = await Package.find({ isActive: true }).sort({ isPerLesson: 1, price: 1 });

    if (packages.length === 0) {
      packages = await Package.insertMany(defaultPackages);
    } else {
      // Ensure all individual and comprehensive packages are present and up to date
      for (const defPkg of defaultPackages) {
        const exists = await Package.findOne({ type: defPkg.type });
        if (!exists) {
          await Package.create(defPkg);
        } else if (defPkg.isPerLesson && (exists.price !== defPkg.price || exists.name !== defPkg.name)) {
          exists.name = defPkg.name;
          exists.price = defPkg.price;
          exists.notes = defPkg.notes;
          exists.isPerLesson = true;
          await exists.save();
        }
      }
      packages = await Package.find({ isActive: true }).sort({ isPerLesson: 1, price: 1 });
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
