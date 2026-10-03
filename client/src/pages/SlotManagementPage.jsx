import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Clock,
  Plus,
  Trash2,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit3,
  Sparkles,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function SlotManagementPage() {
  const [selectedBranch, setSelectedBranch] = useState('Maharagama');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Slot Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSlotForm, setNewSlotForm] = useState({
    startTime: '16:30',
    endTime: '17:30',
    vehicleCategory: 'Light',
    instructorId: '',
  });

  // Edit / Assign Instructor Modal
  const [editingSlot, setEditingSlot] = useState(null);
  const [editInstructorId, setEditInstructorId] = useState('');
  const [updatingInstructor, setUpdatingInstructor] = useState(false);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await api.get('/slots', {
        params: { branch: selectedBranch, date: selectedDate },
      });
      if (res.data.success) {
        setSlots(res.data.slots);
      }
    } catch (err) {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await api.get('/slots/instructors');
      if (res.data.success) {
        setInstructors(res.data.instructors || []);
      }
    } catch (err) {
      console.error('Failed to load instructors', err);
    }
  };

  useEffect(() => {
    fetchSlots();
    fetchInstructors();
  }, [selectedBranch, selectedDate]);

  const handleOpenAddModal = () => {
    setNewSlotForm({
      startTime: '16:30',
      endTime: '17:30',
      vehicleCategory: 'Light',
      instructorId: instructors.find((i) => i.branch === selectedBranch)?._id || instructors[0]?._id || '',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/slots', {
        branch: selectedBranch,
        date: selectedDate,
        startTime: newSlotForm.startTime,
        endTime: newSlotForm.endTime,
        vehicleCategory: newSlotForm.vehicleCategory,
        instructorId: newSlotForm.instructorId || null,
      });
      if (res.data.success) {
        toast.success('Time slot created successfully');
        setIsAddModalOpen(false);
        fetchSlots();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create time slot');
    }
  };

  const handleOpenEditInstructor = (slot) => {
    setEditingSlot(slot);
    setEditInstructorId(slot.instructorId?._id || slot.instructorId || '');
  };

  const handleUpdateInstructor = async (e) => {
    e.preventDefault();
    if (!editingSlot) return;
    setUpdatingInstructor(true);
    try {
      const res = await api.put(`/slots/${editingSlot._id}`, {
        instructorId: editInstructorId || null,
      });
      if (res.data.success) {
        toast.success('Instructor assignment updated successfully');
        setEditingSlot(null);
        fetchSlots();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update instructor');
    } finally {
      setUpdatingInstructor(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;
    try {
      const res = await api.delete(`/slots/${slotId}`);
      if (res.data.success) {
        toast.success('Time slot deleted');
        fetchSlots();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete time slot');
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full text-[#152026]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#B3D5F1] text-[#1B3D59] font-bold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Fleet & Instructor Operations
          </div>
          <h1 className="text-2xl font-extrabold text-[#152026] flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#1B3D59]" /> Branch Slot & Instructor Scheduling
          </h1>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Configure daily training sessions, assign instructors, and monitor booking capacities per branch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSlots}
            className="py-2 px-3.5 rounded-xl border border-[#D4EEF8] bg-white text-[#152026] hover:bg-[#FAFCFE] text-xs flex items-center gap-1.5 font-bold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#1B3D59] ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2 px-4 rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Session Slot
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 bg-white border border-[#D4EEF8] rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#152026] mb-1">Branch:</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-[#D4EEF8] rounded-xl text-xs bg-white font-bold text-[#152026] outline-none focus:border-[#1B3D59] cursor-pointer"
          >
            <option value="Maharagama">Maharagama Branch</option>
            <option value="Werahara">Werahara Branch</option>
            <option value="Delgoda">Delgoda Branch</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#152026] mb-1">Date:</label>
          <div className="relative flex items-center">
            <Calendar className="w-4 h-4 text-[#1B3D59] absolute left-3.5 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl text-xs outline-none focus:border-[#1B3D59] cursor-pointer font-mono"
            />
          </div>
        </div>
      </div>

      {/* Slots Table */}
      <div className="card p-0 overflow-hidden shadow-sm border border-[#D4EEF8] bg-white rounded-3xl">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-600 font-medium flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#1B3D59]" /> Loading branch slots...
          </div>
        ) : slots.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Clock className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-[#152026]">No slots found for this date</p>
            <p className="text-xs text-slate-600 font-medium">Click "Add Session Slot" to schedule a session.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="bg-[#1B3D59] text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Session Time & Title</th>
                  <th className="px-4 py-3.5">Vehicle</th>
                  <th className="px-4 py-3.5">Assigned Instructor</th>
                  <th className="px-4 py-3.5">Capacity & Enrolled</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4EEF8]">
                {slots.map((slot) => {
                  const bookedCount = slot.bookedCount || 0;
                  const capacity = slot.capacity || 10;
                  const isFull = bookedCount >= capacity || slot.status === 'full';
                  const remaining = Math.max(0, capacity - bookedCount);

                  return (
                    <tr key={slot._id} className="hover:bg-[#D4EEF8]/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-[#152026] text-sm">
                          {slot.startTime} – {slot.endTime}
                        </div>
                        <div className="text-[11px] text-[#1B3D59] font-semibold mt-0.5">
                          {slot.lessonTitle || 'Practical Driving Session'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]">
                          {slot.vehicleType || slot.vehicleCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-[#152026]">
                              {slot.instructorId?.name || (
                                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px] font-medium">
                                  Unassigned
                                </span>
                              )}
                            </div>
                            {slot.instructorId?.phone && (
                              <div className="text-[11px] text-slate-600 font-medium">
                                {slot.instructorId.phone}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenEditInstructor(slot)}
                            className="p-1 rounded-lg text-[#1B3D59] hover:bg-[#D4EEF8] transition-colors cursor-pointer"
                            title="Assign or Change Instructor"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-[#152026] text-xs">
                          {bookedCount} / {capacity} Students
                        </div>
                        <div className="text-[10px] text-slate-600 font-medium">
                          {isFull ? 'Capacity Full' : `${remaining} seat(s) open`}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isFull
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : bookedCount > 0
                              ? 'bg-[#D4EEF8] text-[#1B3D59] border-[#B3D5F1]'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          }`}
                        >
                          {isFull ? 'FULL (10/10)' : `${remaining} Available`}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditInstructor(slot)}
                            className="p-1.5 rounded-lg bg-[#D4EEF8]/60 hover:bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1] transition-colors cursor-pointer"
                            title="Assign or Change Instructor"
                          >
                            <User className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={bookedCount > 0}
                            onClick={() => handleDeleteSlot(slot._id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title={bookedCount > 0 ? 'Cannot delete slot with active booked students' : 'Delete slot'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto text-[#152026] animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <h3 className="text-base font-bold text-[#152026] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#1B3D59]" /> Schedule New Session Slot
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-slate-600 hover:text-[#152026] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#152026] mb-1">Start Time:</label>
                  <input
                    type="time"
                    required
                    value={newSlotForm.startTime}
                    onChange={(e) => setNewSlotForm({ ...newSlotForm, startTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl focus:border-[#1B3D59] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#152026] mb-1">End Time:</label>
                  <input
                    type="time"
                    required
                    value={newSlotForm.endTime}
                    onChange={(e) => setNewSlotForm({ ...newSlotForm, endTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl focus:border-[#1B3D59] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#152026] mb-1">Vehicle Category:</label>
                <select
                  value={newSlotForm.vehicleCategory}
                  onChange={(e) =>
                    setNewSlotForm({ ...newSlotForm, vehicleCategory: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl font-medium focus:border-[#1B3D59] outline-none cursor-pointer"
                >
                  <option value="Light">Light Vehicle (Car / Bike / 3-Wheel)</option>
                  <option value="Heavy">Heavy Vehicle (Bus / Lorry)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#152026] mb-1">
                  Assign Instructor: <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <select
                  value={newSlotForm.instructorId}
                  onChange={(e) =>
                    setNewSlotForm({ ...newSlotForm, instructorId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl font-medium focus:border-[#1B3D59] outline-none cursor-pointer"
                >
                  <option value="">-- No Instructor (Leave Unassigned) --</option>
                  {instructors.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.name} ({inst.branch} • {inst.teachingCategories || 'All Vehicles'}{inst.phone ? ` • ${inst.phone}` : ''})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Select a licensed driving instructor stationed at {selectedBranch} or all branches.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2 px-5 rounded-xl font-bold cursor-pointer shadow-md transition-all"
                >
                  Create Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Assign / Edit Instructor Modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto text-[#152026] animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <h3 className="text-base font-bold text-[#152026] flex items-center gap-2">
                <User className="w-4 h-4 text-[#1B3D59]" /> Assign / Change Instructor
              </h3>
              <button
                onClick={() => setEditingSlot(null)}
                className="w-7 h-7 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-slate-600 hover:text-[#152026] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#FAFCFE] rounded-xl border border-[#D4EEF8] text-xs space-y-1">
              <div className="font-bold text-[#152026]">
                {editingSlot.startTime} – {editingSlot.endTime} • {editingSlot.vehicleType || editingSlot.vehicleCategory}
              </div>
              <div className="text-slate-600">
                {editingSlot.lessonTitle || 'Practical Driving Session'} ({editingSlot.branch} Branch)
              </div>
            </div>

            <form onSubmit={handleUpdateInstructor} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#152026] mb-1">
                  Select Driving Instructor:
                </label>
                <select
                  value={editInstructorId}
                  onChange={(e) => setEditInstructorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#D4EEF8] bg-white text-[#152026] rounded-xl font-medium focus:border-[#1B3D59] outline-none cursor-pointer"
                >
                  <option value="">-- No Instructor Assigned (Unassigned) --</option>
                  {instructors.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.name} ({inst.branch} • {inst.teachingCategories || 'All Vehicles'}{inst.phone ? ` • ${inst.phone}` : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="py-2 px-4 rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingInstructor}
                  className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2 px-5 rounded-xl font-bold cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  {updatingInstructor ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Instructor'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
