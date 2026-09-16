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
  Lock,
  Upload,
  Paperclip,
} from 'lucide-react';
import { format } from 'date-fns';
import DmtMilestoneTimeline from '../components/DmtMilestoneTimeline';

export default function DmtMilestonesPage() {
  const { user, student, updateStudentData } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(student || null);
  const [loading, setLoading] = useState(true);

  // DMT Written Theory Exam Result Modal State
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [submittingExamResult, setSubmittingExamResult] = useState(false);
  const [examForm, setExamForm] = useState({
    result: 'passed',
    marks: '',
    examDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Reschedule Request Modal & State (Milestone Date Change Requests)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleMilestone, setRescheduleMilestone] = useState('medical');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [myRescheduleRequests, setMyRescheduleRequests] = useState([]);

  const fetchMyRescheduleRequests = async () => {
    try {
      const res = await api.get('/students/trial-date/reschedule');
      if (res.data?.success) {
        setMyRescheduleRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch reschedule requests:', err);
    }
  };

  useEffect(() => {
    fetchMyRescheduleRequests();
  }, []);

  const handleSubmitReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleReason.trim()) {
      toast.error('Please enter a reason for your reschedule request');
      return;
    }

    const currentScheduledDate =
      rescheduleMilestone === 'medical'
        ? (profile?.medical_date || profile?.dmtDates?.medicalExamDate)
        : rescheduleMilestone === 'registration'
        ? (profile?.registration_date || profile?.dmtDates?.learnerRegistrationDate)
        : rescheduleMilestone === 'theory_exam'
        ? (profile?.written_exam_date || profile?.dmtDates?.learnerExamDate)
        : profile?.trial_date;

    if (!currentScheduledDate) {
      toast.error('A date must be assigned by branch staff / Data Entry Officer before you can request another date.');
      return;
    }

    setSubmittingReschedule(true);
    try {
      const res = await api.post('/students/trial-date/reschedule', {
        milestoneType: rescheduleMilestone,
        reason: rescheduleReason.trim(),
        preferredDate: preferredDate || null,
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'Date reschedule request submitted successfully!');
        setShowRescheduleModal(false);
        setRescheduleReason('');
        setPreferredDate('');
        fetchMyRescheduleRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit reschedule request');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  // Medical Proof & Status Modal State
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [medicalForm, setMedicalForm] = useState({
    status: 'passed',
    remarks: '',
  });
  const [medicalFile, setMedicalFile] = useState(null);
  const [submittingMedical, setSubmittingMedical] = useState(false);

  // Registration Proof & Status Modal State
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    status: 'done',
    remarks: '',
  });
  const [registrationFile, setRegistrationFile] = useState(null);
  const [submittingRegistration, setSubmittingRegistration] = useState(false);

  // Interactive Registration Remarks in Card 2
  const [registrationRemarksInput, setRegistrationRemarksInput] = useState('');
  const [savingRegRemarks, setSavingRegRemarks] = useState(false);

  useEffect(() => {
    if (profile?.registrationRemarks || profile?.dmtDates?.registrationRemarks) {
      setRegistrationRemarksInput(profile?.registrationRemarks || profile?.dmtDates?.registrationRemarks || '');
    }
    if (profile?.medicalRemarks || profile?.dmtDates?.medicalRemarks) {
      setMedicalForm((prev) => ({
        ...prev,
        remarks: profile?.medicalRemarks || profile?.dmtDates?.medicalRemarks || '',
      }));
    }
  }, [profile]);

  const handleSaveRegistrationRemarks = async () => {
    if (!registrationRemarksInput.trim()) {
      toast.error('Please enter remarks first');
      return;
    }
    setSavingRegRemarks(true);
    try {
      const studentId = profile?._id || student?._id;
      const res = await api.patch(`/students/${studentId}/dmt-dates`, {
        registrationRemarks: registrationRemarksInput.trim(),
      });
      if (res.data.success) {
        toast.success('Registration remarks saved successfully!');
        if (res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save remarks');
    } finally {
      setSavingRegRemarks(false);
    }
  };

  const handleUploadMedicalProof = async (e) => {
    e.preventDefault();
    setSubmittingMedical(true);
    try {
      const studentId = profile?._id || student?._id;
      const formData = new FormData();
      formData.append('milestoneType', 'medical');
      formData.append('status', medicalForm.status);
      formData.append('remarks', medicalForm.remarks || '');
      if (medicalFile) {
        formData.append('proofDocument', medicalFile);
      }

      const res = await api.post(`/students/${studentId}/milestone-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Medical examination record saved successfully!');
        if (res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        }
        setShowMedicalModal(false);
        setMedicalFile(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save medical record');
    } finally {
      setSubmittingMedical(false);
    }
  };

  const handleUploadRegistrationProof = async (e) => {
    e.preventDefault();
    setSubmittingRegistration(true);
    try {
      const studentId = profile?._id || student?._id;
      const formData = new FormData();
      formData.append('milestoneType', 'registration');
      formData.append('status', registrationForm.status);
      formData.append('remarks', registrationForm.remarks || registrationRemarksInput || '');
      if (registrationFile) {
        formData.append('proofDocument', registrationFile);
      }

      const res = await api.post(`/students/${studentId}/milestone-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Registration proof document saved successfully!');
        if (res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        }
        setShowRegistrationModal(false);
        setRegistrationFile(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save registration proof');
    } finally {
      setSubmittingRegistration(false);
    }
  };

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
              Track your scheduled dates assigned by branch staff and record milestone progress.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Medical Exam Card */}
          {(() => {
            const medDate = profile?.medical_date || profile?.dmtDates?.medicalExamDate;
            const isMedPassed = Boolean(
              profile?.dmtDates?.medicalExamPassed ||
              profile?.dmtDates?.medicalExamStatus === 'passed' ||
              profile?.dmtDates?.medicalDone
            );
            const isMedFailed = profile?.dmtDates?.medicalExamStatus === 'failed' || profile?.dmtDates?.medicalExamPassed === false;
            const medProofUrl = profile?.medicalDocumentUrl || profile?.dmtDates?.medicalDocumentUrl;
            const medRemarks = profile?.medicalRemarks || profile?.dmtDates?.medicalRemarks;
            const medPendingReq = myRescheduleRequests.find(
              (r) => r.milestone_type === 'medical' && r.status === 'Pending'
            );

            return (
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-cyan-400/30 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-white flex items-center gap-2 font-bold text-sm">
                      <Stethoscope className="w-5 h-5 text-emerald-400" /> 1. DMT Medical Exam
                    </span>
                    <span className={`badge text-xs font-bold py-1 px-3 ${
                      isMedPassed
                        ? 'badge-success'
                        : isMedFailed
                        ? 'badge-error'
                        : medDate
                        ? 'badge-warning'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isMedPassed ? '✓ PASSED' : isMedFailed ? '✕ FAILED' : medDate ? '⏳ SCHEDULED' : 'PENDING DATE'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1.5">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                      <span className="text-slate-400">Scheduled Medical Date:</span>
                      <span className="text-white font-bold font-mono">
                        {medDate
                          ? new Date(medDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                          : 'Not Yet Assigned by Staff'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      National Transport Medical Institute (NTMI) official medical fitness test.
                    </p>
                  </div>

                  {/* Uploaded Proof Document link */}
                  {medProofUrl && (
                    <div className="pt-1">
                      <a
                        href={`http://localhost:5001${medProofUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold transition-all"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>📄 View Medical Certificate / Proof</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  )}

                  {/* Medical Remarks */}
                  {medRemarks && (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-300">
                      <span className="text-slate-400 font-semibold block text-[10px]">Medical Remarks:</span>
                      <p className="mt-0.5 text-slate-200">{medRemarks}</p>
                    </div>
                  )}

                  {medPendingReq && (
                    <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-200 text-xs flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-purple-400" />
                      <span>
                        Reschedule Pending Review{' '}
                        {medPendingReq.preferred_date && `(Preferred: ${new Date(medPendingReq.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  {isMedPassed ? (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>✓ PASSED (Medical Examination Cleared)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMedicalForm({
                            status: 'passed',
                            remarks: medRemarks || '',
                          });
                          setShowMedicalModal(true);
                        }}
                        className="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Update Certificate / Proof Document</span>
                      </button>
                    </div>
                  ) : isMedFailed ? (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>✕ FAILED (Medical Examination Unfit)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMedicalForm({
                              status: 'failed',
                              remarks: medRemarks || '',
                            });
                            setShowMedicalModal(true);
                          }}
                          className="py-2 px-3 rounded-xl text-xs font-bold text-slate-300 border border-white/15 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Update Proof</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRescheduleMilestone('medical');
                            setRescheduleReason(medRemarks ? `Medical examination failed (${medRemarks}). Requesting re-test date.` : 'Medical examination failed. Requesting another medical exam date.');
                            setPreferredDate('');
                            setShowRescheduleModal(true);
                          }}
                          className="py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border bg-rose-500/20 hover:bg-rose-500/30 border-rose-400/50 text-rose-200 transition-all shadow"
                        >
                          <Calendar className="w-3.5 h-3.5 text-rose-400" />
                          <span>📅 Request Date for Another Day</span>
                        </button>
                      </div>
                    </div>
                  ) : medDate ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMedicalForm({
                            status: 'passed',
                            remarks: medRemarks || '',
                          });
                          setShowMedicalModal(true);
                        }}
                        className="btn-accent py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Record Result & Proof</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRescheduleMilestone('medical');
                          setRescheduleReason('');
                          setPreferredDate('');
                          setShowRescheduleModal(true);
                        }}
                        className="py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border bg-white/5 hover:bg-cyan-500/10 border-white/15 hover:border-cyan-400/40 text-cyan-300 transition-all shadow"
                      >
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>📅 Request Date for Another Day</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-dashed border-white/10 text-slate-400 text-xs flex items-center justify-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Awaiting Staff to Assign Initial Date</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 2. Learner Registration Card */}
          {(() => {
            const regDate = profile?.registration_date || profile?.dmtDates?.learnerRegistrationDate;
            const isRegDone = Boolean(profile?.dmtDates?.registrationDone);
            const regProofUrl = profile?.registrationDocumentUrl || profile?.dmtDates?.registrationDocumentUrl;
            const regRemarks = profile?.registrationRemarks || profile?.dmtDates?.registrationRemarks;
            const regPendingReq = myRescheduleRequests.find(
              (r) => r.milestone_type === 'registration' && r.status === 'Pending'
            );

            return (
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-cyan-400/30 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-white flex items-center gap-2 font-bold text-sm">
                      <FileText className="w-5 h-5 text-blue-400" /> 2. DMT Registration
                    </span>
                    <span className={`badge text-xs font-bold py-1 px-3 ${
                      isRegDone
                        ? 'badge-success'
                        : regDate
                        ? 'badge-warning'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isRegDone ? '✓ Done' : regDate ? '⏳ Pending Submission' : 'PENDING DATE'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1.5">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                      <span className="text-slate-400">DMT Submission Date:</span>
                      <span className="text-white font-bold font-mono">
                        {regDate
                          ? new Date(regDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                          : 'Not Yet Assigned by Staff'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Official registration documents submitted to DMT Werahara or local branch.
                    </p>
                  </div>

                  {/* Uploaded Registration Proof Document link */}
                  {regProofUrl && (
                    <div className="pt-1">
                      <a
                        href={`http://localhost:5001${regProofUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold transition-all"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>📄 View DMT Registration Proof</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  )}

                  {regPendingReq && (
                    <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-200 text-xs flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-purple-400" />
                      <span>
                        Reschedule Pending Review{' '}
                        {regPendingReq.preferred_date && `(Preferred: ${new Date(regPendingReq.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  {isRegDone ? (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        <span>✓ Done (DMT Registration Completed)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRegistrationForm({
                            status: 'done',
                            remarks: regRemarks || '',
                          });
                          setShowRegistrationModal(true);
                        }}
                        className="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Update Registration Slip / Proof Document</span>
                      </button>
                    </div>
                  ) : regDate ? (
                    <div className="space-y-3">
                      {/* Box for entering remarks */}
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-semibold">Enter Remarks / Notes:</span>
                          {savingRegRemarks && <span className="text-cyan-400 text-[10px] animate-pulse">Saving...</span>}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Waiting for photo / NIC, submission postponed..."
                            value={registrationRemarksInput}
                            onChange={(e) => setRegistrationRemarksInput(e.target.value)}
                            className="input input-sm flex-1 bg-white/5 border-white/15 text-white text-xs rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={handleSaveRegistrationRemarks}
                            disabled={savingRegRemarks}
                            className="btn-secondary text-xs px-3 py-1 rounded-xl font-bold shrink-0"
                          >
                            Save
                          </button>
                        </div>
                      </div>

                      {/* Action buttons: Mark Done / Upload Proof & Request Date for Another Day */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRegistrationForm({
                              status: 'done',
                              remarks: registrationRemarksInput || regRemarks || '',
                            });
                            setShowRegistrationModal(true);
                          }}
                          className="btn-accent py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Done & Upload Proof</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRescheduleMilestone('registration');
                            setRescheduleReason(registrationRemarksInput || regRemarks || '');
                            setPreferredDate('');
                            setShowRescheduleModal(true);
                          }}
                          className="py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border bg-white/5 hover:bg-cyan-500/10 border-white/15 hover:border-cyan-400/40 text-cyan-300 transition-all shadow"
                        >
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>⏳ Request Date for Another Day</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-dashed border-white/10 text-slate-400 text-xs flex items-center justify-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Awaiting Staff to Assign Initial Date</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 3. Written Theory Exam Card (Span 2 Cols) */}
          {(() => {
            const examDate = profile?.written_exam_date || profile?.dmtDates?.learnerExamDate;
            const isExamDateAssigned = Boolean(examDate);
            const isExamDateReached = isExamDateAssigned && new Date().setHours(0, 0, 0, 0) >= new Date(examDate).setHours(0, 0, 0, 0);
            const isExamFailedState = profile?.learnerExamStatus === 'failed' || (attemptsCount > 0 && !isExamPassed);
            const examPendingReq = myRescheduleRequests.find(
              (r) => r.milestone_type === 'theory_exam' && r.status === 'Pending'
            );

            return (
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
                  <span className={`badge text-xs font-bold py-1.5 px-3.5 ${
                    isExamPassed
                      ? 'badge-success'
                      : isExamFailedState
                      ? 'badge-error'
                      : examDate
                      ? 'badge-warning'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isExamPassed
                      ? `✓ PASSED (${profile?.dmtDates?.learnerExamMarks || profile?.learnerExamMarks || 35}/40 Marks)`
                      : isExamFailedState
                      ? `✕ Attempt ${attemptsCount || 1}/3 Failed`
                      : examDate
                      ? `⏳ Attempt ${attemptsCount + 1} of 3 (Scheduled)`
                      : `Attempt 1 of 3 (Pending Date)`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[11px]">Scheduled Exam Date:</span>
                    <span className="font-bold text-white text-sm font-mono mt-0.5 block">
                      {examDate
                        ? new Date(examDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
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

                  {examPendingReq && (
                    <div className="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-200 text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-purple-400" />
                      <span>
                        Reschedule Pending{' '}
                        {examPendingReq.preferred_date && `(${new Date(examPendingReq.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                      </span>
                    </div>
                  )}

                  {/* Student Result & Next Date Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!isExamPassed && isExamDateAssigned && isExamDateReached && (
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
                        className="btn-accent text-xs py-2 px-3.5 font-bold shadow-md flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Record Exam Result</span>
                      </button>
                    )}

                    {!isExamPassed && isExamDateAssigned && isExamFailedState && (
                      <button
                        type="button"
                        onClick={() => {
                          setRescheduleMilestone('theory_exam');
                          setRescheduleReason(`Attempt ${attemptsCount} failed. Requesting reschedule for next attempt (Attempt ${attemptsCount + 1}).`);
                          setPreferredDate('');
                          setShowRescheduleModal(true);
                        }}
                        className="py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border bg-rose-500/20 hover:bg-rose-500/30 border-rose-400/50 text-rose-200 transition-all shadow"
                      >
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        <span>📅 Request Date for Another Day (Attempt {attemptsCount + 1})</span>
                      </button>
                    )}

                    {!isExamPassed && isExamDateAssigned && !isExamFailedState && (
                      <button
                        type="button"
                        onClick={() => {
                          setRescheduleMilestone('theory_exam');
                          setRescheduleReason('');
                          setPreferredDate('');
                          setShowRescheduleModal(true);
                        }}
                        className="py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border bg-white/5 hover:bg-cyan-500/10 border-white/15 hover:border-cyan-400/40 text-cyan-300 transition-all shadow"
                      >
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>📅 Request Date for Another Day</span>
                      </button>
                    )}

                    {!isExamPassed && !isExamDateAssigned && (
                      <div className="py-2 px-3.5 rounded-xl bg-white/[0.03] border border-dashed border-white/10 text-slate-400 text-xs flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Awaiting Staff to Assign Initial Date</span>
                      </div>
                    )}

                    {isExamPassed && (
                      <span className="badge badge-success text-xs font-bold py-1.5 px-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>✓ PASSED ({profile?.dmtDates?.learnerExamMarks || profile?.learnerExamMarks || 35}/40 Marks) — Practical Lessons Unlocked</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 4. Practical Driving Trial Card (Span 2 Cols) */}
          {(() => {
            const trialPendingReq = myRescheduleRequests.find(
              (r) => (r.milestone_type === 'trial' || !r.milestone_type) && r.status === 'Pending'
            );

            return (
              <div className="md:col-span-2 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white flex items-center gap-2 font-bold text-sm">
                    <Car className="w-5 h-5 text-accent" /> 4. DMT Practical Driving Trial
                  </span>
                  <span className={`badge text-xs font-bold py-1 px-3 ${profile?.trial?.licenseObtained ? 'badge-success' : 'badge-warning'}`}>
                    {profile?.trial?.licenseObtained ? '✓ Licensed / Passed' : `${profile?.trial?.attempts?.length || 0}/3 Attempts Used`}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400 font-semibold">
                    Scheduled Trial Date:{' '}
                    <span className="text-white font-bold font-mono">
                      {profile?.trial_date
                        ? new Date(profile.trial_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : (isExamPassed ? 'Eligible to Schedule Trial with Instructor' : 'Locked — Pending Learner Theory Exam Pass')}
                    </span>
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {trialPendingReq && (
                      <span className="badge bg-purple-500/15 border border-purple-400/30 text-purple-200 text-xs font-bold py-1.5 px-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-pulse text-purple-400" />
                        <span>Reschedule Pending Review</span>
                      </span>
                    )}

                    {profile?.trial_date && !profile?.trial?.licenseObtained && (
                      <button
                        type="button"
                        onClick={() => {
                          setRescheduleMilestone('trial');
                          setRescheduleReason('');
                          setPreferredDate('');
                          setShowRescheduleModal(true);
                        }}
                        className="py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border bg-white/5 hover:bg-cyan-500/10 border-white/15 hover:border-cyan-400/40 text-cyan-300 transition-all shadow"
                      >
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>📅 Request Date for Another Day</span>
                      </button>
                    )}

                    {!profile?.trial_date && !profile?.trial?.licenseObtained && isExamPassed && (
                      <div className="py-2 px-3.5 rounded-xl bg-white/[0.03] border border-dashed border-white/10 text-slate-400 text-xs flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Awaiting Staff to Assign Initial Date</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
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

      {/* DMT Guidance Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-emerald-950/40 to-slate-900/80 border border-emerald-400/20 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <Stethoscope className="w-4 h-4" />
            <span>1. Medical Clearance</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Obtain your NTMI medical certificate at Nugegoda or Werahara before submission to the DMT.
          </p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-blue-950/40 to-slate-900/80 border border-blue-400/20 space-y-2.5">
          <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
            <FileText className="w-4 h-4" />
            <span>2. DMT Registration</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Documents submitted to DMT Werahara or branch. Official written exam date assigned upon submission.
          </p>
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

      {/* MODAL 2A: Update DMT Medical Exam Status & Proof Modal */}
      {showMedicalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.25)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-base">
                <Stethoscope className="w-5 h-5 text-emerald-400" />
                <span>1. DMT Medical Exam — Proof & Status</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMedicalModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadMedicalProof} className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Record your medical examination outcome and attach your official National Transport Medical Institute (NTMI) certificate or fitness report.
              </p>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Medical Exam Result: <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMedicalForm({ ...medicalForm, status: 'passed' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      medicalForm.status === 'passed'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>✓ PASSED</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMedicalForm({ ...medicalForm, status: 'failed' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      medicalForm.status === 'failed'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>✕ FAILED</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Attach Medical Certificate / Proof Document (PDF, JPG, PNG):
                </label>
                <div className="border-2 border-dashed border-white/15 hover:border-emerald-400/40 rounded-2xl p-4 text-center cursor-pointer transition-all bg-white/[0.02]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setMedicalFile(e.target.files[0] || null)}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 cursor-pointer"
                  />
                  {profile?.medicalDocumentUrl && !medicalFile && (
                    <p className="text-[11px] text-emerald-400 mt-2">
                      Current proof on file:{' '}
                      <a
                        href={`http://localhost:5001${profile.medicalDocumentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold"
                      >
                        View Document
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">Remarks / Doctor Notes:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Vision cleared with corrective lenses, blood pressure normal, NTMI certificate #10492"
                  value={medicalForm.remarks}
                  onChange={(e) => setMedicalForm({ ...medicalForm, remarks: e.target.value })}
                  className="textarea w-full bg-slate-950/80 border-white/20 text-white text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowMedicalModal(false)}
                  className="btn-secondary py-2.5 px-4 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMedical}
                  className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 shadow-lg rounded-xl bg-emerald-600 hover:bg-emerald-500"
                >
                  {submittingMedical ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Medical Status & Proof</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2B: Update DMT Registration Status & Proof Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-[0_0_50px_rgba(59,130,246,0.25)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-base">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>2. DMT Registration — Proof & Status</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRegistrationModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadRegistrationProof} className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Confirm your DMT Werahara / branch registration submission and attach your official registration receipt or acknowledged application form.
              </p>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Registration Status: <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegistrationForm({ ...registrationForm, status: 'done' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      registrationForm.status === 'done'
                        ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>✓ Done</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistrationForm({ ...registrationForm, status: 'pending' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      registrationForm.status === 'pending'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>⏳ Incomplete / Pending</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Attach Registration Slip / Proof Document (PDF, JPG, PNG):
                </label>
                <div className="border-2 border-dashed border-white/15 hover:border-blue-400/40 rounded-2xl p-4 text-center cursor-pointer transition-all bg-white/[0.02]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setRegistrationFile(e.target.files[0] || null)}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30 cursor-pointer"
                  />
                  {profile?.registrationDocumentUrl && !registrationFile && (
                    <p className="text-[11px] text-blue-400 mt-2">
                      Current proof on file:{' '}
                      <a
                        href={`http://localhost:5001${profile.registrationDocumentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold"
                      >
                        View Document
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Registration Remarks / Reference Number:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Acknowledged by Werahara counter 4, DMT Ref #WER-89421, biometrics scheduled"
                  value={registrationForm.remarks}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, remarks: e.target.value })}
                  className="textarea w-full bg-slate-950/80 border-white/20 text-white text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowRegistrationModal(false)}
                  className="btn-secondary py-2.5 px-4 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRegistration}
                  className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 shadow-lg rounded-xl bg-blue-600 hover:bg-blue-500"
                >
                  {submittingRegistration ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Registration Status & Proof</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Request Date for Another Day (Reschedule Request Modal) */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-[0_0_50px_rgba(6,182,212,0.25)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-base">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <span>
                  Request Date for Another Day —{' '}
                  {rescheduleMilestone === 'medical'
                    ? 'DMT Medical Exam'
                    : rescheduleMilestone === 'registration'
                    ? 'DMT Registration'
                    : rescheduleMilestone === 'theory_exam'
                    ? 'Written Theory Exam'
                    : 'Practical Driving Trial'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRescheduleModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const currentScheduledDate =
                rescheduleMilestone === 'medical'
                  ? (profile?.medical_date || profile?.dmtDates?.medicalExamDate)
                  : rescheduleMilestone === 'registration'
                  ? (profile?.registration_date || profile?.dmtDates?.learnerRegistrationDate)
                  : rescheduleMilestone === 'theory_exam'
                  ? (profile?.written_exam_date || profile?.dmtDates?.learnerExamDate)
                  : profile?.trial_date;

              const hasAssignedDate = Boolean(currentScheduledDate);

              return (
                <>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    If you cannot attend your scheduled appointment, submit your request below. A branch officer / Data Entry Officer will review your request and assign a new date.
                  </p>

                  {!hasAssignedDate && (
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        An initial date has not yet been assigned by branch staff for this milestone. A date must be assigned before you can request another date.
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitReschedule} className="space-y-4 text-xs">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">
                        Milestone Category:
                      </label>
                      <select
                        value={rescheduleMilestone}
                        onChange={(e) => setRescheduleMilestone(e.target.value)}
                        className="select w-full bg-slate-950/80 border-white/20 text-white font-bold text-xs rounded-xl"
                      >
                        <option value="medical">
                          1. DMT Medical Exam {profile?.medical_date || profile?.dmtDates?.medicalExamDate ? '' : '(No Date Assigned Yet)'}
                        </option>
                        <option value="registration">
                          2. DMT Registration {profile?.registration_date || profile?.dmtDates?.learnerRegistrationDate ? '' : '(No Date Assigned Yet)'}
                        </option>
                        <option value="theory_exam">
                          3. DMT Written Theory Exam {profile?.written_exam_date || profile?.dmtDates?.learnerExamDate ? '' : '(No Date Assigned Yet)'}
                        </option>
                        <option value="trial">
                          4. Practical Driving Trial {profile?.trial_date ? '' : '(No Date Assigned Yet)'}
                        </option>
                      </select>
                    </div>

                    {hasAssignedDate && (
                      <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Current Assigned Date:</span>
                        <span className="text-white font-mono font-bold">
                          {new Date(currentScheduledDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">
                        Preferred New Date (Optional):
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        disabled={!hasAssignedDate}
                        className="input w-full bg-slate-950/80 border-white/20 text-white font-mono text-xs rounded-xl disabled:opacity-50"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Leave blank if you want branch staff to assign the earliest available DMT date.
                      </span>
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">
                        Reason for Date Change / Reschedule Request: <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        disabled={!hasAssignedDate}
                        placeholder="e.g. Unable to attend on current scheduled date due to exam/work commitment, retake after failed attempt, medical postponement..."
                        value={rescheduleReason}
                        onChange={(e) => setRescheduleReason(e.target.value)}
                        className="textarea w-full bg-slate-950/80 border-white/20 text-white text-xs rounded-xl disabled:opacity-50"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setShowRescheduleModal(false)}
                        className="btn-secondary py-2.5 px-4 text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReschedule || !rescheduleReason.trim() || !hasAssignedDate}
                        className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 shadow-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingReschedule ? (
                          <>Submitting Request...</>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Submit Reschedule Request</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
