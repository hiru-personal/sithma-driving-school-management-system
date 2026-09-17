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

export default function PackageManagementPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'comprehensive' | 'individual' | 'other'

  const [isCustomType, setIsCustomType] = useState(false);
  const [customTypeInput, setCustomTypeInput] = useState('');

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
    new Set(
      packages
        .map((p) => p.type)
        .filter((t) => t && !STANDARD_PACKAGE_TYPES.some((s) => s.value === t))
    )
  );

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
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Curriculum & Pricing
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2 drop-shadow">
            <Layers className="w-6 h-6 text-cyan-400" /> Training Package Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure vehicle training bundles, pricing structures, and custom package categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchPackages} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={openAddModal} className="btn-accent text-xs py-2 px-4 font-bold shadow-md flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Create Package
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterTab === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          All Packages ({packages.length})
        </button>
        <button
          onClick={() => setFilterTab('individual')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterTab === 'individual'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          Individual Packages (Hourly) ({packages.filter((p) => p.isPerLesson).length})
        </button>
        <button
          onClick={() => setFilterTab('comprehensive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterTab === 'comprehensive'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white bg-white/5'
          }`}
        >
          Full Course Packages ({packages.filter((p) => !p.isPerLesson && p.categoryGroup !== 'Other').length})
        </button>
        {packages.some((p) => p.categoryGroup === 'Other' || p.type?.toLowerCase().includes('other')) && (
          <button
            onClick={() => setFilterTab('other')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'other'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            Other Packages ({packages.filter((p) => p.categoryGroup === 'Other' || p.type?.toLowerCase().includes('other')).length})
          </button>
        )}
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Loading packages...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div key={pkg._id} className="card card-hover flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="badge badge-info text-[10px]">{pkg.vehicleCategory} Vehicle</span>
                    {pkg.isPerLesson ? (
                      <span className="badge badge-warning text-[10px]">Hourly / Per Lesson</span>
                    ) : (
                      <span className="badge badge-primary text-[10px]">Full Course</span>
                    )}
                    {pkg.categoryGroup === 'Other' && (
                      <span className="badge badge-success text-[10px]">Other Package</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-cyan-500/20 text-cyan-300 border border-white/15 transition-colors"
                      title="Edit package"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg._id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors"
                      title="Delete package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{pkg.name}</h3>
                <div className="flex items-center gap-1.5 mb-3">
                  <Tag className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs text-cyan-300 font-mono font-semibold">{pkg.type?.replace(/_/g, ' ')}</span>
                  {pkg.categoryGroup && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300">
                      Group {pkg.categoryGroup}
                    </span>
                  )}
                </div>

                <div className="text-2xl font-black text-accent mb-3">
                  Rs. {pkg.price?.toLocaleString()}
                  {pkg.isPerLesson && <span className="text-xs font-semibold text-cyan-300 ml-1">/ hr</span>}
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 border-t border-white/10 pt-3">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <strong>{pkg.lessons}</strong> {pkg.isPerLesson ? 'Hour Practical Lesson' : 'Practical On-Road Lessons'}
                  </p>
                  {pkg.bonusLessons?.bike > 0 && (
                    <p className="flex items-center gap-2 text-amber-300">
                      <Gift className="w-3.5 h-3.5 text-accent" />
                      +{pkg.bonusLessons.bike} Free Bike Lessons
                    </p>
                  )}
                  {pkg.bonusLessons?.threeWheeler > 0 && (
                    <p className="flex items-center gap-2 text-amber-300">
                      <Gift className="w-3.5 h-3.5 text-accent" />
                      +{pkg.bonusLessons.threeWheeler} Free Three-Wheeler Lessons
                    </p>
                  )}
                </div>
              </div>

              {pkg.notes && (
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400">
                  {pkg.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Package Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                {editingPackage ? 'Edit Package' : 'Create New Course Package'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Package Name:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Car (Auto/Manual) — Individual Package or Other Special Package"
                  className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl focus:border-cyan-400 outline-none"
                />
              </div>

              {/* Package Type Selection */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Package Type:</label>
                <select
                  value={isCustomType ? '__CUSTOM__' : formData.type}
                  onChange={handleTypeSelectChange}
                  className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl focus:border-cyan-400 outline-none"
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
                <div className="p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-xl space-y-1.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-cyan-300">
                      New / Custom Package Type Identifier:
                    </label>
                    <span className="text-[10px] text-cyan-400/90 font-mono px-2 py-0.5 bg-cyan-500/20 rounded">
                      Custom Type
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={customTypeInput}
                    onChange={(e) => setCustomTypeInput(e.target.value)}
                    placeholder="e.g. Other, VIP_Package, Electric_Car, Combo_Special..."
                    className="w-full px-3.5 py-2 border border-cyan-400/40 bg-slate-900 text-white rounded-lg focus:outline-none focus:border-cyan-300 font-medium"
                  />
                  <p className="text-[11px] text-slate-400">
                    Type a new package type name or "Other". It will be saved as this package's type.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Curriculum Group:</label>
                  <select
                    value={formData.categoryGroup || 'A'}
                    onChange={(e) => setFormData({ ...formData, categoryGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl focus:border-cyan-400 outline-none"
                  >
                    <option value="A">Group A — Individual / Private</option>
                    <option value="B">Group B — Standard Single Lesson</option>
                    <option value="C">Group C — Full Course Package</option>
                    <option value="Other">Group D / Other Packages</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Vehicle Category:</label>
                  <select
                    value={formData.vehicleCategory}
                    onChange={(e) => setFormData({ ...formData, vehicleCategory: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl focus:border-cyan-400 outline-none"
                  >
                    <option value="Light">Light Vehicle</option>
                    <option value="Heavy">Heavy Vehicle</option>
                    <option value="Bike">Motorcycle / Bike</option>
                    <option value="ThreeWheeler">Three Wheeler</option>
                    <option value="All">All / Multi-Vehicle (Combo)</option>
                    <option value="Other">Other Category</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 p-2.5 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
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
                    className="rounded border-white/20 text-cyan-500 focus:ring-0"
                  />
                  <span className="text-xs text-slate-200 font-semibold">
                    Individual Hourly Package (One lesson per hour)
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Practical Lessons:</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.lessons}
                    onChange={(e) => setFormData({ ...formData, lessons: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl font-bold focus:border-cyan-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Price (LKR):</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-accent font-black rounded-xl focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <label className="block font-semibold text-amber-300 mb-1">Bonus Bike Lessons:</label>
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
                    className="w-full px-3 py-2 border border-white/15 bg-slate-900/90 text-white rounded-lg focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-amber-300 mb-1">Bonus 3-Wheel Lessons:</label>
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
                    className="w-full px-3 py-2 border border-white/15 bg-slate-900/90 text-white rounded-lg focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description / Notes (Optional):</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Special combo bundle, customized lesson schedule, or specific requirements..."
                  className="w-full px-3.5 py-2 border border-white/15 bg-slate-900/90 text-white rounded-xl resize-none text-xs focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-5 font-bold">
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
