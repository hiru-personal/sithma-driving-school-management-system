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

  const getPackageIcon = (type, category) => {
    if (category === 'Heavy' || type.includes('Bus')) return Bus;
    if (type.includes('Bike')) return Bike;
    return Car;
  };

  return (
    <div className="min-h-screen bg-neutralBg py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textMain font-heading flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" /> Course Packages & Pricing Management
          </h1>
          <p className="text-xs text-textMuted mt-0.5">
            Configure driving lesson packages, standard fees, and bonus lesson bundles across vehicle categories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchPackages} className="btn-secondary text-xs py-2 px-3">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={openAddModal} className="btn-primary text-xs py-2 px-4 font-bold">
            <Plus className="w-4 h-4" /> Add Package
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-textMuted flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading pricing packages...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const Icon = getPackageIcon(pkg.type, pkg.vehicleCategory);

            return (
              <div key={pkg._id} className="card card-hover flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="badge badge-info text-[10px]">{pkg.vehicleCategory} Vehicle</span>
                  </div>

                  <h3 className="text-base font-bold text-textMain mb-1">{pkg.name}</h3>
                  <div className="text-xl font-extrabold text-primary mb-2">
                    Rs. {pkg.price?.toLocaleString()}
                    {pkg.isPerLesson && <span className="text-xs text-textMuted font-normal"> / lesson</span>}
                  </div>

                  <p className="text-xs text-textMuted leading-relaxed mb-3">{pkg.notes}</p>

                  {/* Bonus Lessons pill */}
                  {(pkg.bonusLessons?.bike > 0 || pkg.bonusLessons?.threeWheeler > 0) && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-1.5 mb-2">
                      <Gift className="w-3.5 h-3.5 text-accent-dark flex-shrink-0" />
                      <span>
                        +{pkg.bonusLessons.bike} Bike & +{pkg.bonusLessons.threeWheeler} 3-Wheeler Bonus Lessons
                      </span>
                    </div>
                  )}

                  {/* Eligibility criteria */}
                  {pkg.eligibilityCriteria && pkg.eligibilityCriteria !== 'None' && (
                    <div className="text-[11px] text-purple-700 bg-purple-50 p-2 rounded border border-purple-200">
                      <strong>Prerequisite:</strong> {pkg.eligibilityCriteria}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-borderColor flex items-center justify-between text-xs">
                  <span className="text-textMuted font-medium">
                    {pkg.lessons} {pkg.lessons === 1 ? 'Lesson' : 'Lessons'} Included
                  </span>
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="p-1.5 rounded text-primary hover:bg-primary-light transition-colors flex items-center gap-1 font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-borderColor pb-3">
              <h3 className="text-base font-bold text-textMain">
                {editingPackage ? 'Edit Course Package' : 'Create New Course Package'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-textMain text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-textMain mb-1">Package Display Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Car — Full License Package"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-textMain mb-1">Category:</label>
                  <select
                    value={formData.vehicleCategory}
                    onChange={(e) => setFormData({ ...formData, vehicleCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs bg-white"
                  >
                    <option value="Light">Light Vehicle</option>
                    <option value="Heavy">Heavy Vehicle</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-textMain mb-1">Lessons Count:</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.lessons}
                    onChange={(e) =>
                      setFormData({ ...formData, lessons: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-textMain mb-1">Price (LKR):</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs font-bold text-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-textMain mb-1">Bonus Bike Lessons:</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bonusLessons.bike}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bonusLessons: {
                          ...formData.bonusLessons,
                          bike: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-textMain mb-1">Bonus 3-Wheeler Lessons:</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bonusLessons.threeWheeler}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bonusLessons: {
                          ...formData.bonusLessons,
                          threeWheeler: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-textMain mb-1">Eligibility Criteria / Prerequisite:</label>
                <input
                  type="text"
                  placeholder="e.g. Must have held Light Vehicle license for 2+ years"
                  value={formData.eligibilityCriteria}
                  onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                  className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-textMain mb-1">Description / Notes:</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-borderColor">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary py-2 px-3 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-4 text-xs font-bold">
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
