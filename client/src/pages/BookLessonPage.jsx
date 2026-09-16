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

  // Reschedule Modal State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [preferredRescheduleDate, setPreferredRescheduleDate] = useState('');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [myRescheduleRequests, setMyRescheduleRequests] = useState([]);

  const fetchMyRescheduleRequests = async () => {
    try {
      const res = await api.get('/students/trial-date/reschedule');
      if (res.data.success) {
        setMyRescheduleRequests(res.data.requests);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchMyRescheduleRequests();
  }, []);

  const handleSubmitReschedule = async (e) => {
    e.preventDefault();
    setSubmittingReschedule(true);
    try {
      const res = await api.post('/students/trial-date/reschedule', {
        reason: rescheduleReason,
        preferredDate: preferredRescheduleDate,
      });
      if (res.data.success) {
        toast.success('Trial date reschedule request submitted successfully!');
        setRescheduleReason('');
        setPreferredRescheduleDate('');
        setShowRescheduleModal(false);
        fetchMyRescheduleRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit reschedule request');
    } finally {
      setSubmittingReschedule(false);
    }
  };

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

  // Shared Trial Date Tracking
  const hasTrialDate = Boolean(student?.trial_date);
  const trialDateObj = hasTrialDate ? new Date(student.trial_date) : null;
  const isTrialDatePassed = Boolean(
    trialDateObj && new Date().getTime() > new Date(trialDateObj).setHours(23, 59, 59, 999)
  );
  const daysUntilTrial = trialDateObj
    ? Math.max(0, Math.ceil((new Date(trialDateObj).setHours(23, 59, 59, 999) - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

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

    // Gate 1b: Type 2 Trial Date Requirement Gate
    if (isType2 && !hasTrialDate) {
      toast.error('Your practical trial date has not been set yet by the branch officer. Please contact your branch data entry officer to schedule your trial date before booking lessons.');
      return;
    }

    // Gate 1c: Trial Date Passed Gate
    if (isTrialDatePassed) {
      toast.error('Your practical trial date has already passed. Please contact the branch officer to reschedule your trial date.');
      return;
    }

    // Gate 1d: Selected Slot after Trial Date Gate
    if (trialDateObj && selectedSlot) {
      const slotTime = new Date(selectedSlot.date).setHours(0, 0, 0, 0);
      const trialLimit = new Date(trialDateObj).setHours(23, 59, 59, 999);
      if (slotTime > trialLimit) {
        toast.error(`You can only book lessons up until your scheduled Trial Date (${trialDateObj.toISOString().split('T')[0]}). Please choose an earlier slot.`);
        return;
      }
    }

    // Gate 2: Package Payment Gate
    if (!isPackagePaymentConfirmed && lessonsRemaining <= 0) {
      if (isPackagePaymentPending) {
        toast.error('Payment Pending Verification: Your course package payment slip is awaiting branch officer verification.');
      } else {
        toast.error('Package Payment Required: Please select and pay for your course package to unlock lessons for booking.');
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

      {/* Shared Trial Date Tracking Banner (Visible to both Type 1 and Type 2) */}
      {hasTrialDate ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/95 via-purple-950/40 to-slate-900/95 border border-purple-400/30 shadow-[0_0_25px_rgba(168,85,247,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold flex-shrink-0">
              <CalendarIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge bg-purple-500/20 text-purple-300 border border-purple-400/40 text-[10px] font-extrabold uppercase">
                  Practical Trial Exam Scheduled
                </span>
                {isTrialDatePassed ? (
                  <span className="badge bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                    Trial Date Passed
                  </span>
                ) : (
                  <span className="badge bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-bold">
                    {daysUntilTrial} Days Remaining
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-white mt-1">
                Trial Date: {format(new Date(student.trial_date), 'EEEE, MMMM dd, yyyy')}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {isTrialDatePassed
                  ? 'Your scheduled trial date has passed and lesson booking is locked. Please request a trial date reschedule below.'
                  : 'You can book practical driving lessons up until this scheduled trial date.'}
              </p>

              {/* Pending Request Notice */}
              {myRescheduleRequests.find((r) => r.status === 'Pending') && (
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>Trial Date Reschedule Request is currently pending DEO review</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(true)}
                  className={`btn-accent text-xs py-2 px-4 font-bold flex items-center gap-1.5 shadow ${
                    isTrialDatePassed ? 'ring-2 ring-purple-400 animate-pulse' : ''
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {isTrialDatePassed ? 'Request Trial Date Reschedule' : 'Request Date Reschedule'}
                </button>
              </div>
            </div>
          </div>
          {student.trial_date_set_by && (
            <div className="text-xs text-slate-400 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10 flex-shrink-0">
              Scheduled by:{' '}
              <strong className="text-white">
                {student.trial_date_set_by?.name || 'Branch Staff'}
              </strong>
            </div>
          )}
        </div>
      ) : isType2 ? (
        <div className="p-5 rounded-2xl bg-amber-500/15 border border-amber-400/40 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-warning text-[10px] font-extrabold uppercase">
                  Action Required
                </span>
                <span className="text-xs font-bold text-amber-300">
                  Trial Date Not Scheduled Yet
                </span>
              </div>
              <h4 className="text-sm font-black text-white mt-1">
                Branch Officer Scheduling Required
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Under DMT regulations, your branch Data Entry Officer must set your official practical trial exam date before practical lesson sessions can be reserved.
              </p>
            </div>
          </div>
          <div className="bg-slate-950/70 border border-amber-400/20 rounded-xl p-3 text-xs text-amber-200 whitespace-nowrap">
            Contact Branch: <strong className="text-white">011-2849201</strong>
          </div>
        </div>
      ) : null}

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
                  : 'Please select and pay for your course package to unlock practical driving lessons.'}
              </p>
            </div>
          </div>
          <Link
            to={isType2 ? "/student/payments" : "/student/dashboard"}
            className="btn-accent text-xs py-2 px-4 font-bold whitespace-nowrap"
          >
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {slots.map((slot) => {
              const bookedCount = slot.bookedCount || 0;
              const capacity = slot.capacity || 10;
              const isFull = slot.isFull || bookedCount >= capacity || slot.status === 'full';
              const remainingSpots = slot.remainingSpots !== undefined ? slot.remainingSpots : Math.max(0, capacity - bookedCount);
              const fillPercentage = Math.min(100, Math.round((bookedCount / capacity) * 100));
              const isStudentAlreadyBooked = Boolean(slot.isStudentBooked);
              const hasInstructor = !!slot.instructorId;

              const isSlotPastTrial = Boolean(
                trialDateObj && new Date(slot.date).setHours(0, 0, 0, 0) > new Date(trialDateObj).setHours(23, 59, 59, 999)
              );
              const isLockedByTrial = (isType2 && !hasTrialDate) || isTrialDatePassed || isSlotPastTrial;
              const isLockedByExam = isType1 && !isTrialEligible;
              const isLockedByPackage = (!isPackagePaymentConfirmed && lessonsRemaining <= 0) || isPackagePaymentPending;
              const isLockedByQuota = lessonsRemaining <= 0;

              const isDisabled =
                isStudentAlreadyBooked ||
                isFull ||
                isLockedByTrial ||
                isLockedByExam ||
                isLockedByPackage ||
                isLockedByQuota;

              return (
                <div
                  key={slot._id}
                  className={`card p-5 flex flex-col justify-between space-y-4 border transition-all ${
                    isStudentAlreadyBooked
                      ? 'bg-emerald-950/25 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : isFull
                      ? 'bg-slate-950/50 border-white/5 opacity-60'
                      : 'border-white/15 hover:border-cyan-400/40 card-hover bg-slate-900/80'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header with Time & Capacity Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-white">
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <span
                        className={`badge text-[10px] font-bold ${
                          isStudentAlreadyBooked
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isFull
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : bookedCount > 0
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                            : 'badge-success'
                        }`}
                      >
                        {isStudentAlreadyBooked
                          ? '✓ Booked by You'
                          : isFull
                          ? 'FULL (10/10)'
                          : `${remainingSpots} spots left`}
                      </span>
                    </div>

                    {/* Lesson Title & Topic */}
                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug">
                        {slot.lessonTitle || `${slot.vehicleType || selectedVehicle} Practical Session`}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {slot.lessonTopic || 'Dual-control road training, clutch control, and maneuvers.'}
                      </p>
                    </div>

                    {/* Branch & Instructor */}
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-white/5 space-y-1 text-xs text-slate-300">
                      <p className="flex items-center gap-1.5 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {slot.branch} Branch
                      </p>
                      <p className="flex items-center gap-1.5 text-[11px]">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        Instructor:{' '}
                        {hasInstructor ? (
                          <strong className="text-white">{slot.instructorId?.name}</strong>
                        ) : (
                          <span className="text-amber-300 font-medium">To be assigned</span>
                        )}
                      </p>
                    </div>

                    {/* 10-Student Capacity Meter */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Class Attendance:</span>
                        <strong className="text-slate-200">
                          {bookedCount} / {capacity} Students
                        </strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-white/10">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFull
                              ? 'bg-rose-500'
                              : fillPercentage >= 70
                              ? 'bg-amber-400'
                              : 'bg-cyan-400'
                          }`}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    disabled={isDisabled}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      isStudentAlreadyBooked
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : isFull
                        ? 'bg-rose-500/10 text-rose-400/60 border border-rose-500/20 cursor-not-allowed'
                        : isType2 && !hasTrialDate
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 cursor-not-allowed'
                        : isTrialDatePassed
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 cursor-not-allowed'
                        : isSlotPastTrial
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 cursor-not-allowed'
                        : isLockedByExam
                        ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                        : isPackagePaymentPending
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 cursor-not-allowed'
                        : isLockedByPackage
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 cursor-not-allowed'
                        : isLockedByQuota
                        ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                        : 'btn-accent text-slate-950 hover:scale-105 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    }`}
                  >
                    {isStudentAlreadyBooked
                      ? '✓ You Are Enrolled in This Lesson'
                      : isFull
                      ? 'Lesson Full (10/10 Limit)'
                      : isType2 && !hasTrialDate
                      ? 'Trial Date Required to Book'
                      : isTrialDatePassed
                      ? 'Trial Date Has Passed'
                      : isSlotPastTrial
                      ? 'Slot is After Trial Date'
                      : isLockedByExam
                      ? 'DMT Theory Exam Pass Required'
                      : isPackagePaymentPending
                      ? 'Payment Pending Officer Approval'
                      : isLockedByPackage
                      ? 'Course Package Payment Required'
                      : isLockedByQuota
                      ? student?.paymentPlan === 'single'
                        ? 'Single Lesson Quota Used (Pay in Dashboard)'
                        : 'No Lessons Remaining (Pay Next Installment)'
                      : 'Book This Lesson'}
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

      {/* Reschedule Request Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-400/30 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="absolute right-5 top-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 font-semibold text-xs mb-1">
                <Clock className="w-3.5 h-3.5" /> DMT Exam Scheduling
              </div>
              <h3 className="text-xl font-black text-white">Request Trial Date Reschedule</h3>
              <p className="text-xs text-slate-300">
                Submit a reschedule request to your branch Data Entry Officer. Upon approval, your practical trial date will be updated and lesson booking access will reopen automatically.
              </p>
            </div>

            <form onSubmit={handleSubmitReschedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Current Scheduled Trial Date:
                </label>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10 text-white font-bold text-sm">
                  {student?.trial_date ? format(new Date(student.trial_date), 'MMMM dd, yyyy') : 'None'}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Reason for Reschedule Request: <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g., Medical reasons, exam clash, or need more preparation..."
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none focus:border-purple-400 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Preferred New Trial Date (Optional):
                </label>
                <input
                  type="date"
                  value={preferredRescheduleDate}
                  onChange={(e) => setPreferredRescheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl outline-none focus:border-purple-400 text-xs font-bold"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Final trial date assignment will be confirmed by DMT and your branch Data Entry Officer.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  disabled={submittingReschedule}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReschedule || !rescheduleReason.trim()}
                  className="btn-accent text-xs py-2 px-5 font-bold flex items-center gap-1.5 shadow"
                >
                  {submittingReschedule ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Submit Reschedule Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

