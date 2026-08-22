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
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PackageManagementPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Car_Full',
    vehicleCategory: 'Light',
    lessons: 15,
    price: 45000,
    bonusLessons: { bike: 0, threeWheeler: 0 },
    eligibilityCriteria: 'None',
    notes: '',
  });

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
    setFormData({
      name: '',
      type: 'Car_Full',
      vehicleCategory: 'Light',
      lessons: 15,
      price: 45000,
      bonusLessons: { bike: 0, threeWheeler: 0 },
      eligibilityCriteria: 'None',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      type: pkg.type,
      vehicleCategory: pkg.vehicleCategory,
      lessons: pkg.lessons,
      price: pkg.price,
      bonusLessons: pkg.bonusLessons || { bike: 0, threeWheeler: 0 },
      eligibilityCriteria: pkg.eligibilityCriteria || 'None',
      notes: pkg.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPackage) {
        const res = await api.put(`/packages/${editingPackage._id}`, formData);
        if (res.data.success) {
          toast.success('Package updated successfully');
        }
      } else {
        const res = await api.post('/packages', formData);
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
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto w-full">
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
            Configure vehicle training bundles, pricing structures, and bonus lesson allocations.
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

      {/* Packages Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Loading packages...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg._id} className="card card-hover flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-info text-[10px]">{pkg.vehicleCategory} Vehicle</span>
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
                <p className="text-xs text-slate-400 mb-3">{pkg.type.replace('_', ' ')}</p>

                <div className="text-2xl font-black text-accent mb-3">
                  Rs. {pkg.price?.toLocaleString()}
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 border-t border-white/10 pt-3">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <strong>{pkg.lessons}</strong> Practical On-Road Lessons
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-md w-full p-6 space-y-4">
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
                  placeholder="e.g. Car Full Driving Course"
                  className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Package Type:</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  >
                    <option value="Car_Full">Car Full Course</option>
                    <option value="Car_TrialOnly">Car Trial Only</option>
                    <option value="Bike_Only">Bike Only</option>
                    <option value="ThreeWheeler_Only">3-Wheeler Only</option>
                    <option value="HeavyVehicle_Bus">Heavy Vehicle (Bus)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Vehicle Category:</label>
                  <select
                    value={formData.vehicleCategory}
                    onChange={(e) => setFormData({ ...formData, vehicleCategory: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  >
                    <option value="Light">Light Vehicle</option>
                    <option value="Heavy">Heavy Vehicle</option>
                  </select>
                </div>
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
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl font-bold"
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
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-accent font-black rounded-xl"
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
                    className="w-full px-3 py-2 border border-white/15 bg-slate-900/90 text-white rounded-lg"
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
                    className="w-full px-3 py-2 border border-white/15 bg-slate-900/90 text-white rounded-lg"
                  />
                </div>
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
