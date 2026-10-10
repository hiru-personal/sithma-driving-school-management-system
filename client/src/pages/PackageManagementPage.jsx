import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Car,
  Bike,
  Bus,
  ShieldCheck,
  RefreshCw,
  Gift,
  Sparkles,
  X,
  Tag,
  AlertTriangle,
  Check,
  FolderTree,
  Settings2,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STANDARD_PACKAGE_TYPES = [
  // Group A: Individual / Private (Pay-Per-Lesson)
  { value: 'Car_Individual', label: 'Car (Auto/Manual) — Individual', group: 'A' },
  { value: 'Bike_Individual', label: 'Bike — Individual / Private', group: 'A' },
  { value: 'ThreeWheeler_Individual', label: 'Three Wheel — Individual / Private', group: 'A' },
  { value: 'HeavyVehicle_Individual', label: 'Heavy Vehicle — Individual', group: 'A' },

  // Group B: Standard Single Lessons (Pay-Per-Lesson)
  { value: 'Car_Standard', label: 'Car — Standard Single Lesson', group: 'B' },
  { value: 'Bike_Standard', label: 'Bike — Standard Single Lesson', group: 'B' },
  { value: 'ThreeWheeler_Standard', label: 'Three Wheel — Standard Single Lesson', group: 'B' },
  { value: 'HeavyVehicle_Standard', label: 'Heavy Vehicle — Standard Single Lesson', group: 'B' },

  // Group C: Full Courses / Multi-Lesson
  { value: 'Car_Full', label: 'Car Full Course (15 Lessons)', group: 'C' },
  { value: 'Combo_Full', label: 'Combo Full Package (Car + Bike + Three-Wheel)', group: 'C' },
  { value: 'Car_Refresher', label: 'Car Refresher Course (6 Lessons)', group: 'C' },
  { value: 'HeavyVehicle_Bus', label: 'Heavy Vehicle (Bus) Full Course', group: 'C' },
  { value: 'HeavyVehicle_Full', label: 'Heavy Vehicle Full Course', group: 'C' },
  { value: 'Bike', label: 'Motorcycle Standard Package', group: 'C' },
  { value: 'ThreeWheeler', label: 'Three-Wheeler Package', group: 'C' },
];

const DEFAULT_CURRICULUM_GROUPS = [
  { code: 'A', name: 'Individual / Private', label: 'Group A — Individual / Private', assignedCount: 0 },
  { code: 'B', name: 'Standard Single Lesson', label: 'Group B — Standard Single Lesson', assignedCount: 0 },
  { code: 'C', name: 'Full Course Package', label: 'Group C — Full Course Package', assignedCount: 0 },
  { code: 'Other', name: 'Group D / Other Packages', label: 'Group D / Other Packages', assignedCount: 0 },
];

const DEFAULT_VEHICLE_CATEGORIES = [
  { key: 'Light', name: 'Light Vehicle', isDefault: true, assignedCount: 0 },
  { key: 'Heavy', name: 'Heavy Vehicle', isDefault: true, assignedCount: 0 },
  { key: 'Bike', name: 'Motorcycle / Bike', isDefault: true, assignedCount: 0 },
  { key: 'ThreeWheeler', name: 'Three Wheeler', isDefault: true, assignedCount: 0 },
  { key: 'All', name: 'All / Multi-Vehicle (Combo)', isDefault: true, assignedCount: 0 },
  { key: 'Other', name: 'Other Category', isDefault: true, assignedCount: 0 },
];

export default function PackageManagementPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'comprehensive' | 'individual' | 'other'

  const [isCustomType, setIsCustomType] = useState(false);
  const [customTypeInput, setCustomTypeInput] = useState('');

  // Custom Package Types state
  const [customTypes, setCustomTypes] = useState([]);
  const [customTypeToEdit, setCustomTypeToEdit] = useState(null);
  const [newCustomTypeName, setNewCustomTypeName] = useState('');
  const [isEditingCustomTypeModalOpen, setIsEditingCustomTypeModalOpen] = useState(false);
  const [editingLoading, setEditingLoading] = useState(false);

  const [customTypeToDelete, setCustomTypeToDelete] = useState(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const [isCustomTypesManagerOpen, setIsCustomTypesManagerOpen] = useState(false);
  const [newManagerTypeInput, setNewManagerTypeInput] = useState('');

  // Curriculum Groups state
  const [curriculumGroups, setCurriculumGroups] = useState(DEFAULT_CURRICULUM_GROUPS);
  const [isManageCurriculumGroupsModalOpen, setIsManageCurriculumGroupsModalOpen] = useState(false);

  // Add Curriculum Group form
  const [newGroupCodeInput, setNewGroupCodeInput] = useState('');
  const [newGroupNameInput, setNewGroupNameInput] = useState('');
  const [addingGroupLoading, setAddingGroupLoading] = useState(false);

  // Edit Curriculum Group modal
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [editGroupCodeInput, setEditGroupCodeInput] = useState('');
  const [editGroupNameInput, setEditGroupNameInput] = useState('');
  const [isEditCurriculumGroupModalOpen, setIsEditCurriculumGroupModalOpen] = useState(false);
  const [editingGroupLoading, setEditingGroupLoading] = useState(false);

  // Delete Curriculum Group modal
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [isDeleteCurriculumGroupModalOpen, setIsDeleteCurriculumGroupModalOpen] = useState(false);
  const [deletingGroupLoading, setDeletingGroupLoading] = useState(false);

  // Vehicle Categories state
  const [vehicleCategories, setVehicleCategories] = useState(DEFAULT_VEHICLE_CATEGORIES);
  const [isManageVehicleCategoriesModalOpen, setIsManageVehicleCategoriesModalOpen] = useState(false);

  // Add Vehicle Category form
  const [newCategoryKeyInput, setNewCategoryKeyInput] = useState('');
  const [newCategoryNameInput, setNewCategoryNameInput] = useState('');
  const [addingCategoryLoading, setAddingCategoryLoading] = useState(false);

  // Edit Vehicle Category modal
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [editCategoryKeyInput, setEditCategoryKeyInput] = useState('');
  const [editCategoryNameInput, setEditCategoryNameInput] = useState('');
  const [isEditVehicleCategoryModalOpen, setIsEditVehicleCategoryModalOpen] = useState(false);
  const [editingCategoryLoading, setEditingCategoryLoading] = useState(false);

  // Delete Vehicle Category modal
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleteVehicleCategoryModalOpen, setIsDeleteVehicleCategoryModalOpen] = useState(false);
  const [deletingCategoryLoading, setDeletingCategoryLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Car_Full',
    categoryGroup: 'C',
    vehicleCategory: 'Light',
    lessons: 15,
    price: 45000,
    isPerLesson: false,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: '',
  });

  const existingCustomTypes = Array.from(
    new Set([
      ...customTypes.map((c) => c.name),
      ...packages
        .map((p) => p.type)
        .filter((t) => t && !STANDARD_PACKAGE_TYPES.some((s) => s.value === t)),
    ])
  );

  const fetchCustomTypes = async () => {
    try {
      const res = await api.get('/packages/custom-types');
      if (res.data?.success) {
        setCustomTypes(res.data.customTypes || []);
      }
    } catch (err) {
      console.error('Failed to load custom package types:', err);
    }
  };

  const fetchCurriculumGroups = async () => {
    try {
      const res = await api.get('/packages/curriculum-groups');
      if (res.data?.success && res.data.groups) {
        setCurriculumGroups(res.data.groups);
      }
    } catch (err) {
      console.error('Failed to load curriculum groups:', err);
    }
  };

  const fetchVehicleCategories = async () => {
    try {
      const res = await api.get('/packages/vehicle-categories');
      if (res.data?.success && res.data.categories) {
        setVehicleCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load vehicle categories:', err);
    }
  };

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/packages');
      if (res.data.success) {
        setPackages(res.data.packages);
      }
    } catch (err) {
      toast.error('Failed to load course packages');
    } finally {
      setLoading(false);
    }
    fetchCustomTypes();
    fetchCurriculumGroups();
    fetchVehicleCategories();
  };


  useEffect(() => {
    fetchPackages();
  }, []);

  const openAddModal = () => {
    setEditingPackage(null);
    setIsCustomType(false);
    setCustomTypeInput('');
    setFormData({
      name: '',
      type: 'Car_Individual',
      categoryGroup: 'A',
      vehicleCategory: 'Light',
      lessons: 1,
      price: 3000,
      isPerLesson: true,
      bonusLessons: { bike: 0, threeWheeler: 0 },
      eligibilityCriteria: 'None',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setEditingPackage(pkg);
    const isStandardOrExisting =
      STANDARD_PACKAGE_TYPES.some((s) => s.value === pkg.type) ||
      existingCustomTypes.includes(pkg.type);

    if (isStandardOrExisting) {
      setIsCustomType(false);
      setCustomTypeInput('');
    } else {
      setIsCustomType(true);
      setCustomTypeInput(pkg.type || '');
    }

    setFormData({
      name: pkg.name,
      type: isStandardOrExisting ? pkg.type : '__CUSTOM__',
      categoryGroup: pkg.categoryGroup || (pkg.isPerLesson ? 'A' : 'C'),
      vehicleCategory: pkg.vehicleCategory || 'Light',
      lessons: pkg.lessons,
      price: pkg.price,
      isPerLesson: pkg.isPerLesson || false,
      bonusLessons: pkg.bonusLessons || { bike: 0, threeWheeler: 0 },
      eligibilityCriteria: pkg.eligibilityCriteria || 'None',
      notes: pkg.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleTypeSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__CUSTOM__') {
      setIsCustomType(true);
      setFormData((prev) => ({ ...prev, type: '__CUSTOM__' }));
      if (!customTypeInput) {
        setCustomTypeInput('Other');
      }
    } else {
      setIsCustomType(false);
      setFormData((prev) => ({ ...prev, type: val }));
    }
  };

  // Custom Package Types Edit & Delete Actions
  const openEditCustomTypeModal = (typeStr) => {
    setCustomTypeToEdit(typeStr);
    setNewCustomTypeName(typeStr.replace(/_/g, ' '));
    setIsEditingCustomTypeModalOpen(true);
  };

  const handleUpdateCustomType = async (e) => {
    if (e) e.preventDefault();
    const cleanLabel = newCustomTypeName.trim();
    if (!cleanLabel) {
      toast.error('Please enter a package type name');
      return;
    }
    const cleanNewName = cleanLabel.replace(/\s+/g, '_');
    if (cleanNewName === customTypeToEdit) {
      setIsEditingCustomTypeModalOpen(false);
      return;
    }
    setEditingLoading(true);
    try {
      const res = await api.put(`/packages/custom-types/${encodeURIComponent(customTypeToEdit)}`, {
        newName: cleanNewName,
        label: cleanLabel,
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Package type updated successfully');
        if (formData.type === customTypeToEdit) {
          setFormData((prev) => ({ ...prev, type: cleanNewName }));
        }
        if (customTypeInput === customTypeToEdit) {
          setCustomTypeInput(cleanNewName);
        }
        setIsEditingCustomTypeModalOpen(false);
        setCustomTypeToEdit(null);
        await Promise.all([fetchPackages(), fetchCustomTypes()]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update package type');
    } finally {
      setEditingLoading(false);
    }
  };

  const openDeleteCustomTypeModal = (typeStr) => {
    setCustomTypeToDelete(typeStr);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDeleteCustomType = async () => {
    if (!customTypeToDelete) return;
    setDeletingLoading(true);
    try {
      const res = await api.delete(`/packages/custom-types/${encodeURIComponent(customTypeToDelete)}`);
      if (res.data.success) {
        toast.success(res.data.message || `Custom package type deleted`);
        if (formData.type === customTypeToDelete) {
          setFormData((prev) => ({ ...prev, type: 'Car_Individual' }));
          setIsCustomType(false);
          setCustomTypeInput('');
        }
        setIsDeleteConfirmModalOpen(false);
        setCustomTypeToDelete(null);
        await Promise.all([fetchPackages(), fetchCustomTypes()]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete package type');
    } finally {
      setDeletingLoading(false);
    }
  };

  const handleCreateDirectCustomType = async (typeName) => {
    const cleanLabel = typeName.trim();
    if (!cleanLabel) {
      toast.error('Please enter a package type name');
      return false;
    }
    const cleanName = cleanLabel.replace(/\s+/g, '_');
    try {
      const res = await api.post('/packages/custom-types', {
        name: cleanName,
        label: cleanLabel,
      });
      if (res.data.success) {
        toast.success(`Custom package type '${cleanName}' added`);
        await Promise.all([fetchPackages(), fetchCustomTypes()]);
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add custom package type');
      return false;
    }
  };

  // Curriculum Groups Handlers
  const handleCreateCurriculumGroup = async (e) => {
    if (e) e.preventDefault();
    const code = newGroupCodeInput.trim();
    const name = newGroupNameInput.trim();
    if (!code) {
      toast.error('Please enter a group code (e.g. D, E, VIP)');
      return;
    }
    if (!name) {
      toast.error('Please enter a group name (e.g. Weekend Intensive)');
      return;
    }
    setAddingGroupLoading(true);
    try {
      const res = await api.post('/packages/curriculum-groups', {
        code,
        name,
      });
      if (res.data.success) {
        toast.success(res.data.message || `Curriculum Group '${code}' created!`);
        setNewGroupCodeInput('');
        setNewGroupNameInput('');
        await Promise.all([fetchCurriculumGroups(), fetchPackages()]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create curriculum group');
    } finally {
      setAddingGroupLoading(false);
    }
  };

  const openEditCurriculumGroupModal = (group) => {
    setGroupToEdit(group);
    setEditGroupCodeInput(group.code);
    setEditGroupNameInput(group.name || '');
    setIsEditCurriculumGroupModalOpen(true);
  };

  const handleUpdateCurriculumGroup = async (e) => {
    if (e) e.preventDefault();
    if (!groupToEdit) return;
    const newCode = editGroupCodeInput.trim();
    const newName = editGroupNameInput.trim();
    if (!newCode || !newName) {
      toast.error('Both code and name are required');
      return;
    }
    setEditingGroupLoading(true);
    try {
      const res = await api.put(`/packages/curriculum-groups/${encodeURIComponent(groupToEdit.code)}`, {
        newCode,
        name: newName,
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Curriculum group updated successfully');
        if (formData.categoryGroup === groupToEdit.code) {
          setFormData((prev) => ({ ...prev, categoryGroup: newCode }));
        }
        setIsEditCurriculumGroupModalOpen(false);
        setGroupToEdit(null);
        await Promise.all([fetchCurriculumGroups(), fetchPackages()]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update curriculum group');
    } finally {
      setEditingGroupLoading(false);
    }
  };

  const openDeleteCurriculumGroupModal = (group) => {
    if (group.assignedCount > 0) {
      toast.error(`Cannot delete: Group ${group.code} is assigned to ${group.assignedCount} package(s). Please reassign them first.`);
      return;
    }
    setGroupToDelete(group);
    setIsDeleteCurriculumGroupModalOpen(true);
  };

  const handleConfirmDeleteCurriculumGroup = async () => {
    if (!groupToDelete) return;
    setDeletingGroupLoading(true);
    try {
      const res = await api.delete(`/packages/curriculum-groups/${encodeURIComponent(groupToDelete.code)}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Curriculum group deleted');
        if (formData.categoryGroup === groupToDelete.code) {
          setFormData((prev) => ({ ...prev, categoryGroup: 'A' }));
        }
        setIsDeleteCurriculumGroupModalOpen(false);
        setGroupToDelete(null);
        await Promise.all([fetchCurriculumGroups(), fetchPackages()]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete curriculum group');
    } finally {
      setDeletingGroupLoading(false);
    }
  };

  // Vehicle Category CRUD handlers
  const handleCreateVehicleCategory = async (e) => {
    if (e) e.preventDefault();
    const name = newCategoryNameInput.trim();
    let key = newCategoryKeyInput.trim();
    if (!name) {
      toast.error('Vehicle category name is required');
      return;
    }
    if (!key) {
      key = name.replace(/[^a-zA-Z0-9]/g, '') || name.replace(/\s+/g, '_');
    }

    setAddingCategoryLoading(true);
    try {
      const res = await api.post('/packages/vehicle-categories', {
        key,
        name,
      });
      if (res.data.success) {
        toast.success(res.data.message || `Vehicle Category '${name}' created!`);
        setNewCategoryKeyInput('');
        setNewCategoryNameInput('');
        await Promise.all([fetchVehicleCategories(), fetchPackages()]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create vehicle category');
    } finally {
      setAddingCategoryLoading(false);
    }
  };

  const openEditVehicleCategoryModal = (cat) => {
    setCategoryToEdit(cat);
    setEditCategoryKeyInput(cat.key);
    setEditCategoryNameInput(cat.name || '');
    setIsEditVehicleCategoryModalOpen(true);
  };

  const handleUpdateVehicleCategory = async (e) => {
    if (e) e.preventDefault();
    if (!categoryToEdit) return;
    const newKey = editCategoryKeyInput.trim();
    const newName = editCategoryNameInput.trim();
    if (!newKey || !newName) {
      toast.error('Both code/key and name are required');
      return;
    }
    setEditingCategoryLoading(true);
    try {
      const res = await api.put(`/packages/vehicle-categories/${encodeURIComponent(categoryToEdit.key)}`, {
        newKey,
        name: newName,
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Vehicle category updated successfully');
        if (formData.vehicleCategory === categoryToEdit.key) {
          setFormData((prev) => ({ ...prev, vehicleCategory: newKey }));
        }
        setIsEditVehicleCategoryModalOpen(false);
        setCategoryToEdit(null);
        await Promise.all([fetchVehicleCategories(), fetchPackages()]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update vehicle category');
    } finally {
      setEditingCategoryLoading(false);
    }
  };

  const openDeleteVehicleCategoryModal = (cat) => {
    if (cat.assignedCount > 0) {
      toast.error(`Cannot delete: Category '${cat.name || cat.key}' is assigned to ${cat.assignedCount} package(s). Please reassign them first.`);
      return;
    }
    setCategoryToDelete(cat);
    setIsDeleteVehicleCategoryModalOpen(true);
  };

  const handleConfirmDeleteVehicleCategory = async () => {
    if (!categoryToDelete) return;
    setDeletingCategoryLoading(true);
    try {
      const res = await api.delete(`/packages/vehicle-categories/${encodeURIComponent(categoryToDelete.key)}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Vehicle category deleted');
        if (formData.vehicleCategory === categoryToDelete.key) {
          const remaining = vehicleCategories.filter((c) => c.key !== categoryToDelete.key);
          setFormData((prev) => ({ ...prev, vehicleCategory: remaining[0]?.key || 'Light' }));
        }
        setIsDeleteVehicleCategoryModalOpen(false);
        setCategoryToDelete(null);
        await Promise.all([fetchVehicleCategories(), fetchPackages()]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete vehicle category');
    } finally {
      setDeletingCategoryLoading(false);
    }
  };

  const getVehicleCategoryLabel = (key) => {
    const match = vehicleCategories.find((c) => c.key === key);
    if (match) return match.name;
    return `${key} Vehicle`;
  };

  const filteredPackages = packages.filter((pkg) => {
    if (filterTab === 'comprehensive') return !pkg.isPerLesson && pkg.categoryGroup !== 'Other';
    if (filterTab === 'individual') return pkg.isPerLesson;
    if (filterTab === 'other') return pkg.categoryGroup === 'Other' || pkg.type.toLowerCase().includes('other');
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalType = formData.type;
      if (isCustomType || formData.type === '__CUSTOM__') {
        const cleanCustom = customTypeInput.trim();
        if (!cleanCustom) {
          toast.error('Please enter a custom package type name');
          return;
        }
        finalType = cleanCustom.replace(/\s+/g, '_');
      }

      const payload = {
        ...formData,
        type: finalType,
        categoryGroup: formData.categoryGroup || (formData.isPerLesson ? 'A' : 'C'),
      };

      if (editingPackage) {
        const res = await api.put(`/packages/${editingPackage._id}`, payload);
        if (res.data.success) {
          toast.success('Package updated successfully');
        }
      } else {
        const res = await api.post('/packages', payload);
        if (res.data.success) {
          toast.success('New package created successfully');
        }
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save package');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this package?')) return;
    try {
      const res = await api.delete(`/packages/${id}`);
      if (res.data.success) {
        toast.success('Package removed');
        fetchPackages();
      }
    } catch (err) {
      toast.error('Failed to delete package');
    }
  };


  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full text-[#152026]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#B3D5F1] text-[#1B3D59] font-bold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Curriculum & Pricing
          </div>
          <h1 className="text-2xl font-extrabold text-[#152026] flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#1B3D59]" /> Training Package Management
          </h1>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Configure vehicle training bundles, pricing structures, and custom package categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCustomTypesManagerOpen(true)}
            className="py-2 px-3.5 rounded-xl border border-[#D4EEF8] bg-white text-[#152026] hover:bg-[#FAFCFE] text-xs flex items-center gap-1.5 font-bold shadow-xs transition-colors cursor-pointer"
            title="View and manage custom package types"
          >
            <Tag className="w-3.5 h-3.5 text-[#1B3D59]" /> Custom Types ({existingCustomTypes.length})
          </button>
          <button
            onClick={() => setIsManageCurriculumGroupsModalOpen(true)}
            className="py-2 px-3.5 rounded-xl border border-[#D4EEF8] bg-white text-[#152026] hover:bg-[#FAFCFE] text-xs flex items-center gap-1.5 font-bold shadow-xs transition-colors cursor-pointer"
            title="View and manage curriculum groups"
          >
            <FolderTree className="w-3.5 h-3.5 text-[#1B3D59]" /> Curriculum Groups ({curriculumGroups.length})
          </button>
          <button
            onClick={() => setIsManageVehicleCategoriesModalOpen(true)}
            className="py-2 px-3.5 rounded-xl border border-[#D4EEF8] bg-white text-[#152026] hover:bg-[#FAFCFE] text-xs flex items-center gap-1.5 font-bold shadow-xs transition-colors cursor-pointer"
            title="View and manage vehicle categories"
          >
            <Car className="w-3.5 h-3.5 text-[#1B3D59]" /> Vehicle Categories ({vehicleCategories.length})
          </button>
          <button
            onClick={fetchPackages}
            className="py-2 px-3.5 rounded-xl border border-[#D4EEF8] bg-white text-[#152026] hover:bg-[#FAFCFE] text-xs flex items-center gap-1.5 font-bold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#1B3D59]" /> Refresh
          </button>
          <button
            onClick={openAddModal}
            className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2 px-4 rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Package
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#D4EEF8] pb-3">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterTab === 'all'
              ? 'bg-[#1B3D59] text-white shadow-xs'
              : 'text-slate-700 hover:text-[#152026] bg-white border border-[#D4EEF8] hover:bg-[#D4EEF8]/40'
          }`}
        >
          All Packages ({packages.length})
        </button>
        <button
          onClick={() => setFilterTab('individual')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filterTab === 'individual'
              ? 'bg-[#1B3D59] text-white shadow-xs'
              : 'text-slate-700 hover:text-[#152026] bg-white border border-[#D4EEF8] hover:bg-[#D4EEF8]/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Individual Packages (Hourly) ({packages.filter((p) => p.isPerLesson).length})
        </button>
        <button
          onClick={() => setFilterTab('comprehensive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterTab === 'comprehensive'
              ? 'bg-[#1B3D59] text-white shadow-xs'
              : 'text-slate-700 hover:text-[#152026] bg-white border border-[#D4EEF8] hover:bg-[#D4EEF8]/40'
          }`}
        >
          Full Course Packages ({packages.filter((p) => !p.isPerLesson && p.categoryGroup !== 'Other').length})
        </button>
        {packages.some((p) => p.categoryGroup === 'Other' || p.type?.toLowerCase().includes('other')) && (
          <button
            onClick={() => setFilterTab('other')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'other'
                ? 'bg-[#1B3D59] text-white shadow-xs'
                : 'text-slate-700 hover:text-[#152026] bg-white border border-[#D4EEF8] hover:bg-[#D4EEF8]/40'
            }`}
          >
            Other Packages ({packages.filter((p) => p.categoryGroup === 'Other' || p.type?.toLowerCase().includes('other')).length})
          </button>
        )}
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-600 font-medium flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#1B3D59]" /> Loading packages...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const isCustomTypePkg = existingCustomTypes.includes(pkg.type);
            return (
              <div key={pkg._id} className="card p-5 bg-white border border-[#D4EEF8] rounded-3xl shadow-sm hover:shadow-md hover:border-[#6A97C0] transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]">{getVehicleCategoryLabel(pkg.vehicleCategory)}</span>
                      {pkg.isPerLesson ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40">Hourly / Per Lesson</span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]">Full Course</span>
                      )}
                      {pkg.categoryGroup === 'Other' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">Other Package</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="p-1.5 rounded-lg bg-[#FAFCFE] hover:bg-[#D4EEF8] text-[#1B3D59] border border-[#D4EEF8] transition-colors cursor-pointer"
                        title="Edit package"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg._id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                        title="Delete package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#152026] mb-1">{pkg.name}</h3>
                  <div className="flex items-center justify-between gap-1.5 mb-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-[#1B3D59]" />
                      <span className="text-xs text-[#1B3D59] font-mono font-semibold">{pkg.type?.replace(/_/g, ' ')}</span>
                      {pkg.categoryGroup && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAFCFE] text-slate-700 font-bold border border-[#D4EEF8]">
                          Group {pkg.categoryGroup}
                        </span>
                      )}
                    </div>

                    {/* Custom Type Action Icons */}
                    {isCustomTypePkg && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] font-bold border border-[#B3D5F1]">
                          Custom
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditCustomTypeModal(pkg.type);
                          }}
                          className="p-1 rounded bg-[#FAFCFE] hover:bg-[#D4EEF8] text-[#1B3D59] border border-[#D4EEF8] transition-colors cursor-pointer"
                          title={`Edit / Rename Custom Type: ${pkg.type?.replace(/_/g, ' ')}`}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteCustomTypeModal(pkg.type);
                          }}
                          className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                          title={`Delete Custom Type: ${pkg.type?.replace(/_/g, ' ')}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>


                <div className="text-2xl font-black text-[#152026] mb-3">
                  Rs. {pkg.price?.toLocaleString()}
                  {pkg.isPerLesson && <span className="text-xs font-bold text-slate-600 ml-1">/ hr</span>}
                </div>

                <div className="space-y-1.5 text-xs text-[#152026] border-t border-[#D4EEF8] pt-3">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <strong>{pkg.lessons}</strong> {pkg.isPerLesson ? 'Hour Practical Lesson' : 'Practical On-Road Lessons'}
                  </p>
                  {pkg.bonusLessons?.bike > 0 && (
                    <p className="flex items-center gap-2 text-[#152026] font-medium">
                      <Gift className="w-3.5 h-3.5 text-[#1B3D59]" />
                      +{pkg.bonusLessons.bike} Free Bike Lessons
                    </p>
                  )}
                  {pkg.bonusLessons?.threeWheeler > 0 && (
                    <p className="flex items-center gap-2 text-[#152026] font-medium">
                      <Gift className="w-3.5 h-3.5 text-[#1B3D59]" />
                      +{pkg.bonusLessons.threeWheeler} Free Three-Wheeler Lessons
                    </p>
                  )}
                </div>
              </div>

              {pkg.notes && (
                <div className="p-2.5 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] text-[11px] text-slate-600 font-medium">
                  {pkg.notes}
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {/* Package Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto text-[#152026] animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <h3 className="text-base font-bold text-[#152026] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1B3D59]" />
                {editingPackage ? 'Edit Package' : 'Create New Course Package'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-slate-600 hover:text-[#152026] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#152026] mb-1">Package Name:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Car (Auto/Manual) — Individual Package or Other Special Package"
                  className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl focus:border-[#1B3D59] outline-none"
                />
              </div>

              {/* Package Type Selection */}
              <div>
                <label className="block font-semibold text-[#152026] mb-1">Package Type:</label>
                <select
                  value={isCustomType ? '__CUSTOM__' : formData.type}
                  onChange={handleTypeSelectChange}
                  className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl focus:border-[#1B3D59] outline-none cursor-pointer"
                >
                  <optgroup label="✨ Custom / Other Packages">
                    <option value="__CUSTOM__">➕ Other / New Package Type...</option>
                  </optgroup>

                  <optgroup label="A. Individual / Private (Pay-Per-Lesson)">
                    {STANDARD_PACKAGE_TYPES.filter((s) => s.group === 'A').map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="B. Standard Single Lessons (Pay-Per-Lesson)">
                    {STANDARD_PACKAGE_TYPES.filter((s) => s.group === 'B').map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="C. Full Course Packages">
                    {STANDARD_PACKAGE_TYPES.filter((s) => s.group === 'C').map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>

                  {existingCustomTypes.length > 0 && (
                    <optgroup label="Previously Created Custom Package Types">
                      {existingCustomTypes.map((t) => (
                        <option key={t} value={t}>
                          {t.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Custom Package Type Input (Shown when "Other / New Package Type" selected) */}
              {isCustomType && (
                <div className="p-3 bg-[#D4EEF8]/40 border border-[#B3D5F1] rounded-xl space-y-1.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-[#1B3D59]">
                      New / Custom Package Type Identifier:
                    </label>
                    <span className="text-[10px] text-[#1B3D59] font-mono px-2 py-0.5 bg-[#D4EEF8] rounded font-bold">
                      Custom Type
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={customTypeInput}
                      onChange={(e) => setCustomTypeInput(e.target.value)}
                      placeholder="e.g. Other, VIP_Package, Electric_Car, Combo_Special..."
                      className="flex-1 px-3.5 py-2 border border-[#D4EEF8] bg-white text-[#152026] rounded-lg focus:outline-none focus:border-[#1B3D59] font-medium"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (customTypeInput.trim()) {
                          const success = await handleCreateDirectCustomType(customTypeInput);
                          if (success) {
                            const val = customTypeInput.trim().replace(/\s+/g, '_');
                            setIsCustomType(false);
                            setFormData((prev) => ({ ...prev, type: val }));
                          }
                        }
                      }}
                      className="px-3 py-2 rounded-lg bg-[#1B3D59] hover:bg-[#152026] text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                      title="Save as permanent custom package type"
                    >
                      + Save Type
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Type a new package type name or "Other". It will be saved as this package's type.
                  </p>
                </div>
              )}

              {/* Custom Package Types with Edit & Delete icons */}
              {existingCustomTypes.length > 0 && (
                <div className="p-3 bg-[#FAFCFE] border border-[#D4EEF8] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#1B3D59] flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-[#1B3D59]" />
                      Custom Package Types ({existingCustomTypes.length}):
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Click name to select, or use icons to edit/delete
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {existingCustomTypes.map((t) => {
                      const isSelected = !isCustomType && formData.type === t;
                      return (
                        <div
                          key={t}
                          className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-[#1B3D59] text-white border-[#1B3D59] shadow-xs'
                              : 'bg-white text-[#152026] border-[#D4EEF8] hover:border-[#B3D5F1]'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomType(false);
                              setFormData((prev) => ({ ...prev, type: t }));
                            }}
                            className="cursor-pointer text-left hover:underline"
                            title={`Select ${t.replace(/_/g, ' ')}`}
                          >
                            {t.replace(/_/g, ' ')}
                          </button>
                          <div
                            className={`flex items-center gap-0.5 ml-1 border-l pl-1 ${
                              isSelected ? 'border-white/30' : 'border-[#D4EEF8]'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditCustomTypeModal(t);
                              }}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                isSelected
                                  ? 'hover:bg-white/20 text-white'
                                  : 'hover:bg-[#D4EEF8] text-[#1B3D59]'
                              }`}
                              title={`Edit / Rename ${t.replace(/_/g, ' ')}`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteCustomTypeModal(t);
                              }}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                isSelected
                                  ? 'hover:bg-rose-500 text-rose-200 hover:text-white'
                                  : 'hover:bg-rose-100 text-rose-600'
                              }`}
                              title={`Delete ${t.replace(/_/g, ' ')}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-[#152026]">Curriculum Group:</label>
                    <button
                      type="button"
                      onClick={() => setIsManageCurriculumGroupsModalOpen(true)}
                      className="text-[11px] text-[#1B3D59] hover:text-[#152026] hover:underline font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Manage curriculum group types"
                    >
                      <Settings2 className="w-3 h-3 text-[#1B3D59]" /> Manage Groups
                    </button>
                  </div>
                  <select
                    value={formData.categoryGroup || 'A'}
                    onChange={(e) => {
                      if (e.target.value === '__MANAGE_GROUPS__') {
                        setIsManageCurriculumGroupsModalOpen(true);
                      } else {
                        setFormData({ ...formData, categoryGroup: e.target.value });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl focus:border-[#1B3D59] outline-none cursor-pointer font-medium"
                  >
                    {curriculumGroups.map((g) => (
                      <option key={g.code} value={g.code}>
                        {g.label || (g.code === 'Other' ? 'Group D / Other Packages' : `Group ${g.code} — ${g.name}`)}
                      </option>
                    ))}
                    <option disabled value="">──────────────</option>
                    <option value="__MANAGE_GROUPS__">⚙️ Manage Curriculum Groups...</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-[#152026]">Vehicle Category:</label>
                    <button
                      type="button"
                      onClick={() => setIsManageVehicleCategoriesModalOpen(true)}
                      className="text-[11px] text-[#1B3D59] hover:text-[#152026] hover:underline font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Manage vehicle categories"
                    >
                      <Settings2 className="w-3 h-3 text-[#1B3D59]" /> Manage Categories
                    </button>
                  </div>
                  <select
                    value={formData.vehicleCategory || 'Light'}
                    onChange={(e) => {
                      if (e.target.value === '__MANAGE_VEHICLE_CATEGORIES__') {
                        setIsManageVehicleCategoriesModalOpen(true);
                      } else {
                        setFormData({ ...formData, vehicleCategory: e.target.value });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl focus:border-[#1B3D59] outline-none cursor-pointer font-medium"
                  >
                    {vehicleCategories.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name || c.key}
                      </option>
                    ))}
                    <option disabled value="">──────────────</option>
                    <option value="__MANAGE_VEHICLE_CATEGORIES__">⚙️ Manage Vehicle Categories...</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 p-2.5 bg-[#FAFCFE] border border-[#D4EEF8] rounded-xl cursor-pointer hover:bg-[#D4EEF8]/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isPerLesson}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPerLesson: e.target.checked,
                        categoryGroup: e.target.checked ? 'A' : (formData.categoryGroup === 'A' ? 'C' : formData.categoryGroup),
                      })
                    }
                    className="rounded border-[#D4EEF8] text-[#1B3D59] focus:ring-0"
                  />
                  <span className="text-xs text-[#152026] font-semibold">
                    Individual Hourly Package (One lesson per hour)
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#152026] mb-1">Practical Lessons:</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.lessons}
                    onChange={(e) => setFormData({ ...formData, lessons: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl font-bold focus:border-[#1B3D59] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#152026] mb-1">Price (LKR):</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] font-black rounded-xl focus:border-[#1B3D59] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAFCFE] border border-[#D4EEF8] rounded-xl">
                <div>
                  <label className="block font-semibold text-[#152026] mb-1">Bonus Bike Lessons:</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bonusLessons.bike}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bonusLessons: { ...formData.bonusLessons, bike: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#D4EEF8] bg-white text-[#152026] rounded-lg focus:border-[#1B3D59] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#152026] mb-1">Bonus 3-Wheel Lessons:</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bonusLessons.threeWheeler}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bonusLessons: {
                          ...formData.bonusLessons,
                          threeWheeler: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#D4EEF8] bg-white text-[#152026] rounded-lg focus:border-[#1B3D59] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#152026] mb-1">Description / Notes (Optional):</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Special combo bundle, customized lesson schedule, or specific requirements..."
                  className="w-full px-3.5 py-2 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl resize-none text-xs focus:border-[#1B3D59] outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2 px-5 rounded-xl font-bold cursor-pointer shadow-md transition-all"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Edit / Rename Custom Package Type Modal */}
      {isEditingCustomTypeModalOpen && customTypeToEdit && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in text-[#152026]">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D4EEF8] border border-[#B3D5F1] flex items-center justify-center text-[#1B3D59]">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#152026]">Edit Custom Package Type</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Rename custom identifier</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditingCustomTypeModalOpen(false);
                  setCustomTypeToEdit(null);
                }}
                className="w-7 h-7 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomType} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#152026]">
                  Current Package Type:
                </label>
                <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono text-xs">
                  {customTypeToEdit} ({customTypeToEdit.replace(/_/g, ' ')})
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#152026]">
                  New Package Type Name:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCustomTypeName}
                  onChange={(e) => setNewCustomTypeName(e.target.value)}
                  placeholder="e.g. VIP Highway Express, Special Auto Training"
                  className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl focus:border-[#1B3D59] outline-none font-medium"
                />
                <p className="text-[11px] text-slate-500">
                  All course packages and dropdowns using this custom type will automatically update.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  disabled={editingLoading}
                  onClick={() => {
                    setIsEditingCustomTypeModalOpen(false);
                    setCustomTypeToEdit(null);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editingLoading}
                  className="py-2.5 px-5 rounded-xl bg-[#1B3D59] hover:bg-[#152026] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {editingLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Delete Confirmation Popup Modal */}
      {isDeleteConfirmModalOpen && customTypeToDelete && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in text-[#152026]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#152026]">Delete Custom Package Type</h3>
                <p className="text-xs text-slate-500 font-medium">Confirmation required</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2 text-xs">
              <p className="text-[#152026] leading-relaxed">
                Are you sure you want to permanently delete custom package type{' '}
                <strong className="text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-mono">
                  {customTypeToDelete.replace(/_/g, ' ')}
                </strong>
                ?
              </p>
              <p className="text-slate-600 text-[11px]">
                ⚠️ This will remove this type from all dropdowns and deactivate any course packages configured with this custom type.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deletingLoading}
                onClick={() => {
                  setIsDeleteConfirmModalOpen(false);
                  setCustomTypeToDelete(null);
                }}
                className="py-2.5 px-4 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingLoading}
                onClick={handleConfirmDeleteCustomType}
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deletingLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Yes, Delete Package Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Manage Custom Package Types Modal */}
      {isCustomTypesManagerOpen && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 my-auto text-[#152026] animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#1B3D59]" />
                <h3 className="text-base font-bold text-[#152026]">Manage Custom Package Types</h3>
              </div>
              <button
                onClick={() => setIsCustomTypesManagerOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Custom Type Inline */}
            <div className="p-3.5 bg-[#D4EEF8]/40 border border-[#B3D5F1] rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-[#1B3D59]">
                + Add New Custom Package Type:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newManagerTypeInput}
                  onChange={(e) => setNewManagerTypeInput(e.target.value)}
                  placeholder="e.g. VIP Express, Electric Car Special..."
                  className="flex-1 px-3 py-2 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl text-xs focus:border-[#1B3D59] outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newManagerTypeInput.trim()) {
                        handleCreateDirectCustomType(newManagerTypeInput);
                        setNewManagerTypeInput('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newManagerTypeInput.trim()) {
                      handleCreateDirectCustomType(newManagerTypeInput);
                      setNewManagerTypeInput('');
                    }
                  }}
                  className="px-3.5 py-2 bg-[#1B3D59] hover:bg-[#152026] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Add Type
                </button>
              </div>
            </div>

            {/* List of custom package types */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#152026]">
                  Custom Package Types ({existingCustomTypes.length}):
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Only custom types can be edited or deleted
                </span>
              </div>

              {existingCustomTypes.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-[#D4EEF8] rounded-2xl">
                  No custom package types created yet. You can add one above!
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {existingCustomTypes.map((t) => {
                    const activeCount = packages.filter((p) => p.type === t).length;
                    return (
                      <div
                        key={t}
                        className="flex items-center justify-between p-2.5 bg-[#FAFCFE] border border-[#D4EEF8] rounded-xl hover:border-[#B3D5F1] transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Tag className="w-3.5 h-3.5 text-[#1B3D59] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#152026] truncate">
                              {t.replace(/_/g, ' ')}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">
                              {t} • {activeCount} {activeCount === 1 ? 'package' : 'packages'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => openEditCustomTypeModal(t)}
                            className="p-1.5 rounded-lg bg-white hover:bg-[#D4EEF8] text-[#1B3D59] border border-[#D4EEF8] transition-colors cursor-pointer"
                            title="Edit / Rename"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteCustomTypeModal(t)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#D4EEF8]">
              <button
                type="button"
                onClick={() => setIsCustomTypesManagerOpen(false)}
                className="py-2 px-4 rounded-xl bg-[#1B3D59] text-white text-xs font-bold cursor-pointer hover:bg-[#152026] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Manage Curriculum Groups Modal */}
      {isManageCurriculumGroupsModalOpen && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-[70] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 my-auto text-[#152026] animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#1B3D59]" />
                <div>
                  <h3 className="text-base font-bold text-[#152026]">Manage Curriculum Groups</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Add, rename, or delete training curriculum group categories</p>
                </div>
              </div>
              <button
                onClick={() => setIsManageCurriculumGroupsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Curriculum Group Section */}
            <form onSubmit={handleCreateCurriculumGroup} className="p-3.5 bg-[#D4EEF8]/40 border border-[#B3D5F1] rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#1B3D59] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add New Curriculum Group:
                </label>
                <span className="text-[10px] text-slate-600 font-medium">e.g. Group D, Group E, VIP</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <input
                    type="text"
                    required
                    value={newGroupCodeInput}
                    onChange={(e) => setNewGroupCodeInput(e.target.value)}
                    placeholder="Code (e.g. D, E, VIP)"
                    className="w-full px-3 py-2 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl text-xs font-semibold focus:border-[#1B3D59] outline-none"
                  />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <input
                    type="text"
                    required
                    value={newGroupNameInput}
                    onChange={(e) => setNewGroupNameInput(e.target.value)}
                    placeholder="Name (e.g. Weekend Intensive / Special)"
                    className="flex-1 px-3 py-2 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl text-xs focus:border-[#1B3D59] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={addingGroupLoading}
                    className="px-3.5 py-2 bg-[#1B3D59] hover:bg-[#152026] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1"
                  >
                    {addingGroupLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    Add Group
                  </button>
                </div>
              </div>
            </form>

            {/* List of Curriculum Groups */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#152026]">
                  Active Curriculum Groups ({curriculumGroups.length}):
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Assigned groups are protected from deletion
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {curriculumGroups.map((g) => {
                  const isAssigned = g.assignedCount > 0;
                  return (
                    <div
                      key={g.code}
                      className="flex items-center justify-between p-3 bg-[#FAFCFE] border border-[#D4EEF8] rounded-2xl hover:border-[#B3D5F1] transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#1B3D59] text-white font-mono shrink-0">
                          {g.code}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#152026] truncate">
                            {g.label || (g.code === 'Other' ? 'Group D / Other Packages' : `Group ${g.code} — ${g.name}`)}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            {isAssigned ? (
                              <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                {g.assignedCount} package{g.assignedCount === 1 ? '' : 's'} assigned
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                0 packages assigned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => openEditCurriculumGroupModal(g)}
                          className="p-2 rounded-xl bg-white hover:bg-[#D4EEF8] text-[#1B3D59] border border-[#D4EEF8] transition-colors cursor-pointer"
                          title={`Edit / Rename Group ${g.code}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteCurriculumGroupModal(g)}
                          disabled={isAssigned}
                          className={`p-2 rounded-xl border transition-colors ${
                            isAssigned
                              ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200 cursor-pointer'
                          }`}
                          title={
                            isAssigned
                              ? `Cannot delete: currently assigned to ${g.assignedCount} package(s)`
                              : `Delete Group ${g.code}`
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#D4EEF8]">
              <button
                type="button"
                onClick={() => setIsManageCurriculumGroupsModalOpen(false)}
                className="py-2 px-5 rounded-xl bg-[#1B3D59] text-white text-xs font-bold cursor-pointer hover:bg-[#152026] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Edit Curriculum Group Modal */}
      {isEditCurriculumGroupModalOpen && groupToEdit && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in text-[#152026]">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D4EEF8] border border-[#B3D5F1] flex items-center justify-center text-[#1B3D59]">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#152026]">Edit Curriculum Group</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Rename group identifier or title</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditCurriculumGroupModalOpen(false);
                  setGroupToEdit(null);
                }}
                className="w-7 h-7 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCurriculumGroup} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#152026] mb-1">
                  Group Code / Key:
                </label>
                <input
                  type="text"
                  required
                  value={editGroupCodeInput}
                  onChange={(e) => setEditGroupCodeInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl focus:border-[#1B3D59] outline-none font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#152026] mb-1">
                  Group Name / Title:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editGroupNameInput}
                  onChange={(e) => setEditGroupNameInput(e.target.value)}
                  placeholder="e.g. Individual / Private Lessons"
                  className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl focus:border-[#1B3D59] outline-none font-medium"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                ℹ️ Changing the code will automatically update all existing packages currently assigned to this curriculum group in the database.
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  disabled={editingGroupLoading}
                  onClick={() => {
                    setIsEditCurriculumGroupModalOpen(false);
                    setGroupToEdit(null);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editingGroupLoading}
                  className="py-2.5 px-5 rounded-xl bg-[#1B3D59] hover:bg-[#152026] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {editingGroupLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Curriculum Group Confirmation Popup */}
      {isDeleteCurriculumGroupModalOpen && groupToDelete && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in text-[#152026]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#152026]">Delete Curriculum Group</h3>
                <p className="text-xs text-slate-500 font-medium">Confirmation required</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2 text-xs">
              <p className="text-[#152026] leading-relaxed">
                Are you sure you want to permanently delete curriculum group{' '}
                <strong className="text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-mono">
                  {groupToDelete.label || `Group ${groupToDelete.code} — ${groupToDelete.name}`}
                </strong>
                ?
              </p>
              <p className="text-slate-600 text-[11px]">
                This will remove this group from the curriculum group dropdown.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deletingGroupLoading}
                onClick={() => {
                  setIsDeleteCurriculumGroupModalOpen(false);
                  setGroupToDelete(null);
                }}
                className="py-2.5 px-4 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingGroupLoading}
                onClick={handleConfirmDeleteCurriculumGroup}
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deletingGroupLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Yes, Delete Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Manage Vehicle Categories Modal */}
      {isManageVehicleCategoriesModalOpen && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in text-[#152026]">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D4EEF8] border border-[#B3D5F1] flex items-center justify-center text-[#1B3D59]">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#152026]">Manage Vehicle Categories</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Add, rename, or delete vehicle category types</p>
                </div>
              </div>
              <button
                onClick={() => setIsManageVehicleCategoriesModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Vehicle Category Form */}
            <form onSubmit={handleCreateVehicleCategory} className="p-3.5 bg-[#FAFCFE] border border-[#D4EEF8] rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#152026] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#1B3D59]" /> Add New Vehicle Category
                </span>
                <span className="text-[10px] text-slate-500">Persists in database</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Category Name: *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCategoryNameInput}
                    onChange={(e) => setNewCategoryNameInput(e.target.value)}
                    placeholder="e.g. Electric Vehicle / EV"
                    className="w-full px-3 py-2 text-xs border border-[#D4EEF8] bg-white rounded-xl focus:border-[#1B3D59] outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Code / Key: (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCategoryKeyInput}
                    onChange={(e) => setNewCategoryKeyInput(e.target.value)}
                    placeholder="e.g. EV"
                    className="w-full px-3 py-2 text-xs border border-[#D4EEF8] bg-white rounded-xl focus:border-[#1B3D59] outline-none font-medium font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={addingCategoryLoading}
                className="w-full py-2 px-3 rounded-xl bg-[#1B3D59] hover:bg-[#152026] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {addingCategoryLoading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                Add Vehicle Category
              </button>
            </form>

            {/* List of existing vehicle categories */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Existing Categories ({vehicleCategories.length})</span>
                <span className="text-[10px] text-slate-500 font-normal">Active package usage</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {vehicleCategories.map((c) => {
                  const isAssigned = c.assignedCount > 0;
                  return (
                    <div
                      key={c.key}
                      className="flex items-center justify-between p-3 bg-[#FAFCFE] border border-[#D4EEF8] rounded-2xl hover:border-[#B3D5F1] transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#1B3D59] text-white font-mono shrink-0">
                          {c.key}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#152026] truncate">
                            {c.name || c.key}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            {isAssigned ? (
                              <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                {c.assignedCount} package{c.assignedCount === 1 ? '' : 's'} assigned
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                0 packages assigned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => openEditVehicleCategoryModal(c)}
                          className="p-2 rounded-xl bg-white hover:bg-[#D4EEF8] text-[#1B3D59] border border-[#D4EEF8] transition-colors cursor-pointer"
                          title={`Edit / Rename Category: ${c.name || c.key}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteVehicleCategoryModal(c)}
                          disabled={isAssigned}
                          className={`p-2 rounded-xl border transition-colors ${
                            isAssigned
                              ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200 cursor-pointer'
                          }`}
                          title={
                            isAssigned
                              ? `Cannot delete: currently assigned to ${c.assignedCount} package(s)`
                              : `Delete Category: ${c.name || c.key}`
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#D4EEF8]">
              <button
                type="button"
                onClick={() => setIsManageVehicleCategoriesModalOpen(false)}
                className="py-2 px-5 rounded-xl bg-[#1B3D59] text-white text-xs font-bold cursor-pointer hover:bg-[#152026] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Edit Vehicle Category Modal */}
      {isEditVehicleCategoryModalOpen && categoryToEdit && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in text-[#152026]">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D4EEF8] border border-[#B3D5F1] flex items-center justify-center text-[#1B3D59]">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#152026]">Edit Vehicle Category</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Rename category code or display name</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditVehicleCategoryModalOpen(false);
                  setCategoryToEdit(null);
                }}
                className="w-7 h-7 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateVehicleCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#152026] mb-1">
                  Category Code / Key:
                </label>
                <input
                  type="text"
                  required
                  value={editCategoryKeyInput}
                  onChange={(e) => setEditCategoryKeyInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl focus:border-[#1B3D59] outline-none font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#152026] mb-1">
                  Category Name / Label:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editCategoryNameInput}
                  onChange={(e) => setEditCategoryNameInput(e.target.value)}
                  placeholder="e.g. Motorcycle / Bike"
                  className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl focus:border-[#1B3D59] outline-none font-medium"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                ℹ️ Changing the code will automatically update all existing packages currently assigned to this vehicle category in the database.
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  disabled={editingCategoryLoading}
                  onClick={() => {
                    setIsEditVehicleCategoryModalOpen(false);
                    setCategoryToEdit(null);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editingCategoryLoading}
                  className="py-2.5 px-5 rounded-xl bg-[#1B3D59] hover:bg-[#152026] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {editingCategoryLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Delete Vehicle Category Confirmation Popup */}
      {isDeleteVehicleCategoryModalOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in text-[#152026]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#152026]">Delete Vehicle Category</h3>
                <p className="text-xs text-slate-500 font-medium">Confirmation required</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2 text-xs">
              <p className="text-[#152026] leading-relaxed">
                Are you sure you want to permanently delete vehicle category{' '}
                <strong className="text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-mono">
                  {categoryToDelete.name || categoryToDelete.key}
                </strong>
                ?
              </p>
              <p className="text-slate-600 text-[11px]">
                This will remove this category from the vehicle category dropdown.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deletingCategoryLoading}
                onClick={() => {
                  setIsDeleteVehicleCategoryModalOpen(false);
                  setCategoryToDelete(null);
                }}
                className="py-2.5 px-4 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingCategoryLoading}
                onClick={handleConfirmDeleteVehicleCategory}
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deletingCategoryLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Yes, Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


