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
  Sparkles,
  Gift,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  FileCheck,
  DollarSign,
  FileText,
  Stethoscope,
  Lock,
  ShieldAlert,
  PlusCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  Edit3,
  Package as PackageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user, student, updateStudentData } = useAuth();
  const [profile, setProfile] = useState(student);
  const [loading, setLoading] = useState(!student);

  // Dynamic Packages for Step 5 Package Selection (US-13, US-14)
  const [availablePackages, setAvailablePackages] = useState([]);
  const [selectedPkgId, setSelectedPkgId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('full'); // 'full' | 'monthly'
  const [slipRef, setSlipRef] = useState('');
  const [bankName, setBankName] = useState('Bank of Ceylon');
  const [submittingPkgPayment, setSubmittingPkgPayment] = useState(false);

  // Edit Profile Details Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    nic: '',
    branch: 'Maharagama',
    studentType: 'Type1_NewLearner',
    packageId: '',
  });

  const openEditModal = () => {
    const currentPkgId =
      profile?.package?.packageId?._id ||
      profile?.package?.packageId ||
      availablePackages.find((p) => p.type === profile?.package?.type)?._id ||
      (availablePackages.length > 0 ? availablePackages[0]._id : '');

    setEditForm({
      name: user?.name || profile?.name || '',
      phone: user?.phone || profile?.phone || '',
      email: user?.email || '',
      nic: profile?.nic || user?.nic || '',
      branch: profile?.branch || user?.branch || 'Maharagama',
      studentType: profile?.studentType || 'Type1_NewLearner',
      packageId: currentPkgId,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!editForm.email.trim()) {
      toast.error('Email address is required');
      return;
    }

    setSavingDetails(true);
    try {
      const studentId = profile?._id || student?._id;
      const res = await api.patch(`/students/${studentId}/profile`, editForm);
      if (res.data.success) {
        toast.success(res.data.message || 'Details updated successfully!');
        setProfile(res.data.student);
        updateStudentData(res.data.student, res.data.user);
        setIsEditModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update details');
    } finally {
      setSavingDetails(false);
    }
  };

  const fetchProfile = async () => {
    try {
      if (student?._id) {
        const res = await api.get(`/students/${student._id}`);
        if (res.data.success) {
          setProfile(res.data.student);
          updateStudentData(res.data.student);
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
    // Load dynamic packages (US-13, US-14)
    api.get('/packages').then((res) => {
      if (res.data?.success && res.data?.packages) {
        setAvailablePackages(res.data.packages);
        if (res.data.packages.length > 0) {
          setSelectedPkgId(res.data.packages[0]._id);
        }
      }
    }).catch(() => {});
  }, []);

  const handlePackagePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!slipRef) {
      toast.error('Please provide a deposit slip or transaction reference number');
      return;
    }
    setSubmittingPkgPayment(true);
    try {
      const selectedPkg = availablePackages.find((p) => p._id === selectedPkgId) || availablePackages[0];
      const amount = selectedPlan === 'monthly' ? Math.round((selectedPkg?.price || 45000) / 3) : (selectedPkg?.price || 45000);

      const res = await api.post('/payments/package-payment', {
        packageId: selectedPkg?._id,
        packageType: selectedPkg?.type,
        paymentPlan: selectedPlan,
        amount,
        bankName,
        transactionReference: slipRef,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Course package payment submitted successfully!');
        setProfile(res.data.student);
        updateStudentData(res.data.student);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit package payment');
    } finally {
      setSubmittingPkgPayment(false);
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

  const unlockedLessons = profile?.lessonsUnlocked !== undefined && profile?.lessonsUnlocked !== null
    ? profile.lessonsUnlocked
    : (pkg.lessonsTotal || 15);
  const usedLessons = profile?.lessonsUsed || pkg.lessonsUsed || 0;
  const remainingLessons = Math.max(0, unlockedLessons - usedLessons);

  const progressPercent = unlockedLessons > 0
    ? Math.min(Math.round((usedLessons / unlockedLessons) * 100), 100)
    : 0;

  const isType1 = profile?.studentType === 'Type1_NewLearner' || profile?.studentType === 'Type 1';
  const isType2 = profile?.studentType === 'Type2_TrialReady' || profile?.studentType === 'Type 2';
  const isTrialEligible = Boolean(
    profile?.trialEligible ||
    profile?.learnerExamStatus === 'passed' ||
    profile?.dmtDates?.learnerExamPassed ||
    isType2
  );
  const isAdvancePaymentPending = Boolean(
    profile?.advancePaymentStatus !== 'verified' ||
    profile?.accountStatus === 'pending_verification' ||
    user?.status === 'pending_verification' ||
    !profile?.isAdvancePaid
  );
  const isPackagePaymentPending = profile?.packagePaymentStatus === 'pending';
  const isPackagePaymentConfirmed = profile?.packagePaymentStatus === 'confirmed';
  const showPackagePaymentBanner =
    !isPackagePaymentConfirmed && (isType2 || (isType1 && isTrialEligible));

  const renderEditModal = () => {
    if (!isEditModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="card max-w-lg w-full p-6 sm:p-8 bg-slate-900/95 border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.85)] space-y-6 relative rounded-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="badge badge-warning text-xs font-bold uppercase tracking-wider mb-1">
                Correction / Update
              </span>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" /> Edit Registration Details
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Correct any errors in your personal or branch enrollment records.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-colors text-sm font-bold"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveDetails} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                  placeholder="e.g. Kasun Perera"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                    placeholder="e.g. kasun@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                    placeholder="e.g. 077 123 4567"
                  />
                </div>
              </div>
            </div>

            {/* NIC */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">
                National Identity Card (NIC) / Passport
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={editForm.nic}
                  onChange={(e) => setEditForm({ ...editForm, nic: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none font-mono"
                  placeholder="e.g. 200012345678 or 981234567V"
                />
              </div>
            </div>

            {/* Branch & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Registered Branch
                </label>
                <select
                  value={editForm.branch}
                  onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                >
                  <option value="Maharagama">Maharagama Branch</option>
                  <option value="Werahara">Werahara Branch</option>
                  <option value="Delgoda">Delgoda Branch</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Learner Category
                </label>
                <select
                  value={editForm.studentType}
                  onChange={(e) => setEditForm({ ...editForm, studentType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                >
                  <option value="Type1_NewLearner">Category 1: New Learner</option>
                  <option value="Type2_TrialReady">Category 2: Trial-Ready</option>
                </select>
              </div>
            </div>

            {/* Course Training Package */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <PackageIcon className="w-3.5 h-3.5 text-cyan-400" /> Enrolled Training Package <span className="text-rose-400">*</span>
                </span>
                {editForm.packageId && availablePackages.find((p) => p._id === editForm.packageId) && (
                  <span className="text-amber-400 font-extrabold text-xs">
                    Rs. {Number(availablePackages.find((p) => p._id === editForm.packageId)?.price || 0).toLocaleString()}.00
                  </span>
                )}
              </label>
              <div className="relative">
                <PackageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={editForm.packageId}
                  onChange={(e) => setEditForm({ ...editForm, packageId: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 text-white rounded-xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                >
                  {availablePackages.length > 0 ? (
                    availablePackages.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.lessons} Lessons) — Rs. {Number(p.price).toLocaleString()}
                      </option>
                    ))
                  ) : (
                    <option value="">Loading available packages...</option>
                  )}
                </select>
              </div>

              {(() => {
                const sel = availablePackages.find((p) => p._id === editForm.packageId);
                if (!sel) return null;
                return (
                  <div className="text-xs text-slate-300 bg-white/5 rounded-xl p-3 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-cyan-300">
                        {sel.lessons} Practical Driving Lessons ({sel.vehicleCategory || 'Light'} Vehicle)
                      </span>
                      <span className="text-amber-300 font-mono">
                        {sel.isPerLesson ? `Rs. ${sel.price}/lesson` : `Total Rs. ${Number(sel.price).toLocaleString()}`}
                      </span>
                    </div>
                    {sel.notes && (
                      <p className="text-[11px] text-slate-400 leading-normal">{sel.notes}</p>
                    )}
                    {sel.bonusLessons?.bike > 0 && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 mt-1">
                        <Gift className="w-3 h-3" /> Includes {sel.bonusLessons.bike} Bike &amp; {sel.bonusLessons.threeWheeler} Three-Wheeler bonus lessons
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                disabled={savingDetails}
                onClick={() => setIsEditModalOpen(false)}
                className="btn-secondary text-xs py-2.5 px-4 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingDetails}
                className="btn-accent text-xs py-2.5 px-5 font-extrabold flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {savingDetails ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (isAdvancePaymentPending) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1280px] mx-auto w-full">
        {/* Welcome Header */}
        <div className="relative backdrop-blur-2xl bg-gradient-to-r from-slate-900/90 via-primary/80 to-slate-900/90 rounded-3xl p-6 sm:p-8 text-white border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-warning text-xs font-bold py-1">
                {profile?.branch || user?.branch} Branch
              </span>
              <span className="badge bg-white/15 text-cyan-300 text-xs border border-white/20">
                {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
              </span>
              <span className="badge bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold flex items-center gap-1.5 py-1">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Status: Pending Verification
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white drop-shadow">
              Ayubowan, {user?.name}!
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Your student profile has been created. Please complete your advance payment to activate your account and unlock your portal features.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 sm:self-center relative z-10">
            <button
              onClick={openEditModal}
              className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 text-cyan-300 hover:border-cyan-400 shadow-md"
            >
              <Edit3 className="w-4 h-4 text-cyan-400" /> Edit Details
            </button>
            <button
              onClick={fetchProfile}
              className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 text-cyan-300" /> Refresh Status
            </button>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <Lock className="w-4 h-4 text-amber-400" /> Booking Locked (Payment Pending)
            </div>
          </div>
        </div>

        {/* Prominent Payment Pending Alert & Complete Payment CTA */}
        <div className="card p-6 sm:p-8 bg-gradient-to-r from-amber-950/80 via-slate-900/90 to-orange-950/80 border-2 border-amber-400/50 space-y-6 shadow-[0_12px_40px_rgba(245,158,11,0.25)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Clock className="w-7 h-7 text-amber-400 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-extrabold text-white text-lg sm:text-xl">
                    Account Status: Pending Verification
                  </h3>
                  <span className="badge badge-warning text-xs font-bold uppercase tracking-wider">
                    Payment Incomplete / Awaiting Approval
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                  Your student account is currently in <strong className="text-amber-300 font-semibold">Pending Verification</strong> status. Practical driving lesson bookings, package selections, and DMT milestone scheduling are locked until your advance deposit of <strong className="text-amber-300 text-base">Rs. {Number(profile?.advancePaymentAmount || 5000).toLocaleString()}.00</strong> is verified.
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 flex-wrap">
                  {profile?.advancePaymentReference && (
                    <span>Reference Code: <strong className="text-amber-300 font-mono text-sm">{profile.advancePaymentReference}</strong></span>
                  )}
                  <span>Registered Branch: <strong className="text-white">{profile?.branch || user?.branch} Branch</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                to="/payment-gateway"
                state={{
                  studentName: user?.name,
                  studentId: profile?._id,
                  userId: user?.id || user?._id,
                  branch: profile?.branch || user?.branch,
                  nic: profile?.nic || user?.nic,
                  email: user?.email,
                  advanceAmount: profile?.advancePaymentAmount || 5000,
                  registrationReference: profile?.advancePaymentReference,
                }}
                className="btn-accent text-sm py-3.5 px-6 font-extrabold flex items-center justify-center gap-2.5 shadow-xl hover:scale-105 transition-transform"
              >
                <CreditCard className="w-5 h-5 text-slate-950" /> Complete Payment / Upload Slip
              </Link>
            </div>
          </div>
        </div>

        {/* Student Registered Details Card */}
        <div className="card p-6 sm:p-8 space-y-6 border border-white/15 bg-slate-900/85 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-3">
            <div>
              <span className="badge badge-info text-xs font-bold uppercase tracking-wider mb-1.5">
                Official Registration File
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" /> Your Enrolled Student Details
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                These are your submitted personal and registration records on file with Sithma Driving School.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={openEditModal}
                className="btn-secondary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 hover:border-cyan-400 text-cyan-300 transition-colors shadow-md"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" /> Edit Details
              </button>
              <span className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                Reference: {profile?.advancePaymentReference || 'ADV-PENDING'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-semibold block flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" /> Full Name
              </span>
              <p className="text-sm font-bold text-white">{user?.name || profile?.name || 'N/A'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-semibold block flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" /> Username / Login ID
              </span>
              <p className="text-sm font-bold text-cyan-300 font-mono">{user?.username || 'N/A'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-semibold block flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Address
              </span>
              <p className="text-sm font-bold text-white">{user?.email || 'N/A'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-semibold block flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" /> Contact Phone
              </span>
              <p className="text-sm font-bold text-white">{user?.phone || profile?.phone || 'Not provided'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-semibold block flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> National Identity Card (NIC)
              </span>
              <p className="text-sm font-bold text-white font-mono">{profile?.nic || user?.nic || 'Not provided'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-semibold block flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-cyan-400" /> Learner Category
              </span>
              <p className="text-sm font-bold text-cyan-300">
                {isType2 ? 'Category 2: Trial-Ready (Existing Permit)' : 'Category 1: New Learner (DMT Direct)'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-semibold block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Registered Branch
              </span>
              <p className="text-sm font-bold text-white">{profile?.branch || user?.branch} Branch</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-semibold block flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Advance Fee Required
              </span>
              <p className="text-sm font-extrabold text-amber-300">
                Rs. {Number(profile?.advancePaymentAmount || 5000).toLocaleString()}.00
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-semibold block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Payment Status
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending Verification
              </span>
            </div>

            {/* Enrolled Training Package */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-amber-950/30 border border-cyan-500/30 space-y-1.5 sm:col-span-2 lg:col-span-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-cyan-300 font-bold flex items-center gap-1.5">
                  <PackageIcon className="w-4 h-4 text-cyan-400" /> Enrolled Training Package
                </span>
                <span className="text-xs font-black text-amber-300 bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/30">
                  Course Fee: Rs. {Number(profile?.package?.priceTotal || profile?.package?.packageId?.price || 45000).toLocaleString()}.00
                </span>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <p className="text-base font-extrabold text-white">
                  {profile?.package?.packageId?.name || (availablePackages.find((p) => p.type === profile?.package?.type)?.name) || (profile?.package?.type?.replace(/_/g, ' ')) || 'Car — Full License Package'}
                </p>
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="px-2.5 py-1 bg-white/10 text-cyan-300 rounded-lg font-bold">
                    {profile?.package?.lessonsTotal || 15} Practical Lessons
                  </span>
                  {(profile?.package?.bonusLessons?.bike > 0 || profile?.package?.packageId?.bonusLessons?.bike > 0) && (
                    <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 rounded-lg font-bold border border-emerald-500/20">
                      + Bonus: {profile?.package?.bonusLessons?.bike || profile?.package?.packageId?.bonusLessons?.bike} Bike, {profile?.package?.bonusLessons?.threeWheeler || profile?.package?.packageId?.bonusLessons?.threeWheeler} Three-Wheeler
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Steps to Unlock Access */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" /> Steps to Unlock Full Portal Access:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="font-bold text-cyan-300">1. Submit Advance Payment</span>
              <p className="text-slate-400 leading-relaxed">
                Click "Complete Payment / Upload Slip" above to pay online or deposit slip at {profile?.branch || user?.branch} Branch.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="font-bold text-cyan-300">2. Officer Verification</span>
              <p className="text-slate-400 leading-relaxed">
                Our branch Data Entry Officer will confirm your slip or cash payment in the system.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="font-bold text-emerald-400">3. Portal Unlocked</span>
              <p className="text-slate-400 leading-relaxed">
                Once approved, course package selection, practical driving lesson bookings, and instructor scheduling unlock immediately.
              </p>
            </div>
          </div>
        </div>

        {renderEditModal()}
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Welcome Banner */}
      <div className="relative backdrop-blur-2xl bg-gradient-to-r from-slate-900/90 via-primary/80 to-slate-900/90 rounded-3xl p-6 sm:p-8 text-white border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-warning text-xs font-bold py-1">
              {profile?.branch} Branch
            </span>
            <span className="badge bg-white/15 text-cyan-300 text-xs border border-white/20">
              {isType2 ? 'Type 2: Trial-Ready' : 'Type 1: New Learner'}
            </span>
            {profile?.nic && (
              <span className="badge bg-slate-950/60 text-slate-300 text-xs border border-white/10 font-mono">
                NIC: {profile.nic}
              </span>
            )}
            {isAdvancePaymentPending ? (
              <span className="badge bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold flex items-center gap-1.5 py-1">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Status: Pending Verification
              </span>
            ) : (
              <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold flex items-center gap-1.5 py-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Status: Active
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white drop-shadow">
            Ayubowan, {user?.name}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            Welcome to your driving portal. Track official DMT milestones, review your course lesson balance, and book your practical driving sessions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 sm:self-center relative z-10">
          <button
            onClick={openEditModal}
            className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 text-cyan-300 hover:border-cyan-400 shadow-md"
          >
            <Edit3 className="w-4 h-4 text-cyan-400" /> Edit Details
          </button>
          <button
            onClick={fetchProfile}
            className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-cyan-300" /> Refresh
          </button>

          {isAdvancePaymentPending ? (
            <button
              onClick={() =>
                toast.error(
                  '🔒 Advance Payment Pending: Practical lesson booking is restricted until your advance deposit is approved by your branch officer.'
                )
              }
              className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 opacity-80 border border-amber-400/40 text-amber-300 cursor-not-allowed"
              title="Lesson booking locked until advance payment is verified"
            >
              <Lock className="w-4 h-4 text-amber-400" /> Booking Locked (Payment Pending)
            </button>
          ) : isType1 && !isTrialEligible ? (
            <button
              onClick={() =>
                toast.error(
                  '🔒 DMT Requirement (US-09): Practical & trial lessons can only be booked after passing your Learner Written Exam (marked Passed by your branch officer).'
                )
              }
              className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 opacity-75 border border-cyan-400/30"
              title="Practical lessons locked until Learner Written Exam is passed"
            >
              <Lock className="w-4 h-4 text-amber-400" /> Lessons Locked (Exam Pending)
            </button>
          ) : (
            <Link
              to="/student/lessons/book"
              className="btn-accent text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-slate-950" /> Book a Lesson
            </Link>
          )}
        </div>
      </div>


      {/* TYPE 1: US-09 DMT LEARNER EXAM GATE NOTICE BANNER */}
      {isType1 && !isTrialEligible && (
        <div className="card p-6 bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-blue-950/70 border-2 border-cyan-400/40 space-y-4 shadow-[0_10px_35px_rgba(6,182,212,0.15)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 flex-shrink-0">
                <ShieldAlert className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <span className="badge badge-warning text-[10px] font-bold uppercase tracking-wider mb-1">
                  US-09 DMT Regulation Active • Theory Exam Gate
                </span>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  Practical Trial Lessons Locked Until Learner's Exam Passed
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  As a <strong>Type 1 New Learner</strong>, you can review your enrolled details and DMT milestone schedule below. In accordance with DMT regulations, on-road practical driving and trial lessons can only be booked after your Learner Written Exam is officially marked <strong>"Passed"</strong> by your branch officer.
                </p>
              </div>
            </div>
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-right self-start sm:self-auto min-w-[180px]">
              <span className="text-[10px] text-slate-400 font-semibold block">Your Exam Status:</span>
              <span
                className={`text-xs font-black ${
                  profile?.learnerExamStatus === 'failed' ? 'text-rose-400' : 'text-amber-300'
                }`}
              >
                {profile?.learnerExamStatus === 'failed'
                  ? 'Failed (Retake Required)'
                  : profile?.dmtDates?.learnerExamDate
                  ? 'Scheduled / Awaiting Result'
                  : 'Not Yet Faced'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* COURSE PACKAGE SELECTION & PAYMENT BANNER (FOR TRIAL-READY STUDENTS) */}
      {showPackagePaymentBanner && (
        <div className="card p-6 sm:p-8 bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-purple-900/30 border border-amber-400/30 space-y-6 shadow-[0_10px_40px_rgba(245,158,11,0.15)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="badge badge-warning text-xs font-bold uppercase tracking-wider mb-1">
                Step 5 Required • Course Package Selection & Payment
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-amber-400" /> Select Course Package & Choose Payment Plan
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Your advance payment is verified! Please select your vehicle package and preferred payment plan to unlock practical lessons.
              </p>
            </div>
            {isPackagePaymentPending && (
              <span className="badge badge-warning px-3 py-1 text-xs font-bold self-start sm:self-auto">
                ⏳ Payment Slip Pending Officer Verification
              </span>
            )}
          </div>

          {isPackagePaymentPending ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-xs text-amber-200 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <strong className="text-white">Your package payment slip is awaiting review.</strong>
                <p className="text-slate-300 mt-0.5">
                  Our Data Entry Officer will confirm your slip. As soon as verified, your {profile.paymentPlan === 'monthly' ? '4 monthly lessons' : 'full package lessons'} will unlock automatically for booking.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePackagePaymentSubmit} className="space-y-6">
              {/* Package Selection (US-13, US-14 Dynamic Packages) */}
              <div>
                <label className="block text-xs font-bold text-white mb-2">
                  1. Choose Course Package (Maintained by Branch Officer):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availablePackages.length > 0 ? (
                    availablePackages.map((pkgItem) => (
                      <div
                        key={pkgItem._id}
                        onClick={() => setSelectedPkgId(pkgItem._id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedPkgId === pkgItem._id
                            ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400 shadow-md'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white text-xs">{pkgItem.name}</span>
                          {selectedPkgId === pkgItem._id && (
                            <CheckCircle2 className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div className="text-sm font-black text-accent mb-1">
                          Rs. {pkgItem.price?.toLocaleString()}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {pkgItem.lessons} Lessons ({pkgItem.category || 'Practical'})
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 col-span-3">Loading available packages...</div>
                  )}
                </div>
              </div>

              {/* Payment Plan Selection (Full vs Monthly) */}
              <div>
                <label className="block text-xs font-bold text-white mb-2">
                  2. Choose Payment Plan (Step 5 Flow):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setSelectedPlan('full')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedPlan === 'full'
                        ? 'border-cyan-400 bg-cyan-500/15 ring-1 ring-cyan-400 text-cyan-200'
                        : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-white">Option A: Full Payment</span>
                      {selectedPlan === 'full' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Pay the complete course fee upfront. <strong>Unlocks all lessons immediately</strong> with no monthly caps.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedPlan === 'monthly'
                        ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400 text-amber-200'
                        : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-white">Option B: Monthly Payment</span>
                      {selectedPlan === 'monthly' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Pay month-by-month. <strong>Unlocks a maximum of 4 lessons</strong> for that billing month only (enforced server-side).
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Slip / Reference Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Deposited Bank Name
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-white/15 bg-slate-950/90 text-white rounded-xl text-xs outline-none"
                  >
                    <option value="Bank of Ceylon">Bank of Ceylon (BOC)</option>
                    <option value="Commercial Bank">Commercial Bank</option>
                    <option value="Sampath Bank">Sampath Bank</option>
                    <option value="Hatton National Bank">Hatton National Bank (HNB)</option>
                    <option value="People's Bank">People's Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bank Deposit Slip / Reference Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BOC-DEP-849204 or Mobile Transfer Ref"
                    value={slipRef}
                    onChange={(e) => setSlipRef(e.target.value)}
                    className="w-full px-3 py-2.5 border border-white/15 bg-slate-950/90 text-white rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submittingPkgPayment}
                  className="btn-accent py-3 px-6 text-xs font-bold shadow-lg flex items-center gap-2"
                >
                  {submittingPkgPayment ? 'Submitting...' : 'Submit Course Package Payment for Verification'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Grid: DMT Official Read-Only Milestones View (US-06) + Course Balance & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: DMT Timeline & Consolidated Read-Only Records (US-06) */}
        <div className="lg:col-span-2 space-y-6">
          {/* US-06: Consolidated Read-Only View of Trial, Learner Exam, and Medical Dates */}
          <div className="card p-6 space-y-4 border border-cyan-400/30 bg-slate-900/80">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="badge badge-info text-[10px] font-bold uppercase mb-1">
                  US-06 • DMT Official Record
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" /> Government DMT Milestone Schedule (Read-Only)
                </h2>
                <p className="text-xs text-slate-400">
                  Maintained and verified exclusively by your branch Data Entry Officer.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {profile?.branch} Branch
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Medical Exam */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                    <Stethoscope className="w-4 h-4 text-emerald-400" /> DMT Medical Exam
                  </span>
                  <span className={`badge text-[10px] ${profile?.dmtDates?.medicalExamPassed || isType2 ? 'badge-success' : 'badge-warning'}`}>
                    {profile?.dmtDates?.medicalExamPassed || isType2 ? 'Passed' : 'Pending'}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">
                  {profile?.dmtDates?.medicalExamDate
                    ? new Date(profile.dmtDates.medicalExamDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : (isType2 ? 'Cleared Prior to Enrolling' : 'Date Not Yet Assigned')}
                </div>
              </div>

              {/* Learner Registration */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                    <FileText className="w-4 h-4 text-blue-400" /> Learner Registration
                  </span>
                  <span className="badge badge-info text-[10px]">
                    {profile?.dmtDates?.learnerRegistrationDate ? 'Registered' : 'In Progress'}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">
                  {profile?.dmtDates?.learnerRegistrationDate
                    ? new Date(profile.dmtDates.learnerRegistrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : (isType2 ? 'Registered with DMT' : 'Pending Medical Clearance')}
                </div>
              </div>

              {/* Learner Written Exam */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                    <BookOpen className="w-4 h-4 text-purple-400" /> Learner's Written Exam
                  </span>
                  <span className={`badge text-[10px] ${profile?.learnerExamStatus === 'passed' || profile?.dmtDates?.learnerExamPassed || isType2 ? 'badge-success' : 'badge-warning'}`}>
                    {profile?.learnerExamStatus === 'passed' || profile?.dmtDates?.learnerExamPassed || isType2 ? 'Passed' : (profile?.learnerExamStatus === 'failed' ? 'Failed' : 'Not Taken')}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">
                  {profile?.dmtDates?.learnerExamDate
                    ? new Date(profile.dmtDates.learnerExamDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : (isType2 ? 'Cleared Prior to Enrolling' : 'Date Not Yet Assigned')}
                </div>
                {isType1 && (
                  <p className="text-[10px] text-cyan-300/90 pt-0.5">
                    {profile?.learnerExamStatus === 'passed' || profile?.dmtDates?.learnerExamPassed
                      ? '✓ Passed! Practical trial lesson booking unlocked (US-09).'
                      : '🔒 Trial lesson booking locked until exam passed (US-09).'}
                  </p>
                )}
              </div>

              {/* Practical Trial Exam */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                    <Car className="w-4 h-4 text-accent" /> DMT Practical Trial
                  </span>
                  <span className={`badge text-[10px] ${profile?.trial?.licenseObtained ? 'badge-success' : 'badge-warning'}`}>
                    {profile?.trial?.licenseObtained ? 'Licensed' : `${profile?.trial?.attempts?.length || 0}/3 Attempts Used`}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">
                  {profile?.trial?.deadlineDate
                    ? `1.5-Yr Deadline: ${new Date(profile.trial.deadlineDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
                    : (isType2 ? 'Ready for Practical Trial' : 'Pending Learner Exam Pass')}
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          <DmtMilestoneTimeline student={profile} />
        </div>

        {/* Right 1 Col: Course Package, Lessons & Quick Links */}
        <div className="space-y-6">
          {/* Current Package & Lessons Balance Card */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Course Package</h3>
                <p className="text-xs text-slate-400">{pkg.type?.replace('_', ' ')}</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-accent">
                  Rs. {pkg.priceTotal?.toLocaleString()}
                </span>
                {profile?.paymentPlan && (
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    Plan: {profile.paymentPlan}
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Plan 4-Lesson Cap Banner */}
            {profile?.paymentPlan === 'monthly' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 text-xs text-amber-200">
                <strong>Monthly Plan Active:</strong> Max 4 lessons unlocked per billing month (Server-enforced cap). Total lessons used: {usedLessons}/{unlockedLessons}.
              </div>
            )}

            {/* Lessons Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Lessons Used vs Unlocked:</span>
                <span className="text-cyan-300 font-bold">
                  {usedLessons} / {unlockedLessons} Lessons
                </span>
              </div>
              <div className="w-full bg-slate-950/80 rounded-full h-3 overflow-hidden border border-white/15 p-0.5">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{remainingLessons} lesson(s) available to book</span>
                <span className="font-mono text-cyan-300 font-bold">{progressPercent}% Completed</span>
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
              <span className="text-slate-400">Package Status:</span>
              <span
                className={`badge ${
                  isPackagePaymentConfirmed || (!isType2 && profile?.registrationStatus === 'registered')
                    ? 'badge-success'
                    : isPackagePaymentPending
                    ? 'badge-warning'
                    : 'badge-info'
                }`}
              >
                {isPackagePaymentConfirmed || (!isType2 && profile?.registrationStatus === 'registered')
                  ? 'Payment Verified'
                  : isPackagePaymentPending
                  ? 'Pending Officer Review'
                  : 'Awaiting Package Payment'}
              </span>
            </div>

            {/* Need More Practice? Buy Additional Lessons Quick Link */}
            <div className="pt-2 border-t border-white/10">
              <Link
                to="/student/profile"
                className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/20 text-xs text-cyan-300 font-bold transition-all group"
              >
                <span className="flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-cyan-400" /> Need more driving practice?
                </span>
                <span className="text-[11px] text-white flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Buy Extra Lessons <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>

          {/* Quick Actions Card (With Type 1 Scope Restriction Applied) */}
          <div className="card space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> Student Quick Hub
            </h3>
            <div className="space-y-2 text-xs">
              {/* Type 1 Scope Restriction: Exam/Quiz is strictly hidden for Type 1 */}
              {!isType1 && (
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
              )}

              {isType1 && !isTrialEligible ? (
                <div
                  onClick={() =>
                    toast.error(
                      '🔒 DMT Requirement (US-09): Learner written exam must be marked Passed before booking practical trial lessons.'
                    )
                  }
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 opacity-60 border border-white/10 cursor-not-allowed"
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-slate-400">
                      Book Driving Lessons (Locked)
                    </span>
                  </div>
                  <span className="badge badge-warning text-[10px]">Exam Required</span>
                </div>
              ) : (
                <Link
                  to="/student/lessons"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200 group-hover:text-white">
                      Book Driving Lessons
                    </span>
                  </div>
                  <span className="text-[11px] text-cyan-300 font-bold">{remainingLessons} Available</span>
                </Link>
              )}

              <Link
                to="/student/profile"
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-slate-200 group-hover:text-white">
                    Buy Additional Lessons
                  </span>
                </div>
                <span className="text-[11px] text-accent font-bold">Profile Shop</span>
              </Link>

              <Link
                to="/student/payments"
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  <span className="font-semibold text-slate-200 group-hover:text-white">
                    Payment History & Slips
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">Bank Slips</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {renderEditModal()}
    </div>
  );
}

