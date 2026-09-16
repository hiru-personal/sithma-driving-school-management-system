import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  ShieldAlert,
  Edit3,
  Stethoscope,
  CheckCircle2,
  FileText,
  BookOpen,
  Calendar,
  Car,
  Clock,
  ArrowRight,
  AlertTriangle,
  X,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  HelpCircle,
  Check,
  Info,
  ExternalLink,
} from 'lucide-react';
import DmtMilestoneTimeline from '../components/DmtMilestoneTimeline';

export default function DmtMilestonesPage() {
  const { user, student, updateStudentData } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(student || null);
  const [loading, setLoading] = useState(true);

  // DMT Milestone Dates Update Modal State
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [savingMilestones, setSavingMilestones] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    medicalExamDate: '',
    learnerRegistrationDate: '',
    learnerExamDate: '',
  });

  // DMT Written Theory Exam Result Modal State
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [submittingExamResult, setSubmittingExamResult] = useState(false);
  const [examForm, setExamForm] = useState({
    result: 'passed',
    marks: '',
    examDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Toggling action state
  const [togglingMilestone, setTogglingMilestone] = useState(false);
  const [reRegistering, setReRegistering] = useState(false);

  // Student Type Checks
  const isType2 =
    profile?.studentType === 'Type2_TrialReady' ||
    profile?.studentType === 'Type 2' ||
    profile?.student_type === 'Type 2' ||
    user?.studentType === 'Type 2' ||
    user?.studentType === 'Type2_TrialReady';

  // If Type 2 student accesses this page, redirect to home dashboard
  useEffect(() => {
    if (isType2) {
      toast('DMT Milestones are only applicable for Type 1 New Learners.', { icon: 'ℹ️' });
      navigate('/student/dashboard', { replace: true });
    }
  }, [isType2, navigate]);

  // Load fresh student profile
  useEffect(() => {
    const fetchProfile = async () => {
      const targetId = student?._id || user?.studentProfileId;
      if (!targetId) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/students/${targetId}`);
        if (res.data?.success && res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        }
      } catch (err) {
        console.error('Failed to fetch student profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [student?._id, user?.studentProfileId]);

  // Exam and milestone calculations
  const isExamPassed = Boolean(
    profile?.learnerExamPassed ||
    profile?.learnerExamStatus === 'passed' ||
    profile?.dmtDates?.learnerExamPassed
  );
  const attemptsCount = profile?.learnerExamAttempts?.length || (profile?.learnerExamStatus === 'failed' ? 1 : 0);
  const remainingAttempts = Math.max(0, 3 - attemptsCount);
  const isTrialEligible = isExamPassed;

  // Open Dates Modal
  const openMilestoneModal = () => {
    setMilestoneForm({
      medicalExamDate: profile?.dmtDates?.medicalExamDate ? profile.dmtDates.medicalExamDate.split('T')[0] : '',
      learnerRegistrationDate: profile?.dmtDates?.learnerRegistrationDate ? profile.dmtDates.learnerRegistrationDate.split('T')[0] : '',
      learnerExamDate: profile?.dmtDates?.learnerExamDate ? profile.dmtDates.learnerExamDate.split('T')[0] : '',
    });
    setIsMilestoneModalOpen(true);
  };

  // Save Milestone Dates
  const handleSaveMilestones = async (e) => {
    e.preventDefault();
    setSavingMilestones(true);
    try {
      const studentId = profile?._id || student?._id;
      const res = await api.patch(`/students/${studentId}/dmt-dates`, {
        medicalExamDate: milestoneForm.medicalExamDate || null,
        learnerRegistrationDate: milestoneForm.learnerRegistrationDate || null,
        learnerExamDate: milestoneForm.learnerExamDate || null,
      });
      if (res.data.success) {
        toast.success('DMT milestone dates updated successfully!');
        if (res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        }
        setIsMilestoneModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update milestone dates');
    } finally {
      setSavingMilestones(false);
    }
  };

  // Toggle milestone checkbox status (e.g. Medical Done, Registration Done)
  const handleToggleMilestone = async (field, currentValue) => {
    setTogglingMilestone(true);
    try {
      const studentId = profile?._id || student?._id;
      const res = await api.patch(`/students/${studentId}/dmt-dates`, {
        [field]: !currentValue,
      });
      if (res.data.success) {
        toast.success(
          !currentValue
            ? `✓ ${field === 'registrationDone' ? 'DMT Registration' : 'DMT Medical'} marked as completed!`
            : 'Status updated.'
        );
        if (res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update milestone progress');
    } finally {
      setTogglingMilestone(false);
    }
  };

  // Record Theory Exam Result
  const handleSaveExamResult = async (e) => {
    e.preventDefault();
    if (examForm.marks === '' || examForm.marks === null) {
      toast.error('Please enter marks scored in the examination');
      return;
    }
    setSubmittingExamResult(true);
    try {
      const studentId = profile?._id || student?._id;
      const res = await api.post(`/students/${studentId}/exam-attempt`, {
        result: examForm.result,
        marks: Number(examForm.marks),
        examDate: examForm.examDate,
        notes: examForm.notes,
      });
      if (res.data.success) {
        if (res.data.isAutoCancelled) {
          toast.error('⚠️ Maximum 3 failed attempts reached. Registration has been cancelled.');
        } else if (examForm.result === 'passed') {
          toast.success(`🎉 Congratulations! Passed with ${examForm.marks} marks. Practical lessons unlocked!`);
        } else {
          toast(`⚠️ Exam attempt recorded as failed. ${res.data.attemptsRemaining} attempt(s) remaining.`, {
            icon: '⚠️',
          });
        }
        if (res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        }
        setIsExamModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record exam attempt');
    } finally {
      setSubmittingExamResult(false);
    }
  };

  // Re-register if cancelled
  const handleReRegister = async () => {
    if (
      !window.confirm(
        'Are you sure you want to re-register as a new learner? This will reset your exam attempts and require re-paying the Rs. 5,000 advance fee.'
      )
    ) {
      return;
    }
    setReRegistering(true);
    try {
      const studentId = profile?._id || student?._id;
      const res = await api.post(`/students/${studentId}/re-register`);
      if (res.data.success) {
        toast.success('Re-registration initiated! Please submit your advance deposit to continue.');
        if (res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        }
        navigate('/payment-gateway', {
          state: {
            studentName: user?.name,
            studentId: profile?._id,
            packageTitle: 'Type 1 Learner Advance Registration Fee',
            amount: 5000,
            packageType: 'advance_fee',
          },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate re-registration');
    } finally {
      setReRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm animate-pulse">Loading DMT Milestone Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl animate-fade-in">
      {/* Top Breadcrumb & Return to Dashboard */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/student/dashboard" className="hover:text-cyan-300 flex items-center gap-1 transition-colors">
            Student Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-cyan-300 font-semibold">DMT Milestone Schedule</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge badge-info text-xs font-mono">
            Type 1: New Learner
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {profile?.branch} Branch
          </span>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-400/30 p-6 sm:p-8 shadow-[0_10px_40px_rgba(6,182,212,0.15)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="badge badge-accent text-[10px] font-black uppercase tracking-wider">
                Official DMT Tracking
              </span>
              <span className="text-xs text-cyan-300 font-mono">
                Student ID: {profile?.studentIdNumber || profile?._id?.slice(-6)?.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
              Government DMT Milestone Schedule
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track your official Department of Motor Traffic (DMT) milestones from medical examination and learner registration to the written theory test and final practical trial.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={openMilestoneModal}
              className="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all"
            >
              <Edit3 className="w-4 h-4 text-cyan-400" />
              <span>Update Milestone Dates</span>
            </button>
            <Link
              to="/student/quiz"
              className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <BookOpen className="w-4 h-4" />
              <span>Practice Exam Quizzes</span>
            </Link>
          </div>
        </div>

        {/* Decorative Background Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Auto-cancellation Warning Banner (if 3 attempts failed) */}
      {profile?.isRegistrationCancelled && (
        <div className="p-5 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-rose-300 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">Registration Auto-Cancelled (3 Failed Attempts)</p>
              <p className="text-rose-200/80 mt-0.5">
                In accordance with DMT regulations, you have reached the maximum allowed 3 theory exam attempts. To continue, you must re-register as a new learner.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={reRegistering}
            onClick={handleReRegister}
            className="btn-primary bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 px-4 whitespace-nowrap shadow-lg flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{reRegistering ? 'Processing...' : 'Re-Register Now (Rs. 5,000)'}</span>
          </button>
        </div>
      )}

      {/* Grid: 4 Core DMT Milestones */}
      <div className="card p-6 sm:p-8 space-y-6 border border-cyan-400/30 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
          <div>
            <span className="badge badge-info text-[10px] font-bold uppercase mb-1">
              Step-by-Step Progress
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" /> Milestone Tracking Cards
            </h2>
            <p className="text-xs text-slate-400">
              Update your scheduled dates and check off completed stages as you progress.
            </p>
          </div>
          <button
            type="button"
            onClick={openMilestoneModal}
            className="btn-secondary text-xs py-1.5 px-3.5 font-bold flex items-center gap-1.5 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10 self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Update Milestone Dates</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Medical Exam Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-cyan-400/30 transition-all">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white flex items-center gap-2 font-bold text-sm">
                <Stethoscope className="w-5 h-5 text-emerald-400" /> 1. DMT Medical Exam
              </span>
              <span className={`badge text-xs font-bold ${profile?.dmtDates?.medicalDone || profile?.dmtDates?.medicalExamPassed ? 'badge-success' : 'badge-warning'}`}>
                {profile?.dmtDates?.medicalDone || profile?.dmtDates?.medicalExamPassed ? '✓ Cleared' : 'Pending'}
              </span>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Scheduled Date:</span>
                <span className="text-white font-bold font-mono">
                  {profile?.dmtDates?.medicalExamDate
                    ? new Date(profile.dmtDates.medicalExamDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Not Yet Assigned by Staff'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                National Transport Medical Institute (NTMI) official medical certificate.
              </p>
            </div>
            <button
              type="button"
              disabled={togglingMilestone}
              onClick={() => handleToggleMilestone('medicalDone', profile?.dmtDates?.medicalDone)}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                profile?.dmtDates?.medicalDone
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-white/5 hover:bg-white/10 border-white/15 text-cyan-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{profile?.dmtDates?.medicalDone ? '✓ Medical Marked as Done (Click to undo)' : 'Mark Medical as Done ✓'}</span>
            </button>
          </div>

          {/* 2. Learner Registration Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-cyan-400/30 transition-all">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white flex items-center gap-2 font-bold text-sm">
                <FileText className="w-5 h-5 text-blue-400" /> 2. DMT Registration
              </span>
              <span className={`badge text-xs font-bold ${profile?.dmtDates?.registrationDone || profile?.dmtDates?.learnerRegistrationDate ? 'badge-info' : 'badge-warning'}`}>
                {profile?.dmtDates?.registrationDone ? '✓ Completed' : (profile?.dmtDates?.learnerRegistrationDate ? 'Enrolled' : 'Pending')}
              </span>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">DMT Submission Date:</span>
                <span className="text-white font-bold font-mono">
                  {profile?.dmtDates?.learnerRegistrationDate
                    ? new Date(profile.dmtDates.learnerRegistrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Not Yet Assigned by Staff'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Official registration documents submitted to DMT Werahara/local branch.
              </p>
            </div>
            <button
              type="button"
              disabled={togglingMilestone}
              onClick={() => handleToggleMilestone('registrationDone', profile?.dmtDates?.registrationDone)}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                profile?.dmtDates?.registrationDone
                  ? 'bg-blue-500/15 border-blue-400/40 text-blue-300 hover:bg-blue-500/25'
                  : 'bg-white/5 hover:bg-white/10 border-white/15 text-cyan-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>{profile?.dmtDates?.registrationDone ? '✓ Registration Marked as Done (Click to undo)' : 'Mark Registration as Done ✓'}</span>
            </button>
          </div>

          {/* 3. Written Theory Exam Card (Span 2 Cols) */}
          <div className="md:col-span-2 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-cyan-950/40 border border-purple-400/30 space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">3. DMT Written Theory Exam</h4>
                  <p className="text-xs text-slate-400">
                    Official computer-based theory examination at DMT. Maximum of 3 attempts allowed.
                  </p>
                </div>
              </div>
              <span className={`badge text-xs font-bold py-1 px-3 ${
                isExamPassed
                  ? 'badge-success'
                  : profile?.learnerExamStatus === 'failed'
                  ? 'badge-error'
                  : 'badge-warning'
              }`}>
                {isExamPassed
                  ? `✓ PASSED (${profile?.dmtDates?.learnerExamMarks || profile?.learnerExamMarks || 'Pass'} Marks)`
                  : profile?.learnerExamStatus === 'failed'
                  ? `Attempt ${attemptsCount}/3 Failed`
                  : `Attempt 1 of 3 (Pending)`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[11px]">Scheduled Exam Date:</span>
                <span className="font-bold text-white text-sm font-mono mt-0.5 block">
                  {profile?.dmtDates?.learnerExamDate
                    ? new Date(profile.dmtDates.learnerExamDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Date Not Yet Assigned by Staff'}
                </span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[11px]">Attempts Status:</span>
                <span className="font-bold text-white text-sm mt-0.5 block">
                  {isExamPassed
                    ? '✓ Cleared — Practical Lessons Unlocked'
                    : `${remainingAttempts} attempt(s) remaining before auto-cancellation`}
                </span>
              </div>
            </div>

            {/* 3 Attempts Indicator Badges & Action Buttons */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 text-xs font-bold">Attempts Track:</span>
                {[1, 2, 3].map((num) => {
                  const att = profile?.learnerExamAttempts?.find((a) => a.attemptNumber === num);
                  const isPassedAttempt = att?.result === 'passed';
                  const isFailedAttempt = att?.result === 'failed';
                  const isCurrentPending = !att && num === attemptsCount + 1 && !isExamPassed;

                  return (
                    <span
                      key={num}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                        isPassedAttempt
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : isFailedAttempt
                          ? 'bg-rose-500/20 border-rose-400 text-rose-300 line-through'
                          : isCurrentPending
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse'
                          : 'bg-white/5 border-white/10 text-slate-500'
                      }`}
                    >
                      Attempt {num}
                      {isPassedAttempt && ' ✓'}
                      {isFailedAttempt && ` (${att.marks || 'F'})`}
                    </span>
                  );
                })}
              </div>

              {/* Student Result & Next Date Action Buttons */}
              {!isExamPassed && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setExamForm({
                        result: 'passed',
                        marks: '',
                        examDate: new Date().toISOString().split('T')[0],
                        notes: '',
                      });
                      setIsExamModalOpen(true);
                    }}
                    className="btn-accent text-xs py-2 px-4 font-bold shadow-md flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Record Exam Result (Pass / Fail & Marks)</span>
                  </button>

                  {profile?.learnerExamStatus === 'failed' && remainingAttempts > 0 && (
                    <button
                      type="button"
                      onClick={openMilestoneModal}
                      className="btn-secondary text-xs py-2 px-3.5 font-bold border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10 flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Update Next Exam Date (From Staff)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4. Practical Driving Trial Card (Span 2 Cols) */}
          <div className="md:col-span-2 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white flex items-center gap-2 font-bold text-sm">
                <Car className="w-5 h-5 text-accent" /> 4. DMT Practical Driving Trial
              </span>
              <span className={`badge text-xs font-bold ${profile?.trial?.licenseObtained ? 'badge-success' : 'badge-warning'}`}>
                {profile?.trial?.licenseObtained ? 'Licensed' : `${profile?.trial?.attempts?.length || 0}/3 Attempts Used`}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 font-semibold">
                Status:{' '}
                <span className="text-white font-bold">
                  {profile?.trial?.deadlineDate
                    ? `1.5-Yr Deadline: ${new Date(profile.trial.deadlineDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
                    : (isExamPassed ? 'Eligible to Schedule Trial with Instructor' : 'Locked — Pending Learner Theory Exam Pass')}
                </span>
              </span>
              {isExamPassed ? (
                <Link
                  to="/student/lessons/book"
                  className="btn-accent text-xs py-1.5 px-3.5 font-bold inline-flex items-center gap-1 self-start sm:self-auto"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Practical Lessons</span>
                </Link>
              ) : (
                <span className="text-[11px] text-amber-300 font-medium">
                  Pass theory exam to unlock trial bookings
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="card p-6 sm:p-8 space-y-4 border border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" /> Complete DMT Progression Timeline
          </h3>
          <p className="text-xs text-slate-400">
            A linear progression of each stage required by the Department of Motor Traffic.
          </p>
        </div>
        <DmtMilestoneTimeline student={profile} />
      </div>

      {/* Helpful DMT Guidelines for Type 1 Students */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 bg-gradient-to-br from-cyan-950/40 to-slate-900/80 border border-cyan-400/20 space-y-2.5">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
            <Stethoscope className="w-4 h-4" />
            <span>NTMI Medical Exam</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Attend your scheduled medical test at the designated NTMI center. Ensure you bring your original National Identity Card (NIC).
          </p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-purple-950/40 to-slate-900/80 border border-purple-400/20 space-y-2.5">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Theory Exam Preparation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Practice past exam papers in Sinhala, Tamil, or English using our free practice quiz simulator before attending your exam at DMT.
          </p>
          <Link to="/student/quiz" className="text-xs text-cyan-300 font-bold hover:underline inline-flex items-center gap-1 pt-1">
            Open Quiz Simulator <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="card p-5 bg-gradient-to-br from-amber-950/40 to-slate-900/80 border border-amber-400/20 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <Car className="w-4 h-4" />
            <span>Practical Trial Lessons</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Once you record a passing score, you will choose your vehicle package, pay your course balance, and begin hands-on road training.
          </p>
        </div>
      </div>

      {/* MODAL 1: Update Milestone Dates Modal */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
                <Calendar className="w-5 h-5" />
                <span>Update DMT Milestone Dates</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMilestoneModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMilestones} className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Enter or update the official scheduled dates assigned to you by Sithma branch staff or the DMT.
              </p>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                  1. DMT Medical Exam Date
                </label>
                <input
                  type="date"
                  value={milestoneForm.medicalExamDate}
                  onChange={(e) =>
                    setMilestoneForm({ ...milestoneForm, medicalExamDate: e.target.value })
                  }
                  className="input w-full bg-slate-950/80 border-white/20 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  2. DMT Registration Submission Date
                </label>
                <input
                  type="date"
                  value={milestoneForm.learnerRegistrationDate}
                  onChange={(e) =>
                    setMilestoneForm({ ...milestoneForm, learnerRegistrationDate: e.target.value })
                  }
                  className="input w-full bg-slate-950/80 border-white/20 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  3. DMT Written Theory Exam Date
                </label>
                <input
                  type="date"
                  value={milestoneForm.learnerExamDate}
                  onChange={(e) =>
                    setMilestoneForm({ ...milestoneForm, learnerExamDate: e.target.value })
                  }
                  className="input w-full bg-slate-950/80 border-white/20 text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMilestones}
                  className="btn-accent py-2 px-5 text-xs font-bold flex items-center gap-1.5"
                >
                  {savingMilestones ? 'Saving...' : 'Save Dates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Exam Result Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-base">
                <BookOpen className="w-5 h-5" />
                <span>Record DMT Theory Exam Result</span>
              </div>
              <button
                type="button"
                onClick={() => setIsExamModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExamResult} className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Submit the marks and outcome of your official DMT Theory Exam. Passing (score ≥ 30/40) will immediately unlock practical training and vehicle packages.
              </p>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">Examination Result:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExamForm({ ...examForm, result: 'passed' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      examForm.result === 'passed'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>PASSED</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamForm({ ...examForm, result: 'failed' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      examForm.result === 'failed'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>FAILED</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Marks Scored (Out of 40):
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  required
                  placeholder="e.g. 35"
                  value={examForm.marks}
                  onChange={(e) => setExamForm({ ...examForm, marks: e.target.value })}
                  className="input w-full bg-slate-950/80 border-white/20 text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">Exam Date Faced:</label>
                <input
                  type="date"
                  required
                  value={examForm.examDate}
                  onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                  className="input w-full bg-slate-950/80 border-white/20 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">Optional Notes:</label>
                <input
                  type="text"
                  placeholder="e.g. Taken at DMT Werahara Hall 2"
                  value={examForm.notes}
                  onChange={(e) => setExamForm({ ...examForm, notes: e.target.value })}
                  className="input w-full bg-slate-950/80 border-white/20 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingExamResult}
                  className="btn-primary bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2 px-5 text-xs font-bold flex items-center gap-1.5 shadow-lg"
                >
                  {submittingExamResult ? 'Submitting...' : 'Save Exam Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
