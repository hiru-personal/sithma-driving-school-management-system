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
  ShieldAlert,
  AlertTriangle,
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

export default function MyLessonsPage() {
  const { student, updateStudentData } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const isType1 = student?.studentType === 'Type1_NewLearner' || student?.studentType === 'Type 1';
  const isType2 = Boolean(
    student?.studentType === 'Type2_TrialReady' ||
    student?.studentType === 'Type 2' ||
    student?.student_type === 'Type 2'
  );
  const isTrialEligible = Boolean(
    isType2 ||
    student?.trialEligible ||
    student?.learnerExamStatus === 'passed' ||
    student?.dmtDates?.learnerExamPassed
  );
  const isTrialPassed = Boolean(
    student?.trial?.licenseObtained ||
    student?.isPassed ||
    student?.trial?.attempts?.some((a) => a.result === 'passed')
  );

  // Shared Trial Date Tracking
  const hasTrialDate = Boolean(student?.trial_date && !isNaN(new Date(student.trial_date).getTime()));
  const trialDateObj = hasTrialDate ? new Date(student.trial_date) : null;
  const isTrialDatePassed = Boolean(
    trialDateObj && new Date().getTime() > new Date(trialDateObj).setHours(23, 59, 59, 999)
  );
  const daysUntilTrial = trialDateObj
    ? Math.max(0, Math.ceil((new Date(trialDateObj).setHours(23, 59, 59, 999) - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

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
      const res = await api.post(`/students/${student._id}/additional-lessons`, {
        extraLessons: extraCount,
      });
      if (res.data.success) {
        toast.success(`Success! Added ${extraCount} additional lessons to your account.`);
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

  const getStudentHourlyRate = () => {
    const pkgType = student?.package?.type || '';
    if (pkgType.includes('Car')) return 3000;
    if (pkgType.includes('Bike')) return 1500;
    if (pkgType.includes('ThreeWheeler')) return 2000;
    if (pkgType.includes('Heavy')) return 3500;
    return 3000;
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4EEF8] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> Training Management
          </div>
          <h1 className="text-2xl font-black text-[#152026] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#1B3D59]" /> My Lesson Schedule & History
          </h1>
          <p className="text-xs text-[#6A97C0] mt-0.5">
            Track your upcoming on-road lessons, free weekly theory sessions, and completed driving history.
          </p>
        </div>

        {isTrialPassed ? (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Practical Trial Passed • Lessons Closed</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link to="/student/lessons/book" className="btn-primary text-xs py-2.5 px-4 font-bold shadow-sm flex items-center justify-center gap-1.5 w-full sm:w-auto">
              <Calendar className="w-4 h-4" /> Book New Lesson
            </Link>
            <button onClick={openFreeClassModal} className="btn-secondary text-xs py-2.5 px-4 font-bold shadow-sm flex items-center justify-center gap-1.5 w-full sm:w-auto">
              <Gift className="w-4 h-4 text-[#1B3D59]" /> Book Free Weekly Class
            </button>
            <button onClick={() => setIsExtraModalOpen(true)} className="btn-light text-xs py-2.5 px-4 font-bold shadow-sm flex items-center justify-center gap-1.5 w-full sm:w-auto">
              <PlusCircle className="w-4 h-4 text-[#1B3D59]" /> Request Extra Lessons
            </button>
          </div>
        )}
      </div>

      {/* Shared Trial Date Tracking Banner */}
      {isTrialPassed ? (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  Practical Trial Passed ✓
                </span>
              </div>
              <h3 className="text-base font-black text-emerald-950 mt-1">
                Practical Training & Trial Examination Completed
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                You have successfully cleared your official Practical Driving Trial. Practical lesson bookings are now closed. Review your completed driving sessions below.
              </p>
            </div>
          </div>
          <Link to="/student/dashboard" className="btn-primary text-xs py-2.5 px-4 font-bold whitespace-nowrap flex items-center gap-1.5 shadow-sm bg-emerald-700 hover:bg-emerald-800 text-white">
            Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : hasTrialDate ? (
        <div className="p-5 rounded-2xl bg-white border border-[#D4EEF8] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D4EEF8] border border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59] font-bold flex-shrink-0">
              <Calendar className="w-6 h-6 text-[#1B3D59]" />
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
                  ? 'Your scheduled trial date has passed. Please contact the branch officer to reschedule.'
                  : 'Practical lesson bookings are permitted on or before your scheduled trial date.'}
              </p>
            </div>
          </div>
          <Link to="/student/lessons/book" className="btn-primary text-xs py-2.5 px-4 font-bold whitespace-nowrap flex items-center gap-1.5 shadow-sm">
            Book Next Lesson <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : isType2 ? (
        <div className="p-4 bg-[#F3EED8] border border-[#6A97C0]/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#1B3D59] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#152026] text-sm">Practical Trial Date Not Scheduled Yet</p>
              <p className="text-[#152026]/80 mt-0.5">
                As a Type 2 Trial-Only student, your practical trial date must be assigned by the branch Data Entry Officer before slots can be booked.
              </p>
            </div>
          </div>
          <div className="text-xs font-bold text-[#152026] bg-white px-3 py-2 rounded-xl border border-[#D4EEF8] whitespace-nowrap shadow-sm">
            Contact Branch Staff
          </div>
        </div>
      ) : null}

      {/* Type 1 US-09 DMT Lock Banner */}
      {isType1 && !isTrialEligible && (
        <div className="p-4 bg-[#D4EEF8]/60 border border-[#6A97C0]/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-[#1B3D59] flex-shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="font-bold text-[#152026] text-sm">DMT Learner Exam Required for Practical Lessons (US-09)</p>
              <p className="text-[#152026]/80 mt-0.5">
                Government DMT regulations require Type 1 New Learners to pass the DMT Written Theory Examination before booking on-road practical/trial sessions.
              </p>
            </div>
          </div>
          <Link to="/student/milestones" className="btn-secondary text-xs py-2 px-4 font-bold whitespace-nowrap shadow-sm">
            View DMT Milestone Schedule →
          </Link>
        </div>
      )}

      {/* Upcoming Lessons */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#152026] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#1B3D59]" /> Upcoming Practical Lessons
        </h2>

        {loading ? (
          <div className="py-8 text-center text-xs text-[#6A97C0] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#1B3D59]" /> Loading lesson schedule...
          </div>
        ) : upcomingBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center space-y-3 border border-[#D4EEF8] shadow-sm">
            <Calendar className="w-8 h-8 text-[#6A97C0] mx-auto" />
            <p className="text-sm font-bold text-[#152026]">You have no upcoming lessons booked</p>
            {!isTrialPassed && (
              <Link to="/student/lessons/book" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 font-bold shadow-sm">
                Book a Lesson Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingBookings.map((b) => (
              <div key={b._id} className="bg-white rounded-3xl p-5 space-y-3 border border-[#D4EEF8] shadow-sm border-l-4 border-l-[#1B3D59]">
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] font-bold text-xs">{b.vehicleType}</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${b.lessonType === 'free-weekly-class' ? 'bg-[#F3EED8] text-[#152026]' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                    {b.lessonType === 'free-weekly-class' ? 'Free Class' : 'Confirmed'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-sm font-black text-[#152026]">
                    {safeFormatDate(b.timeSlotId?.date, 'EEEE, MMM dd, yyyy', 'Scheduled')}
                  </p>
                  <p className="font-bold text-[#1B3D59]">
                    {b.timeSlotId?.startTime} – {b.timeSlotId?.endTime}
                  </p>
                  <p className="text-[#152026]/70 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#6A97C0]" /> {b.branch} Branch
                  </p>
                  <p className="text-[#152026]/70 flex items-center gap-1 font-medium">
                    <User className="w-3.5 h-3.5 text-[#6A97C0]" /> Instructor:{' '}
                    <strong className="text-[#152026]">{b.timeSlotId?.instructorId?.name || 'Will be assigned'}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lesson History & Cancelled Lessons (Rules 2 & 3) */}
      <div className="space-y-4 pt-6 border-t border-[#D4EEF8]">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#152026] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1B3D59]" /> Lesson History & Status
          </h2>
          <span className="text-xs text-[#6A97C0] font-bold">
            {pastBookings.length} Recorded / Cancelled
          </span>
        </div>

        {pastBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center text-xs font-semibold text-slate-500 border border-[#D4EEF8]">
            No completed or cancelled lessons in your record.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pastBookings.map((b) => (
              <div
                key={b._id}
                className={`bg-white rounded-3xl p-5 space-y-3 border shadow-sm ${
                  b.status === 'cancelled'
                    ? 'border-rose-300 border-l-4 border-l-rose-500 bg-rose-50/20'
                    : 'border-[#D4EEF8] border-l-4 border-l-emerald-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] font-bold text-xs">
                    {b.vehicleType}
                  </span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      b.status === 'cancelled'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {b.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-sm font-black text-[#152026]">
                    {b.timeSlotId?.date ? format(new Date(b.timeSlotId.date), 'EEEE, MMM dd, yyyy') : 'Scheduled'}
                  </p>
                  <p className="font-bold text-[#1B3D59]">
                    {b.timeSlotId?.startTime} – {b.timeSlotId?.endTime}
                  </p>
                  <p className="text-[#152026]/70 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#6A97C0]" /> {b.branch} Branch
                  </p>
                  {b.timeSlotId?.instructorId?.name && (
                    <p className="text-[#152026]/70 flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-[#6A97C0]" /> Instructor:{' '}
                      <strong className="text-[#152026]">{b.timeSlotId.instructorId.name}</strong>
                    </p>
                  )}

                  {b.status === 'cancelled' && b.cancellationReason && (
                    <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Cancellation Reason</span>
                      </div>
                      <p className="text-rose-700 pl-5">{b.cancellationReason}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Free Weekly Class Modal */}
      {isFreeModalOpen && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#D4EEF8] rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <h3 className="text-base font-bold text-[#152026] flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#1B3D59]" /> Book Free Weekly Theory & Practical Class
              </h3>
              <button
                onClick={() => setIsFreeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-[#152026] flex items-center justify-center transition-colors border border-[#D4EEF8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#152026]/75 leading-relaxed">
              Each week, Sithma Driving School conducts free group classes on road signs and vehicle mechanics. No deduction from your package balance.
            </p>

            <form onSubmit={handleBookFreeClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#152026] mb-1">
                  Choose Available Class Slot ({student?.branch} Branch):
                </label>
                {freeSlotLoading ? (
                  <p className="text-[#6A97C0]">Loading slots...</p>
                ) : (
                  <select
                    value={selectedFreeSlot}
                    onChange={(e) => setSelectedFreeSlot(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-[#D4EEF8] rounded-xl bg-[#FAFCFE] text-[#152026] font-bold outline-none focus:border-[#1B3D59]"
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

              <div className="flex justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => setIsFreeModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold shadow-sm">
                  Reserve Free Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Extra Lessons Modal */}
      {isExtraModalOpen && (
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#D4EEF8] rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <h3 className="text-base font-bold text-[#152026] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#1B3D59]" /> Request Extra Practical Lessons
              </h3>
              <button
                onClick={() => setIsExtraModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-[#152026] flex items-center justify-center transition-colors border border-[#D4EEF8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#152026]/75 leading-relaxed">
              Need extra driving practice before your practical DMT trial? Request supplementary lessons at Rs. {getStudentHourlyRate().toLocaleString()} per hourly session.
            </p>

            <form onSubmit={handleRequestExtra} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#152026] mb-1.5">
                  Number of Additional Sessions:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 4, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setExtraCount(num)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                        extraCount === num
                          ? 'border-[#1B3D59] bg-[#1B3D59] text-white shadow-sm'
                          : 'border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40'
                      }`}
                    >
                      {num} Lessons
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-[#FAFCFE] rounded-2xl border border-[#D4EEF8] flex justify-between items-center text-xs">
                <span className="text-[#6A97C0] font-medium">Estimated Additional Cost:</span>
                <span className="font-black text-[#1B3D59] text-sm">
                  Rs. {(extraCount * getStudentHourlyRate()).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => setIsExtraModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={extraLoading}
                  className="btn-primary py-2 px-5 text-xs font-bold shadow-sm"
                >
                  {extraLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
