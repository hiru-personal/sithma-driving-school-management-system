import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  User,
  PlusCircle,
  Sparkles,
  Gift,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function MyLessonsPage() {
  const { student, updateStudentData } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Free Weekly Class Modal
  const [isFreeModalOpen, setIsFreeModalOpen] = useState(false);
  const [freeSlots, setFreeSlots] = useState([]);
  const [selectedFreeSlot, setSelectedFreeSlot] = useState('');
  const [freeSlotLoading, setFreeSlotLoading] = useState(false);

  // Request Extra Lessons Modal
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
  const [extraCount, setExtraCount] = useState(2);
  const [extraLoading, setExtraLoading] = useState(false);

  const fetchBookings = async () => {
    if (!student?._id) return;
    setLoading(true);
    try {
      const res = await api.get(`/bookings/student/${student._id}`);
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openFreeClassModal = async () => {
    setIsFreeModalOpen(true);
    setFreeSlotLoading(true);
    try {
      const res = await api.get('/slots', {
        params: {
          branch: student?.branch || 'Maharagama',
          date: new Date().toISOString().split('T')[0],
          vehicleCategory: 'Light',
        },
      });
      if (res.data.success) {
        setFreeSlots(res.data.slots.filter((s) => s.status === 'available'));
      }
    } catch (err) {
      toast.error('Failed to load free slots');
    } finally {
      setFreeSlotLoading(false);
    }
  };

  const handleBookFreeClass = async (e) => {
    e.preventDefault();
    if (!selectedFreeSlot) {
      toast.error('Please select an available session slot');
      return;
    }

    try {
      const res = await api.post('/bookings/free-class', {
        timeSlotId: selectedFreeSlot,
        vehicleType: 'Car',
      });
      if (res.data.success) {
        toast.success('🎉 Free weekly class booked successfully!');
        setIsFreeModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book free class');
    }
  };

  const handleRequestExtra = async (e) => {
    e.preventDefault();
    setExtraLoading(true);
    try {
      const res = await api.post(`/bookings/students/${student._id}/additional-lessons`, {
        extraLessons: extraCount,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setIsExtraModalOpen(false);
        if (student?._id) {
          const profileRes = await api.get(`/students/${student._id}`);
          if (profileRes.data.success) {
            updateStudentData(profileRes.data.student);
          }
        }
      }
    } catch (err) {
      toast.error('Failed to request additional lessons');
    } finally {
      setExtraLoading(false);
    }
  };

  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
  const pastBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="min-h-screen bg-neutralBg py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textMain font-heading flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" /> My Lesson Schedule & History
          </h1>
          <p className="text-xs text-textMuted mt-0.5">
            Track your upcoming on-road lessons, free weekly theory sessions, and completed driving history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={openFreeClassModal} className="btn-accent text-xs py-2 px-3.5 font-bold shadow-sm">
            <Gift className="w-4 h-4 text-textMain" /> Book Free Weekly Class
          </button>
          <button onClick={() => setIsExtraModalOpen(true)} className="btn-secondary text-xs py-2 px-3.5 font-bold shadow-sm">
            <PlusCircle className="w-4 h-4 text-primary" /> Request Extra Lessons
          </button>
        </div>
      </div>

      {/* Upcoming Lessons */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-textMain flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Upcoming Practical Lessons
        </h2>

        {loading ? (
          <div className="py-8 text-center text-xs text-textMuted flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading lesson schedule...
          </div>
        ) : upcomingBookings.length === 0 ? (
          <div className="card text-center py-8 space-y-3">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-textMain">You have no upcoming lessons booked</p>
            <Link to="/student/lessons/book" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
              Book a Lesson Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBookings.map((b) => (
              <div key={b._id} className="card card-hover p-5 space-y-3 border-l-4 border-l-primary">
                <div className="flex items-center justify-between">
                  <span className="badge badge-info">{b.vehicleType}</span>
                  <span className={`badge ${b.lessonType === 'free-weekly-class' ? 'badge-accent' : 'badge-success'}`}>
                    {b.lessonType === 'free-weekly-class' ? 'Free Class' : 'Confirmed'}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-sm font-bold text-textMain">
                    {b.timeSlotId?.date ? format(new Date(b.timeSlotId.date), 'EEEE, MMM dd, yyyy') : 'Scheduled'}
                  </p>
                  <p className="font-semibold text-primary">
                    {b.timeSlotId?.startTime} – {b.timeSlotId?.endTime}
                  </p>
                  <p className="text-textMuted flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.branch} Branch
                  </p>
                  <p className="text-textMuted flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Instructor:{' '}
                    <strong>{b.timeSlotId?.instructorId?.name || 'Will be assigned'}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Free Weekly Class Modal */}
      {isFreeModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-borderColor pb-3">
              <h3 className="text-base font-bold text-textMain flex items-center gap-2">
                <Gift className="w-4 h-4 text-accent-dark" /> Book Free Weekly Theory & Practical Class
              </h3>
              <button
                onClick={() => setIsFreeModalOpen(false)}
                className="text-slate-400 hover:text-textMain text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-textMuted">
              Each week, Sithma Driving School conducts free group classes on road signs and vehicle mechanics. No deduction from your package balance.
            </p>

            <form onSubmit={handleBookFreeClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-textMain mb-1">
                  Choose Available Class Slot ({student?.branch} Branch):
                </label>
                {freeSlotLoading ? (
                  <p className="text-textMuted">Loading slots...</p>
                ) : (
                  <select
                    value={selectedFreeSlot}
                    onChange={(e) => setSelectedFreeSlot(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-borderColor rounded-lg bg-white"
                  >
                    <option value="">-- Select an available session --</option>
                    {freeSlots.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.startTime} – {s.endTime} ({s.vehicleCategory} Vehicle)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-borderColor">
                <button
                  type="button"
                  onClick={() => setIsFreeModalOpen(false)}
                  className="btn-secondary py-2 px-3 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-accent py-2 px-4 text-xs font-bold text-textMain">
                  Reserve Free Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Extra Lessons Modal */}
      {isExtraModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-borderColor pb-3">
              <h3 className="text-base font-bold text-textMain flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-primary" /> Request Additional Practice Lessons
              </h3>
              <button
                onClick={() => setIsExtraModalOpen(false)}
                className="text-slate-400 hover:text-textMain text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-textMuted">
              Need extra on-road practice before your practical trial? Add additional lessons directly to your student balance.
            </p>

            <form onSubmit={handleRequestExtra} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-textMain mb-1">
                  Number of Additional Lessons:
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={extraCount}
                  onChange={(e) => setExtraCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 border border-borderColor rounded-lg font-bold text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-borderColor">
                <button
                  type="button"
                  onClick={() => setIsExtraModalOpen(false)}
                  className="btn-secondary py-2 px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={extraLoading}
                  className="btn-primary py-2 px-4 text-xs font-bold"
                >
                  {extraLoading ? 'Adding...' : `Add ${extraCount} Lessons`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
