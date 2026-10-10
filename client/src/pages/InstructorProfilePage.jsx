import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  User,
  BookOpen,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  X,
  Car,
  Bike,
  Bus,
  Layers,
  ChevronRight,
  Clock,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const DEFAULT_FALLBACK_PRESETS = [
  {
    title: 'Morning Highway Driving & Overtaking',
    description: 'Speed regulation, lane discipline, dual-carriageway entry/exit, overtaking maneuvers',
    vehicleCategory: 'Light',
    vehicleType: 'Car',
    isDefault: true,
  },
  {
    title: 'Parallel Parking, Hill Start & Reverse 90°',
    description: 'Precision maneuvering, clutch bite control on steep incline, reverse bay alignment',
    vehicleCategory: 'Light',
    vehicleType: 'Car',
    isDefault: true,
  },
  {
    title: 'City Traffic, Roundabouts & Complex Junctions',
    description: 'Traffic light signals, multi-lane roundabouts, pedestrian crossings, mirror-signal-maneuver',
    vehicleCategory: 'Light',
    vehicleType: 'Car',
    isDefault: true,
  },
  {
    title: 'Motorcycle Slalom & Balance Mastery',
    description: 'Emergency braking, cone slalom weaving, figure-8 balance, tight slow-speed turns',
    vehicleCategory: 'Light',
    vehicleType: 'Bike',
    isDefault: true,
  },
  {
    title: 'Three-Wheeler Practical Control & Navigation',
    description: 'Incline throttle coordination, tight turning radius maneuvers, urban obstacle handling',
    vehicleCategory: 'Light',
    vehicleType: 'ThreeWheeler',
    isDefault: true,
  },
  {
    title: 'Heavy Transport Bus Road Operation',
    description: 'Air brake operation, wide turning geometry, rear mirror navigation, blind-spot checks',
    vehicleCategory: 'Heavy',
    vehicleType: 'HeavyVehicle_Bus',
    isDefault: true,
  },
];

export default function InstructorProfilePage() {
  const { user, updateUser } = useAuth();

  // Presets state
  const [presets, setPresets] = useState(DEFAULT_FALLBACK_PRESETS);
  const [loadingPresets, setLoadingPresets] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('All');

  // Modal: Add / Edit Preset
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [submittingPreset, setSubmittingPreset] = useState(false);
  const [presetForm, setPresetForm] = useState({
    title: '',
    description: '',
    vehicleType: 'Car',
    vehicleCategory: 'Light',
  });

  // Modal: Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState(null);
  const [deletingPreset, setDeletingPreset] = useState(false);

  // Profile Phone Editing
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [savingPhone, setSavingPhone] = useState(false);

  // Stats
  const [scheduleCount, setScheduleCount] = useState(0);

  // Fetch presets from API
  const fetchPresets = async () => {
    setLoadingPresets(true);
    try {
      const res = await api.get('/curriculum-presets');
      if (res.data?.success && Array.isArray(res.data.presets)) {
        setPresets(res.data.presets);
      }
    } catch (err) {
      console.error('Failed to load presets:', err);
      toast.error('Failed to load curriculum presets from server');
    } finally {
      setLoadingPresets(false);
    }
  };

  // Fetch instructor schedule count
  const fetchScheduleCount = async () => {
    if (!user?._id) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get(`/slots/instructor/${user._id}`, {
        params: { date: today, branch: user.branch || 'Maharagama' },
      });
      if (res.data?.success && Array.isArray(res.data.schedule)) {
        setScheduleCount(res.data.schedule.length);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchPresets();
    fetchScheduleCount();
  }, [user]);

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    setEditingPreset(null);
    setPresetForm({
      title: '',
      description: '',
      vehicleType: 'Car',
      vehicleCategory: 'Light',
    });
    setIsModalOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEditModal = (preset) => {
    setEditingPreset(preset);
    setPresetForm({
      title: preset.title || '',
      description: preset.description || preset.topic || '',
      vehicleType: preset.vehicleType || preset.type || 'Car',
      vehicleCategory: preset.vehicleCategory || preset.category || 'Light',
    });
    setIsModalOpen(true);
  };

  // Handle Save Preset (Create or Update)
  const handleSavePreset = async (e) => {
    e.preventDefault();
    if (!presetForm.title.trim()) {
      toast.error('Please enter a lesson name');
      return;
    }
    if (!presetForm.description.trim()) {
      toast.error('Please enter a lesson description');
      return;
    }

    setSubmittingPreset(true);
    try {
      const payload = {
        title: presetForm.title.trim(),
        description: presetForm.description.trim(),
        vehicleType: presetForm.vehicleType,
        vehicleCategory: presetForm.vehicleType === 'HeavyVehicle_Bus' ? 'Heavy' : 'Light',
      };

      if (editingPreset && editingPreset._id) {
        // Update
        const res = await api.put(`/curriculum-presets/${editingPreset._id}`, payload);
        if (res.data?.success) {
          toast.success('🎉 Lesson updated successfully! Preset dropdown updated.');
          setIsModalOpen(false);
          await fetchPresets();
        }
      } else {
        // Create
        const res = await api.post('/curriculum-presets', payload);
        if (res.data?.success) {
          toast.success('🎉 New lesson added! It is now available in the curriculum preset dropdown.');
          setIsModalOpen(false);
          await fetchPresets();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lesson preset');
    } finally {
      setSubmittingPreset(false);
    }
  };

  // Handle Open Delete Modal
  const handleOpenDeleteModal = (preset) => {
    if (preset.isDefault) {
      toast.error('Standard syllabus presets are permanent and cannot be deleted.');
      return;
    }
    setPresetToDelete(preset);
    setDeleteModalOpen(true);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!presetToDelete || !presetToDelete._id) return;
    setDeletingPreset(true);
    try {
      const res = await api.delete(`/curriculum-presets/${presetToDelete._id}`);
      if (res.data?.success) {
        toast.success('Lesson preset deleted successfully.');
        setDeleteModalOpen(false);
        setPresetToDelete(null);
        await fetchPresets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete lesson preset');
    } finally {
      setDeletingPreset(false);
    }
  };

  // Handle Save Phone
  const handleSavePhone = async (e) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    setSavingPhone(true);
    try {
      const res = await api.patch('/auth/profile', { phone: phoneInput.trim() });
      if (res.data?.success) {
        toast.success('Contact telephone updated successfully');
        if (updateUser) {
          updateUser(res.data.user);
        }
        setIsEditingPhone(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update phone number');
    } finally {
      setSavingPhone(false);
    }
  };

  // Filtered presets
  const filteredPresets = presets.filter((p) => {
    const titleMatch = (p.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (p.description || p.topic || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || descMatch;

    if (selectedVehicleFilter === 'All') return matchesSearch;
    const pType = p.vehicleType || p.type || 'Car';
    if (selectedVehicleFilter === 'Car') return matchesSearch && pType === 'Car';
    if (selectedVehicleFilter === 'Bike') return matchesSearch && pType === 'Bike';
    if (selectedVehicleFilter === 'ThreeWheeler') return matchesSearch && pType === 'ThreeWheeler';
    if (selectedVehicleFilter === 'Heavy') return matchesSearch && pType === 'HeavyVehicle_Bus';
    return matchesSearch;
  });

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'Bike':
        return <Bike className="w-4 h-4 text-[#1B3D59]" />;
      case 'ThreeWheeler':
        return <Car className="w-4 h-4 text-[#1B3D59]" />;
      case 'HeavyVehicle_Bus':
        return <Bus className="w-4 h-4 text-[#1B3D59]" />;
      case 'Car':
      default:
        return <Car className="w-4 h-4 text-[#1B3D59]" />;
    }
  };

  const formatVehicleLabel = (type) => {
    switch (type) {
      case 'Bike':
        return 'Motorcycle (Bike)';
      case 'ThreeWheeler':
        return 'Three-Wheeler';
      case 'HeavyVehicle_Bus':
        return 'Heavy Vehicle (Bus)';
      case 'Car':
      default:
        return 'Car (Manual / Auto)';
    }
  };

  const customPresetsCount = presets.filter((p) => !p.isDefault).length;

  return (
    <div className="py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full text-[#152026] box-border min-w-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#B3D5F1] text-[#1B3D59] font-bold text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1B3D59]" /> Certified Instructor Profile & Academy Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#152026] flex items-center gap-2.5">
            <User className="w-7 h-7 text-[#1B3D59]" /> Instructor Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#6A97C0]">
            Manage your instructor credentials, contact details, and custom quick curriculum presets for lesson scheduling.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            onClick={() => {
              fetchPresets();
              fetchScheduleCount();
            }}
            className="py-2.5 px-3.5 rounded-xl border border-[#D4EEF8] bg-white text-[#152026] hover:bg-[#FAFCFE] text-xs flex items-center gap-1.5 font-bold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#1B3D59] ${loadingPresets ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <Link
            to="/instructor/schedule"
            className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2.5 px-4 font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Calendar className="w-4 h-4" /> Daily Schedule & Roster
          </Link>
        </div>
      </div>

      {/* Instructor Details Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D4EEF8] p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-[#D4EEF8]">
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#1B3D59] shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1B3D59] to-[#152026] text-white font-black text-2xl flex items-center justify-center shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'I'}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs" title="Active" />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-black text-[#152026] break-words">{user?.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#1B3D59] text-white text-[10px] font-black uppercase tracking-wider shrink-0">
                  Licensed Instructor
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] text-[10px] font-bold shrink-0">
                  {user?.branch || 'Maharagama'} Branch
                </span>
              </div>
              <p className="text-xs text-[#6A97C0] font-medium leading-relaxed">
                Certified Driving Academy Specialist • Qualified Teaching Categories:{' '}
                <strong className="text-[#152026]">{user?.teachingCategories || 'Light & Heavy'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2.5 px-4 font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap self-start lg:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Curriculum Preset
          </button>
        </div>

        {/* Info Grid: 1 col on mobile, 2 on tablet, 4 on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 text-xs">
          <div className="p-3.5 rounded-xl sm:rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] min-w-0">
            <span className="text-[#6A97C0] font-bold block text-[10px] uppercase flex items-center gap-1 mb-1">
              <Mail className="w-3.5 h-3.5 text-[#1B3D59]" /> Email Address
            </span>
            <p className="font-extrabold text-[#152026] truncate" title={user?.email}>{user?.email || 'N/A'}</p>
          </div>

          <div className="p-3.5 rounded-xl sm:rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#6A97C0] font-bold block text-[10px] uppercase flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#1B3D59]" /> Contact Phone
              </span>
              {!isEditingPhone && (
                <button
                  onClick={() => {
                    setPhoneInput(user?.phone || '');
                    setIsEditingPhone(true);
                  }}
                  className="text-[10px] text-[#1B3D59] font-bold hover:underline cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingPhone ? (
              <form onSubmit={handleSavePhone} className="flex items-center gap-1.5 mt-1">
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded-lg border border-[#D4EEF8] bg-white text-[#152026] outline-none font-bold"
                  placeholder="07X-XXXXXXX"
                />
                <button
                  type="submit"
                  disabled={savingPhone}
                  className="p-1 rounded-lg bg-[#1B3D59] text-white hover:bg-[#152026] cursor-pointer"
                  title="Save"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(false)}
                  className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <p className="font-extrabold text-[#152026]">{user?.phone || 'Not provided'}</p>
            )}
          </div>

          <div className="p-3.5 rounded-xl sm:rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] min-w-0">
            <span className="text-[#6A97C0] font-bold block text-[10px] uppercase flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#1B3D59]" /> Base Branch
            </span>
            <p className="font-extrabold text-[#152026] truncate">{user?.branch || 'Maharagama'} Training Center</p>
          </div>

          <div className="p-3.5 rounded-xl sm:rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] min-w-0">
            <span className="text-[#6A97C0] font-bold block text-[10px] uppercase flex items-center gap-1 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-[#1B3D59]" /> Curriculum Presets
            </span>
            <p className="font-extrabold text-[#152026] truncate">
              {presets.length} Total Lessons ({customPresetsCount} Custom)
            </p>
          </div>
        </div>
      </div>

      {/* QUICK CURRICULUM PRESET MANAGEMENT SECTION */}
      <div id="curriculum-presets" className="bg-white rounded-2xl sm:rounded-3xl border border-[#D4EEF8] p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D4EEF8]">
          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EED8] border border-[#E2D9B8] text-[#152026] font-bold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-[#8C6D1F]" /> Interactive Lesson Syllabus
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#152026] flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#1B3D59]" /> Quick Curriculum Preset Management
            </h2>
            <p className="text-xs text-[#6A97C0] max-w-2xl leading-relaxed">
              Add, edit, and delete practical lesson syllabus topics. Any changes made here are saved directly in the
              database and immediately update the <strong>Quick Curriculum Preset</strong> dropdown when scheduling lessons.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2.5 px-4 font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" /> Add New Lesson Preset
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Vehicle Type Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['All', 'Car', 'Bike', 'ThreeWheeler', 'Heavy'].map((filter) => {
              const label =
                filter === 'All'
                  ? 'All Vehicles'
                  : filter === 'Car'
                  ? 'Cars'
                  : filter === 'Bike'
                  ? 'Motorcycles'
                  : filter === 'ThreeWheeler'
                  ? 'Three-Wheelers'
                  : 'Heavy Transport';

              return (
                <button
                  key={filter}
                  onClick={() => setSelectedVehicleFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                    selectedVehicleFilter === filter
                      ? 'bg-[#1B3D59] text-white shadow-xs'
                      : 'bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] hover:bg-[#D4EEF8]/40'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-3.5 h-3.5 text-[#6A97C0] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by lesson name or description..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] text-xs text-[#152026] placeholder-[#6A97C0] outline-none focus:border-[#1B3D59] transition-colors"
            />
          </div>
        </div>

        {/* Presets List / Responsive Grid: 1 col on mobile, 2 cols on tablet & laptop, 3 cols on xl desktop */}
        {loadingPresets ? (
          <div className="py-12 text-center text-xs text-[#6A97C0] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#1B3D59]" /> Loading curriculum presets...
          </div>
        ) : filteredPresets.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#D4EEF8] rounded-2xl bg-[#FAFCFE] space-y-3">
            <BookOpen className="w-10 h-10 text-[#6A97C0] mx-auto opacity-70" />
            <p className="text-sm font-bold text-[#152026]">No curriculum presets matched your filter</p>
            <p className="text-xs text-[#6A97C0]">Try adjusting your search terms or create a new lesson preset.</p>
            <button
              onClick={handleOpenAddModal}
              className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2 px-4 font-bold rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Lesson Preset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5 sm:gap-5 min-w-0">
            {filteredPresets.map((preset, index) => {
              const vType = preset.vehicleType || preset.type || 'Car';
              const isDefault = Boolean(preset.isDefault);

              return (
                <div
                  key={preset._id || index}
                  className="rounded-2xl border border-[#D4EEF8] hover:border-[#1B3D59] p-5 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4 min-w-0 w-full"
                >
                  <div className="space-y-3 min-w-0">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4EEF8] text-[#1B3D59] text-[10px] font-bold border border-[#B3D5F1] shrink-0">
                        {getVehicleIcon(vType)}
                        <span>{formatVehicleLabel(vType)}</span>
                      </span>

                      {isDefault ? (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#F3EED8] text-[#152026] border border-[#E2D9B8] text-[10px] font-bold shrink-0">
                          Standard Syllabus
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold shrink-0">
                          Custom Preset
                        </span>
                      )}
                    </div>

                    {/* Lesson Name */}
                    <h3 className="font-extrabold text-[#152026] text-sm sm:text-base leading-snug group-hover:text-[#1B3D59] transition-colors break-words">
                      {preset.title}
                    </h3>

                    {/* Lesson Description */}
                    <p className="text-xs text-[#6A97C0] leading-relaxed break-words">
                      {preset.description || preset.topic || 'No description provided.'}
                    </p>
                  </div>

                  {/* Card Actions Footer - mt-auto guarantees bottom alignment across different text lengths */}
                  <div className="pt-3 border-t border-[#D4EEF8]/60 flex items-center justify-between gap-2 text-xs mt-auto">
                    <span className="text-[10px] text-[#6A97C0] font-medium truncate shrink-0 max-w-[140px] sm:max-w-[170px]">
                      {isDefault ? 'National Syllabus' : preset.createdByName ? `By ${preset.createdByName}` : 'Instructor Preset'}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(preset)}
                        className="p-1.5 rounded-lg border border-[#D4EEF8] bg-[#FAFCFE] hover:bg-[#D4EEF8]/50 text-[#1B3D59] transition-colors cursor-pointer"
                        title="Edit Lesson"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {!isDefault ? (
                        <button
                          onClick={() => handleOpenDeleteModal(preset)}
                          className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          title="Delete Lesson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span
                          className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60"
                          title="Standard syllabus preset is protected"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT LESSON PRESET */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-fade-in text-[#152026] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D4EEF8] flex items-center justify-center text-[#1B3D59]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#152026]">
                    {editingPreset ? 'Edit Curriculum Lesson Preset' : 'Add New Curriculum Lesson Preset'}
                  </h3>
                  <p className="text-xs text-[#6A97C0]">
                    Saved lessons immediately sync to your lesson creation dropdown.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-[#6A97C0] hover:text-[#152026] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePreset} className="space-y-4 text-xs">
              {/* Lesson Name */}
              <div>
                <label className="block font-bold text-[#152026] mb-1">
                  Lesson Name: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={presetForm.title}
                  onChange={(e) => setPresetForm({ ...presetForm, title: e.target.value })}
                  placeholder="e.g., Night Driving & Adverse Weather Navigation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D4EEF8] text-[#152026] font-bold outline-none focus:border-[#1B3D59] transition-colors"
                />
              </div>

              {/* Lesson Description */}
              <div>
                <label className="block font-bold text-[#152026] mb-1">
                  Lesson Description / Key Maneuvers Practiced: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={presetForm.description}
                  onChange={(e) => setPresetForm({ ...presetForm, description: e.target.value })}
                  placeholder="e.g., Headlight beam selection, low visibility hazard anticipation, braking on wet tarmac, defogger usage..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D4EEF8] text-[#152026] outline-none focus:border-[#1B3D59] transition-colors leading-relaxed"
                />
              </div>

              {/* Vehicle Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#152026] mb-1">Vehicle Type:</label>
                  <select
                    value={presetForm.vehicleType}
                    onChange={(e) => {
                      const vType = e.target.value;
                      setPresetForm({
                        ...presetForm,
                        vehicleType: vType,
                        vehicleCategory: vType === 'HeavyVehicle_Bus' ? 'Heavy' : 'Light',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4EEF8] text-[#152026] font-bold outline-none focus:border-[#1B3D59] transition-colors cursor-pointer"
                  >
                    <option value="Car">Car (Manual / Auto)</option>
                    <option value="Bike">Motorcycle / Bike</option>
                    <option value="ThreeWheeler">Three-Wheeler</option>
                    <option value="HeavyVehicle_Bus">Heavy Vehicle (Bus / Truck)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#152026] mb-1">Vehicle Category:</label>
                  <div className="px-3 py-2 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] text-[#1B3D59] font-bold">
                    {presetForm.vehicleType === 'HeavyVehicle_Bus' ? 'Heavy Category' : 'Light Category'}
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 bg-[#D4EEF8]/40 border border-[#B3D5F1]/60 rounded-xl flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#1B3D59] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#152026]">
                  When saved, this lesson preset will be instantly selectable under <strong>Quick Curriculum Preset</strong> in your
                  daily session scheduler.
                </p>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-[#D4EEF8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPreset}
                  className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2 px-5 font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  {submittingPreset ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> {editingPreset ? 'Update Preset' : 'Save Lesson Preset'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteModalOpen && presetToDelete && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in text-[#152026]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#152026]">Delete Lesson Preset?</h3>
                <p className="text-xs text-[#6A97C0]">This action will remove the lesson from your curriculum list.</p>
              </div>
            </div>

            <div className="p-3 bg-[#FAFCFE] rounded-xl border border-[#D4EEF8] text-xs">
              <p className="font-extrabold text-[#152026]">{presetToDelete.title}</p>
              <p className="text-[#6A97C0] text-[11px] mt-0.5 line-clamp-2">
                {presetToDelete.description || presetToDelete.topic}
              </p>
            </div>

            <p className="text-xs text-[#152026]">
              Are you sure you want to delete this lesson? It will no longer appear in the Quick Curriculum Preset dropdown.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setPresetToDelete(null);
                }}
                className="py-2 px-4 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingPreset}
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs py-2 px-5 font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                {deletingPreset ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Delete Lesson
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
