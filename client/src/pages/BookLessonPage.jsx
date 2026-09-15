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
  const [lessonType, setLessonType] = useState('regular'); // 'regular' | 'trial'
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

  const isType1 = Boolean(
    student?.studentType === 'Type1_NewLearner' ||
    student?.studentType === 'Type 1' ||
    student?.student_type === 'Type 1'
  );
  const isType2 = Boolean(
    student?.studentType === 'Type2_TrialReady' ||
    student?.studentType === 'Type 2' ||
    student?.student_type === 'Type 2'
  );
  const isExamPassed = Boolean(
    student?.learnerExamStatus === 'passed' ||
    student?.dmtDates?.learnerExamPassed
  );
  const isTrialEligible = Boolean(isType2 || isExamPassed);
  const isPackagePaymentConfirmed = student?.packagePaymentStatus === 'confirmed';
  const isPackagePaymentPending = student?.packagePaymentStatus === 'pending';

  const unlockedCount =
    student?.lessonsUnlocked !== undefined && student?.lessonsUnlocked !== null
      ? student.lessonsUnlocked
      : (student?.package?.lessonsTotal || 15) + (student?.package?.additionalLessonsRequested || 0);
  const usedCount = student?.lessonsUsed || student?.package?.lessonsUsed || 0;
  const lessonsRemaining = Math.max(0, unlockedCount - usedCount);
  const isMonthlyPlan = student?.paymentPlan === 'monthly';

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    // Gate 1: Type 1 Learner Exam Gate (US-09)
    if (isType1 && !isTrialEligible) {
      toast.error('DMT Requirement (US-09): Practical & trial lessons can only be booked after passing your Learner Written Exam.');
      return;
    }

    // Gate 2: Package Payment Gate
    if (!isPackagePaymentConfirmed && lessonsRemaining <= 0) {
      if (isPackagePaymentPending) {
        toast.error('Your course package payment is awaiting branch officer verification.');
      } else {
        toast.error('Please select and pay for your course package to unlock lessons for booking.');
      }
      return;
    }

    // Gate 3: Quota / Lesson Count Gate
    if (lessonsRemaining <= 0) {
      if (isMonthlyPlan) {
        toast.error('Monthly Quota Reached: You have completed all unlocked lessons for this billing month (max 4). Please submit next month payment or buy extra lessons in Profile.');
      } else {
        toast.error('All lessons in your course package have been used. Please buy additional lessons in your Profile to continue booking.');
      }
      return;
    }

    setBookingLoading(true);
    try {
      const res = await api.post('/bookings', {
        timeSlotId: selectedSlot._id,
        vehicleType: selectedVehicle,
        lessonType,
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

  // ─────────────────────────────────────────────────────────────
  // US-09: TYPE 1 STUDENTS WHO HAVE NOT PASSED EXAM CANNOT VIEW
  // OR ACCESS THE LESSON BOOKING DASHBOARD
  // ─────────────────────────────────────────────────────────────
  if (isType1 && !isTrialEligible) {
    const examStatusText =
      student?.learnerExamStatus === 'failed'
        ? 'Failed (Requires Retake)'
        : student?.dmtDates?.learnerExamDate
        ? `Scheduled for ${new Date(student.dmtDates.learnerExamDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })} (Not Yet Faced)`
        : 'Not Yet Faced / Date Not Yet Scheduled';

    return (
      <div className="py-10 px-4 sm:px-6 lg:px-10 max-w-4xl mx-auto w-full space-y-8">
        {/* US-09 DMT Gate Lock Card */}
        <div className="backdrop-blur-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 rounded-3xl p-8 sm:p-10 border-2 border-cyan-400/40 shadow-[0_0_50px_rgba(6,182,212,0.18)] space-y-6 relative overflow-hidden text-center">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          <div className="w-20 h-20 rounded-3xl bg-cyan-500/15 border-2 border-cyan-400/40 flex items-center justify-center text-cyan-300 mx-auto shadow-inner">
            <ShieldAlert className="w-10 h-10 text-cyan-400 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="badge badge-warning text-xs font-bold uppercase tracking-wider">
              DMT Regulation US-09 • Practical Training Locked
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Learner Exam Pass Required
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              As a <strong>Type 1 (New Learner)</strong>, Department of Motor Traffic (DMT) regulations require you to officially <strong>face and pass your DMT Learner's Written Exam</strong> before practical driving or trial lessons can be scheduled.
            </p>
          </div>

          {/* Current Milestone Status Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left max-w-2xl mx-auto pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold block">1. Medical Exam</span>
              <div className="text-xs font-bold text-white">
                {student?.dmtDates?.medicalExamPassed ? '✓ Cleared' : 'Pending Clearance'}
              </div>
              <span className={`badge text-[9px] ${student?.dmtDates?.medicalExamPassed ? 'badge-success' : 'badge-warning'}`}>
                {student?.dmtDates?.medicalExamPassed ? 'Passed' : 'Pending'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold block">2. DMT Registration</span>
              <div className="text-xs font-bold text-white">
                {student?.dmtDates?.learnerRegistrationDate ? '✓ Enrolled' : 'In Progress'}
              </div>
              <span className="badge badge-info text-[9px]">
                {student?.dmtDates?.learnerRegistrationDate ? 'Registered' : 'Processing'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 space-y-1">
              <span className="text-[11px] text-cyan-300 font-bold block">3. Learner Exam (US-09)</span>
              <div className="text-xs font-bold text-white">
                {examStatusText}
              </div>
              <span className={`badge text-[9px] ${student?.learnerExamStatus === 'failed' ? 'badge-warning' : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'}`}>
                {student?.learnerExamStatus === 'failed' ? 'Failed' : 'Exam Not Passed'}
              </span>
            </div>
          </div>

          {/* Explanation banner */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 max-w-2xl mx-auto text-left flex items-start gap-3">
            <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">What happens next?</strong>
              <p className="mt-0.5">
                Once you sit for your exam and your branch Data Entry Officer records your result as <strong>"Passed"</strong>, this practical lesson booking dashboard will unlock automatically. You will then be able to choose your course package and start booking trial sessions.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-center">
            <Link
              to="/student/dashboard"
              className="btn-accent text-xs py-3 px-6 font-bold shadow-lg flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> Return to Student Dashboard & Track Milestones
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> On-Road Practical & Trial Training
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
              <p className="text-slate-400 text-[11px]">
                {isMonthlyPlan ? `Monthly quota: ${usedCount}/${unlockedCount} used` : 'in your active course package'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Package Payment Pending or Required Warning (US-09 Payment Gate) */}
      {!isPackagePaymentConfirmed && lessonsRemaining <= 0 && (
        <div className="p-4 bg-amber-500/15 border border-amber-400/30 rounded-2xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300 text-sm">
                Course Package Payment Required Before Booking
              </p>
              <p className="text-slate-300 mt-0.5">
                {isPackagePaymentPending
                  ? 'Your course package payment slip is awaiting review by our branch officer. Lessons will unlock immediately once confirmed.'
                  : 'You have cleared the DMT Learner Exam! Please select and pay for your course package to unlock practical driving lessons.'}
              </p>
            </div>
          </div>
          <Link to="/student/dashboard" className="btn-accent text-xs py-2 px-4 font-bold whitespace-nowrap">
            {isPackagePaymentPending ? 'Check Payment Status' : 'Select Package & Pay'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Monthly Plan Quota Cap Warning */}
      {isMonthlyPlan && lessonsRemaining <= 0 && isPackagePaymentConfirmed && (
        <div className="p-4 bg-amber-500/15 border border-amber-400/30 rounded-2xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white text-sm">Monthly Quota Reached ({unlockedCount} Lessons):</strong>
              <p className="mt-0.5">
                You have completed all {unlockedCount} lessons unlocked for this billing month under your monthly installment plan. Pay next month's installment or buy additional lessons to continue booking.
              </p>
            </div>
          </div>
          <Link to="/student/profile" className="btn-secondary text-xs py-2 px-4 font-bold whitespace-nowrap">
            Buy Extra Lessons in Profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Package Lessons Exhausted Banner */}
      {!isMonthlyPlan && lessonsRemaining <= 0 && isPackagePaymentConfirmed && (
        <div className="p-4 bg-purple-500/15 border border-purple-400/30 rounded-2xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-purple-200">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white text-sm">All Course Package Lessons Completed!</strong>
              <p className="mt-0.5">
                You have used all {unlockedCount} lessons in your package. Need extra on-road practice before your DMT practical trial? You can buy additional lessons anytime in your profile.
              </p>
            </div>
          </div>
          <Link to="/student/profile" className="btn-accent text-xs py-2 px-4 font-bold whitespace-nowrap">
            Buy Additional Lessons in Profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
                    disabled={isBooked || isType2PackagePending || lessonsRemaining <= 0}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      isBooked || isType2PackagePending || lessonsRemaining <= 0
                        ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                        : 'btn-accent text-slate-950 hover:scale-105'
                    }`}
                  >
                    {isBooked
                      ? 'Slot Unavailable'
                      : isType2PackagePending
                      ? 'Package Payment Required'
                      : lessonsRemaining <= 0
                      ? 'No Lessons Remaining'
                      : 'Book This Slot'}
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

            {/* Lesson Category Selector (Regular vs Trial - US-09) */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-slate-300">
                Lesson Type:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLessonType('regular')}
                  className={`p-2.5 rounded-xl border font-bold text-xs transition-all ${
                    lessonType === 'regular'
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                      : 'border-white/10 bg-white/5 text-slate-300'
                  }`}
                >
                  Regular Lesson
                </button>
                <button
                  type="button"
                  onClick={() => setLessonType('trial')}
                  className={`p-2.5 rounded-xl border font-bold text-xs transition-all ${
                    lessonType === 'trial'
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : 'border-white/10 bg-white/5 text-slate-300'
                  }`}
                >
                  Trial Lesson (US-09)
                </button>
              </div>
            </div>

            {/* Trial Gate Warning for Type 1 (US-09) */}
            {lessonType === 'trial' && isType1 && !isTrialEligible && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>US-09 Gate Restricted:</strong> Trial lessons can only be booked after your Learner Written Exam is officially marked <strong>Passed</strong> by the branch Data Entry Officer.
                </p>
              </div>
            )}

            {/* Package Impact Summary */}
            <div className="p-3.5 bg-cyan-500/10 border border-cyan-400/20 rounded-xl text-xs text-slate-200 space-y-1">
              <p className="font-bold text-cyan-300">Lesson Balance Impact:</p>
              <div className="flex justify-between">
                <span>Available Lessons Unlocked:</span>
                <span className="font-bold">{lessonsRemaining}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining After Booking:</span>
                <span className="font-bold text-cyan-300">{Math.max(0, lessonsRemaining - 1)} Remaining</span>
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
                disabled={bookingLoading || (lessonType === 'trial' && isType1 && !isTrialEligible)}
                onClick={handleConfirmBooking}
                className="btn-primary text-xs py-2 px-5 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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

