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
    const regDate = profile?.registration_date || profile?.dmtDates?.learnerRegistrationDate;
    if (!regDate) {
      toast.error('DMT Registration date has not been assigned by staff yet.');
      return;
    }
    const todayTime = new Date().setHours(0, 0, 0, 0);
    const regTime = new Date(regDate).setHours(0, 0, 0, 0);
    if (todayTime < regTime) {
      toast.error(`You cannot submit remarks before your scheduled date (${new Date(regDate).toLocaleDateString()}).`);
      return;
    }
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
    const medDate = profile?.medical_date || profile?.dmtDates?.medicalExamDate;
    if (!medDate) {
      toast.error('DMT Medical Exam date has not been assigned by staff yet.');
      return;
    }
    const todayTime = new Date().setHours(0, 0, 0, 0);
    const medTime = new Date(medDate).setHours(0, 0, 0, 0);
    if (todayTime < medTime) {
      toast.error(`You cannot update status or upload proof before your scheduled date (${new Date(medDate).toLocaleDateString()}).`);
      return;
    }
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
    const regDate = profile?.registration_date || profile?.dmtDates?.learnerRegistrationDate;
    if (!regDate) {
      toast.error('DMT Registration submission date has not been assigned by staff yet.');
      return;
    }
    const todayTime = new Date().setHours(0, 0, 0, 0);
    const regTime = new Date(regDate).setHours(0, 0, 0, 0);
    if (todayTime < regTime) {
      toast.error(`You cannot mark registration as completed or upload proof before your scheduled date (${new Date(regDate).toLocaleDateString()}).`);
      return;
    }
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
  const recordedExamMarks = profile?.learnerExamMarks ?? profile?.dmtDates?.learnerExamMarks;
  const isExamPassed = Boolean(
    (profile?.learnerExamPassed ||
    profile?.learnerExamStatus === 'passed' ||
    profile?.dmtDates?.learnerExamPassed) &&
    (recordedExamMarks === null || recordedExamMarks === undefined || recordedExamMarks > 30)
  );
  const attemptsCount = profile?.learnerExamAttempts?.length || (profile?.learnerExamStatus === 'failed' || (!isExamPassed && recordedExamMarks !== null && recordedExamMarks <= 30) ? 1 : 0);
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
    const marksNum = Number(examForm.marks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > 40) {
      toast.error('DMT Theory Exam marks must be between 0 and 40.');
      return;
    }
    if (examForm.result === 'passed' && marksNum <= 30) {
      toast.error('DMT Theory Exam requires marks greater than 30 (out of 40) to pass. Marks of 30 or below is a Fail.');
      return;
    }
    if (examForm.result === 'failed' && marksNum > 30) {
      toast.error('Score is greater than 30 marks, which qualifies for a Pass. Please select PASSED or adjust marks.');
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
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#DBE2EF] pb-4">
        <div className="flex items-center gap-2 text-xs text-[#4B6584] font-medium">
          <Link to="/student/dashboard" className="hover:text-[#3F72AF] flex items-center gap-1 transition-colors">
            Student Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-[#3F72AF] font-bold">DMT Milestone Schedule</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge badge-info text-xs font-mono font-bold">
            Type 1: New Learner
          </span>
          <span className="text-xs text-[#4B6584] font-semibold font-mono">
            {profile?.branch} Branch
          </span>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="card p-6 sm:p-8 bg-gradient-to-r from-blue-50/90 via-white to-cyan-50/70 border border-[#DBE2EF] rounded-3xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="badge badge-accent text-[10px] font-black uppercase tracking-wider">
                Official DMT Tracking
              </span>
              <span className="text-xs text-[#3F72AF] font-bold font-mono">
                Student ID: {profile?.studentIdNumber || profile?._id?.slice(-6)?.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B2447] flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[#3F72AF]" />
              Government DMT Milestone Schedule
            </h1>
            <p className="text-sm text-[#334E68] max-w-2xl leading-relaxed font-medium">
              Track your official Department of Motor Traffic (DMT) milestones from medical examination and learner registration to the written theory test and final practical trial.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to="/student/quiz"
              className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Practice Exam Quizzes</span>
            </Link>
          </div>
        </div>

        {/* Decorative Background Accent */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Auto-cancellation Warning Banner (if 3 attempts failed) */}
      {profile?.isRegistrationCancelled && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3 text-rose-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-rose-900 text-sm">Registration Auto-Cancelled (3 Failed Attempts)</p>
              <p className="text-rose-700 mt-0.5 font-medium leading-relaxed">
                In accordance with DMT regulations, you have reached the maximum allowed 3 theory exam attempts. To continue, you must re-register as a new learner.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={reRegistering}
            onClick={handleReRegister}
            className="btn-primary bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-4 whitespace-nowrap shadow-md flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{reRegistering ? 'Processing...' : 'Re-Register Now (Rs. 5,000)'}</span>
          </button>
        </div>
      )}

      {/* Grid: 4 Core DMT Milestones */}
      <div className="card p-6 sm:p-8 space-y-6 bg-white border border-[#DBE2EF] rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DBE2EF] pb-4 gap-3">
          <div>
            <span className="badge badge-accent text-[10px] font-bold uppercase mb-1">
              Step-by-Step Progress
            </span>
            <h2 className="text-xl font-black text-[#0B2447] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#3F72AF]" /> Milestone Tracking Cards
            </h2>
            <p className="text-xs text-[#4B6584] font-medium">
              Track your scheduled dates assigned by branch staff and record milestone progress.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Medical Exam Card */}
          {(() => {
            const medDate = profile?.medical_date || profile?.dmtDates?.medicalExamDate;
            const isMedDateAssigned = Boolean(medDate);
            const isMedDateReached = isMedDateAssigned && new Date().setHours(0, 0, 0, 0) >= new Date(medDate).setHours(0, 0, 0, 0);

            const isMedPassed = isMedDateAssigned && Boolean(
              profile?.dmtDates?.medicalExamPassed === true ||
              profile?.dmtDates?.medicalExamStatus === 'passed' ||
              profile?.dmtDates?.medicalDone
            );
            // Failed status only applies if the scheduled date has arrived/passed
            const isMedFailed = isMedDateAssigned && isMedDateReached && !isMedPassed && (
              profile?.dmtDates?.medicalExamStatus === 'failed' ||
              profile?.dmtDates?.medicalExamPassed === false
            );
            const medProofUrl = isMedDateAssigned ? (profile?.medicalDocumentUrl || profile?.dmtDates?.medicalDocumentUrl) : null;
            const medRemarks = isMedDateAssigned ? (profile?.medicalRemarks || profile?.dmtDates?.medicalRemarks) : null;
            const medPendingReq = myRescheduleRequests.find(
              (r) => r.milestone_type === 'medical' && r.status === 'Pending'
            );

            return (
              <div className="p-5 rounded-2xl bg-[#FAFBFC] border-2 border-[#DBE2EF] hover:border-[#3F72AF]/50 space-y-4 transition-all flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-[#0B2447] flex items-center gap-2 font-extrabold text-sm sm:text-base">
                      <Stethoscope className="w-5 h-5 text-emerald-600" /> 1. DMT Medical Exam
                    </span>
                    <span className={`badge text-xs font-bold py-1 px-3 ${
                      !isMedDateAssigned
                        ? 'bg-slate-100 text-[#4B6584] border border-slate-300'
                        : !isMedDateReached
                        ? 'bg-blue-50 text-[#19376D] border border-blue-200'
                        : isMedPassed
                        ? 'badge-success'
                        : isMedFailed
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}>
                      {!isMedDateAssigned
                        ? 'PENDING DATE'
                        : !isMedDateReached
                        ? '⏳ SCHEDULED'
                        : isMedPassed
                        ? '✓ PASSED'
                        : isMedFailed
                        ? '✕ FAILED'
                        : '⏳ ACTION REQUIRED'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#DBE2EF] shadow-xs">
                      <span className="text-xs font-semibold text-[#4B6584]">Scheduled Medical Date:</span>
                      <span className="text-sm font-extrabold font-mono text-[#0B2447]">
                        {medDate
                          ? new Date(medDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                          : 'Not Yet Assigned by Staff'}
                      </span>
                    </div>
                    <p className="text-xs text-[#4B6584] font-medium leading-relaxed">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition-all shadow-xs"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                        <span>📄 View Medical Certificate / Proof</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  )}

                  {/* Medical Remarks */}
                  {medRemarks && (
                    <div className="p-3 rounded-xl bg-white border border-[#DBE2EF] text-xs text-[#334E68] shadow-xs">
                      <span className="text-[#64748B] font-bold text-[11px] block">Medical Remarks:</span>
                      <p className="mt-0.5 text-[#0B2447] font-medium">{medRemarks}</p>
                    </div>
                  )}

                  {medPendingReq && (
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-purple-600 shrink-0" />
                      <span>
                        Reschedule Pending Review{' '}
                        {medPendingReq.preferred_date && `(Preferred: ${new Date(medPendingReq.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  {!isMedDateAssigned ? (
                    <div className="p-3 rounded-xl bg-white border border-dashed border-[#CBD5E1] text-[#4B6584] text-xs font-semibold flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-[#64748B]" />
                      <span>Awaiting Staff to Assign Initial Date</span>
                    </div>
                  ) : !isMedDateReached ? (
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-[#19376D] text-xs flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#3F72AF] shrink-0" />
                          <span>
                            Exam scheduled for <strong className="text-[#0B2447]">{new Date(medDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>. Status update (Pass/Fail) unlocks on exam day.
                          </span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRescheduleMilestone('medical');
                          setRescheduleReason('');
                          setPreferredDate('');
                          setShowRescheduleModal(true);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#DBE2EF] bg-white hover:bg-blue-50/60 text-[#19376D] transition-all shadow-xs"
                      >
                        <Calendar className="w-4 h-4 text-[#3F72AF]" />
                        <span>📅 Request Date for Another Day</span>
                      </button>
                    </div>
                  ) : isMedPassed ? (
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold text-[#334E68] hover:text-[#0B2447] border border-[#DBE2EF] hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#3F72AF]" />
                        <span>Update Certificate / Proof Document</span>
                      </button>
                    </div>
                  ) : isMedFailed ? (
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
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
                          className="py-2.5 px-3 rounded-xl text-xs font-bold text-[#334E68] border border-[#DBE2EF] bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#3F72AF]" />
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
                          className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 transition-all shadow-xs"
                        >
                          <Calendar className="w-3.5 h-3.5 text-rose-600" />
                          <span>📅 Request Date for Another Day</span>
                        </button>
                      </div>
                    </div>
                  ) : (
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
                        className="btn-accent py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
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
                        className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#DBE2EF] bg-white hover:bg-blue-50/60 text-[#19376D] transition-all shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#3F72AF]" />
                        <span>📅 Request Date for Another Day</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 2. Learner Registration Card */}
          {(() => {
            const regDate = profile?.registration_date || profile?.dmtDates?.learnerRegistrationDate;
            const isRegDateAssigned = Boolean(regDate);
            const isRegDateReached = isRegDateAssigned && new Date().setHours(0, 0, 0, 0) >= new Date(regDate).setHours(0, 0, 0, 0);

            const isRegDone = isRegDateAssigned && Boolean(profile?.dmtDates?.registrationDone);
            const regProofUrl = isRegDateAssigned ? (profile?.registrationDocumentUrl || profile?.dmtDates?.registrationDocumentUrl) : null;
            const regRemarks = isRegDateAssigned ? (profile?.registrationRemarks || profile?.dmtDates?.registrationRemarks) : null;
            const regPendingReq = myRescheduleRequests.find(
              (r) => r.milestone_type === 'registration' && r.status === 'Pending'
            );

            return (
              <div className="p-5 rounded-2xl bg-[#FAFBFC] border-2 border-[#DBE2EF] hover:border-[#3F72AF]/50 space-y-4 transition-all flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-[#0B2447] flex items-center gap-2 font-extrabold text-sm sm:text-base">
                      <FileText className="w-5 h-5 text-[#3F72AF]" /> 2. DMT Registration
                    </span>
                    <span className={`badge text-xs font-bold py-1 px-3 ${
                      !isRegDateAssigned
                        ? 'bg-slate-100 text-[#4B6584] border border-slate-300'
                        : isRegDone
                        ? 'badge-success'
                        : isRegDateReached
                        ? 'badge-warning'
                        : 'bg-blue-50 text-[#19376D] border border-blue-200'
                    }`}>
                      {!isRegDateAssigned
                        ? 'PENDING DATE'
                        : isRegDone
                        ? '✓ Done'
                        : isRegDateReached
                        ? '⏳ Pending Submission'
                        : '⏳ SCHEDULED'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#DBE2EF] shadow-xs">
                      <span className="text-xs font-semibold text-[#4B6584]">DMT Submission Date:</span>
                      <span className="text-sm font-extrabold font-mono text-[#0B2447]">
                        {regDate
                          ? new Date(regDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                          : 'Not Yet Assigned by Staff'}
                      </span>
                    </div>
                    <p className="text-xs text-[#4B6584] font-medium leading-relaxed">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 text-xs font-bold transition-all shadow-xs"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                        <span>📄 View DMT Registration Proof</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  )}

                  {regPendingReq && (
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-purple-600 shrink-0" />
                      <span>
                        Reschedule Pending Review{' '}
                        {regPendingReq.preferred_date && `(Preferred: ${new Date(regPendingReq.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  {!isRegDateAssigned ? (
                    <div className="p-3 rounded-xl bg-white border border-dashed border-[#CBD5E1] text-[#4B6584] text-xs font-semibold flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-[#64748B]" />
                      <span>Awaiting Staff to Assign Initial Date</span>
                    </div>
                  ) : isRegDone ? (
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold text-[#334E68] hover:text-[#0B2447] border border-[#DBE2EF] hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#3F72AF]" />
                        <span>Update Registration Slip / Proof Document</span>
                      </button>
                    </div>
                  ) : !isRegDateReached ? (
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-[#19376D] text-xs flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#3F72AF] shrink-0" />
                          <span>Completion & proof unlock on scheduled date ({new Date(regDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRescheduleMilestone('registration');
                          setRescheduleReason(registrationRemarksInput || regRemarks || '');
                          setPreferredDate('');
                          setShowRescheduleModal(true);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#DBE2EF] bg-white hover:bg-blue-50/60 text-[#19376D] transition-all shadow-xs"
                      >
                        <Calendar className="w-4 h-4 text-[#3F72AF]" />
                        <span>⏳ Request Date for Another Day</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Box for entering remarks */}
                      <div className="p-3 rounded-xl bg-white border border-[#DBE2EF] space-y-2 shadow-xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#0B2447] font-bold">Enter Remarks / Notes:</span>
                          {savingRegRemarks && <span className="text-[#3F72AF] text-[10px] font-bold animate-pulse">Saving...</span>}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Waiting for photo / NIC, submission postponed..."
                            value={registrationRemarksInput}
                            onChange={(e) => setRegistrationRemarksInput(e.target.value)}
                            className="input input-sm flex-1 bg-[#FAFBFC] border-[#DBE2EF] text-[#0B2447] text-xs rounded-xl"
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
                          className="btn-accent py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
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
                          className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#DBE2EF] bg-white hover:bg-blue-50/60 text-[#19376D] transition-all shadow-xs"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#3F72AF]" />
                          <span>⏳ Request Date for Another Day</span>
                        </button>
                      </div>
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
              <div className="md:col-span-2 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/40 border-2 border-indigo-200/80 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DBE2EF] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-[#0B2447]">3. DMT Written Theory Exam</h4>
                      <p className="text-xs text-[#4B6584] font-medium">
                        Official computer-based theory examination at DMT. Maximum of 3 attempts allowed.
                      </p>
                    </div>
                  </div>
                  <span className={`badge text-xs font-bold py-1.5 px-3.5 ${
                    isExamPassed
                      ? 'badge-success'
                      : isExamFailedState
                      ? 'badge-danger'
                      : examDate
                      ? 'badge-warning'
                      : 'bg-slate-100 text-[#4B6584] border border-slate-300'
                  }`}>
                    {isExamPassed
                      ? `✓ PASSED (${recordedExamMarks || 35}/40 Marks)`
                      : isExamFailedState
                      ? `✕ Attempt ${attemptsCount || 1}/3 Failed${recordedExamMarks !== null && recordedExamMarks !== undefined ? ` (${recordedExamMarks}/40 Marks)` : ''}`
                      : examDate
                      ? `⏳ Attempt ${attemptsCount + 1} of 3 (Scheduled)`
                      : `Attempt 1 of 3 (Pending Date)`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-white rounded-xl border border-[#DBE2EF] shadow-xs">
                    <span className="text-[#64748B] block text-xs font-semibold">Scheduled Exam Date:</span>
                    <span className="font-extrabold text-[#0B2447] text-sm sm:text-base font-mono mt-0.5 block">
                      {examDate
                        ? new Date(examDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : 'Date Not Yet Assigned by Staff'}
                    </span>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-[#DBE2EF] shadow-xs">
                    <span className="text-[#64748B] block text-xs font-semibold">Attempts Status:</span>
                    <span className="font-bold text-[#0B2447] text-xs sm:text-sm mt-0.5 block">
                      {isExamPassed
                        ? '✓ Cleared — Practical Lessons Unlocked'
                        : recordedExamMarks !== null && recordedExamMarks !== undefined && recordedExamMarks <= 30
                        ? `✕ Scored ${recordedExamMarks}/40 (Score ≤ 30 Failed — Pass requires > 30)`
                        : `${remainingAttempts} attempt(s) remaining before auto-cancellation`}
                    </span>
                  </div>
                </div>

                {/* 3 Attempts Indicator Badges & Action Buttons */}
                <div className="p-4 rounded-xl bg-white border border-[#DBE2EF] flex items-center justify-between flex-wrap gap-3 text-xs shadow-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#0B2447] text-xs font-bold">Attempts Track:</span>
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
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                              : isFailedAttempt
                              ? 'bg-rose-50 border-rose-300 text-rose-800 line-through'
                              : isCurrentPending
                              ? 'bg-blue-50 border-blue-400 text-[#19376D] ring-2 ring-blue-300/40'
                              : 'bg-slate-50 border-slate-200 text-[#64748B]'
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
                    <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-purple-600" />
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
                        className="py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 transition-all shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5 text-rose-600" />
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
                        className="py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-[#DBE2EF] bg-white hover:bg-blue-50/60 text-[#19376D] transition-all shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#3F72AF]" />
                        <span>📅 Request Date for Another Day</span>
                      </button>
                    )}

                    {!isExamPassed && !isExamDateAssigned && (
                      <div className="py-2 px-3.5 rounded-xl bg-white border border-dashed border-[#CBD5E1] text-[#4B6584] text-xs font-semibold flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#64748B]" />
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
              <div className="md:col-span-2 p-5 sm:p-6 rounded-2xl bg-[#FAFBFC] border-2 border-[#DBE2EF] space-y-4 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#0B2447] flex items-center gap-2 font-extrabold text-sm sm:text-base">
                    <Car className="w-5 h-5 text-[#3F72AF]" /> 4. DMT Practical Driving Trial
                  </span>
                  <span className={`badge text-xs font-bold py-1 px-3 ${profile?.trial?.licenseObtained ? 'badge-success' : 'badge-warning'}`}>
                    {profile?.trial?.licenseObtained ? '✓ Licensed / Passed' : `${profile?.trial?.attempts?.length || 0}/3 Attempts Used`}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs p-3.5 bg-white rounded-xl border border-[#DBE2EF] shadow-xs">
                  <span className="text-[#4B6584] font-semibold">
                    Scheduled Trial Date:{' '}
                    <span className="text-[#0B2447] font-extrabold font-mono text-sm ml-1">
                      {profile?.trial_date
                        ? new Date(profile.trial_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : (isExamPassed ? 'Eligible to Schedule Trial with Instructor' : 'Locked — Pending Learner Theory Exam Pass')}
                    </span>
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {trialPendingReq && (
                      <span className="badge bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold py-1.5 px-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-pulse text-purple-600" />
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
                        className="py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-[#DBE2EF] bg-white hover:bg-blue-50/60 text-[#19376D] transition-all shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#3F72AF]" />
                        <span>📅 Request Date for Another Day</span>
                      </button>
                    )}

                    {!profile?.trial_date && !profile?.trial?.licenseObtained && isExamPassed && (
                      <div className="py-2 px-3.5 rounded-xl bg-slate-50 border border-dashed border-[#CBD5E1] text-[#4B6584] text-xs font-semibold flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#64748B]" />
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
      <div className="card p-6 sm:p-8 space-y-4 bg-white border border-[#DBE2EF] rounded-3xl shadow-sm">
        <div className="border-b border-[#DBE2EF] pb-3">
          <h3 className="text-base font-extrabold text-[#0B2447] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#3F72AF]" /> Complete DMT Progression Timeline
          </h3>
          <p className="text-xs text-[#4B6584] font-medium">
            A linear progression of each stage required by the Department of Motor Traffic.
          </p>
        </div>
        <DmtMilestoneTimeline student={profile} />
      </div>

      {/* DMT Guidance Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 border border-emerald-200 rounded-2xl space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            <span>1. Medical Clearance</span>
          </div>
          <p className="text-xs text-[#334E68] leading-relaxed font-medium">
            Obtain your NTMI medical certificate at Nugegoda or Werahara before submission to the DMT.
          </p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 border border-blue-200 rounded-2xl space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2 text-blue-800 font-extrabold text-sm">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>2. DMT Registration</span>
          </div>
          <p className="text-xs text-[#334E68] leading-relaxed font-medium">
            Documents submitted to DMT Werahara or branch. Official written exam date assigned upon submission.
          </p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border border-amber-200 rounded-2xl space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
            <Car className="w-4 h-4 text-amber-600" />
            <span>Practical Trial Lessons</span>
          </div>
          <p className="text-xs text-[#334E68] leading-relaxed font-medium">
            Once you record a passing score, you will choose your vehicle package, pay your course balance, and begin hands-on road training.
          </p>
        </div>
      </div>

      {/* MODAL 2: Record Exam Result Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#DBE2EF] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto text-[#1E293B]">
            <div className="flex items-center justify-between border-b border-[#DBE2EF] pb-4">
              <div className="flex items-center gap-2 text-indigo-800 font-extrabold text-base">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Record DMT Theory Exam Result</span>
              </div>
              <button
                type="button"
                onClick={() => setIsExamModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0B2447] p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExamResult} className="space-y-4 text-xs">
              <p className="text-[#4B6584] leading-relaxed font-medium">
                Submit the marks and outcome of your official DMT Theory Exam. Passing (score ≥ 30/40) will immediately unlock practical training and vehicle packages.
              </p>

              <div>
                <label className="text-[#0B2447] font-bold block mb-1.5 text-xs">Examination Result:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExamForm({ ...examForm, result: 'passed' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      examForm.result === 'passed'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                        : 'bg-[#FAFBFC] border-[#DBE2EF] text-[#4B6584] hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>PASSED</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamForm({ ...examForm, result: 'failed' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      examForm.result === 'failed'
                        ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs'
                        : 'bg-[#FAFBFC] border-[#DBE2EF] text-[#4B6584] hover:bg-slate-50'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>FAILED</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[#0B2447] font-bold block mb-1.5 text-xs">
                  Marks Scored (Out of 40):
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  required
                  placeholder="e.g. 35 (Pass: > 30)"
                  value={examForm.marks}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = Number(val);
                    let newRes = examForm.result;
                    if (val !== '' && !isNaN(num)) {
                      if (num > 30 && num <= 40) newRes = 'passed';
                      else if (num <= 30 && num >= 0) newRes = 'failed';
                    }
                    setExamForm({ ...examForm, marks: val, result: newRes });
                  }}
                  className={`input w-full bg-[#FAFBFC] text-[#0B2447] font-mono text-sm font-bold rounded-xl focus:bg-white ${
                    examForm.marks !== '' && (Number(examForm.marks) < 0 || Number(examForm.marks) > 40)
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : examForm.marks !== '' && Number(examForm.marks) > 30
                      ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                      : examForm.marks !== '' && Number(examForm.marks) <= 30
                      ? 'border-amber-500 ring-1 ring-amber-500/20'
                      : 'border-[#DBE2EF]'
                  }`}
                />
                {/* Live Marks Feedback */}
                {examForm.marks !== '' && examForm.marks !== null && (
                  <div className="mt-1.5 text-xs">
                    {Number(examForm.marks) < 0 || Number(examForm.marks) > 40 ? (
                      <span className="text-rose-600 font-bold">✕ Invalid: Marks must be between 0 and 40.</span>
                    ) : Number(examForm.marks) > 30 ? (
                      <span className="text-emerald-700 font-bold">✓ Passing Score ({examForm.marks}/40): Qualifies for Pass (&gt; 30).</span>
                    ) : (
                      <span className="text-amber-700 font-bold">⚠️ Failing Score ({examForm.marks}/40): 30 or below is a Fail (Pass requires &gt; 30).</span>
                    )}
                  </div>
                )}
                {examForm.marks === '' && (
                  <p className="text-[11px] text-[#64748B] mt-1 font-medium">
                    DMT Rule: Passing requires strictly &gt; 30 marks (31 to 40).
                  </p>
                )}
              </div>

              <div>
                <label className="text-[#0B2447] font-bold block mb-1.5 text-xs">Exam Date Faced:</label>
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-[#3F72AF] absolute left-3.5 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={examForm.examDate}
                    onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                    className="input w-full pl-10 pr-3.5 bg-[#FAFBFC] border border-[#DBE2EF] text-[#0B2447] font-mono text-xs font-bold rounded-xl focus:bg-white cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#0B2447] font-bold block mb-1.5 text-xs">Optional Notes:</label>
                <input
                  type="text"
                  placeholder="e.g. Taken at DMT Werahara Hall 2"
                  value={examForm.notes}
                  onChange={(e) => setExamForm({ ...examForm, notes: e.target.value })}
                  className="input w-full bg-[#FAFBFC] border border-[#DBE2EF] text-[#0B2447] text-xs font-medium rounded-xl focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DBE2EF]">
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
                  className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5 shadow-md"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#DBE2EF] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto text-[#1E293B]">
            <div className="flex items-center justify-between border-b border-[#DBE2EF] pb-4">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-base">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                <span>1. DMT Medical Exam — Proof & Status</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMedicalModal(false)}
                className="text-[#94A3B8] hover:text-[#0B2447] p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadMedicalProof} className="space-y-4 text-xs">
              <p className="text-[#4B6584] leading-relaxed font-medium">
                Record your medical examination outcome and attach your official National Transport Medical Institute (NTMI) certificate or fitness report.
              </p>

              <div>
                <label className="text-[#0B2447] font-bold block mb-1.5 text-xs">
                  Medical Exam Result: <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMedicalForm({ ...medicalForm, status: 'passed' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      medicalForm.status === 'passed'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                        : 'bg-[#FAFBFC] border-[#DBE2EF] text-[#4B6584] hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✓ PASSED</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMedicalForm({ ...medicalForm, status: 'failed' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      medicalForm.status === 'failed'
                        ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs'
                        : 'bg-[#FAFBFC] border-[#DBE2EF] text-[#4B6584] hover:bg-slate-50'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>✕ FAILED</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[#0B2447] font-bold block mb-1.5 text-xs">
                  Attach Medical Certificate / Proof Document (PDF, JPG, PNG):
                </label>
                <div className="border-2 border-dashed border-[#CBD5E1] hover:border-[#3F72AF] rounded-2xl p-4 text-center cursor-pointer transition-all bg-[#FAFBFC]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setMedicalFile(e.target.files[0] || null)}
                    className="block w-full text-xs text-[#4B6584] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 cursor-pointer"
                  />
                  {profile?.medicalDocumentUrl && !medicalFile && (
                    <p className="text-[11px] text-emerald-700 mt-2 font-medium">
                      Current proof on file:{' '}
                      <a
                        href={`http://localhost:5001${profile.medicalDocumentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold text-emerald-800 hover:text-emerald-950"
                      >
                        View Document
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[#0B2447] font-bold block mb-1.5 text-xs">Remarks / Doctor Notes:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Vision cleared with corrective lenses, blood pressure normal, NTMI certificate #10492"
                  value={medicalForm.remarks}
                  onChange={(e) => setMedicalForm({ ...medicalForm, remarks: e.target.value })}
                  className="textarea w-full bg-[#FAFBFC] border border-[#DBE2EF] text-[#0B2447] text-xs font-medium rounded-xl focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DBE2EF] flex-wrap">
                {(profile?.medical_date || profile?.dmtDates?.medicalExamDate) &&
                  new Date().setHours(0, 0, 0, 0) <
                    new Date(profile?.medical_date || profile?.dmtDates?.medicalExamDate).setHours(0, 0, 0, 0) && (
                    <p className="w-full text-[11px] text-amber-900 bg-amber-50 border border-amber-200 p-2.5 rounded-xl mb-2 font-medium">
                      ⏳ Medical Exam is scheduled for{' '}
                      <strong className="text-amber-950">
                        {new Date(profile?.medical_date || profile?.dmtDates?.medicalExamDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </strong>
                      . Result and proof submission unlocks on the exam date.
                    </p>
                  )}

                <button
                  type="button"
                  onClick={() => setShowMedicalModal(false)}
                  className="btn-secondary py-2.5 px-4 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    submittingMedical ||
                    Boolean(
                      (profile?.medical_date || profile?.dmtDates?.medicalExamDate) &&
                        new Date().setHours(0, 0, 0, 0) <
                          new Date(profile?.medical_date || profile?.dmtDates?.medicalExamDate).setHours(0, 0, 0, 0)
                    )
                  }
                  className={`btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 shadow-md rounded-xl bg-emerald-600 hover:bg-emerald-700 ${
                    Boolean(
                      (profile?.medical_date || profile?.dmtDates?.medicalExamDate) &&
                        new Date().setHours(0, 0, 0, 0) <
                          new Date(profile?.medical_date || profile?.dmtDates?.medicalExamDate).setHours(0, 0, 0, 0)
                    )
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#DBE2EF] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto text-[#1E293B]">
            <div className="flex items-center justify-between border-b border-[#DBE2EF] pb-4">
              <div className="flex items-center gap-2 text-blue-800 font-extrabold text-base">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>2. DMT Registration — Proof & Status</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRegistrationModal(false)}
                className="text-[#94A3B8] hover:text-[#0B2447] p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadRegistrationProof} className="space-y-4 text-xs">
              <p className="text-[#4B6584] leading-relaxed font-medium">
                Confirm your DMT Werahara / branch registration submission and attach your official registration receipt or acknowledged application form.
              </p>

              <div>
                <label className="text-[#0B2447] font-bold block mb-1.5 text-xs">
                  Registration Status: <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegistrationForm({ ...registrationForm, status: 'done' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      registrationForm.status === 'done'
                        ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-xs'
                        : 'bg-[#FAFBFC] border-[#DBE2EF] text-[#4B6584] hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>✓ Done</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistrationForm({ ...registrationForm, status: 'pending' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      registrationForm.status === 'pending'
                        ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                        : 'bg-[#FAFBFC] border-[#DBE2EF] text-[#4B6584] hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>⏳ Incomplete / Pending</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[#0B2447] font-bold block mb-1.5 text-xs">
                  Attach Registration Slip / Proof Document (PDF, JPG, PNG):
                </label>
                <div className="border-2 border-dashed border-[#CBD5E1] hover:border-[#3F72AF] rounded-2xl p-4 text-center cursor-pointer transition-all bg-[#FAFBFC]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setRegistrationFile(e.target.files[0] || null)}
                    className="block w-full text-xs text-[#4B6584] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-800 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {profile?.registrationDocumentUrl && !registrationFile && (
                    <p className="text-[11px] text-blue-700 mt-2 font-medium">
                      Current proof on file:{' '}
                      <a
                        href={`http://localhost:5001${profile.registrationDocumentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold text-blue-800 hover:text-blue-950"
                      >
                        View Document
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[#0B2447] font-bold block mb-1.5 text-xs">
                  Registration Remarks / Reference Number:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Acknowledged by Werahara counter 4, DMT Ref #WER-89421, biometrics scheduled"
                  value={registrationForm.remarks}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, remarks: e.target.value })}
                  className="textarea w-full bg-[#FAFBFC] border border-[#DBE2EF] text-[#0B2447] text-xs font-medium rounded-xl focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DBE2EF]">
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
                  className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 shadow-md rounded-xl bg-blue-600 hover:bg-blue-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#DBE2EF] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto my-auto text-[#1E293B]">
            <div className="flex items-center justify-between border-b border-[#DBE2EF] pb-4">
              <div className="flex items-center gap-2 text-[#0B2447] font-extrabold text-base">
                <Calendar className="w-5 h-5 text-[#3F72AF]" />
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
                className="text-[#94A3B8] hover:text-[#0B2447] p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
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
                  <p className="text-xs text-[#4B6584] leading-relaxed font-medium">
                    If you cannot attend your scheduled appointment, submit your request below. A branch officer / Data Entry Officer will review your request and assign a new date.
                  </p>

                  {!hasAssignedDate && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        An initial date has not yet been assigned by branch staff for this milestone. A date must be assigned before you can request another date.
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitReschedule} className="space-y-4 text-xs">
                    <div>
                      <label className="text-[#0B2447] font-bold block mb-1 text-xs">
                        Milestone Category:
                      </label>
                      <select
                        value={rescheduleMilestone}
                        onChange={(e) => setRescheduleMilestone(e.target.value)}
                        className="select w-full bg-[#FAFBFC] border border-[#DBE2EF] text-[#0B2447] font-bold text-xs rounded-xl focus:bg-white"
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
                      <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs">
                        <span className="text-[#4B6584] font-semibold">Current Assigned Date:</span>
                        <span className="text-[#0B2447] font-mono font-extrabold">
                          {new Date(currentScheduledDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="text-[#0B2447] font-bold block mb-1 text-xs">
                        Preferred New Date (Optional):
                      </label>
                      <div className="relative flex items-center">
                        <Calendar className="w-4 h-4 text-[#3F72AF] absolute left-3.5 pointer-events-none" />
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          disabled={!hasAssignedDate}
                          className="input w-full pl-10 pr-3.5 bg-[#FAFBFC] border border-[#DBE2EF] text-[#0B2447] font-mono text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer focus:bg-white"
                        />
                      </div>
                      <span className="text-[10px] text-[#64748B] block mt-1 font-medium">
                        Leave blank if you want branch staff to assign the earliest available DMT date.
                      </span>
                    </div>

                    <div>
                      <label className="text-[#0B2447] font-bold block mb-1 text-xs">
                        Reason for Date Change / Reschedule Request: <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        disabled={!hasAssignedDate}
                        placeholder="e.g. Unable to attend on current scheduled date due to exam/work commitment, retake after failed attempt, medical postponement..."
                        value={rescheduleReason}
                        onChange={(e) => setRescheduleReason(e.target.value)}
                        className="textarea w-full bg-[#FAFBFC] border border-[#DBE2EF] text-[#0B2447] text-xs font-medium rounded-xl disabled:opacity-50 focus:bg-white"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DBE2EF]">
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
                        className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 shadow-md rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
