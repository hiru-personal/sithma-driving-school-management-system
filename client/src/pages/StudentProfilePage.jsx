import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  User,
  ShieldCheck,
  Calendar,
  CreditCard,
  Building2,
  Phone,
  Mail,
  Printer,
  Sparkles,
  QrCode,
  CheckCircle2,
  Clock,
  Car,
  PlusCircle,
  ArrowRight,
  AlertCircle,
  Camera,
  Upload,
  Edit3,
  Check,
  X,
  FileText,
  Stethoscope,
  BookOpen,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const safeFormatDate = (dateVal, formatStr = 'EEEE, MMMM dd, yyyy') => {
  if (!dateVal) return 'None';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'None';
    return format(d, formatStr);
  } catch {
    return 'None';
  }
};

export default function StudentProfilePage() {
  const { user, student, updateStudentData } = useAuth();
  const fileInputRef = useRef(null);

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [updatingPhone, setUpdatingPhone] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [myRescheduleRequests, setMyRescheduleRequests] = useState([]);

  const isType2 = Boolean(
    student?.studentType === 'Type 2' ||
    student?.studentType === 'Type2_TrialReady' ||
    student?.student_type === 'Type 2' ||
    user?.studentType === 'Type 2' ||
    user?.student_type === 'Type 2'
  );

  const fetchRescheduleRequests = async () => {
    try {
      const res = await api.get('/students/trial-date/reschedule');
      if (res.data.success) {
        setMyRescheduleRequests(res.data.requests || []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchRescheduleRequests();
  }, []);

  const handlePrintCard = () => {
    window.print();
  };

  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    if (!student?._id) return;
    setUpdatingPhone(true);
    try {
      const res = await api.patch(`/students/${student._id}/profile`, {
        phone: newPhone.trim(),
      });
      if (res.data.success) {
        toast.success('Contact telephone updated successfully');
        if (res.data.student) {
          updateStudentData(res.data.student, res.data.student.userId);
        }
        setIsEditingPhone(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update phone number');
    } finally {
      setUpdatingPhone(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile photo size must be less than 5MB');
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));
    uploadProfilePhoto(file);
  };

  const uploadProfilePhoto = async (file) => {
    if (!student?._id) {
      toast.error('Student profile not found');
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      const res = await api.post(`/students/${student._id}/profile-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('🎉 Profile photo updated successfully!');
        if (res.data.student) {
          updateStudentData(res.data.student, res.data.student.userId);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload profile photo');
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
      return path;
    }
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl && apiUrl.startsWith('http')) {
      try {
        const origin = new URL(apiUrl).origin;
        return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
      } catch {
        return path;
      }
    }
    return path;
  };

  const currentPhoto = photoPreview || getAvatarUrl(student?.profilePicture || user?.profilePicture || user?.avatar) || null;

  // Lesson metrics
  const totalLessons = student?.package?.lessonsTotal || 15;
  const unlockedCount =
    student?.lessonsUnlocked !== undefined && student?.lessonsUnlocked !== null
      ? student.lessonsUnlocked
      : totalLessons;
  const usedCount = student?.lessonsUsed || student?.package?.lessonsUsed || 0;
  const lessonsRemaining = Math.max(0, unlockedCount - usedCount);

  // Active trial date
  const officialTrialDate = student?.trial_date || student?.trial?.trialDate || null;
  const pendingReschedule = myRescheduleRequests.find((r) => r.status === 'Pending');

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-5xl mx-auto w-full print:p-0 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Learner Identity & DMT Milestones
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading flex items-center gap-2 drop-shadow">
            <User className="w-7 h-7 text-cyan-400" /> Student Profile & Digital ID
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Official learner credentials, enrolled branch attribution, scheduled milestone dates, and course balance.
          </p>
        </div>

        <button
          onClick={handlePrintCard}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold self-start sm:self-auto shadow-md print:hidden"
        >
          <Printer className="w-3.5 h-3.5" /> Print Learner Pass
        </button>
      </div>

      {/* Grid: Digital ID Card (Left) + Detailed Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 1 Col: Digital ID Badge */}
        <div className="card p-6 space-y-6 relative overflow-hidden border-2 border-cyan-400/40 bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950/95 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <div className="absolute inset-x-4 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* School Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-xs text-white">Sithma Driving School</h3>
                <p className="text-[9px] text-cyan-300">Official Student Learner Pass</p>
              </div>
            </div>
            <span className="badge badge-info text-[9px]">{student?.branch || user?.branch}</span>
          </div>

          {/* User Photo Upload & Details */}
          <div className="text-center space-y-3">
            <div className="relative w-24 h-24 mx-auto group">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={user?.name || 'Student Photo'}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-400/60 shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-3xl flex items-center justify-center shadow-lg border-2 border-white/30">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}

              {/* Upload / Change Photo Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-[10px] font-bold cursor-pointer print:hidden"
                title="Click to change profile photo"
              >
                {uploadingPhoto ? (
                  <Clock className="w-5 h-5 text-cyan-400 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-cyan-400" />
                    <span>Change Photo</span>
                  </>
                )}
              </button>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            <div className="print:hidden">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 mx-auto"
              >
                <Upload className="w-3 h-3" />
                {uploadingPhoto ? 'Uploading...' : currentPhoto ? 'Update Photo' : 'Upload Profile Photo'}
              </button>
            </div>

            <div>
              <h2 className="text-base font-bold text-white">{user?.name}</h2>
              <p className="text-xs text-slate-400 font-mono">
                ID: SDS-{user?._id ? user._id.slice(-6).toUpperCase() : '847291'}
              </p>
              <div className="inline-block mt-1">
                <span className="badge badge-warning text-[9px]">
                  {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Matrix */}
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">NIC Number:</span>
              <span className="font-mono font-bold text-white">{student?.nic || user?.nic || 'Not Set'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Enrolled Package:</span>
              <span className="font-bold text-white">{student?.package?.type?.replace(/_/g, ' ') || 'Car Package'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Lessons Balance:</span>
              <span className="font-bold text-accent">
                {lessonsRemaining} Remaining ({usedCount}/{unlockedCount} Used)
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Practical Trial:</span>
              <span className="font-bold text-purple-300">
                {officialTrialDate ? safeFormatDate(officialTrialDate, 'MMM dd, yyyy') : 'Pending Scheduling'}
              </span>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="text-center pt-2 border-t border-white/10 space-y-1">
            <div className="w-16 h-16 rounded-xl bg-white p-1 mx-auto flex items-center justify-center shadow-md">
              <QrCode className="w-14 h-14 text-slate-950" />
            </div>
            <p className="text-[9px] text-slate-500 font-mono">Scan for DMT Compliance Verification</p>
          </div>
        </div>

        {/* Right 2 Cols: Details, Course Package & Date Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account & Contact Details Card */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" /> Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Mail className="w-3.5 h-3.5 text-cyan-300" /> Email Address:
                </span>
                <p className="font-bold text-white truncate">{user?.email}</p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1 relative">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> Contact Phone:
                  </span>
                  {!isEditingPhone && (
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold print:hidden"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>
                {isEditingPhone ? (
                  <form onSubmit={handlePhoneUpdate} className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="px-2 py-1 bg-slate-950 border border-cyan-400 text-white rounded-lg text-xs outline-none w-full font-mono"
                      placeholder="e.g. 0771234567"
                    />
                    <button
                      type="submit"
                      disabled={updatingPhone}
                      className="p-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPhone(false);
                        setNewPhone(user?.phone || '');
                      }}
                      className="p-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <p className="font-bold text-white font-mono">{user?.phone || 'Not Provided'}</p>
                )}
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-amber-300" /> Registered Training Branch:
                </span>
                <p className="font-bold text-white">{student?.branch || user?.branch} Branch</p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" /> Enrollment Date:
                </span>
                <p className="font-bold text-white">
                  {safeFormatDate(student?.createdAt || user?.createdAt, 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* CURRENT ENROLLED COURSE PACKAGE & BALANCE CARD (REPLACES OLD PROFILE EXTRA PACKAGES) */}
          <div className="card p-6 space-y-5 border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-purple-900/20 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="badge badge-warning text-[10px] font-bold uppercase tracking-wider mb-1">
                  Enrolled Training Program
                </span>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-400" />
                  {student?.package?.type?.replace(/_/g, ' ') || 'Course Training Package'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Plan: <strong className="text-amber-300 capitalize">{student?.paymentPlan === 'installments' ? '3 Monthly Installments' : student?.paymentPlan === 'single' ? 'Daily Pay-Per-Lesson' : 'Full Upfront Course'}</strong>
                  {student?.package?.priceTotal ? ` • Total Fee: Rs. ${Number(student.package.priceTotal).toLocaleString()}` : ''}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-semibold">Ready to Book:</span>
                <span className="text-xl font-black text-emerald-400">
                  {lessonsRemaining} Lessons Available
                </span>
              </div>
            </div>

            {/* Lesson Balance Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                <span className="text-slate-400 text-[10px] block font-semibold">Course Quota</span>
                <span className="font-black text-white text-base">{totalLessons}</span>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-400/20 text-center">
                <span className="text-cyan-300 text-[10px] block font-semibold">Unlocked</span>
                <span className="font-black text-cyan-300 text-base">{unlockedCount}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                <span className="text-slate-400 text-[10px] block font-semibold">Completed</span>
                <span className="font-black text-slate-300 text-base">{usedCount}</span>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-400/20 text-center">
                <span className="text-emerald-300 text-[10px] block font-semibold">Remaining</span>
                <span className="font-black text-emerald-300 text-base">{lessonsRemaining}</span>
              </div>
            </div>

            {/* Action Bar: Directs to Dashboard Package & Payment Plan Section */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-300">
                Need more driving lessons or want to change your payment plan?
              </p>
              <Link
                to={{ pathname: '/student/dashboard', hash: '#package-selection-payment' }}
                state={{ openPaymentForm: true }}
                className="btn-accent text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Select Course Package & Choose Payment Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* COMPREHENSIVE ALL DATE DETAILS MATRIX */}
          <div className="card p-6 space-y-4 border border-purple-400/30 bg-gradient-to-r from-slate-900/95 via-purple-950/20 to-slate-900/95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  All DMT Milestone & Examination Dates
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Complete record of government DMT regulatory dates, practical trials, and branch scheduling.
                </p>
              </div>
              <span className="badge bg-purple-500/20 text-purple-300 border border-purple-400/40 text-xs font-bold">
                {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              {/* 1. DMT Medical Exam Date */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-cyan-400" /> 1. DMT Medical Exam
                  </span>
                  <span
                    className={`badge text-[10px] font-bold ${
                      isType2
                        ? 'badge-success'
                        : student?.dmtDates?.medicalExamStatus === 'passed' || student?.medical_date
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}
                  >
                    {isType2
                      ? 'Exempt (Pre-Cleared)'
                      : student?.dmtDates?.medicalExamStatus === 'passed'
                      ? 'Passed'
                      : student?.medical_date
                      ? 'Scheduled'
                      : 'Pending Date'}
                  </span>
                </div>
                <div className="text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scheduled Date:</span>
                    <span className="font-mono font-bold text-white">
                      {isType2
                        ? 'Exempt (Existing Permit)'
                        : safeFormatDate(student?.medical_date || student?.dmtDates?.medicalExamDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isType2
                      ? 'Pre-existing learner permit holder. Medical certification already cleared.'
                      : student?.dmtDates?.medicalRemarks || 'National Transport Medical Institute (NTMI) fitness exam.'}
                  </p>
                </div>
              </div>

              {/* 2. DMT Learner Registration Date */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-400" /> 2. DMT Registration
                  </span>
                  <span
                    className={`badge text-[10px] font-bold ${
                      isType2
                        ? 'badge-success'
                        : student?.dmtDates?.registrationDone || student?.registration_date
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}
                  >
                    {isType2
                      ? 'Exempt (Registered)'
                      : student?.dmtDates?.registrationDone
                      ? 'Completed'
                      : student?.registration_date
                      ? 'Scheduled'
                      : 'Pending'}
                  </span>
                </div>
                <div className="text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scheduled Date:</span>
                    <span className="font-mono font-bold text-white">
                      {isType2
                        ? 'Exempt (Existing Permit)'
                        : safeFormatDate(student?.registration_date || student?.dmtDates?.learnerRegistrationDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isType2
                      ? 'Official learner application pre-registered directly with Department of Motor Traffic.'
                      : 'Formal submission of learner driver registration documents to DMT office.'}
                  </p>
                </div>
              </div>

              {/* 3. DMT Written Theory Exam Date */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" /> 3. DMT Written Exam
                  </span>
                  <span
                    className={`badge text-[10px] font-bold ${
                      isType2
                        ? 'badge-success'
                        : student?.learnerExamStatus === 'passed'
                        ? 'badge-success'
                        : student?.learnerExamStatus === 'failed'
                        ? 'badge-error'
                        : student?.written_exam_date
                        ? 'badge-warning'
                        : 'badge-warning'
                    }`}
                  >
                    {isType2
                      ? 'Exempt (Passed)'
                      : student?.learnerExamStatus === 'passed'
                      ? 'Passed (≥80%)'
                      : student?.learnerExamStatus === 'failed'
                      ? 'Failed'
                      : student?.written_exam_date
                      ? 'Scheduled'
                      : 'Not Yet Faced'}
                  </span>
                </div>
                <div className="text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exam Date:</span>
                    <span className="font-mono font-bold text-white">
                      {isType2
                        ? 'Exempt (Existing Permit)'
                        : safeFormatDate(student?.written_exam_date || student?.dmtDates?.learnerExamDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {!isType2 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Score & Attempts:</span>
                      <span className="text-cyan-300 font-bold">
                        {student?.learnerExamMarks !== null && student?.learnerExamMarks !== undefined
                          ? `${student.learnerExamMarks} Marks • `
                          : ''}
                        Attempt {student?.learnerExamAttempts?.length || student?.learnerExamAttemptsCount || 1}/3
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400">
                    {isType2
                      ? 'Theory knowledge verified through existing learner permit. Practical trial enabled.'
                      : 'Standard 40-question computerized multiple-choice road rules examination.'}
                  </p>
                </div>
              </div>

              {/* 4. Official DMT Practical Driving Trial Date */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-2 border-purple-400/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-purple-400" /> 4. Practical Driving Trial
                  </span>
                  <span
                    className={`badge text-[10px] font-bold ${
                      !officialTrialDate
                        ? 'badge-warning'
                        : Boolean(officialTrialDate && new Date(officialTrialDate).getTime() < Date.now() && new Date().toDateString() !== new Date(officialTrialDate).toDateString())
                        ? 'badge-error'
                        : 'badge-success'
                    }`}
                  >
                    {!officialTrialDate
                      ? 'Awaiting Branch Date'
                      : Boolean(officialTrialDate && new Date(officialTrialDate).getTime() < Date.now() && new Date().toDateString() !== new Date(officialTrialDate).toDateString())
                      ? 'Trial Date Passed'
                      : 'Scheduled (Active)'}
                  </span>
                </div>
                <div className="text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trial Exam Date:</span>
                    <span className="font-mono font-bold text-purple-300 text-sm">
                      {officialTrialDate ? safeFormatDate(officialTrialDate, 'MMM dd, yyyy') : 'Pending Assignment'}
                    </span>
                  </div>
                  {student?.trial_date_set_by && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Scheduled By:</span>
                      <span className="text-white font-semibold">
                        {student.trial_date_set_by?.name || 'Branch DEO'}
                      </span>
                    </div>
                  )}
                  {pendingReschedule && (
                    <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-200 text-[10px] font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                      <span>Reschedule Request Pending: Requested {safeFormatDate(pendingReschedule.new_date || pendingReschedule.new_trial_date, 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400">
                    On-road practical driving test conducted by DMT examiners. Practical lessons can be booked up until this date.
                  </p>
                </div>
              </div>
            </div>

            {/* Trial Reschedule Call to Action */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Need to change any of your scheduled dates? Submit a request to your branch Data Entry Officer.
              </span>
              <Link
                to="/student/dashboard"
                className="btn-secondary text-xs py-2 px-4 font-bold flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Manage & Reschedule on Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
