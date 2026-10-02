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
  CreditCard,
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

  // Final Driving License Photo State (US Requirements 6 & 7)
  const [licensePhotoFile, setLicensePhotoFile] = useState(null);
  const [licensePhotoPreview, setLicensePhotoPreview] = useState(null);
  const [licenseNumberInput, setLicenseNumberInput] = useState('');
  const [uploadingLicensePhoto, setUploadingLicensePhoto] = useState(false);

  useEffect(() => {
    if (profile?.finalLicense?.licenseNumber) {
      setLicenseNumberInput(profile.finalLicense.licenseNumber);
    }
  }, [profile?.finalLicense?.licenseNumber]);

  const handleLicensePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      toast.error('Only JPG, JPEG, PNG, or WEBP image formats are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be 10MB or less.');
      return;
    }
    setLicensePhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLicensePhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadFinalLicense = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!licensePhotoFile && !profile?.finalLicense?.licensePhotoUrl) {
      toast.error('Please choose a license photo to upload.');
      return;
    }
    setUploadingLicensePhoto(true);
    try {
      const studentId = profile?._id || student?._id;
      const formData = new FormData();
      if (licensePhotoFile) {
        formData.append('licensePhoto', licensePhotoFile);
      }
      if (licenseNumberInput) {
        formData.append('licenseNumber', licenseNumberInput.trim());
      }
      const res = await api.post(`/students/${studentId}/final-license`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Final Driving License photo uploaded successfully!');
        if (res.data.student) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
        }
        setLicensePhotoFile(null);
        setLicensePhotoPreview(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload driving license photo');
    } finally {
      setUploadingLicensePhoto(false);
    }
  };

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

  // DMT 1.5-Year Learner License Lifecycle & Multi-Cycle Tracking
  const licenseStartDate =
    profile?.learnerLicenseStartDate ||
    profile?.registration_date ||
    profile?.dmtDates?.learnerRegistrationDate ||
    profile?.createdAt ||
    null;

  const licenseExpiryDate = React.useMemo(() => {
    if (profile?.learnerLicenseExpiryDate) return new Date(profile.learnerLicenseExpiryDate);
    if (licenseStartDate) {
      const d = new Date(licenseStartDate);
      d.setMonth(d.getMonth() + 18);
      return d;
    }
    return null;
  }, [profile?.learnerLicenseExpiryDate, licenseStartDate]);

  const remainingDays = React.useMemo(() => {
    if (!licenseExpiryDate) return null;
    const diff = licenseExpiryDate.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [licenseExpiryDate]);

  const isExpired = Boolean(
    profile?.learnerLicenseStatus === 'expired' ||
    (remainingDays !== null && remainingDays <= 0 && profile?.learnerLicenseStatus !== 'completed' && profile?.learnerLicenseStatus !== 'passed')
  );

  const is3AttemptsFailed = Boolean(
    profile?.learnerLicenseStatus === 'attempts_exhausted' ||
    (profile?.learnerExamAttempts && profile.learnerExamAttempts.length >= 3 && !profile.learnerExamAttempts.some((a) => a.result === 'passed'))
  );

  const isCancelled = Boolean(
    isExpired ||
    is3AttemptsFailed ||
    profile?.registrationStatus === 'cancelled' ||
    profile?.accountStatus === 'cancelled'
  );

  const isFinalPassed = Boolean(
    profile?.learnerLicenseStatus === 'passed' ||
    (isExamPassed && profile?.learnerLicenseStatus !== 'active' && profile?.learnerLicenseStatus !== 'expiring_soon' && profile?.learnerLicenseStatus !== 'pending_payment')
  );

  const isLicenseCompleted = Boolean(
    profile?.learnerLicenseStatus === 'completed' ||
    profile?.finalLicense?.verificationStatus === 'verified' ||
    profile?.trial?.licenseObtained
  );

  const isExpiringSoon = Boolean(
    !isExpired && !is3AttemptsFailed && !isFinalPassed && !isLicenseCompleted &&
    (profile?.learnerLicenseStatus === 'expiring_soon' || (remainingDays !== null && remainingDays <= 30 && remainingDays > 0))
  );

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
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFCFE]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1B3D59] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#6A97C0] text-sm font-medium animate-pulse">Loading DMT Milestone Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl animate-fade-in text-[#152026]">
      {/* Top Breadcrumb & Return to Dashboard */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D4EEF8] pb-4">
        <div className="flex items-center gap-2 text-xs text-[#6A97C0]">
          <Link to="/student/dashboard" className="hover:text-[#1B3D59] flex items-center gap-1 transition-colors">
            Student Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#152026] font-semibold">DMT Milestone Schedule</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#D4EEF8] text-[#1B3D59] border border-[#B3D5F1]">
            Type 1: New Learner
          </span>
          <span className="text-xs text-[#6A97C0] font-mono">
            {profile?.branch} Branch
          </span>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#152026] via-[#1B3D59] to-[#152026] border border-[#1B3D59]/30 p-6 sm:p-8 shadow-lg text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#B3D5F1]/20 text-[#D4EEF8] border border-[#B3D5F1]/30 text-[10px] font-black uppercase tracking-wider">
                Official DMT Tracking
              </span>
              <span className="text-xs text-[#B3D5F1] font-mono">
                Student ID: {profile?.studentIdNumber || profile?._id?.slice(-6)?.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[#B3D5F1]" />
              Government DMT Milestone Schedule
            </h1>
            <p className="text-sm text-[#D4EEF8]/90 max-w-2xl leading-relaxed">
              Track your official Department of Motor Traffic (DMT) milestones from medical examination and learner registration to the written theory test and final practical trial.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to="/student/quiz"
              className="py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 rounded-xl bg-white text-[#1B3D59] hover:bg-[#D4EEF8] shadow-md transition-all"
            >
              <BookOpen className="w-4 h-4 text-[#1B3D59]" />
              <span>Practice Exam Quizzes</span>
            </Link>
          </div>
        </div>

        {/* Decorative Background Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#6A97C0]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Cancellation / Expiry Banner (US Requirements 2, 3, 8) */}
      {isCancelled && (
        <div className="p-6 rounded-3xl bg-[#F3EED8] border-2 border-[#6A97C0]/40 text-[#152026] flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
          <div className="flex items-start gap-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#6A97C0]/30 flex items-center justify-center text-[#152026] shrink-0 shadow-xs">
              <AlertTriangle className="w-6 h-6 animate-pulse text-[#152026]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white text-[#152026] border border-[#6A97C0]/40 text-[10px] font-black uppercase">
                  {isExpired ? 'License Status: Expired' : '3 Attempts Failed'}
                </span>
                <span className="text-[#6A97C0] font-mono text-[11px]">
                  Cycle #{profile?.currentCycleNumber || 1}
                </span>
              </div>
              <h3 className="font-black text-[#152026] text-base sm:text-lg">
                {isExpired ? 'Learner License Expired' : 'All 3 exam attempts have been used.'}
              </h3>
              <p className="text-[#152026]/90 max-w-2xl leading-relaxed text-xs">
                {isExpired
                  ? 'Please register again. As per DMT regulations, a candidate has a maximum of 1.5 years (18 months) to complete the process. Your license validity ended on ' + (licenseExpiryDate ? format(licenseExpiryDate, 'dd MMMM yyyy') : 'Expired') + '.'
                  : 'Please register again. In accordance with DMT regulations, candidates are allowed a maximum of 3 trial attempts for the written theory examination per registration cycle.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={reRegistering}
            onClick={handleReRegister}
            className="bg-[#1B3D59] text-white hover:bg-[#152026] text-xs font-bold py-3 px-5 whitespace-nowrap shadow-md flex items-center gap-2 self-start sm:self-auto rounded-xl transition-all"
          >
            <RotateCcw className={`w-4 h-4 ${reRegistering ? 'animate-spin' : ''}`} />
            <span>{reRegistering ? 'Initializing...' : 'Action: Register Again'}</span>
          </button>
        </div>
      )}

      {/* 1.5-Year Validity Period Tracker */}
      <div className={`p-6 rounded-3xl border transition-all space-y-4 shadow-sm bg-white ${
        isLicenseCompleted
          ? 'border-emerald-300'
          : isFinalPassed
          ? 'border-[#B3D5F1]'
          : isExpiringSoon
          ? 'border-[#F3EED8] bg-[#F3EED8]/30'
          : 'border-[#D4EEF8]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4EEF8] pb-3">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isLicenseCompleted
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : isFinalPassed
                ? 'bg-[#D4EEF8] text-[#1B3D59] border-[#B3D5F1]'
                : isExpiringSoon
                ? 'bg-[#F3EED8] text-[#152026] border-[#6A97C0]/40'
                : 'bg-[#D4EEF8] text-[#1B3D59] border-[#B3D5F1]'
            }`}>
              {isLicenseCompleted
                ? 'License Completed'
                : isFinalPassed
                ? 'Passed'
                : isExpiringSoon
                ? 'Expiring Soon'
                : 'Learner License Active'}
            </span>
            <span className="text-xs text-[#6A97C0] font-mono">
              Cycle #{profile?.currentCycleNumber || 1} • Max 1.5-Year Validity
            </span>
          </div>

          <div className="text-xs text-[#6A97C0] flex items-center gap-4">
            <span>
              Start: <strong className="text-[#152026] font-mono">{licenseStartDate ? format(new Date(licenseStartDate), 'MMM dd, yyyy') : 'Registered'}</strong>
            </span>
            <span>
              Expires: <strong className={`font-mono ${isExpiringSoon ? 'text-amber-600 font-bold' : 'text-[#1B3D59]'}`}>{licenseExpiryDate ? format(licenseExpiryDate, 'MMM dd, yyyy') : 'In 18 Months'}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-1">
            <span className="text-[#6A97C0] block text-[11px]">18-Month Validity Rule</span>
            <span className="font-semibold text-[#152026]">License Start Date + 18 Months</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-1">
            <span className="text-[#6A97C0] block text-[11px]">Days Remaining</span>
            <span className={`font-bold font-mono ${isExpiringSoon ? 'text-amber-600' : 'text-emerald-700'}`}>
              {remainingDays !== null ? `${remainingDays} Days Remaining` : '18 Months'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-1">
            <span className="text-[#6A97C0] block text-[11px]">Written Theory Attempts</span>
            <span className="font-bold text-[#152026] font-mono">
              {attemptsCount} of 3 Allowed Used
            </span>
          </div>
        </div>

        {/* Driving License Photo Upload Section when Passed / Completed */}
        {(isFinalPassed || isLicenseCompleted || profile?.finalLicense?.licensePhotoUrl) && (
          <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-3 pt-4 mt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4EEF8] pb-2 text-xs">
              <span className="font-bold text-[#152026] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#1B3D59]" /> Driving License / Final License
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                profile?.finalLicense?.licensePhotoUrl
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-[#F3EED8] text-[#152026] border-[#6A97C0]/40'
              }`}>
                {profile?.finalLicense?.licensePhotoUrl ? 'License Photo: Uploaded ✓' : 'License Photo: Not Uploaded'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs items-start">
              <form onSubmit={handleUploadFinalLicense} className="space-y-3">
                <div>
                  <label className="block text-[#152026] font-medium mb-1">Driving License Number:</label>
                  <input
                    type="text"
                    value={licenseNumberInput}
                    onChange={(e) => setLicenseNumberInput(e.target.value)}
                    placeholder="e.g. B1234567"
                    disabled={isLicenseCompleted}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4EEF8] text-[#152026] font-mono focus:outline-none focus:border-[#1B3D59] focus:ring-1 focus:ring-[#1B3D59]"
                  />
                </div>
                {!isLicenseCompleted && (
                  <div>
                    <label className="block text-[#152026] font-medium mb-1">
                      {profile?.finalLicense?.licensePhotoUrl ? 'Replace License Photo:' : 'Upload License Photo (JPG, PNG, WEBP):'}
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleLicensePhotoSelect}
                      className="w-full text-xs text-[#6A97C0] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#D4EEF8] file:text-[#1B3D59] file:font-bold hover:file:bg-[#B3D5F1]"
                    />
                  </div>
                )}
                {!isLicenseCompleted && (
                  <button
                    type="submit"
                    disabled={uploadingLicensePhoto}
                    className="bg-[#1B3D59] text-white hover:bg-[#152026] text-xs py-2 px-4 font-bold flex items-center gap-1.5 rounded-xl shadow-xs transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingLicensePhoto ? 'Uploading...' : 'Save License Info'}</span>
                  </button>
                )}
              </form>

              <div>
                {licensePhotoPreview || profile?.finalLicense?.licensePhotoUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#D4EEF8] bg-white p-2">
                    <img
                      src={licensePhotoPreview || profile.finalLicense.licensePhotoUrl}
                      alt="Driving License"
                      className="w-full max-h-40 object-contain mx-auto rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-[#D4EEF8] rounded-xl text-center text-[#6A97C0]">
                    No license photo uploaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid: 4 Core DMT Milestones */}
      <div className="card p-6 sm:p-8 space-y-6 border border-[#D4EEF8] bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4EEF8] pb-4 gap-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] text-[10px] font-bold uppercase mb-1 inline-block">
              Step-by-Step Progress
            </span>
            <h2 className="text-lg font-bold text-[#152026] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1B3D59]" /> Milestone Tracking Cards
            </h2>
            <p className="text-xs text-[#6A97C0]">
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
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] hover:border-[#6A97C0] transition-all flex flex-col justify-between space-y-3 shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-[#152026] flex items-center gap-2 font-bold text-sm">
                      <Stethoscope className="w-5 h-5 text-[#1B3D59]" /> 1. DMT Medical Exam
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      !isMedDateAssigned
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : !isMedDateReached
                        ? 'bg-[#D4EEF8] text-[#1B3D59] border-[#B3D5F1]'
                        : isMedPassed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : isMedFailed
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-[#F3EED8] text-[#152026] border-[#6A97C0]/40'
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

                  <div className="text-xs text-[#152026] space-y-1.5">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#D4EEF8]">
                      <span className="text-[#6A97C0]">Scheduled Medical Date:</span>
                      <span className="text-[#152026] font-bold font-mono">
                        {medDate
                          ? new Date(medDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                          : 'Not Yet Assigned by Staff'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6A97C0]">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>📄 View Medical Certificate / Proof</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  )}

                  {/* Medical Remarks */}
                  {medRemarks && (
                    <div className="p-2.5 rounded-xl bg-white border border-[#D4EEF8] text-xs text-[#152026]">
                      <span className="text-[#6A97C0] font-semibold block text-[10px]">Medical Remarks:</span>
                      <p className="mt-0.5 text-[#152026]">{medRemarks}</p>
                    </div>
                  )}

                  {medPendingReq && (
                    <div className="p-2.5 rounded-xl bg-[#F3EED8] border border-[#6A97C0]/40 text-[#152026] text-xs flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-[#152026]" />
                      <span>
                        Reschedule Pending Review{' '}
                        {medPendingReq.preferred_date && `(Preferred: ${new Date(medPendingReq.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  {!isMedDateAssigned ? (
                    <div className="p-2.5 rounded-xl bg-white border border-dashed border-[#D4EEF8] text-[#6A97C0] text-xs flex items-center justify-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#6A97C0]" />
                      <span>Awaiting Staff to Assign Initial Date</span>
                    </div>
                  ) : !isMedDateReached ? (
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-[#D4EEF8]/60 border border-[#B3D5F1] text-[#1B3D59] text-xs flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#1B3D59] shrink-0" />
                          <span>
                            Exam scheduled for <strong className="text-[#152026]">{new Date(medDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>. Status update (Pass/Fail) unlocks on exam day.
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
                        className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#D4EEF8] hover:border-[#1B3D59] bg-white hover:bg-[#D4EEF8]/40 text-[#1B3D59] transition-all shadow-xs"
                      >
                        <Calendar className="w-4 h-4 text-[#1B3D59]" />
                        <span>📅 Request Date for Another Day</span>
                      </button>
                    </div>
                  ) : isMedPassed ? (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
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
                        className="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold text-[#6A97C0] hover:text-[#152026] border border-[#D4EEF8] bg-white hover:bg-[#FAFCFE] transition-all flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Update Certificate / Proof Document</span>
                      </button>
                    </div>
                  ) : isMedFailed ? (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center justify-center gap-2">
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
                          className="py-2 px-3 rounded-xl text-xs font-bold text-[#152026] border border-[#D4EEF8] bg-white hover:bg-[#FAFCFE] transition-all flex items-center justify-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#1B3D59]" />
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
                          className="py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 transition-all shadow-xs"
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
                        className="bg-[#1B3D59] hover:bg-[#152026] text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
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
                        className="py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#D4EEF8] hover:border-[#1B3D59] bg-white hover:bg-[#D4EEF8]/40 text-[#1B3D59] transition-all shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#1B3D59]" />
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
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] hover:border-[#6A97C0] transition-all flex flex-col justify-between space-y-3 shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-[#152026] flex items-center gap-2 font-bold text-sm">
                      <FileText className="w-5 h-5 text-[#1B3D59]" /> 2. DMT Registration
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      !isRegDateAssigned
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : isRegDone
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : isRegDateReached
                        ? 'bg-[#F3EED8] text-[#152026] border-[#6A97C0]/40'
                        : 'bg-[#D4EEF8] text-[#1B3D59] border-[#B3D5F1]'
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

                  <div className="text-xs text-[#152026] space-y-1.5">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#D4EEF8]">
                      <span className="text-[#6A97C0]">DMT Submission Date:</span>
                      <span className="text-[#152026] font-bold font-mono">
                        {regDate
                          ? new Date(regDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                          : 'Not Yet Assigned by Staff'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6A97C0]">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>📄 View DMT Registration Proof</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  )}

                  {regPendingReq && (
                    <div className="p-2.5 rounded-xl bg-[#F3EED8] border border-[#6A97C0]/40 text-[#152026] text-xs flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-[#152026]" />
                      <span>
                        Reschedule Pending Review{' '}
                        {regPendingReq.preferred_date && `(Preferred: ${new Date(regPendingReq.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  {!isRegDateAssigned ? (
                    <div className="p-2.5 rounded-xl bg-white border border-dashed border-[#D4EEF8] text-[#6A97C0] text-xs flex items-center justify-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#6A97C0]" />
                      <span>Awaiting Staff to Assign Initial Date</span>
                    </div>
                  ) : isRegDone ? (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
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
                        className="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold text-[#6A97C0] hover:text-[#152026] border border-[#D4EEF8] bg-white hover:bg-[#FAFCFE] transition-all flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Update Registration Slip / Proof Document</span>
                      </button>
                    </div>
                  ) : !isRegDateReached ? (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-[#D4EEF8]/60 border border-[#B3D5F1] text-[#1B3D59] text-xs flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#1B3D59] shrink-0" />
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
                        className="w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#D4EEF8] hover:border-[#1B3D59] bg-white hover:bg-[#D4EEF8]/40 text-[#1B3D59] transition-all shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#1B3D59]" />
                        <span>⏳ Request Date for Another Day</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Box for entering remarks */}
                      <div className="p-2.5 rounded-xl bg-white border border-[#D4EEF8] space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#6A97C0] font-semibold">Enter Remarks / Notes:</span>
                          {savingRegRemarks && <span className="text-[#1B3D59] text-[10px] animate-pulse">Saving...</span>}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Waiting for photo / NIC, submission postponed..."
                            value={registrationRemarksInput}
                            onChange={(e) => setRegistrationRemarksInput(e.target.value)}
                            className="input-sm flex-1 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] text-xs rounded-xl focus:border-[#1B3D59] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleSaveRegistrationRemarks}
                            disabled={savingRegRemarks}
                            className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs px-3 py-1 rounded-xl font-bold shrink-0 transition-all"
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
                          className="bg-[#1B3D59] hover:bg-[#152026] text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
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
                          className="py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#D4EEF8] hover:border-[#1B3D59] bg-white hover:bg-[#D4EEF8]/40 text-[#1B3D59] transition-all shadow-xs"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#1B3D59]" />
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
              <div className="md:col-span-2 p-5 sm:p-6 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] hover:border-[#6A97C0] space-y-4 shadow-xs transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4EEF8] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D4EEF8] border border-[#B3D5F1] flex items-center justify-center text-[#1B3D59]">
                      <BookOpen className="w-5 h-5 text-[#1B3D59]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#152026]">3. DMT Written Theory Exam</h4>
                      <p className="text-xs text-[#6A97C0]">
                        Official computer-based theory examination at DMT. Maximum of 3 attempts allowed.
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isExamPassed
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : isExamFailedState
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : examDate
                      ? 'bg-[#F3EED8] text-[#152026] border-[#6A97C0]/40'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
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
                  <div className="p-3 bg-white rounded-xl border border-[#D4EEF8]">
                    <span className="text-[#6A97C0] block text-[11px]">Scheduled Exam Date:</span>
                    <span className="font-bold text-[#152026] text-sm font-mono mt-0.5 block">
                      {examDate
                        ? new Date(examDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : 'Date Not Yet Assigned by Staff'}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#D4EEF8]">
                    <span className="text-[#6A97C0] block text-[11px]">Attempts Status:</span>
                    <span className="font-bold text-[#152026] text-sm mt-0.5 block">
                      {isExamPassed
                        ? '✓ Cleared — Practical Lessons Unlocked'
                        : recordedExamMarks !== null && recordedExamMarks !== undefined && recordedExamMarks <= 30
                        ? `✕ Scored ${recordedExamMarks}/40 (Score ≤ 30 Failed — Pass requires > 30)`
                        : `${remainingAttempts} attempt(s) remaining before auto-cancellation`}
                    </span>
                  </div>
                </div>

                {/* 3 Attempts Indicator Badges & Action Buttons */}
                <div className="p-3.5 rounded-xl bg-white border border-[#D4EEF8] flex items-center justify-between flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#6A97C0] text-xs font-bold">Attempts Track:</span>
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
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                              : isFailedAttempt
                              ? 'bg-rose-50 border-rose-300 text-rose-700 line-through'
                              : isCurrentPending
                              ? 'bg-[#D4EEF8] border-[#1B3D59] text-[#1B3D59] animate-pulse'
                              : 'bg-[#FAFCFE] border-[#D4EEF8] text-[#6A97C0]'
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
                    <div className="px-3 py-1.5 rounded-xl bg-[#F3EED8] border border-[#6A97C0]/40 text-[#152026] text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-[#152026]" />
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
                        className="bg-[#1B3D59] hover:bg-[#152026] text-white text-xs py-2 px-3.5 rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-all"
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
                        className="py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 transition-all shadow-xs"
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
                        className="py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-[#D4EEF8] hover:border-[#1B3D59] bg-white hover:bg-[#D4EEF8]/40 text-[#1B3D59] transition-all shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#1B3D59]" />
                        <span>📅 Request Date for Another Day</span>
                      </button>
                    )}

                    {!isExamPassed && !isExamDateAssigned && (
                      <div className="py-2 px-3.5 rounded-xl bg-white border border-dashed border-[#D4EEF8] text-[#6A97C0] text-xs flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#6A97C0]" />
                        <span>Awaiting Staff to Assign Initial Date</span>
                      </div>
                    )}

                    {isExamPassed && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold py-1.5 px-3 rounded-full flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
              <div className="md:col-span-2 p-5 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#152026] flex items-center gap-2 font-bold text-sm">
                    <Car className="w-5 h-5 text-[#1B3D59]" /> 4. DMT Practical Driving Trial
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${profile?.trial?.licenseObtained ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-[#F3EED8] text-[#152026] border-[#6A97C0]/40'}`}>
                    {profile?.trial?.licenseObtained ? '✓ Licensed / Passed' : `${profile?.trial?.attempts?.length || 0}/3 Attempts Used`}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-[#6A97C0] font-semibold">
                    Scheduled Trial Date:{' '}
                    <span className="text-[#152026] font-bold font-mono">
                      {profile?.trial_date
                        ? new Date(profile.trial_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : (isExamPassed ? 'Eligible to Schedule Trial with Instructor' : 'Locked — Pending Learner Theory Exam Pass')}
                    </span>
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {trialPendingReq && (
                      <span className="bg-[#F3EED8] border border-[#6A97C0]/40 text-[#152026] text-xs font-bold py-1.5 px-3 rounded-full flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-pulse text-[#152026]" />
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
                        className="py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-[#D4EEF8] hover:border-[#1B3D59] bg-white hover:bg-[#D4EEF8]/40 text-[#1B3D59] transition-all shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#1B3D59]" />
                        <span>📅 Request Date for Another Day</span>
                      </button>
                    )}

                    {!profile?.trial_date && !profile?.trial?.licenseObtained && isExamPassed && (
                      <div className="py-2 px-3.5 rounded-xl bg-white border border-dashed border-[#D4EEF8] text-[#6A97C0] text-xs flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#6A97C0]" />
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
      <div className="card p-6 sm:p-8 space-y-4 border border-[#D4EEF8] bg-white shadow-sm">
        <div className="border-b border-[#D4EEF8] pb-3">
          <h3 className="text-base font-bold text-[#152026] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1B3D59]" /> Complete DMT Progression Timeline
          </h3>
          <p className="text-xs text-[#6A97C0]">
            A linear progression of each stage required by the Department of Motor Traffic.
          </p>
        </div>
        <DmtMilestoneTimeline student={profile} />
      </div>

      {/* DMT Guidance Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 bg-white border border-[#D4EEF8] shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-[#1B3D59] font-bold text-sm">
            <Stethoscope className="w-4 h-4 text-[#1B3D59]" />
            <span>1. Medical Clearance</span>
          </div>
          <p className="text-xs text-[#6A97C0] leading-relaxed">
            Obtain your NTMI medical certificate at Nugegoda or Werahara before submission to the DMT.
          </p>
        </div>

        <div className="card p-5 bg-white border border-[#D4EEF8] shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-[#1B3D59] font-bold text-sm">
            <FileText className="w-4 h-4 text-[#1B3D59]" />
            <span>2. DMT Registration</span>
          </div>
          <p className="text-xs text-[#6A97C0] leading-relaxed">
            Documents submitted to DMT Werahara or branch. Official written exam date assigned upon submission.
          </p>
        </div>

        <div className="card p-5 bg-white border border-[#D4EEF8] shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-[#1B3D59] font-bold text-sm">
            <Car className="w-4 h-4 text-[#1B3D59]" />
            <span>Practical Trial Lessons</span>
          </div>
          <p className="text-xs text-[#6A97C0] leading-relaxed">
            Once you record a passing score, you will choose your vehicle package, pay your course balance, and begin hands-on road training.
          </p>
        </div>
      </div>

      {/* MODAL 1: Record Exam Result Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152026]/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl p-5 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto text-[#152026]">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-4">
              <div className="flex items-center gap-2 text-[#1B3D59] font-bold text-base">
                <BookOpen className="w-5 h-5 text-[#1B3D59]" />
                <span>Record DMT Theory Exam Result</span>
              </div>
              <button
                type="button"
                onClick={() => setIsExamModalOpen(false)}
                className="text-[#6A97C0] hover:text-[#152026] p-1.5 rounded-xl hover:bg-[#D4EEF8]/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExamResult} className="space-y-4 text-xs">
              <p className="text-[#6A97C0] leading-relaxed">
                Submit the marks and outcome of your official DMT Theory Exam. Passing (score &gt; 30/40) will immediately unlock practical training and vehicle packages.
              </p>

              <div>
                <label className="text-[#152026] font-semibold block mb-1.5">Examination Result:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExamForm({ ...examForm, result: 'passed' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      examForm.result === 'passed'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-white border-[#D4EEF8] text-[#6A97C0] hover:bg-[#FAFCFE]'
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
                        ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                        : 'bg-white border-[#D4EEF8] text-[#6A97C0] hover:bg-[#FAFCFE]'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>FAILED</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[#152026] font-semibold block mb-1.5">
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
                  className={`w-full px-3 py-2 rounded-xl bg-white text-[#152026] font-mono text-sm border focus:outline-none ${
                    examForm.marks !== '' && (Number(examForm.marks) < 0 || Number(examForm.marks) > 40)
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : examForm.marks !== '' && Number(examForm.marks) > 30
                      ? 'border-emerald-500 ring-1 ring-emerald-500'
                      : examForm.marks !== '' && Number(examForm.marks) <= 30
                      ? 'border-amber-500 ring-1 ring-amber-500'
                      : 'border-[#D4EEF8] focus:border-[#1B3D59]'
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
                  <p className="text-[11px] text-[#6A97C0] mt-1">
                    DMT Rule: Passing requires strictly &gt; 30 marks (31 to 40).
                  </p>
                )}
              </div>

              <div>
                <label className="text-[#152026] font-semibold block mb-1.5">Exam Date Faced:</label>
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-[#1B3D59] absolute left-3.5 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={examForm.examDate}
                    onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-white border border-[#D4EEF8] text-[#152026] font-mono cursor-pointer focus:border-[#1B3D59] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#152026] font-semibold block mb-1.5">Optional Notes:</label>
                <input
                  type="text"
                  placeholder="e.g. Taken at DMT Werahara Hall 2"
                  value={examForm.notes}
                  onChange={(e) => setExamForm({ ...examForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#D4EEF8] text-[#152026] focus:border-[#1B3D59] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingExamResult}
                  className="bg-[#1B3D59] hover:bg-[#152026] text-white py-2 px-5 text-xs font-bold flex items-center gap-1.5 rounded-xl shadow-md transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152026]/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl p-5 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto text-[#152026]">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-4">
              <div className="flex items-center gap-2 text-[#1B3D59] font-bold text-base">
                <Stethoscope className="w-5 h-5 text-[#1B3D59]" />
                <span>1. DMT Medical Exam — Proof & Status</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMedicalModal(false)}
                className="text-[#6A97C0] hover:text-[#152026] p-1.5 rounded-xl hover:bg-[#D4EEF8]/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadMedicalProof} className="space-y-4 text-xs">
              <p className="text-[#6A97C0] leading-relaxed">
                Record your medical examination outcome and attach your official National Transport Medical Institute (NTMI) certificate or fitness report.
              </p>

              <div>
                <label className="text-[#152026] font-semibold block mb-1.5">
                  Medical Exam Result: <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMedicalForm({ ...medicalForm, status: 'passed' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      medicalForm.status === 'passed'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-white border-[#D4EEF8] text-[#6A97C0] hover:bg-[#FAFCFE]'
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
                        ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                        : 'bg-white border-[#D4EEF8] text-[#6A97C0] hover:bg-[#FAFCFE]'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>✕ FAILED</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[#152026] font-semibold block mb-1.5">
                  Attach Medical Certificate / Proof Document (PDF, JPG, PNG):
                </label>
                <div className="border-2 border-dashed border-[#D4EEF8] hover:border-[#1B3D59] rounded-2xl p-4 text-center cursor-pointer transition-all bg-[#FAFCFE]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setMedicalFile(e.target.files[0] || null)}
                    className="block w-full text-xs text-[#6A97C0] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#D4EEF8] file:text-[#1B3D59] hover:file:bg-[#B3D5F1] cursor-pointer"
                  />
                  {profile?.medicalDocumentUrl && !medicalFile && (
                    <p className="text-[11px] text-emerald-700 mt-2">
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
                <label className="text-[#152026] font-semibold block mb-1.5">Remarks / Doctor Notes:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Vision cleared with corrective lenses, blood pressure normal, NTMI certificate #10492"
                  value={medicalForm.remarks}
                  onChange={(e) => setMedicalForm({ ...medicalForm, remarks: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#D4EEF8] text-[#152026] text-xs rounded-xl focus:border-[#1B3D59] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4EEF8] flex-wrap">
                {(profile?.medical_date || profile?.dmtDates?.medicalExamDate) &&
                  new Date().setHours(0, 0, 0, 0) <
                    new Date(profile?.medical_date || profile?.dmtDates?.medicalExamDate).setHours(0, 0, 0, 0) && (
                    <p className="w-full text-[11px] text-[#152026] bg-[#F3EED8] border border-[#6A97C0]/40 p-2.5 rounded-xl mb-2 font-medium">
                      ⏳ Medical Exam is scheduled for{' '}
                      {new Date(profile?.medical_date || profile?.dmtDates?.medicalExamDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      . Result and proof submission unlocks on the exam date.
                    </p>
                  )}

                <button
                  type="button"
                  onClick={() => setShowMedicalModal(false)}
                  className="py-2.5 px-4 text-xs font-bold rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 transition-colors"
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
                  className={`bg-[#1B3D59] hover:bg-[#152026] text-white py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 shadow-md rounded-xl transition-all ${
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152026]/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl p-5 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto my-auto text-[#152026]">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-4">
              <div className="flex items-center gap-2 text-[#1B3D59] font-bold text-base">
                <FileText className="w-5 h-5 text-[#1B3D59]" />
                <span>2. DMT Registration — Proof & Status</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRegistrationModal(false)}
                className="text-[#6A97C0] hover:text-[#152026] p-1.5 rounded-xl hover:bg-[#D4EEF8]/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadRegistrationProof} className="space-y-4 text-xs">
              <p className="text-[#6A97C0] leading-relaxed">
                Confirm your DMT Werahara / branch registration submission and attach your official registration receipt or acknowledged application form.
              </p>

              <div>
                <label className="text-[#152026] font-semibold block mb-1.5">
                  Registration Status: <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegistrationForm({ ...registrationForm, status: 'done' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      registrationForm.status === 'done'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-white border-[#D4EEF8] text-[#6A97C0] hover:bg-[#FAFCFE]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✓ Done</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistrationForm({ ...registrationForm, status: 'pending' })}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      registrationForm.status === 'pending'
                        ? 'bg-[#F3EED8] border-[#6A97C0]/40 text-[#152026] shadow-xs'
                        : 'bg-white border-[#D4EEF8] text-[#6A97C0] hover:bg-[#FAFCFE]'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-[#152026]" />
                    <span>⏳ Incomplete / Pending</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[#152026] font-semibold block mb-1.5">
                  Attach Registration Slip / Proof Document (PDF, JPG, PNG):
                </label>
                <div className="border-2 border-dashed border-[#D4EEF8] hover:border-[#1B3D59] rounded-2xl p-4 text-center cursor-pointer transition-all bg-[#FAFCFE]">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setRegistrationFile(e.target.files[0] || null)}
                    className="block w-full text-xs text-[#6A97C0] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#D4EEF8] file:text-[#1B3D59] hover:file:bg-[#B3D5F1] cursor-pointer"
                  />
                  {profile?.registrationDocumentUrl && !registrationFile && (
                    <p className="text-[11px] text-[#1B3D59] mt-2 font-medium">
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
                <label className="text-[#152026] font-semibold block mb-1.5">
                  Registration Remarks / Reference Number:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Acknowledged by Werahara counter 4, DMT Ref #WER-89421, biometrics scheduled"
                  value={registrationForm.remarks}
                  onChange={(e) => setRegistrationForm({ ...registrationForm, remarks: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#D4EEF8] text-[#152026] text-xs rounded-xl focus:border-[#1B3D59] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => setShowRegistrationModal(false)}
                  className="py-2.5 px-4 text-xs font-bold rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRegistration}
                  className="bg-[#1B3D59] hover:bg-[#152026] text-white py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 shadow-md rounded-xl transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152026]/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl p-5 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto my-auto text-[#152026]">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-4">
              <div className="flex items-center gap-2 text-[#1B3D59] font-bold text-base">
                <Calendar className="w-5 h-5 text-[#1B3D59]" />
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
                className="text-[#6A97C0] hover:text-[#152026] p-1.5 rounded-xl hover:bg-[#D4EEF8]/40 transition-colors"
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
                  <p className="text-xs text-[#6A97C0] leading-relaxed">
                    If you cannot attend your scheduled appointment, submit your request below. A branch officer / Data Entry Officer will review your request and assign a new date.
                  </p>

                  {!hasAssignedDate && (
                    <div className="p-3 rounded-xl bg-[#F3EED8] border border-[#6A97C0]/40 text-[#152026] text-xs flex items-center gap-2 font-medium">
                      <Clock className="w-4 h-4 text-[#152026] shrink-0" />
                      <span>
                        An initial date has not yet been assigned by branch staff for this milestone. A date must be assigned before you can request another date.
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitReschedule} className="space-y-4 text-xs">
                    <div>
                      <label className="text-[#152026] font-semibold block mb-1">
                        Milestone Category:
                      </label>
                      <select
                        value={rescheduleMilestone}
                        onChange={(e) => setRescheduleMilestone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D4EEF8] text-[#152026] font-bold text-xs rounded-xl focus:border-[#1B3D59] focus:outline-none"
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
                      <div className="p-2.5 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] flex items-center justify-between text-xs">
                        <span className="text-[#6A97C0]">Current Assigned Date:</span>
                        <span className="text-[#152026] font-mono font-bold">
                          {new Date(currentScheduledDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="text-[#152026] font-semibold block mb-1">
                        Preferred New Date (Optional):
                      </label>
                      <div className="relative flex items-center">
                        <Calendar className="w-4 h-4 text-[#1B3D59] absolute left-3.5 pointer-events-none" />
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          disabled={!hasAssignedDate}
                          className="w-full pl-10 pr-3.5 py-2 bg-white border border-[#D4EEF8] text-[#152026] font-mono text-xs rounded-xl disabled:opacity-50 cursor-pointer focus:border-[#1B3D59] focus:outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-[#6A97C0] block mt-1">
                        Leave blank if you want branch staff to assign the earliest available DMT date.
                      </span>
                    </div>

                    <div>
                      <label className="text-[#152026] font-semibold block mb-1">
                        Reason for Date Change / Reschedule Request: <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        disabled={!hasAssignedDate}
                        placeholder="e.g. Unable to attend on current scheduled date due to exam/work commitment, retake after failed attempt, medical postponement..."
                        value={rescheduleReason}
                        onChange={(e) => setRescheduleReason(e.target.value)}
                        className="w-full p-2.5 bg-white border border-[#D4EEF8] text-[#152026] text-xs rounded-xl disabled:opacity-50 focus:border-[#1B3D59] focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4EEF8]">
                      <button
                        type="button"
                        onClick={() => setShowRescheduleModal(false)}
                        className="py-2.5 px-4 text-xs font-bold rounded-xl border border-[#D4EEF8] bg-[#FAFCFE] text-[#152026] hover:bg-[#D4EEF8]/40 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReschedule || !rescheduleReason.trim() || !hasAssignedDate}
                        className="bg-[#1B3D59] hover:bg-[#152026] text-white py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 shadow-md rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
