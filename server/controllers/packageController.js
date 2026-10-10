const Package = require('../models/Package');
const CustomPackageType = require('../models/CustomPackageType');
const Student = require('../models/Student');
const CurriculumGroup = require('../models/CurriculumGroup');
const VehicleCategory = require('../models/VehicleCategory');

// Protected standard package types per Sithma Driving School curriculum
const STANDARD_PACKAGE_TYPES_LIST = [
  'Bike_Individual',
  'ThreeWheeler_Individual',
  'Car_Individual',
  'HeavyVehicle_Individual',
  'Bike_Standard',
  'ThreeWheeler_Standard',
  'Car_Standard',
  'HeavyVehicle_Standard',
  'Car_Full',
  'Combo_Full',
  'Car_Refresher',
  'HeavyVehicle_Bus',
  'HeavyVehicle_Full',
  'Bike',
  'ThreeWheeler',
];

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

    // Auto-sync custom package type to CustomPackageType collection if not standard
    if (payload.type && !STANDARD_PACKAGE_TYPES_LIST.includes(payload.type)) {
      await CustomPackageType.findOneAndUpdate(
        { name: payload.type },
        { name: payload.type, label: payload.type.replace(/_/g, ' ') },
        { upsert: true }
      ).catch(() => {});
    }

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

    // Auto-sync custom package type to CustomPackageType collection if not standard
    if (updatedPackage.type && !STANDARD_PACKAGE_TYPES_LIST.includes(updatedPackage.type)) {
      await CustomPackageType.findOneAndUpdate(
        { name: updatedPackage.type },
        { name: updatedPackage.type, label: updatedPackage.type.replace(/_/g, ' ') },
        { upsert: true }
      ).catch(() => {});
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

// =============================================================================
// CUSTOM PACKAGE TYPE MANAGEMENT (Admin/Staff)
// =============================================================================

// @desc    Get all custom package types (auto-syncs with active packages in DB)
// @route   GET /api/packages/custom-types
// @access  Public
exports.getCustomPackageTypes = async (req, res) => {
  try {
    let customTypes = await CustomPackageType.find().sort({ createdAt: 1 });

    // Sync any existing packages that have non-standard types into CustomPackageType
    const activePkgTypes = await Package.distinct('type', { isActive: true });
    let newlyAdded = false;

    for (const t of activePkgTypes) {
      if (t && !STANDARD_PACKAGE_TYPES_LIST.includes(t)) {
        const exists = customTypes.some((c) => c.name === t);
        if (!exists) {
          const doc = await CustomPackageType.create({
            name: t,
            label: t.replace(/_/g, ' '),
          });
          customTypes.push(doc);
          newlyAdded = true;
        }
      }
    }

    if (newlyAdded) {
      customTypes.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    }

    return res.status(200).json({
      success: true,
      count: customTypes.length,
      customTypes,
    });
  } catch (error) {
    console.error('Error fetching custom package types:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch custom package types',
      error: error.message,
    });
  }
};

// @desc    Create a custom package type
// @route   POST /api/packages/custom-types
// @access  Staff, Admin
exports.createCustomPackageType = async (req, res) => {
  try {
    const { name, label, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Package type identifier is required',
      });
    }

    const cleanName = name.trim().replace(/\s+/g, '_');

    // Protect standard types
    if (STANDARD_PACKAGE_TYPES_LIST.includes(cleanName)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create a custom type with the same identifier as a default/standard package type.',
      });
    }

    const existing = await CustomPackageType.findOne({ name: cleanName });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Custom package type '${cleanName}' already exists.`,
      });
    }

    const newCustomType = await CustomPackageType.create({
      name: cleanName,
      label: label?.trim() || cleanName.replace(/_/g, ' '),
      description: description || '',
      createdBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: `Custom package type '${cleanName}' created successfully`,
      customType: newCustomType,
    });
  } catch (error) {
    console.error('Error creating custom package type:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create custom package type',
    });
  }
};

// @desc    Update / rename a custom package type
// @route   PUT /api/packages/custom-types/:name
// @access  Staff, Admin
exports.updateCustomPackageType = async (req, res) => {
  try {
    const oldName = decodeURIComponent(req.params.name).trim();
    const { newName, label, description } = req.body;

    if (!oldName) {
      return res.status(400).json({ success: false, message: 'Target package type name is required' });
    }

    // Protect standard types from being edited
    if (STANDARD_PACKAGE_TYPES_LIST.includes(oldName)) {
      return res.status(400).json({
        success: false,
        message: 'Protected default package types cannot be edited or renamed.',
      });
    }

    if (!newName || !newName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'New package type name is required',
      });
    }

    const cleanNewName = newName.trim().replace(/\s+/g, '_');

    // Protect standard types from being overwritten
    if (STANDARD_PACKAGE_TYPES_LIST.includes(cleanNewName)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot rename to a default/standard package type name.',
      });
    }

    // Check if another custom type with this new name already exists
    if (cleanNewName !== oldName) {
      const conflict = await CustomPackageType.findOne({ name: cleanNewName });
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: `A custom package type '${cleanNewName}' already exists.`,
        });
      }
    }

    // 1. Update or upsert in CustomPackageType
    const updatedCustomType = await CustomPackageType.findOneAndUpdate(
      { name: oldName },
      {
        name: cleanNewName,
        label: label?.trim() || cleanNewName.replace(/_/g, ' '),
        description: description !== undefined ? description : '',
      },
      { new: true, upsert: true }
    );

    // 2. Cascade rename to all existing packages
    const pkgUpdateRes = await Package.updateMany(
      { type: oldName },
      { $set: { type: cleanNewName } }
    );

    // 3. Cascade rename to all existing student package records
    let studentCount = 0;
    try {
      const studentUpdateRes = await Student.updateMany(
        { 'package.type': oldName },
        { $set: { 'package.type': cleanNewName } }
      );
      studentCount = studentUpdateRes.modifiedCount || 0;
    } catch (stErr) {
      console.warn('Cascade update to students skipped:', stErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `Custom package type '${oldName}' updated to '${cleanNewName}' successfully.`,
      customType: updatedCustomType,
      updatedPackagesCount: pkgUpdateRes.modifiedCount,
      updatedStudentsCount: studentCount,
    });
  } catch (error) {
    console.error('Error updating custom package type:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update custom package type',
    });
  }
};

// @desc    Delete a custom package type
// @route   DELETE /api/packages/custom-types/:name
// @access  Staff, Admin
exports.deleteCustomPackageType = async (req, res) => {
  try {
    const targetName = decodeURIComponent(req.params.name).trim();

    if (!targetName) {
      return res.status(400).json({ success: false, message: 'Package type name is required' });
    }

    // Protect standard types from being deleted
    if (STANDARD_PACKAGE_TYPES_LIST.includes(targetName)) {
      return res.status(400).json({
        success: false,
        message: 'Protected default package types cannot be deleted.',
      });
    }

    // 1. Delete from CustomPackageType collection
    await CustomPackageType.findOneAndDelete({ name: targetName });

    // 2. Deactivate any packages that had this custom package type
    const pkgDeleteRes = await Package.updateMany(
      { type: targetName },
      { $set: { isActive: false } }
    );

    return res.status(200).json({
      success: true,
      message: `Custom package type '${targetName}' deleted successfully.`,
      deletedType: targetName,
      deactivatedPackagesCount: pkgDeleteRes.modifiedCount,
    });
  } catch (error) {
    console.error('Error deleting custom package type:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete custom package type',
    });
  }
};

// =============================================================================
// CURRICULUM GROUP MANAGEMENT (Admin/Staff)
// =============================================================================

const defaultCurriculumGroups = [
  { code: 'A', name: 'Individual / Private', label: 'Group A — Individual / Private', isDefault: true, order: 1 },
  { code: 'B', name: 'Standard Single Lesson', label: 'Group B — Standard Single Lesson', isDefault: true, order: 2 },
  { code: 'C', name: 'Full Course Package', label: 'Group C — Full Course Package', isDefault: true, order: 3 },
  { code: 'Other', name: 'Group D / Other Packages', label: 'Group D / Other Packages', isDefault: true, order: 4 },
];

// @desc    Get all curriculum groups with assigned package counts
// @route   GET /api/packages/curriculum-groups
// @access  Public
exports.getCurriculumGroups = async (req, res) => {
  try {
    let groups = await CurriculumGroup.find().sort({ order: 1, code: 1 });

    if (groups.length === 0) {
      groups = await CurriculumGroup.insertMany(defaultCurriculumGroups);
    }

    // Calculate how many active packages are using each curriculum group
    const activePackages = await Package.find({ isActive: true }).select('categoryGroup');
    const counts = {};
    for (const p of activePackages) {
      if (p.categoryGroup) {
        counts[p.categoryGroup] = (counts[p.categoryGroup] || 0) + 1;
      }
    }

    const groupsWithCounts = groups.map((g) => ({
      ...g.toObject(),
      assignedCount: counts[g.code] || 0,
    }));

    return res.status(200).json({
      success: true,
      count: groupsWithCounts.length,
      groups: groupsWithCounts,
    });
  } catch (error) {
    console.error('Error fetching curriculum groups:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch curriculum groups',
      error: error.message,
    });
  }
};

// @desc    Create a new curriculum group
// @route   POST /api/packages/curriculum-groups
// @access  Staff, Admin
exports.createCurriculumGroup = async (req, res) => {
  try {
    const { code, name, label, description } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Curriculum group code / identifier is required.',
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Curriculum group name is required.',
      });
    }

    const cleanCode = code.trim();
    const cleanName = name.trim();

    const existing = await CurriculumGroup.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Curriculum group with code '${cleanCode}' already exists.`,
      });
    }

    const highestOrder = await CurriculumGroup.findOne().sort({ order: -1 }).select('order');
    const nextOrder = (highestOrder?.order || 0) + 1;

    const finalLabel = label?.trim() || (cleanCode.toLowerCase() === 'other' ? 'Group D / Other Packages' : `Group ${cleanCode} — ${cleanName}`);

    const newGroup = await CurriculumGroup.create({
      code: cleanCode,
      name: cleanName,
      label: finalLabel,
      description: description || '',
      order: nextOrder,
    });

    return res.status(201).json({
      success: true,
      message: `Curriculum Group '${cleanCode}' created successfully.`,
      group: {
        ...newGroup.toObject(),
        assignedCount: 0,
      },
    });
  } catch (error) {
    console.error('Error creating curriculum group:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create curriculum group',
    });
  }
};

// @desc    Update / rename a curriculum group
// @route   PUT /api/packages/curriculum-groups/:code
// @access  Staff, Admin
exports.updateCurriculumGroup = async (req, res) => {
  try {
    const oldCode = decodeURIComponent(req.params.code).trim();
    const { newCode, name, label, description } = req.body;

    if (!oldCode) {
      return res.status(400).json({ success: false, message: 'Target group code is required.' });
    }

    const group = await CurriculumGroup.findOne({ code: oldCode });
    if (!group) {
      return res.status(404).json({ success: false, message: `Curriculum group '${oldCode}' not found.` });
    }

    const cleanNewCode = newCode ? newCode.trim() : oldCode;
    const cleanName = name ? name.trim() : group.name;

    // If changing code, verify new code isn't taken
    if (cleanNewCode !== oldCode) {
      const conflict = await CurriculumGroup.findOne({ code: cleanNewCode });
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: `Curriculum group code '${cleanNewCode}' is already in use.`,
        });
      }
    }

    const finalLabel = label?.trim() || (cleanNewCode.toLowerCase() === 'other' ? 'Group D / Other Packages' : `Group ${cleanNewCode} — ${cleanName}`);

    group.code = cleanNewCode;
    group.name = cleanName;
    group.label = finalLabel;
    if (description !== undefined) group.description = description;
    await group.save();

    // Cascade update to all packages if code changed
    let updatedPackagesCount = 0;
    if (cleanNewCode !== oldCode) {
      const pkgRes = await Package.updateMany(
        { categoryGroup: oldCode },
        { $set: { categoryGroup: cleanNewCode } }
      );
      updatedPackagesCount = pkgRes.modifiedCount;
    }

    const activeCount = await Package.countDocuments({ categoryGroup: cleanNewCode, isActive: true });

    return res.status(200).json({
      success: true,
      message: `Curriculum Group updated successfully.`,
      group: {
        ...group.toObject(),
        assignedCount: activeCount,
      },
      updatedPackagesCount,
    });
  } catch (error) {
    console.error('Error updating curriculum group:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update curriculum group',
    });
  }
};

// @desc    Delete a curriculum group (Prevented if assigned to existing packages)
// @route   DELETE /api/packages/curriculum-groups/:code
// @access  Staff, Admin
exports.deleteCurriculumGroup = async (req, res) => {
  try {
    const targetCode = decodeURIComponent(req.params.code).trim();

    if (!targetCode) {
      return res.status(400).json({ success: false, message: 'Group code is required.' });
    }

    // REQUIREMENT: Prevent deleting groups already assigned to existing course packages
    const assignedCount = await Package.countDocuments({ categoryGroup: targetCode, isActive: true });
    if (assignedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete Curriculum Group '${targetCode}' because it is assigned to ${assignedCount} active course package(s). Please reassign or update these packages first.`,
        assignedCount,
      });
    }

    const deleted = await CurriculumGroup.findOneAndDelete({ code: targetCode });
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Curriculum group '${targetCode}' not found.` });
    }

    return res.status(200).json({
      success: true,
      message: `Curriculum Group '${targetCode}' deleted successfully.`,
      deletedCode: targetCode,
    });
  } catch (error) {
    console.error('Error deleting curriculum group:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete curriculum group',
    });
  }
};

// =============================================================================
// VEHICLE CATEGORY MANAGEMENT (Admin/Staff)
// =============================================================================

const defaultVehicleCategories = [
  { key: 'Light', name: 'Light Vehicle', isDefault: true, order: 1 },
  { key: 'Heavy', name: 'Heavy Vehicle', isDefault: true, order: 2 },
  { key: 'Bike', name: 'Motorcycle / Bike', isDefault: true, order: 3 },
  { key: 'ThreeWheeler', name: 'Three Wheeler', isDefault: true, order: 4 },
  { key: 'All', name: 'All / Multi-Vehicle (Combo)', isDefault: true, order: 5 },
  { key: 'Other', name: 'Other Category', isDefault: true, order: 6 },
];

// @desc    Get all vehicle categories with assigned package counts
// @route   GET /api/packages/vehicle-categories
// @access  Public
exports.getVehicleCategories = async (req, res) => {
  try {
    let categories = await VehicleCategory.find().sort({ order: 1, key: 1 });

    if (categories.length === 0) {
      categories = await VehicleCategory.insertMany(defaultVehicleCategories);
    }

    // Calculate how many active packages are using each vehicle category
    const activePackages = await Package.find({ isActive: true }).select('vehicleCategory');
    const counts = {};
    for (const p of activePackages) {
      if (p.vehicleCategory) {
        counts[p.vehicleCategory] = (counts[p.vehicleCategory] || 0) + 1;
      }
    }

    const categoriesWithCounts = categories.map((c) => ({
      ...c.toObject(),
      assignedCount: counts[c.key] || 0,
    }));

    return res.status(200).json({
      success: true,
      count: categoriesWithCounts.length,
      categories: categoriesWithCounts,
    });
  } catch (error) {
    console.error('Error fetching vehicle categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle categories',
      error: error.message,
    });
  }
};

// @desc    Create a new vehicle category
// @route   POST /api/packages/vehicle-categories
// @access  Staff, Admin
exports.createVehicleCategory = async (req, res) => {
  try {
    const { key, name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle category name is required.',
      });
    }

    const cleanName = name.trim();
    // Auto-generate key from name if not specified
    let cleanKey = (key && key.trim()) || cleanName.replace(/[^a-zA-Z0-9]/g, '');
    if (!cleanKey) {
      cleanKey = cleanName.replace(/\s+/g, '_');
    }

    const existing = await VehicleCategory.findOne({ key: cleanKey });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Vehicle category with key/code '${cleanKey}' already exists.`,
      });
    }

    const highestOrder = await VehicleCategory.findOne().sort({ order: -1 }).select('order');
    const nextOrder = (highestOrder?.order || 0) + 1;

    const newCategory = await VehicleCategory.create({
      key: cleanKey,
      name: cleanName,
      description: description || '',
      order: nextOrder,
    });

    return res.status(201).json({
      success: true,
      message: `Vehicle Category '${cleanName}' created successfully.`,
      category: {
        ...newCategory.toObject(),
        assignedCount: 0,
      },
    });
  } catch (error) {
    console.error('Error creating vehicle category:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create vehicle category',
    });
  }
};

// @desc    Update / rename a vehicle category
// @route   PUT /api/packages/vehicle-categories/:key
// @access  Staff, Admin
exports.updateVehicleCategory = async (req, res) => {
  try {
    const oldKey = decodeURIComponent(req.params.key).trim();
    const { newKey, name, description } = req.body;

    if (!oldKey) {
      return res.status(400).json({ success: false, message: 'Target vehicle category key is required.' });
    }

    const category = await VehicleCategory.findOne({ key: oldKey });
    if (!category) {
      return res.status(404).json({ success: false, message: `Vehicle category '${oldKey}' not found.` });
    }

    const cleanNewKey = newKey ? newKey.trim() : oldKey;
    const cleanName = name ? name.trim() : category.name;

    // If changing key, check for conflicts
    if (cleanNewKey !== oldKey) {
      const conflict = await VehicleCategory.findOne({ key: cleanNewKey });
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: `Vehicle category key '${cleanNewKey}' is already in use.`,
        });
      }
    }

    category.key = cleanNewKey;
    category.name = cleanName;
    if (description !== undefined) category.description = description;
    await category.save();

    // Cascade update to all packages if key changed
    let updatedPackagesCount = 0;
    if (cleanNewKey !== oldKey) {
      const pkgRes = await Package.updateMany(
        { vehicleCategory: oldKey },
        { $set: { vehicleCategory: cleanNewKey } }
      );
      updatedPackagesCount = pkgRes.modifiedCount;
    }

    const activeCount = await Package.countDocuments({ vehicleCategory: cleanNewKey, isActive: true });

    return res.status(200).json({
      success: true,
      message: `Vehicle Category updated successfully.`,
      category: {
        ...category.toObject(),
        assignedCount: activeCount,
      },
      updatedPackagesCount,
    });
  } catch (error) {
    console.error('Error updating vehicle category:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update vehicle category',
    });
  }
};

// @desc    Delete a vehicle category (Prevented if assigned to existing packages)
// @route   DELETE /api/packages/vehicle-categories/:key
// @access  Staff, Admin
exports.deleteVehicleCategory = async (req, res) => {
  try {
    const targetKey = decodeURIComponent(req.params.key).trim();

    if (!targetKey) {
      return res.status(400).json({ success: false, message: 'Vehicle category key is required.' });
    }

    // REQUIREMENT: Prevent deleting categories already assigned to existing course packages
    const assignedCount = await Package.countDocuments({ vehicleCategory: targetKey, isActive: true });
    if (assignedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete Vehicle Category '${targetKey}' because it is assigned to ${assignedCount} active course package(s). Please reassign or update these packages first.`,
        assignedCount,
      });
    }

    const deleted = await VehicleCategory.findOneAndDelete({ key: targetKey });
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Vehicle category '${targetKey}' not found.` });
    }

    return res.status(200).json({
      success: true,
      message: `Vehicle Category '${targetKey}' deleted successfully.`,
      deletedKey: targetKey,
    });
  } catch (error) {
    console.error('Error deleting vehicle category:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete vehicle category',
    });
  }
};


