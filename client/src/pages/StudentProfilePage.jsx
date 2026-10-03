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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4EEF8] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> Learner Identity & DMT Milestones
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#152026] flex items-center gap-2">
            <User className="w-7 h-7 text-[#1B3D59]" /> Student Profile & Digital ID
          </h1>
          <p className="text-xs text-[#6A97C0] mt-0.5">
            Official learner credentials, enrolled branch attribution, scheduled milestone dates, and course balance.
          </p>
        </div>

        <button
          onClick={handlePrintCard}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 font-bold self-start sm:self-auto shadow-sm print:hidden"
        >
          <Printer className="w-3.5 h-3.5" /> Print Learner Pass
        </button>
      </div>

      {/* Grid: Digital ID Card (Left) + Detailed Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 1 Col: Digital ID Badge */}
        <div className="bg-white rounded-3xl p-6 space-y-6 border-2 border-[#D4EEF8] shadow-md relative overflow-hidden">
          {/* School Header */}
          <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59]">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-xs text-[#152026]">Sithma Driving School</h3>
                <p className="text-[9px] text-[#6A97C0] font-bold">Official Student Learner Pass</p>
              </div>
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] font-bold text-[10px]">
              {student?.branch || user?.branch}
            </span>
          </div>

          {/* User Photo Upload & Details */}
          <div className="text-center space-y-3">
            <div className="relative w-24 h-24 mx-auto group">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={user?.name || 'Student Photo'}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-[#1B3D59] shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-[#1B3D59] text-white font-black text-3xl flex items-center justify-center shadow-md border-2 border-[#D4EEF8]">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}

              {/* Upload / Change Photo Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 rounded-2xl bg-[#152026]/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-[10px] font-bold cursor-pointer print:hidden"
                title="Click to change profile photo"
              >
                {uploadingPhoto ? (
                  <Clock className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-[#B3D5F1]" />
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
                className="text-[11px] font-bold text-[#1B3D59] hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <Upload className="w-3 h-3" />
                {uploadingPhoto ? 'Uploading...' : currentPhoto ? 'Update Photo' : 'Upload Profile Photo'}
              </button>
            </div>

            <div>
              <h2 className="text-base font-black text-[#152026]">{user?.name}</h2>
              <p className="text-xs text-[#6A97C0] font-mono">
                ID: SDS-{user?._id ? user._id.slice(-6).toUpperCase() : '847291'}
              </p>
              <div className="inline-block mt-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F3EED8] text-[#152026] text-[10px] font-bold border border-[#6A97C0]/30">
                  {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Matrix */}
          <div className="p-3.5 bg-[#FAFCFE] rounded-2xl border border-[#D4EEF8] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#6A97C0] font-medium">NIC Number:</span>
              <span className="font-mono font-bold text-[#152026]">{student?.nic || user?.nic || 'Not Set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6A97C0] font-medium">Enrolled Package:</span>
              <span className="font-bold text-[#152026]">{student?.package?.type?.replace(/_/g, ' ') || 'Car Package'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6A97C0] font-medium">Lessons Balance:</span>
              <span className="font-bold text-[#1B3D59]">
                {lessonsRemaining} Remaining ({usedCount}/{unlockedCount} Used)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6A97C0] font-medium">Practical Trial:</span>
              <span className="font-bold text-[#152026]">
                {officialTrialDate ? safeFormatDate(officialTrialDate, 'MMM dd, yyyy') : 'Pending Scheduling'}
              </span>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="text-center pt-2 border-t border-[#D4EEF8] space-y-1">
            <div className="w-16 h-16 rounded-xl bg-white p-1 mx-auto flex items-center justify-center border border-[#D4EEF8] shadow-sm">
              <QrCode className="w-14 h-14 text-[#152026]" />
            </div>
            <p className="text-[9px] text-[#6A97C0] font-mono">Scan for DMT Compliance Verification</p>
          </div>
        </div>

        {/* Right 2 Cols: Details, Course Package & Date Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account & Contact Details Card */}
          <div className="bg-white rounded-3xl p-6 space-y-4 border border-[#D4EEF8] shadow-sm">
            <h3 className="text-sm font-bold text-[#152026] flex items-center gap-2 border-b border-[#D4EEF8] pb-3">
              <User className="w-4 h-4 text-[#1B3D59]" /> Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#FAFCFE] rounded-2xl border border-[#D4EEF8] space-y-1">
                <span className="text-[#6A97C0] flex items-center gap-1.5 font-bold">
                  <Mail className="w-3.5 h-3.5 text-[#1B3D59]" /> Email Address:
                </span>
                <p className="font-bold text-[#152026] truncate">{user?.email}</p>
              </div>

              <div className="p-3.5 bg-[#FAFCFE] rounded-2xl border border-[#D4EEF8] space-y-1 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[#6A97C0] flex items-center gap-1.5 font-bold">
                    <Phone className="w-3.5 h-3.5 text-[#1B3D59]" /> Contact Phone:
                  </span>
                  {!isEditingPhone && (
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="text-[10px] text-[#1B3D59] hover:underline flex items-center gap-1 font-bold print:hidden"
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
                      className="px-2 py-1 bg-white border border-[#1B3D59] text-[#152026] rounded-lg text-xs outline-none w-full font-mono"
                      placeholder="e.g. 0771234567"
                    />
                    <button
                      type="submit"
                      disabled={updatingPhone}
                      className="p-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
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
                      className="p-1 rounded bg-rose-100 text-rose-800 hover:bg-rose-200"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <p className="font-bold text-[#152026] font-mono">{user?.phone || 'Not Provided'}</p>
                )}
              </div>

              <div className="p-3.5 bg-[#FAFCFE] rounded-2xl border border-[#D4EEF8] space-y-1">
                <span className="text-[#6A97C0] flex items-center gap-1.5 font-bold">
                  <Building2 className="w-3.5 h-3.5 text-[#1B3D59]" /> Registered Training Branch:
                </span>
                <p className="font-bold text-[#152026]">{student?.branch || user?.branch} Branch</p>
              </div>

              <div className="p-3.5 bg-[#FAFCFE] rounded-2xl border border-[#D4EEF8] space-y-1">
                <span className="text-[#6A97C0] flex items-center gap-1.5 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-[#1B3D59]" /> Enrollment Date:
                </span>
                <p className="font-bold text-[#152026]">
                  {safeFormatDate(student?.createdAt || user?.createdAt, 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Current Enrolled Course Package & Balance Card */}
          <div className="bg-white rounded-3xl p-6 space-y-5 border border-[#D4EEF8] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4EEF8] pb-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] text-[10px] font-bold uppercase tracking-wider mb-1">
                  Enrolled Training Program
                </span>
                <h3 className="text-lg font-black text-[#152026] flex items-center gap-2">
                  <Car className="w-5 h-5 text-[#1B3D59]" />
                  {student?.package?.type?.replace(/_/g, ' ') || 'Course Training Package'}
                </h3>
                <p className="text-xs text-[#152026]/75 mt-0.5">
                  Plan: <strong className="text-[#1B3D59] capitalize">{student?.paymentPlan === 'installments' ? '3 Monthly Installments' : student?.paymentPlan === 'single' ? 'Daily Pay-Per-Lesson' : 'Full Upfront Course'}</strong>
                  {student?.package?.priceTotal ? ` • Total Fee: Rs. ${Number(student.package.priceTotal).toLocaleString()}` : ''}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#6A97C0] block font-bold">Ready to Book:</span>
                <span className="text-xl font-black text-emerald-700">
                  {lessonsRemaining} Lessons Available
                </span>
              </div>
            </div>

            {/* Lesson Balance Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-[#FAFCFE] rounded-xl border border-[#D4EEF8] text-center">
                <span className="text-[#6A97C0] text-[10px] block font-bold">Course Quota</span>
                <span className="font-black text-[#152026] text-base">{totalLessons}</span>
              </div>
              <div className="p-3 bg-[#D4EEF8]/40 rounded-xl border border-[#D4EEF8] text-center">
                <span className="text-[#1B3D59] text-[10px] block font-bold">Unlocked</span>
                <span className="font-black text-[#1B3D59] text-base">{unlockedCount}</span>
              </div>
              <div className="p-3 bg-[#FAFCFE] rounded-xl border border-[#D4EEF8] text-center">
                <span className="text-[#6A97C0] text-[10px] block font-bold">Completed</span>
                <span className="font-black text-[#152026] text-base">{usedCount}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-emerald-800 text-[10px] block font-bold">Remaining</span>
                <span className="font-black text-emerald-800 text-base">{lessonsRemaining}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-[#D4EEF8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-[#152026]/75">
                Need more driving lessons or want to change your payment plan?
              </p>
              <Link
                to={{ pathname: '/student/dashboard', hash: '#package-selection-payment' }}
                state={{ openPaymentForm: true }}
                className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Select Course Package & Choose Payment Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Comprehensive All Date Details Matrix */}
          <div className="bg-white rounded-3xl p-6 space-y-4 border border-[#D4EEF8] shadow-sm">
            <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
              <div>
                <h3 className="text-base font-black text-[#152026] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#1B3D59]" />
                  All DMT Milestone & Examination Dates
                </h3>
                <p className="text-xs text-[#6A97C0] mt-0.5">
                  Complete record of government DMT regulatory dates, practical trials, and branch scheduling.
                </p>
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] text-xs font-bold">
                {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 1. DMT Medical Exam Date */}
              <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#152026] flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-[#1B3D59]" /> 1. DMT Medical Exam
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      isType2
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : student?.dmtDates?.medicalExamStatus === 'passed' || student?.medical_date
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-[#F3EED8] text-[#152026] border border-[#D4EEF8]'
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
                <div className="text-[#152026]/80 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#6A97C0] font-medium">Scheduled Date:</span>
                    <span className="font-mono font-bold text-[#152026]">
                      {isType2
                        ? 'Exempt (Existing Permit)'
                        : safeFormatDate(student?.medical_date || student?.dmtDates?.medicalExamDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6A97C0]">
                    {isType2
                      ? 'Pre-existing learner permit holder. Medical certification already cleared.'
                      : student?.dmtDates?.medicalRemarks || 'National Transport Medical Institute (NTMI) fitness exam.'}
                  </p>
                </div>
              </div>

              {/* 2. DMT Learner Registration Date */}
              <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#152026] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#1B3D59]" /> 2. DMT Registration
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      isType2
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : student?.dmtDates?.registrationDone || student?.registration_date
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-[#F3EED8] text-[#152026] border border-[#D4EEF8]'
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
                <div className="text-[#152026]/80 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#6A97C0] font-medium">Scheduled Date:</span>
                    <span className="font-mono font-bold text-[#152026]">
                      {isType2
                        ? 'Exempt (Existing Permit)'
                        : safeFormatDate(student?.registration_date || student?.dmtDates?.learnerRegistrationDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6A97C0]">
                    {isType2
                      ? 'Official learner application pre-registered directly with Department of Motor Traffic.'
                      : 'Formal submission of learner driver registration documents to DMT office.'}
                  </p>
                </div>
              </div>

              {/* 3. DMT Written Theory Exam Date */}
              <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#152026] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#1B3D59]" /> 3. DMT Written Exam
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      isType2
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : student?.learnerExamStatus === 'passed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : student?.learnerExamStatus === 'failed'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : student?.written_exam_date
                        ? 'bg-[#F3EED8] text-[#152026]'
                        : 'bg-[#F3EED8] text-[#152026]'
                    }`}
                  >
                    {isType2
                      ? 'Exempt (Passed)'
                      : student?.learnerExamStatus === 'passed' && (student?.learnerExamMarks === null || student?.learnerExamMarks === undefined || student?.learnerExamMarks > 30)
                      ? `Passed (${student?.learnerExamMarks || 35}/40)`
                      : student?.learnerExamStatus === 'failed' || (student?.learnerExamMarks !== null && student?.learnerExamMarks !== undefined && student?.learnerExamMarks <= 30)
                      ? `Failed (${student?.learnerExamMarks !== null && student?.learnerExamMarks !== undefined ? `${student.learnerExamMarks}/40` : '≤30'})`
                      : student?.written_exam_date
                      ? 'Scheduled'
                      : 'Not Yet Faced'}
                  </span>
                </div>
                <div className="text-[#152026]/80 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#6A97C0] font-medium">Exam Date:</span>
                    <span className="font-mono font-bold text-[#152026]">
                      {isType2
                        ? 'Exempt (Existing Permit)'
                        : safeFormatDate(student?.written_exam_date || student?.dmtDates?.learnerExamDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {!isType2 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#6A97C0] font-medium">Score & Attempts:</span>
                      <span className="text-[#1B3D59] font-bold">
                        {student?.learnerExamMarks !== null && student?.learnerExamMarks !== undefined
                          ? `${student.learnerExamMarks} Marks • `
                          : ''}
                        Attempt {student?.learnerExamAttempts?.length || student?.learnerExamAttemptsCount || 1}/3
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-[#6A97C0]">
                    {isType2
                      ? 'Theory knowledge verified through existing learner permit. Practical trial enabled.'
                      : 'Standard 40-question computerized multiple-choice road rules examination.'}
                  </p>
                </div>
              </div>

              {/* 4. Official DMT Practical Driving Trial Date */}
              <div className="p-4 rounded-2xl bg-[#FAFCFE] border-2 border-[#D4EEF8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#152026] flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-[#1B3D59]" /> 4. Practical Driving Trial
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      !officialTrialDate
                        ? 'bg-[#F3EED8] text-[#152026]'
                        : Boolean(officialTrialDate && new Date(officialTrialDate).getTime() < Date.now() && new Date().toDateString() !== new Date(officialTrialDate).toDateString())
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {!officialTrialDate
                      ? 'Awaiting Branch Date'
                      : Boolean(officialTrialDate && new Date(officialTrialDate).getTime() < Date.now() && new Date().toDateString() !== new Date(officialTrialDate).toDateString())
                      ? 'Trial Date Passed'
                      : 'Scheduled (Active)'}
                  </span>
                </div>
                <div className="text-[#152026]/80 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#6A97C0] font-medium">Trial Exam Date:</span>
                    <span className="font-mono font-bold text-[#1B3D59] text-sm">
                      {officialTrialDate ? safeFormatDate(officialTrialDate, 'MMM dd, yyyy') : 'Pending Assignment'}
                    </span>
                  </div>
                  {student?.trial_date_set_by && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#6A97C0] font-medium">Scheduled By:</span>
                      <span className="text-[#152026] font-bold">
                        {student.trial_date_set_by?.name || 'Branch DEO'}
                      </span>
                    </div>
                  )}
                  {pendingReschedule && (
                    <div className="p-2 rounded-lg bg-[#F3EED8] border border-[#6A97C0]/30 text-[#152026] text-[10px] font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1B3D59] animate-pulse shrink-0" />
                      <span>Reschedule Request Pending: Requested {safeFormatDate(pendingReschedule.new_date || pendingReschedule.new_trial_date, 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-[#6A97C0]">
                    On-road practical driving test conducted by DMT examiners. Practical lessons can be booked up until this date.
                  </p>
                </div>
              </div>
            </div>

            {/* Trial Reschedule Call to Action */}
            <div className="pt-3 border-t border-[#D4EEF8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-[#6A97C0]">
                Need to change any of your scheduled dates? Submit a request to your branch Data Entry Officer.
              </span>
              <Link
                to="/student/dashboard"
                className="btn-secondary text-xs py-2 px-4 font-bold flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto shadow-sm"
              >
                <Clock className="w-3.5 h-3.5 text-[#1B3D59]" />
                <span>Manage & Reschedule on Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
