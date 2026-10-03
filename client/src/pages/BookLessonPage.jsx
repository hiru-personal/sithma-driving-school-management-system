import React, { useState, useEffect, useMemo } from 'react';
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
  AlertTriangle,
  MapPin,
  User,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  RefreshCw,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const safeFormatDate = (dateVal, formatStr = 'EEEE, MMMM dd, yyyy', fallback = 'None') => {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
};

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
  const isTrialPassed = Boolean(
    student?.trial?.licenseObtained ||
    student?.isPassed ||
    student?.trial?.attempts?.some((a) => a.result === 'passed')
  );
  const isPackagePaymentConfirmed = student?.packagePaymentStatus === 'confirmed';
  const isPackagePaymentPending = student?.packagePaymentStatus === 'pending';

  // Shared Trial Date Tracking & Cut-off enforcement (Rules 1 & 4)
  const hasTrialDate = Boolean(student?.trial_date && !isNaN(new Date(student.trial_date).getTime()));
  const trialDateObj = hasTrialDate ? new Date(student.trial_date) : null;
  const isTrialDatePassed = Boolean(
    trialDateObj && new Date().setHours(0, 0, 0, 0) >= new Date(trialDateObj).setHours(0, 0, 0, 0)
  );
  const daysUntilTrial = trialDateObj
    ? Math.max(0, Math.ceil((new Date(trialDateObj).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)))
    : null;

  const maxBookingDate = useMemo(() => {
    if (!trialDateObj) return undefined;
    const maxD = new Date(trialDateObj);
    maxD.setDate(maxD.getDate() - 1);
    return maxD.toISOString().split('T')[0];
  }, [trialDateObj]);

  const isSelectedDateOnOrAfterTrial = useMemo(() => {
    if (!trialDateObj || !selectedDate) return false;
    return new Date(selectedDate).setHours(0, 0, 0, 0) >= new Date(trialDateObj).setHours(0, 0, 0, 0);
  }, [trialDateObj, selectedDate]);

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

    // Gate 1d: Selected Slot on or after Trial Date Gate (Rules 1 & 4)
    if (trialDateObj && selectedSlot) {
      const slotTime = new Date(selectedSlot.date).setHours(0, 0, 0, 0);
      const trialLimit = new Date(trialDateObj).setHours(23, 59, 59, 999);
      if (slotTime > trialLimit) {
        toast.error(`You can only book lessons up until your scheduled Trial Date (${safeFormatDate(trialDateObj, 'yyyy-MM-dd')}). Please choose an earlier slot.`);
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
        toast.error('Monthly Quota Reached: You have completed all unlocked lessons for this billing month (max 4). Please submit next month payment or buy additional lessons on Dashboard.');
      } else {
        toast.error('All lessons in your course package have been used. Please select a package or buy additional lessons on Dashboard to continue booking.');
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
  // PRACTICAL TRIAL PASSED: TRAINING COMPLETED - BOOKING CLOSED
  // ─────────────────────────────────────────────────────────────
  if (isTrialPassed) {
    return (
      <div className="py-10 px-4 sm:px-6 lg:px-10 max-w-4xl mx-auto w-full space-y-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-emerald-300 shadow-xl space-y-6 relative overflow-hidden text-center">
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-700 mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Practical Training Completed ✓
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#152026]">
              Practical Trial Passed!
            </h1>
            <p className="text-sm text-[#475569] leading-relaxed">
              Congratulations! You have successfully passed your DMT Practical Driving Trial. Practical lesson bookings are now closed. Please visit your dashboard to upload your driving license certificate.
            </p>
          </div>

          <div className="pt-4">
            <Link
              to="/student/dashboard"
              className="btn-primary text-sm py-3 px-6 font-bold inline-flex items-center gap-2 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Student Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-[#D4EEF8] shadow-xl space-y-6 relative overflow-hidden text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#D4EEF8] border-2 border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59] mx-auto shadow-sm">
            <ShieldAlert className="w-10 h-10 text-[#1B3D59]" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-[#F3EED8] border border-[#6A97C0]/30 text-[#152026] text-xs font-bold uppercase tracking-wider">
              DMT Regulation US-09 • Practical Training Locked
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#152026]">
              Learner Exam Pass Required
            </h1>
            <p className="text-sm text-[#152026]/75 leading-relaxed">
              As a <strong>Type 1 (New Learner)</strong>, Department of Motor Traffic (DMT) regulations require you to officially <strong>face and pass your DMT Learner's Written Exam</strong> before practical driving or trial lessons can be scheduled.
            </p>
          </div>

          {/* Current Milestone Status Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left max-w-2xl mx-auto pt-2">
            <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-1">
              <span className="text-[11px] text-[#6A97C0] font-semibold block">1. Medical Exam</span>
              <div className="text-xs font-bold text-[#152026]">
                {student?.dmtDates?.medicalExamPassed ? '✓ Cleared' : 'Pending Clearance'}
              </div>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${student?.dmtDates?.medicalExamPassed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-[#F3EED8] text-[#152026] border border-[#D4EEF8]'}`}>
                {student?.dmtDates?.medicalExamPassed ? 'Passed' : 'Pending'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-1">
              <span className="text-[11px] text-[#6A97C0] font-semibold block">2. DMT Registration</span>
              <div className="text-xs font-bold text-[#152026]">
                {student?.dmtDates?.learnerRegistrationDate ? '✓ Enrolled' : 'In Progress'}
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4EEF8] text-[#1B3D59]">
                {student?.dmtDates?.learnerRegistrationDate ? 'Registered' : 'Processing'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F3EED8]/40 border border-[#6A97C0]/30 space-y-1">
              <span className="text-[11px] text-[#1B3D59] font-bold block">3. Learner Exam (US-09)</span>
              <div className="text-xs font-bold text-[#152026]">
                {examStatusText}
              </div>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${student?.learnerExamStatus === 'failed' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                {student?.learnerExamStatus === 'failed' ? 'Failed' : 'Exam Not Passed'}
              </span>
            </div>
          </div>

          {/* Explanation banner */}
          <div className="p-4 rounded-2xl bg-[#D4EEF8]/40 border border-[#D4EEF8] text-xs text-[#152026] max-w-2xl mx-auto text-left flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#1B3D59] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#152026] font-bold">What happens next?</strong>
              <p className="mt-0.5 text-[#152026]/80 leading-relaxed">
                Once you sit for your exam and your branch Data Entry Officer records your result as <strong>"Passed"</strong>, this practical lesson booking dashboard will unlock automatically. You will then be able to choose your course package and start booking trial sessions.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-center">
            <Link
              to="/student/dashboard"
              className="btn-primary text-xs py-3 px-6 font-bold shadow-md flex items-center gap-2"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4EEF8] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> On-Road Practical & Trial Training
          </div>
          <h1 className="text-2xl font-black text-[#152026] flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-[#1B3D59]" /> Book a Practical Driving Lesson
          </h1>
          <p className="text-xs text-[#6A97C0] mt-0.5">
            Select your branch, date, vehicle type, and preferred 1-hour session time.
          </p>
        </div>

        {/* Balance badge */}
        <div className="flex items-center gap-2">
          <div className="bg-white rounded-2xl p-3 flex items-center gap-3 border border-[#D4EEF8] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#D4EEF8] border border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59] font-black text-sm">
              {lessonsRemaining}
            </div>
            <div className="text-xs">
              <p className="font-bold text-[#152026]">Lessons Remaining</p>
              <p className="text-[#6A97C0] text-[11px]">
                {isMonthlyPlan ? `Monthly quota: ${usedCount}/${unlockedCount} used` : 'in your active course package'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Trial Date Tracking Banner (Visible to both Type 1 and Type 2) */}
      {hasTrialDate ? (
        <div className="p-5 rounded-2xl bg-white border border-[#D4EEF8] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D4EEF8] border border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59] font-bold flex-shrink-0">
              <CalendarIcon className="w-6 h-6 text-[#1B3D59]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#1B3D59] text-white text-[10px] font-extrabold uppercase tracking-wider">
                  Practical Trial Exam Scheduled
                </span>
                {isTrialDatePassed ? (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                    Trial Date Passed
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/30 text-[10px] font-bold">
                    {daysUntilTrial} Days Remaining
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-[#152026] mt-1">
                Trial Date: {safeFormatDate(student?.trial_date, 'EEEE, MMMM dd, yyyy')}
              </h3>
              <p className="text-xs text-[#152026]/75 mt-0.5">
                {isTrialDatePassed
                  ? 'Your scheduled trial date has arrived/passed and lesson booking is locked. Please request a trial date reschedule below.'
                  : 'You can book practical driving lessons only for dates before your scheduled trial date.'}
              </p>

              {/* Pending Request Notice */}
              {myRescheduleRequests.find((r) => r.status === 'Pending') && (
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl bg-[#F3EED8] border border-[#6A97C0]/30 text-[#152026] text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 animate-pulse text-[#1B3D59]" />
                  <span>Trial Date Reschedule Request is currently pending DEO review</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(true)}
                  className="btn-secondary text-xs py-2 px-4 font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5 text-[#1B3D59]" />
                  {isTrialDatePassed ? 'Request Trial Date Reschedule' : 'Request Date Reschedule'}
                </button>
              </div>
            </div>
          </div>
          {student.trial_date_set_by && (
            <div className="text-xs text-[#152026]/70 bg-[#FAFCFE] px-3.5 py-2 rounded-xl border border-[#D4EEF8] flex-shrink-0">
              Scheduled by:{' '}
              <strong className="text-[#152026]">
                {student.trial_date_set_by?.name || 'Branch Staff'}
              </strong>
            </div>
          )}
        </div>
      ) : isType2 ? (
        <div className="p-5 rounded-2xl bg-[#F3EED8] border border-[#6A97C0]/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4EEF8] border border-[#6A97C0]/40 flex items-center justify-center text-[#1B3D59] flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-[#1B3D59]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#1B3D59] text-white text-[10px] font-extrabold uppercase">
                  Action Required
                </span>
                <span className="text-xs font-bold text-[#152026]">
                  Trial Date Not Scheduled Yet
                </span>
              </div>
              <h4 className="text-sm font-black text-[#152026] mt-1">
                Branch Officer Scheduling Required
              </h4>
              <p className="text-xs text-[#152026]/80 mt-0.5">
                Under DMT regulations, your branch Data Entry Officer must set your official practical trial exam date before practical lesson sessions can be reserved.
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#D4EEF8] rounded-xl p-3 text-xs text-[#152026] whitespace-nowrap shadow-sm">
            Contact Branch: <strong className="text-[#1B3D59]">011-2849201</strong>
          </div>
        </div>
      ) : null}

      {/* Package Payment Pending or Required Warning (US-09 Payment Gate) */}
      {!isPackagePaymentConfirmed && lessonsRemaining <= 0 && (
        <div className="p-4 bg-[#F3EED8] border border-[#6A97C0]/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#1B3D59] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#152026] text-sm">
                Course Package Payment Required Before Booking
              </p>
              <p className="text-[#152026]/80 mt-0.5">
                {isPackagePaymentPending
                  ? 'Your course package payment slip is awaiting review by our branch officer. Lessons will unlock immediately once confirmed.'
                  : 'Please select and pay for your course package to unlock practical driving lessons.'}
              </p>
            </div>
          </div>
          <Link
            to="/student/dashboard#package-selection-payment"
            className="btn-primary text-xs py-2 px-4 font-bold whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            {isPackagePaymentPending ? 'Check Payment Status' : 'Select Package & Pay'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Monthly Plan Quota Cap Warning */}
      {isMonthlyPlan && lessonsRemaining <= 0 && isPackagePaymentConfirmed && (
        <div className="p-4 bg-[#F3EED8] border border-[#6A97C0]/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#1B3D59] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#152026] text-sm font-bold">Monthly Quota Reached ({unlockedCount} Lessons):</strong>
              <p className="mt-0.5 text-[#152026]/80">
                You have completed all {unlockedCount} lessons unlocked for this billing month under your monthly installment plan. Pay next month's installment or buy additional lessons to continue booking.
              </p>
            </div>
          </div>
          <Link
            to={{ pathname: '/student/dashboard', hash: '#package-selection-payment' }}
            state={{ openPaymentForm: true }}
            className="btn-secondary text-xs py-2 px-4 font-bold whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            Buy Additional Lessons <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Package Lessons Exhausted Banner */}
      {!isMonthlyPlan && lessonsRemaining <= 0 && isPackagePaymentConfirmed && (
        <div className="p-4 bg-[#D4EEF8] border border-[#6A97C0]/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-[#1B3D59] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#152026] text-sm font-bold">All Course Package Lessons Completed!</strong>
              <p className="mt-0.5 text-[#152026]/80">
                You have used all {unlockedCount} lessons in your package. Need extra on-road practice before your DMT practical trial? You can select additional lessons or packages anytime on your dashboard.
              </p>
            </div>
          </div>
          <Link
            to={{ pathname: '/student/dashboard', hash: '#package-selection-payment' }}
            state={{ openPaymentForm: true }}
            className="btn-primary text-xs py-2 px-4 font-bold whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            Buy Additional Lessons <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Control Filters (Branch, Date, Vehicle) */}
      <div className="bg-white rounded-3xl p-6 border border-[#D4EEF8] shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Branch Selector */}
          <div>
            <label className="block text-xs font-bold text-[#152026] mb-1.5">
              Select Training Branch:
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#D4EEF8] rounded-xl text-xs bg-[#FAFCFE] text-[#1B3D59] font-bold outline-none focus:border-[#1B3D59]"
            >
              <option value="Maharagama">Maharagama Branch</option>
              <option value="Werahara">Werahara Branch</option>
              <option value="Delgoda">Delgoda Branch</option>
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-[#152026] mb-1.5">
              Select Lesson Date:
            </label>
            <div className="relative flex items-center">
              <CalendarIcon className="w-4 h-4 text-[#6A97C0] absolute left-3.5 pointer-events-none" />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                max={maxBookingDate}
                value={selectedDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  if (trialDateObj && newDate) {
                    const chosen = new Date(newDate).setHours(0, 0, 0, 0);
                    const trialLimit = new Date(trialDateObj).setHours(0, 0, 0, 0);
                    if (chosen >= trialLimit) {
                      toast.error('Lessons cannot be booked on or after your Trial Exam Date.');
                      return;
                    }
                  }
                  setSelectedDate(newDate);
                }}
                className="w-full pl-10 pr-3.5 py-2.5 border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-[#1B3D59]"
              />
            </div>
            {isSelectedDateOnOrAfterTrial && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Lessons cannot be booked on or after your Trial Exam Date.
              </p>
            )}
          </div>

          {/* Vehicle Type Selector */}
          <div>
            <label className="block text-xs font-bold text-[#152026] mb-1.5">
              Vehicle Type:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    selectedVehicle === v.id
                      ? 'bg-[#1B3D59] text-white shadow-sm border border-[#1B3D59]'
                      : 'bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 border border-[#D4EEF8]'
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#152026] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1B3D59]" /> Available Session Slots for {selectedDate}
          </h2>
          <span className="text-xs text-[#6A97C0]">Standard session: 1 hour (2 x 30-min units)</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#6A97C0] flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-[#1B3D59]" /> Loading branch schedule...
          </div>
        ) : slots.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center space-y-2 border border-[#D4EEF8] shadow-sm">
            <Clock className="w-8 h-8 text-[#6A97C0] mx-auto" />
            <p className="text-sm font-bold text-[#152026]">No time slots scheduled for this date</p>
            <p className="text-xs text-[#6A97C0]">Please choose another date or contact the branch.</p>
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

              const isSlotOnOrPastTrial = Boolean(
                trialDateObj && new Date(slot.date).setHours(0, 0, 0, 0) >= new Date(trialDateObj).setHours(0, 0, 0, 0)
              );
              const isLockedByTrial = (isType2 && !hasTrialDate) || isTrialDatePassed || isSlotOnOrPastTrial;
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
                  className={`bg-white rounded-3xl p-5 flex flex-col justify-between space-y-4 border transition-all shadow-sm ${
                    isStudentAlreadyBooked
                      ? 'border-emerald-300 ring-1 ring-emerald-300 bg-emerald-50/20'
                      : isFull
                      ? 'border-[#D4EEF8] opacity-60 bg-[#FAFCFE]'
                      : 'border-[#D4EEF8] hover:border-[#6A97C0] hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header with Time & Capacity Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[#152026]">
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isStudentAlreadyBooked
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isFull
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : bookedCount > 0
                            ? 'bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/30'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
                      <h4 className="text-xs font-bold text-[#152026] leading-snug">
                        {slot.lessonTitle || `${slot.vehicleType || selectedVehicle} Practical Session`}
                      </h4>
                      <p className="text-[11px] text-[#152026]/70 mt-0.5 line-clamp-2 leading-relaxed">
                        {slot.lessonTopic || 'Dual-control road training, clutch control, and maneuvers.'}
                      </p>
                    </div>

                    {/* Branch & Instructor */}
                    <div className="p-3 bg-[#FAFCFE] rounded-2xl border border-[#D4EEF8] space-y-1.5 text-xs text-[#152026]">
                      <p className="flex items-center gap-1.5 text-[11px] font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#1B3D59]" /> {slot.branch} Branch
                      </p>
                      <p className="flex items-center gap-1.5 text-[11px] font-medium">
                        <User className="w-3.5 h-3.5 text-[#6A97C0]" />
                        Instructor:{' '}
                        {hasInstructor ? (
                          <strong className="text-[#152026] font-bold">{slot.instructorId?.name}</strong>
                        ) : (
                          <span className="text-amber-800 font-medium">To be assigned</span>
                        )}
                      </p>
                    </div>

                    {/* 10-Student Capacity Meter */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#6A97C0] font-medium">Class Attendance:</span>
                        <strong className="text-[#152026] font-bold">
                          {bookedCount} / {capacity} Students
                        </strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#D4EEF8] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFull
                              ? 'bg-rose-500'
                              : fillPercentage >= 70
                              ? 'bg-amber-400'
                              : 'bg-[#1B3D59]'
                          }`}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    disabled={isDisabled}
                    onClick={() => {
                      if (isSlotOnOrPastTrial) {
                        toast.error('Lessons cannot be booked on or after your Trial Exam Date.');
                        return;
                      }
                      setSelectedSlot(slot);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      isStudentAlreadyBooked
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                        : isFull
                        ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        : isType2 && !hasTrialDate
                        ? 'bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/30 cursor-not-allowed'
                        : isTrialDatePassed
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 cursor-not-allowed'
                        : isSlotOnOrPastTrial
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 cursor-not-allowed'
                        : isLockedByExam
                        ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        : isPackagePaymentPending
                        ? 'bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/30 cursor-not-allowed'
                        : isLockedByPackage
                        ? 'bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/30 cursor-not-allowed'
                        : isLockedByQuota
                        ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        : 'btn-primary shadow-sm hover:scale-[1.02]'
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
                      : isSlotOnOrPastTrial
                      ? 'Lessons Restricted: On or After Trial Exam'
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
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#D4EEF8] rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <h3 className="text-base font-bold text-[#152026] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#1B3D59]" /> Confirm Lesson Booking
              </h3>
              <button
                onClick={() => setSelectedSlot(null)}
                className="w-8 h-8 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-[#152026] flex items-center justify-center transition-colors border border-[#D4EEF8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-[#FAFCFE] p-4 rounded-2xl border border-[#D4EEF8]">
              <div className="flex justify-between">
                <span className="text-[#6A97C0] font-medium">Date:</span>
                <span className="font-bold text-[#152026]">
                  {safeFormatDate(selectedSlot?.date, 'EEEE, MMMM dd, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6A97C0] font-medium">Time:</span>
                <span className="font-bold text-[#1B3D59]">
                  {selectedSlot.startTime} – {selectedSlot.endTime} (1 Hour)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6A97C0] font-medium">Branch:</span>
                <span className="font-bold text-[#152026]">{selectedSlot.branch} Branch</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6A97C0] font-medium">Vehicle Type:</span>
                <span className="font-bold text-[#1B3D59]">{selectedVehicle}</span>
              </div>
              <div className="flex justify-between border-t border-[#D4EEF8] pt-2">
                <span className="text-[#6A97C0] font-medium">Assigned Instructor:</span>
                <span className="font-bold text-[#152026]">
                  {selectedSlot.instructorId?.name || 'Will be assigned by branch'}
                </span>
              </div>
            </div>

            {/* Lesson Category Selector (Regular vs Trial - US-09) */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-[#152026]">
                Lesson Type:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLessonType('regular')}
                  className={`p-2.5 rounded-xl border font-bold text-xs transition-all ${
                    lessonType === 'regular'
                      ? 'border-[#1B3D59] bg-[#1B3D59] text-white shadow-sm'
                      : 'border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40'
                  }`}
                >
                  Regular Lesson
                </button>
                <button
                  type="button"
                  onClick={() => setLessonType('trial')}
                  className={`p-2.5 rounded-xl border font-bold text-xs transition-all ${
                    lessonType === 'trial'
                      ? 'border-[#1B3D59] bg-[#F3EED8] text-[#152026] shadow-sm font-black'
                      : 'border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40'
                  }`}
                >
                  Trial Lesson (US-09)
                </button>
              </div>
            </div>

            {/* Trial Gate Warning for Type 1 (US-09) */}
            {lessonType === 'trial' && isType1 && !isTrialEligible && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>US-09 Gate Restricted:</strong> Trial lessons can only be booked after your Learner Written Exam is officially marked <strong>Passed</strong> by the branch Data Entry Officer.
                </p>
              </div>
            )}

            {/* Package Impact Summary */}
            <div className="p-3.5 bg-[#D4EEF8]/50 border border-[#D4EEF8] rounded-xl text-xs text-[#152026] space-y-1">
              <p className="font-bold text-[#1B3D59]">Lesson Balance Impact:</p>
              <div className="flex justify-between">
                <span className="text-[#152026]/75">Available Lessons Unlocked:</span>
                <span className="font-bold text-[#152026]">{lessonsRemaining}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#152026]/75">Remaining After Booking:</span>
                <span className="font-bold text-[#1B3D59]">{Math.max(0, lessonsRemaining - 1)} Remaining</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="btn-secondary text-xs py-2 px-4 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bookingLoading || (lessonType === 'trial' && isType1 && !isTrialEligible)}
                onClick={handleConfirmBooking}
                className="btn-primary text-xs py-2 px-5 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {bookingLoading ? 'Confirming...' : 'Confirm & Reserve Slot'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Request Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-[#152026]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-[#D4EEF8] rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="absolute right-5 top-5 p-2 text-[#6A97C0] hover:text-[#152026] rounded-xl hover:bg-[#D4EEF8]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-xs mb-1">
                <Clock className="w-3.5 h-3.5" /> DMT Exam Scheduling
              </div>
              <h3 className="text-xl font-black text-[#152026]">Request Trial Date Reschedule</h3>
              <p className="text-xs text-[#152026]/75">
                Submit a reschedule request to your branch Data Entry Officer. Upon approval, your practical trial date will be updated and lesson booking access will reopen automatically.
              </p>
            </div>

            <form onSubmit={handleSubmitReschedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#152026] mb-1">
                  Current Scheduled Trial Date:
                </label>
                <div className="p-3 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] font-bold text-sm">
                  {safeFormatDate(student?.trial_date, 'MMMM dd, yyyy', 'None')}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#152026] mb-1">
                  Reason for Reschedule Request: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g., Medical reasons, exam clash, or need more preparation..."
                  className="w-full px-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] text-xs font-medium placeholder:text-[#6A97C0]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#152026] mb-1">
                  Preferred New Trial Date (Optional):
                </label>
                <div className="relative flex items-center">
                  <CalendarIcon className="w-4 h-4 text-[#6A97C0] absolute left-3.5 pointer-events-none" />
                  <input
                    type="date"
                    value={preferredRescheduleDate}
                    onChange={(e) => setPreferredRescheduleDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl outline-none focus:border-[#1B3D59] text-xs font-bold cursor-pointer"
                  />
                </div>
                <span className="text-[10px] text-[#6A97C0] block mt-1">
                  Final trial date assignment will be confirmed by DMT and your branch Data Entry Officer.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  disabled={submittingReschedule}
                  className="btn-secondary text-xs py-2 px-4 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReschedule || !rescheduleReason.trim()}
                  className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 shadow-sm"
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
