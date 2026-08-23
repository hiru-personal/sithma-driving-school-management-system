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

  useEffect(() => {
    fetchSlots();
  }, [selectedBranch, selectedDate]);

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
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Fleet & Instructor Operations
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2 drop-shadow">
            <Clock className="w-6 h-6 text-cyan-400" /> Branch Slot & Instructor Scheduling
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure daily training sessions, assign instructors, and monitor booking capacities per branch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchSlots} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-accent text-xs py-2 px-4 font-bold shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Session Slot
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Branch:</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-white/15 rounded-xl text-xs bg-slate-950/80 font-bold text-cyan-300 outline-none"
          >
            <option value="Maharagama">Maharagama Branch</option>
            <option value="Werahara">Werahara Branch</option>
            <option value="Delgoda">Delgoda Branch</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950/80 text-white rounded-xl text-xs outline-none"
          />
        </div>
      </div>

      {/* Slots Table */}
      <div className="card p-0 overflow-hidden shadow-2xl border border-white/10">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Loading branch slots...
          </div>
        ) : slots.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Clock className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No slots found for this date</p>
            <p className="text-xs text-slate-400">Click "Add Session Slot" to schedule a session.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 border-b border-white/10 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Session Time</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Assigned Instructor</th>
                  <th className="px-4 py-3.5">Booked Student</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {slots.map((slot) => {
                  const isBooked = slot.status === 'booked' || !!slot.bookedBy;

                  return (
                    <tr key={slot._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5 font-extrabold text-white">
                        {slot.startTime} – {slot.endTime}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="badge badge-info text-[10px]">{slot.vehicleCategory} Vehicle</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-cyan-300">
                          {slot.instructorId?.name || (
                            <span className="text-amber-300 font-normal">Unassigned</span>
                          )}
                        </div>
                        {slot.instructorId?.phone && (
                          <div className="text-[11px] text-slate-400">{slot.instructorId.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {slot.bookedBy?.userId ? (
                          <div>
                            <p className="font-bold text-white">{slot.bookedBy.userId.name}</p>
                            <p className="text-[11px] text-slate-400">{slot.bookedBy.userId.phone}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">None (Open)</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`badge text-[10px] ${
                            isBooked ? 'badge-danger bg-rose-500/15 text-rose-400' : 'badge-success'
                          }`}
                        >
                          {isBooked ? 'Booked' : 'Available'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          disabled={isBooked}
                          onClick={() => handleDeleteSlot(slot._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Delete slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" /> Schedule New Session Slot
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Start Time:</label>
                  <input
                    type="time"
                    required
                    value={newSlotForm.startTime}
                    onChange={(e) => setNewSlotForm({ ...newSlotForm, startTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">End Time:</label>
                  <input
                    type="time"
                    required
                    value={newSlotForm.endTime}
                    onChange={(e) => setNewSlotForm({ ...newSlotForm, endTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Vehicle Category:</label>
                <select
                  value={newSlotForm.vehicleCategory}
                  onChange={(e) =>
                    setNewSlotForm({ ...newSlotForm, vehicleCategory: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl font-medium"
                >
                  <option value="Light">Light Vehicle (Car / Bike / 3-Wheel)</option>
                  <option value="Heavy">Heavy Vehicle (Bus / Lorry)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-accent text-xs py-2 px-5 font-bold">
                  Create Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
