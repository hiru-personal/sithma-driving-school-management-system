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

  const handleAssignInstructor = async (slotId, instructorId) => {
    try {
      const res = await api.put(`/slots/${slotId}`, { instructorId });
      if (res.data.success) {
        toast.success('Instructor updated for session');
        fetchSlots();
      }
    } catch (err) {
      toast.error('Failed to assign instructor');
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
    <div className="min-h-screen bg-neutralBg py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textMain font-heading flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" /> Branch Slot & Instructor Scheduling
          </h1>
          <p className="text-xs text-textMuted mt-0.5">
            Configure daily training sessions, assign instructors, and monitor booking capacities per branch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchSlots} className="btn-secondary text-xs py-2 px-3">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary text-xs py-2 px-4 font-bold"
          >
            <Plus className="w-4 h-4" /> Add Session Slot
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-textMain mb-1">Branch:</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs bg-white font-bold text-primary"
          >
            <option value="Maharagama">Maharagama Branch</option>
            <option value="Werahara">Werahara Branch</option>
            <option value="Delgoda">Delgoda Branch</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-textMain mb-1">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs bg-white"
          />
        </div>
      </div>

      {/* Slots Table */}
      <div className="card p-0 overflow-hidden shadow-card">
        {loading ? (
          <div className="py-12 text-center text-xs text-textMuted flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading branch slots...
          </div>
        ) : slots.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-textMain">No slots found for this date</p>
            <p className="text-xs text-textMuted">Click "Add Session Slot" to schedule a session.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-borderColor text-textMuted uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Session Time</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Assigned Instructor</th>
                  <th className="px-4 py-3">Booked Student</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor">
                {slots.map((slot) => {
                  const isBooked = slot.status === 'booked' || !!slot.bookedBy;

                  return (
                    <tr key={slot._id} className="hover:bg-primary-light/20 transition-colors">
                      <td className="px-4 py-3 font-extrabold text-textMain">
                        {slot.startTime} – {slot.endTime}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge badge-info text-[10px]">{slot.vehicleCategory} Vehicle</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-textMain">
                          {slot.instructorId?.name || (
                            <span className="text-warning-dark font-normal">Unassigned</span>
                          )}
                        </div>
                        {slot.instructorId?.phone && (
                          <div className="text-[11px] text-textMuted">{slot.instructorId.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {slot.bookedBy?.userId ? (
                          <div>
                            <div className="font-bold text-textMain">{slot.bookedBy.userId.name}</div>
                            <div className="text-[11px] text-textMuted">{slot.bookedBy.userId.phone}</div>
                          </div>
                        ) : (
                          <span className="text-textMuted italic">No student booked</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${isBooked ? 'badge-warning' : 'badge-success'}`}>
                          {isBooked ? 'Booked' : 'Available'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          disabled={isBooked}
                          onClick={() => handleDeleteSlot(slot._id)}
                          className="p-1.5 rounded text-danger hover:bg-danger-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Delete Slot"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-borderColor pb-3">
              <h3 className="text-base font-bold text-textMain">Create Branch Session Slot</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-textMain text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-textMain mb-1">Start Time (24h):</label>
                  <input
                    type="time"
                    required
                    value={newSlotForm.startTime}
                    onChange={(e) =>
                      setNewSlotForm({ ...newSlotForm, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-borderColor rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-textMain mb-1">End Time (24h):</label>
                  <input
                    type="time"
                    required
                    value={newSlotForm.endTime}
                    onChange={(e) =>
                      setNewSlotForm({ ...newSlotForm, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-borderColor rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-textMain mb-1">Vehicle Category:</label>
                <select
                  value={newSlotForm.vehicleCategory}
                  onChange={(e) =>
                    setNewSlotForm({ ...newSlotForm, vehicleCategory: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-borderColor rounded-lg bg-white"
                >
                  <option value="Light">Light Vehicle (Car / Bike / 3-Wheeler)</option>
                  <option value="Heavy">Heavy Vehicle (Bus)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-borderColor">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary py-2 px-3 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-4 text-xs font-bold">
                  Create Time Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
