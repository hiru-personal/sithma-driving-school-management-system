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
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

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

  // Shared Trial Date Tracking
  const hasTrialDate = Boolean(student?.trial_date);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Training Management
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2 drop-shadow">
            <Calendar className="w-6 h-6 text-cyan-400" /> My Lesson Schedule & History
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track your upcoming on-road lessons, free weekly theory sessions, and completed driving history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/student/lessons/book" className="btn-primary text-xs py-2 px-4 font-bold shadow-sm flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> Book New Lesson
          </Link>
          <button onClick={openFreeClassModal} className="btn-accent text-xs py-2 px-4 font-bold shadow-sm">
            <Gift className="w-4 h-4 text-slate-950" /> Book Free Weekly Class
          </button>
          <button onClick={() => setIsExtraModalOpen(true)} className="btn-secondary text-xs py-2 px-4 font-bold shadow-sm">
            <PlusCircle className="w-4 h-4 text-cyan-300" /> Request Extra Lessons
          </button>
        </div>
      </div>

      {/* Shared Trial Date Tracking Banner */}
      {hasTrialDate ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/95 via-purple-950/40 to-slate-900/95 border border-purple-400/30 shadow-[0_0_25px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold flex-shrink-0">
              <Calendar className="w-6 h-6 text-purple-400" />
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
                  ? 'Your scheduled trial date has passed. Please contact the branch officer to reschedule.'
                  : 'Practical lesson bookings are permitted on or before your scheduled trial date.'}
              </p>
            </div>
          </div>
          <Link to="/student/lessons/book" className="btn-accent text-xs py-2.5 px-4 font-bold whitespace-nowrap flex items-center gap-1.5">
            Book Next Lesson <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : isType2 ? (
        <div className="p-4 bg-amber-500/15 border border-amber-400/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300 text-sm">Practical Trial Date Not Scheduled Yet</p>
              <p className="text-slate-300 mt-0.5">
                As a Type 2 Trial-Only student, your practical trial date must be assigned by the branch Data Entry Officer before slots can be booked.
              </p>
            </div>
          </div>
          <div className="text-xs font-bold text-amber-200 bg-slate-950/60 px-3 py-2 rounded-xl border border-amber-400/20 whitespace-nowrap">
            Contact Branch Staff
          </div>
        </div>
      ) : null}

      {/* Type 1 US-09 DMT Lock Banner */}
      {isType1 && !isTrialEligible && (
        <div className="p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="font-bold text-white text-sm">DMT Learner Exam Required for Practical Lessons (US-09)</p>
              <p className="text-slate-300 mt-0.5">
                Government DMT regulations require Type 1 New Learners to pass the DMT Written Theory Examination before booking on-road practical/trial sessions.
              </p>
            </div>
          </div>
          <Link to="/student/milestones" className="btn-secondary text-xs py-2 px-4 font-bold whitespace-nowrap">
            View DMT Milestone Schedule →
          </Link>
        </div>
      )}

      {/* Upcoming Lessons */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" /> Upcoming Practical Lessons
        </h2>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Loading lesson schedule...
          </div>
        ) : upcomingBookings.length === 0 ? (
          <div className="card text-center py-8 space-y-3">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">You have no upcoming lessons booked</p>
            <Link to="/student/lessons/book" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 font-bold">
              Book a Lesson Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBookings.map((b) => (
              <div key={b._id} className="card card-hover p-5 space-y-3 border-l-4 border-l-cyan-400">
                <div className="flex items-center justify-between">
                  <span className="badge badge-info">{b.vehicleType}</span>
                  <span className={`badge ${b.lessonType === 'free-weekly-class' ? 'badge-accent' : 'badge-success'}`}>
                    {b.lessonType === 'free-weekly-class' ? 'Free Class' : 'Confirmed'}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-sm font-bold text-white">
                    {b.timeSlotId?.date ? format(new Date(b.timeSlotId.date), 'EEEE, MMM dd, yyyy') : 'Scheduled'}
                  </p>
                  <p className="font-semibold text-cyan-300">
                    {b.timeSlotId?.startTime} – {b.timeSlotId?.endTime}
                  </p>
                  <p className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.branch} Branch
                  </p>
                  <p className="text-slate-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Instructor:{' '}
                    <strong className="text-white">{b.timeSlotId?.instructorId?.name || 'Will be assigned'}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Free Weekly Class Modal */}
      {isFreeModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-accent" /> Book Free Weekly Theory & Practical Class
              </h3>
              <button
                onClick={() => setIsFreeModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Each week, Sithma Driving School conducts free group classes on road signs and vehicle mechanics. No deduction from your package balance.
            </p>

            <form onSubmit={handleBookFreeClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Choose Available Class Slot ({student?.branch} Branch):
                </label>
                {freeSlotLoading ? (
                  <p className="text-slate-400">Loading slots...</p>
                ) : (
                  <select
                    value={selectedFreeSlot}
                    onChange={(e) => setSelectedFreeSlot(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-white/15 rounded-xl bg-slate-900/90 text-white font-medium outline-none"
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

              <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFreeModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-accent py-2 px-5 text-xs font-bold">
                  Reserve Free Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Extra Lessons Modal */}
      {isExtraModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-400" /> Request Extra Practical Lessons
              </h3>
              <button
                onClick={() => setIsExtraModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Need extra driving practice before your practical DMT trial? Request supplementary lessons at Rs. {getStudentHourlyRate().toLocaleString()} per hourly session.
            </p>

            <form onSubmit={handleRequestExtra} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
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
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                          : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {num} Lessons
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center text-xs">
                <span className="text-slate-400">Estimated Additional Cost:</span>
                <span className="font-black text-accent text-sm">
                  Rs. {(extraCount * getStudentHourlyRate()).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsExtraModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={extraLoading}
                  className="btn-primary py-2 px-5 text-xs font-bold"
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
