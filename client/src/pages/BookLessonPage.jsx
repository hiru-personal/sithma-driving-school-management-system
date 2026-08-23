import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Calendar as CalendarIcon,
  Clock,
  Car,
  Bike,
  Bus,
  CheckCircle2,
  AlertCircle,
  MapPin,
  User,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  X,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function BookLessonPage() {
  const { student, updateStudentData } = useAuth();

  const [selectedBranch, setSelectedBranch] = useState(student?.branch || 'Maharagama');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedVehicle, setSelectedVehicle] = useState('Car');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Booking Modal State
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await api.get('/slots', {
        params: {
          branch: selectedBranch,
          date: selectedDate,
          vehicleCategory: selectedVehicle === 'HeavyVehicle_Bus' ? 'Heavy' : 'Light',
        },
      });
      if (res.data.success) {
        setSlots(res.data.slots);
      }
    } catch (err) {
      toast.error('Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedBranch, selectedDate, selectedVehicle]);

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    setBookingLoading(true);
    try {
      const res = await api.post('/bookings', {
        timeSlotId: selectedSlot._id,
        vehicleType: selectedVehicle,
        lessonType: 'regular',
      });

      if (res.data.success) {
        toast.success('🎉 Lesson booked successfully!');
        setSelectedSlot(null);
        fetchSlots();

        // Refresh student data in context
        if (student?._id) {
          const profileRes = await api.get(`/students/${student._id}`);
          if (profileRes.data.success) {
            updateStudentData(profileRes.data.student);
          }
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book lesson');
    } finally {
      setBookingLoading(false);
    }
  };

  const isDmtBlocked =
    student?.studentType === 'Type1_NewLearner' && !student?.dmtDates?.learnerExamPassed;

  const lessonsRemaining =
    (student?.package?.lessonsTotal || 15) +
    (student?.package?.additionalLessonsRequested || 0) -
    (student?.package?.lessonsUsed || 0);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> On-Road Practical Training
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2 drop-shadow">
            <CalendarIcon className="w-6 h-6 text-cyan-400" /> Book a Practical Driving Lesson
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Select your branch, date, vehicle type, and preferred 1-hour session time.
          </p>
        </div>

        {/* Balance badge */}
        <div className="flex items-center gap-2">
          <div className="card p-3 flex items-center gap-3 bg-slate-900/80 border border-white/15">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-black text-sm">
              {lessonsRemaining}
            </div>
            <div className="text-xs">
              <p className="font-bold text-white">Lessons Remaining</p>
              <p className="text-slate-400 text-[11px]">in your active package</p>
            </div>
          </div>
        </div>
      </div>

      {/* DMT Pass Requirement Alert */}
      {isDmtBlocked && (
        <div className="p-4 bg-amber-500/10 border border-amber-400/30 rounded-2xl backdrop-blur-md flex items-start gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">
              Department of Motor Traffic (DMT) Learner Written Exam Prerequisite
            </p>
            <p className="text-slate-300 mt-0.5">
              As a <strong>Type 1 (New Learner)</strong> student, you must pass the DMT written examination before starting practical on-road trial lessons. You can update your exam pass date in your{' '}
              <Link to="/student/dashboard" className="font-bold underline text-cyan-300">
                Student Dashboard
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      {/* Control Filters (Branch, Date, Vehicle) */}
      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Branch Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Training Branch:
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-white/15 rounded-xl text-xs bg-slate-950/80 text-cyan-300 font-bold outline-none"
            >
              <option value="Maharagama">Maharagama Branch</option>
              <option value="Werahara">Werahara Branch</option>
              <option value="Delgoda">Delgoda Branch</option>
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Lesson Date:
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950/80 text-white rounded-xl text-xs font-medium outline-none"
            />
          </div>

          {/* Vehicle Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Vehicle Type:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'Car', label: 'Car', icon: Car },
                { id: 'Bike', label: 'Bike', icon: Bike },
                { id: 'ThreeWheeler', label: '3-Wheel', icon: Car },
                { id: 'HeavyVehicle_Bus', label: 'Bus', icon: Bus },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVehicle(v.id)}
                  className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    selectedVehicle === v.id
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)] border border-cyan-300'
                      : 'bg-white/5 text-slate-300 hover:bg-white/15 border border-white/10'
                  }`}
                >
                  <v.icon className="w-3.5 h-3.5" />
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" /> Available Session Slots for {selectedDate}
          </h2>
          <span className="text-xs text-slate-400">Standard session: 1 hour (2 x 30-min units)</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-cyan-400" /> Loading branch schedule...
          </div>
        ) : slots.length === 0 ? (
          <div className="card text-center py-10 space-y-2">
            <Clock className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No time slots scheduled for this date</p>
            <p className="text-xs text-slate-400">Please choose another date or contact the branch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {slots.map((slot) => {
              const isBooked = slot.status === 'booked' || !!slot.bookedBy;
              const hasInstructor = !!slot.instructorId;

              return (
                <div
                  key={slot._id}
                  className={`card p-5 flex flex-col justify-between space-y-4 border transition-all ${
                    isBooked
                      ? 'bg-slate-950/40 border-white/5 opacity-50'
                      : 'border-white/15 hover:border-cyan-400/40 card-hover bg-slate-900/70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-extrabold text-white">
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <span
                        className={`badge ${
                          isBooked
                            ? 'badge-danger bg-rose-500/10 text-rose-400'
                            : 'badge-success'
                        }`}
                      >
                        {isBooked ? 'Booked' : 'Available'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-400">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {slot.branch} Branch
                      </p>
                      <p className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        Instructor:{' '}
                        {hasInstructor ? (
                          <strong className="text-white">{slot.instructorId?.name}</strong>
                        ) : (
                          <span className="text-amber-300 font-medium">To be assigned</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isBooked || isDmtBlocked || lessonsRemaining <= 0}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      isBooked
                        ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                        : 'btn-accent text-slate-950 hover:scale-105'
                    }`}
                  >
                    {isBooked ? 'Slot Unavailable' : 'Book This Slot'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Confirmation Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" /> Confirm Lesson Booking
              </h3>
              <button
                onClick={() => setSelectedSlot(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-bold text-white">
                  {format(new Date(selectedSlot.date), 'EEEE, MMMM dd, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time:</span>
                <span className="font-bold text-cyan-300">
                  {selectedSlot.startTime} – {selectedSlot.endTime} (1 Hour)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Branch:</span>
                <span className="font-bold text-white">{selectedSlot.branch} Branch</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle Type:</span>
                <span className="font-bold text-accent">{selectedVehicle}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-slate-400">Assigned Instructor:</span>
                <span className="font-bold text-white">
                  {selectedSlot.instructorId?.name || 'Will be assigned by branch'}
                </span>
              </div>
            </div>

            {/* Package Impact Summary */}
            <div className="p-3.5 bg-cyan-500/10 border border-cyan-400/20 rounded-xl text-xs text-slate-200 space-y-1">
              <p className="font-bold text-cyan-300">Package Deduction:</p>
              <div className="flex justify-between">
                <span>Current Lessons Remaining:</span>
                <span className="font-bold">{lessonsRemaining}</span>
              </div>
              <div className="flex justify-between">
                <span>After Booking:</span>
                <span className="font-bold text-cyan-300">{lessonsRemaining - 1} Remaining</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bookingLoading}
                onClick={handleConfirmBooking}
                className="btn-primary text-xs py-2 px-5 font-bold"
              >
                {bookingLoading ? 'Confirming...' : 'Confirm & Reserve Slot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
