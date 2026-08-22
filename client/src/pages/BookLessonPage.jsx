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
    <div className="min-h-screen bg-neutralBg py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderColor pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textMain font-heading flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" /> Book a Practical Driving Lesson
          </h1>
          <p className="text-xs text-textMuted mt-0.5">
            Select your branch, date, vehicle type, and preferred 1-hour session time.
          </p>
        </div>

        {/* Balance badge */}
        <div className="flex items-center gap-2">
          <div className="card p-3 bg-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary font-bold">
              {lessonsRemaining}
            </div>
            <div className="text-xs">
              <p className="font-bold text-textMain">Lessons Remaining</p>
              <p className="text-textMuted text-[11px]">in your active package</p>
            </div>
          </div>
        </div>
      </div>

      {/* DMT Pass Requirement Alert */}
      {isDmtBlocked && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-accent-dark flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900">
              Department of Motor Traffic (DMT) Learner Written Exam Prerequisite
            </p>
            <p className="text-amber-800 mt-0.5">
              As a <strong>Type 1 (New Learner)</strong> student, you must pass the DMT written examination before starting practical on-road trial lessons. You can update your exam pass date in your{' '}
              <Link to="/student/dashboard" className="font-bold underline text-primary">
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
            <label className="block text-xs font-semibold text-textMain mb-1">
              Select Training Branch:
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2.5 border border-borderColor rounded-lg text-xs bg-white focus:ring-2 focus:ring-primary outline-none font-semibold text-primary"
            >
              <option value="Maharagama">Maharagama Branch</option>
              <option value="Werahara">Werahara Branch</option>
              <option value="Delgoda">Delgoda Branch</option>
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">
              Select Lesson Date:
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-borderColor rounded-lg text-xs bg-white focus:ring-2 focus:ring-primary outline-none font-medium"
            />
          </div>

          {/* Vehicle Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">
              Vehicle Type:
            </label>
            <div className="grid grid-cols-4 gap-1">
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
                  className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                    selectedVehicle === v.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-neutralBg text-textMuted hover:bg-slate-200'
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
          <h2 className="text-base font-bold text-textMain flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Available Session Slots for {selectedDate}
          </h2>
          <span className="text-xs text-textMuted">Standard session: 1 hour (2 x 30-min units)</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-textMuted flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-primary" /> Loading branch schedule...
          </div>
        ) : slots.length === 0 ? (
          <div className="card text-center py-10 space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-textMain">No time slots scheduled for this date</p>
            <p className="text-xs text-textMuted">Please choose another date or contact the branch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {slots.map((slot) => {
              const isBooked = slot.status === 'booked' || !!slot.bookedBy;
              const hasInstructor = !!slot.instructorId;

              return (
                <div
                  key={slot._id}
                  className={`card p-5 flex flex-col justify-between space-y-4 border-2 transition-all ${
                    isBooked
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'border-borderColor hover:border-primary/50 card-hover bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-extrabold text-textMain">
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <span
                        className={`badge ${
                          isBooked
                            ? 'badge-danger bg-slate-200 text-slate-700'
                            : 'badge-success'
                        }`}
                      >
                        {isBooked ? 'Booked' : 'Available'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-textMuted">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {slot.branch} Branch
                      </p>
                      <p className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-accent-dark" />
                        Instructor:{' '}
                        {hasInstructor ? (
                          <strong className="text-textMain">{slot.instructorId?.name}</strong>
                        ) : (
                          <span className="text-warning-dark font-medium">To be assigned</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isBooked || isDmtBlocked || lessonsRemaining <= 0}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                      isBooked
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'btn-accent text-textMain hover:bg-accent-dark hover:text-white'
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-borderColor pb-3">
              <h3 className="text-base font-bold text-textMain flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> Confirm Lesson Booking
              </h3>
              <button
                onClick={() => setSelectedSlot(null)}
                className="text-slate-400 hover:text-textMain text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-neutralBg p-4 rounded-xl border border-borderColor">
              <div className="flex justify-between">
                <span className="text-textMuted">Date:</span>
                <span className="font-bold text-textMain">
                  {format(new Date(selectedSlot.date), 'EEEE, MMMM dd, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-textMuted">Time:</span>
                <span className="font-bold text-primary">
                  {selectedSlot.startTime} – {selectedSlot.endTime} (1 Hour)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-textMuted">Branch:</span>
                <span className="font-bold text-textMain">{selectedSlot.branch} Branch</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textMuted">Vehicle Type:</span>
                <span className="font-bold text-accent-dark">{selectedVehicle}</span>
              </div>
              <div className="flex justify-between border-t border-borderColor pt-2">
                <span className="text-textMuted">Assigned Instructor:</span>
                <span className="font-bold text-textMain">
                  {selectedSlot.instructorId?.name || 'Will be assigned by branch'}
                </span>
              </div>
            </div>

            {/* Package Impact Summary */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
              <p className="font-bold">Package Deduction:</p>
              <div className="flex justify-between">
                <span>Current Lessons Remaining:</span>
                <span className="font-bold">{lessonsRemaining}</span>
              </div>
              <div className="flex justify-between">
                <span>After Booking:</span>
                <span className="font-bold text-primary">{lessonsRemaining - 1} Remaining</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-borderColor">
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="btn-secondary text-xs py-2 px-3"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bookingLoading}
                onClick={handleConfirmBooking}
                className="btn-primary text-xs py-2 px-4 font-bold"
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
