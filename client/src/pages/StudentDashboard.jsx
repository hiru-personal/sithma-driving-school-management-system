import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DmtMilestoneTimeline from '../components/DmtMilestoneTimeline';
import api from '../api/axios';
import {
  Car,
  Calendar,
  CreditCard,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  Sparkles,
  Gift,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user, student, updateStudentData } = useAuth();
  const [profile, setProfile] = useState(student);
  const [loading, setLoading] = useState(!student);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  // Edit Date Form State
  const [dmtForm, setDmtForm] = useState({
    medicalExamDate: '',
    medicalExamPassed: false,
    learnerRegistrationDate: '',
    learnerExamDate: '',
    learnerExamPassed: false,
  });

  const fetchProfile = async () => {
    try {
      if (student?._id) {
        const res = await api.get(`/students/${student._id}`);
        if (res.data.success) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
          if (res.data.student.dmtDates) {
            setDmtForm({
              medicalExamDate: res.data.student.dmtDates.medicalExamDate
                ? res.data.student.dmtDates.medicalExamDate.split('T')[0]
                : '',
              medicalExamPassed: res.data.student.dmtDates.medicalExamPassed || false,
              learnerRegistrationDate: res.data.student.dmtDates.learnerRegistrationDate
                ? res.data.student.dmtDates.learnerRegistrationDate.split('T')[0]
                : '',
              learnerExamDate: res.data.student.dmtDates.learnerExamDate
                ? res.data.student.dmtDates.learnerExamDate.split('T')[0]
                : '',
              learnerExamPassed: res.data.student.dmtDates.learnerExamPassed || false,
            });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateDates = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/students/${profile._id}/dmt-dates`, dmtForm);
      if (res.data.success) {
        toast.success('DMT Milestone dates updated successfully!');
        setIsDateModalOpen(false);
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update DMT dates');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-300 font-bold text-sm bg-slate-900/80 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" /> Loading Student Dashboard...
        </div>
      </div>
    );
  }

  const pkg = profile?.package || {
    type: 'Car_Full',
    lessonsTotal: 15,
    lessonsUsed: 0,
    priceTotal: 45000,
    bonusLessons: { bike: 2, threeWheeler: 2 },
  };

  const progressPercent = Math.min(
    Math.round(((pkg.lessonsUsed || 0) / (pkg.lessonsTotal || 15)) * 100),
    100
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Welcome Banner */}
      <div className="relative backdrop-blur-2xl bg-gradient-to-r from-slate-900/90 via-primary/80 to-slate-900/90 rounded-3xl p-6 sm:p-8 text-white border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="badge badge-warning text-xs font-bold py-1">
              {profile?.branch} Branch
            </span>
            <span className="badge bg-white/15 text-cyan-300 text-xs border border-white/20">
              {profile?.studentType === 'Type2_TrialReady'
                ? 'Type 2: Trial-Ready'
                : 'Type 1: New Learner'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white drop-shadow">
            Ayubowan, {user?.name}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            Welcome to your driving learning portal. Track your Department of Motor Traffic (DMT) milestones, view remaining lessons, and book your practical driving sessions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 sm:self-center relative z-10">
          <button
            onClick={() => setIsDateModalOpen(true)}
            className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-cyan-300" /> Update DMT Dates
          </button>
          <Link
            to="/student/lessons"
            className="btn-accent text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-slate-950" /> Book a Lesson
          </Link>
        </div>
      </div>

      {/* Grid: DMT Timeline (Left) + Package & Status Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: DMT Regulatory Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <DmtMilestoneTimeline student={profile} />
        </div>

        {/* Right 1 Col: Course Package, Lessons & Quick Links */}
        <div className="space-y-6">
          {/* Current Package Card */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Course Package</h3>
                <p className="text-xs text-slate-400">{pkg.type?.replace('_', ' ')}</p>
              </div>
              <span className="text-base font-black text-accent">
                Rs. {pkg.priceTotal?.toLocaleString()}
              </span>
            </div>

            {/* Lessons Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Practical Lessons Used:</span>
                <span className="text-cyan-300 font-bold">
                  {pkg.lessonsUsed || 0} / {pkg.lessonsTotal || 15} Lessons
                </span>
              </div>
              <div className="w-full bg-slate-950/80 rounded-full h-3 overflow-hidden border border-white/15 p-0.5">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                {(pkg.lessonsTotal || 15) - (pkg.lessonsUsed || 0)} lessons remaining in your package
              </div>
            </div>

            {/* Bonus Lessons (if applicable) */}
            {(pkg.bonusLessons?.bike > 0 || pkg.bonusLessons?.threeWheeler > 0) && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-400/20 rounded-xl space-y-1.5 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Gift className="w-4 h-4 text-accent" /> Bonus Package Lessons Included:
                </div>
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>🛵 Free Motorbike Lessons:</span>
                  <span className="font-bold text-amber-300">{pkg.bonusLessons.bike} Lessons</span>
                </div>
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>🛺 Free Three-Wheeler Lessons:</span>
                  <span className="font-bold text-amber-300">{pkg.bonusLessons.threeWheeler} Lessons</span>
                </div>
              </div>
            )}

            {/* Payment & Registration Status Pill */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">Payment Status:</span>
              <span
                className={`badge ${
                  profile?.registrationStatus === 'registered' || profile?.registrationStatus === 'completed'
                    ? 'badge-success'
                    : 'badge-warning'
                }`}
              >
                {profile?.registrationStatus === 'registered' || profile?.registrationStatus === 'completed'
                  ? 'Payment Verified'
                  : 'Pending Slip Verification'}
              </span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="card space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> Student Quick Hub
            </h3>
            <div className="space-y-2 text-xs">
              <Link
                to="/student/quiz"
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-cyan-300" />
                  <span className="font-semibold text-slate-200 group-hover:text-white">
                    DMT Exam Practice Quiz
                  </span>
                </div>
                <span className="badge badge-info text-[10px]">3 Languages</span>
              </Link>
              <Link
                to="/student/payments"
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  <span className="font-semibold text-slate-200 group-hover:text-white">
                    Upload / View Payment Slips
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">Bank Transfer</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* DMT Date Update Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-300" /> Update DMT Milestone Dates
              </h3>
              <button
                onClick={() => setIsDateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateDates} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  DMT Medical Examination Date:
                </label>
                <input
                  type="date"
                  value={dmtForm.medicalExamDate}
                  onChange={(e) => setDmtForm({ ...dmtForm, medicalExamDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
                <input
                  type="checkbox"
                  id="medicalPassed"
                  checked={dmtForm.medicalExamPassed}
                  onChange={(e) =>
                    setDmtForm({ ...dmtForm, medicalExamPassed: e.target.checked })
                  }
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="medicalPassed" className="text-xs font-medium text-slate-200 cursor-pointer">
                  Passed DMT Medical Examination
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  DMT Learner Written Exam Date:
                </label>
                <input
                  type="date"
                  value={dmtForm.learnerExamDate}
                  onChange={(e) => setDmtForm({ ...dmtForm, learnerExamDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
                <input
                  type="checkbox"
                  id="examPassed"
                  checked={dmtForm.learnerExamPassed}
                  onChange={(e) =>
                    setDmtForm({ ...dmtForm, learnerExamPassed: e.target.checked })
                  }
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="examPassed" className="text-xs font-medium text-slate-200 cursor-pointer">
                  Passed DMT Learner Written Exam (Unlocks Trial Lessons)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsDateModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-5 font-bold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
