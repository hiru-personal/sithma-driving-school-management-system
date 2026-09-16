import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import StudentTypeSelectModal from '../components/StudentTypeSelectModal';
import {
  UserPlus,
  GraduationCap,
  Award,
  Calendar,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Car,
  Bike,
  Truck,
  Gift,
  Check,
  Minus,
  Plus,
  Layers,
  Package as PackageIcon,
} from 'lucide-react';

import toast from 'react-hot-toast';

// Official Vehicle Training Package Catalog for Sithma Driving School
const FALLBACK_PACKAGES = [
  // A. Individual / Private Single Lessons (Pay-Per-Lesson)
  {
    type: 'Bike_Individual',
    name: 'Bike (Individual / Private)',
    categoryGroup: 'A',
    vehicleCategory: 'Bike',
    lessons: 1,
    price: 2000,
    isPerLesson: true,
    desc: '1-on-1 private lesson with dedicated instructor. LKR 2,000 / lesson.',
  },
  {
    type: 'ThreeWheeler_Individual',
    name: 'Three-Wheel (Individual / Private)',
    categoryGroup: 'A',
    vehicleCategory: 'Three-Wheel',
    lessons: 1,
    price: 2500,
    isPerLesson: true,
    desc: '1-on-1 private lesson with dedicated instructor. LKR 2,500 / lesson.',
  },
  {
    type: 'Car_Individual',
    name: 'Car (Auto / Manual — Individual / Private)',
    categoryGroup: 'A',
    vehicleCategory: 'Car',
    lessons: 1,
    price: 3000,
    isPerLesson: true,
    desc: '1-on-1 private lesson with dual-control vehicle. LKR 3,000 / lesson.',
  },
  {
    type: 'HeavyVehicle_Individual',
    name: 'Heavy Vehicle (Individual / Private)',
    categoryGroup: 'A',
    vehicleCategory: 'Heavy',
    lessons: 1,
    price: 3500,
    isPerLesson: true,
    desc: '1-on-1 private heavy vehicle commercial training. LKR 3,500 / lesson.',
  },

  // B. Standard Single Lessons (Pay-Per-Lesson)
  {
    type: 'Bike_Standard',
    name: 'Bike (Standard Single Lesson)',
    categoryGroup: 'B',
    vehicleCategory: 'Bike',
    lessons: 1,
    price: 800,
    isPerLesson: true,
    desc: 'Standard single practice lesson. LKR 800 / lesson.',
  },
  {
    type: 'ThreeWheeler_Standard',
    name: 'Three-Wheel (Standard Single Lesson)',
    categoryGroup: 'B',
    vehicleCategory: 'Three-Wheel',
    lessons: 1,
    price: 1500,
    isPerLesson: true,
    desc: 'Standard single practice lesson. LKR 1,500 / lesson.',
  },
  {
    type: 'Car_Standard',
    name: 'Car (Standard Single Lesson)',
    categoryGroup: 'B',
    vehicleCategory: 'Car',
    lessons: 1,
    price: 2000,
    isPerLesson: true,
    desc: 'Standard single practice session (Auto/Manual). LKR 2,000 / lesson.',
  },
  {
    type: 'HeavyVehicle_Standard',
    name: 'Heavy Vehicle (Standard Single Lesson)',
    categoryGroup: 'B',
    vehicleCategory: 'Heavy',
    lessons: 1,
    price: 2500,
    isPerLesson: true,
    desc: 'Standard single heavy vehicle session. LKR 2,500 / lesson.',
  },

  // C. Full Course Packages (Includes 15 Standard Lessons)
  {
    type: 'Car_Full',
    name: 'Car Package (Auto Car OR Manual Car)',
    categoryGroup: 'C',
    vehicleCategory: 'Car',
    lessons: 15,
    price: 40000,
    isPerLesson: false,
    bonusText: 'Includes 2 FREE Bike lessons + 2 FREE Three-Wheel lessons.',
    bonusLessons: { bike: 2, threeWheeler: 2 },
    desc: 'Includes 15 standard lessons + 2 FREE Bike lessons + 2 FREE Three-Wheel lessons.',
  },
  {
    type: 'Combo_Full',
    name: 'Combo Package (Car + Bike + Three-Wheel)',
    categoryGroup: 'C',
    vehicleCategory: 'Combo',
    lessons: 15,
    price: 65000,
    isPerLesson: false,
    bonusText: 'Includes full access to 15 standard lessons across all three categories.',
    bonusLessons: { bike: 0, threeWheeler: 0 },
    desc: 'Includes full access to 15 standard lessons across all three categories.',
  },
  {
    type: 'HeavyVehicle_Full',
    name: 'Heavy Vehicle Full Package',
    categoryGroup: 'C',
    vehicleCategory: 'Heavy',
    lessons: 15,
    price: 70000,
    isPerLesson: false,
    bonusText: 'Includes 15 standard heavy vehicle training lessons.',
    bonusLessons: { bike: 0, threeWheeler: 0 },
    desc: 'Includes 15 standard heavy vehicle training lessons.',
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Normalize student type parameter: "Type 1" (Full Course) or "Type 2" (Trial Only)
  const rawType = searchParams.get('type') || '';
  const initialStudentType = rawType.toLowerCase().includes('2') ? 'Type 2' : 'Type 1';

  const [studentType, setStudentType] = useState(initialStudentType);
  const [typeModalOpen, setTypeModalOpen] = useState(!rawType);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync category type when searchParams change or ensure modal opens if no type in URL
  useEffect(() => {
    const currentType = searchParams.get('type');
    if (currentType) {
      setStudentType(currentType.toLowerCase().includes('2') ? 'Type 2' : 'Type 1');
      setTypeModalOpen(false);
    } else {
      setTypeModalOpen(true);
    }
  }, [searchParams]);

  // Type 2 Vehicle Package State (Only for Type 2 students)
  const [availablePackages, setAvailablePackages] = useState([]);
  const [selectedTier, setSelectedTier] = useState('C'); // 'C' (Full Course), 'A' (Individual), 'B' (Standard)
  const [selectedPackageType, setSelectedPackageType] = useState('Car_Full');
  const [lessonQty, setLessonQty] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    email: '',
    phone: '',
    nic: '',
    branch: 'Maharagama',
    password: '',
    confirmPassword: '',
  });

  // Calculate live age from DOB string
  const calculatedAge = useMemo(() => {
    if (!formData.dob) return null;
    const dob = new Date(formData.dob);
    if (isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }, [formData.dob]);

  // Password validation rules
  const passwordErrors = useMemo(() => {
    const p = formData.password;
    if (!p) return [];
    const errors = [];
    if (p.length < 8) errors.push('At least 8 characters');
    if (!/[A-Za-z]/.test(p)) errors.push('At least one letter');
    if (!/[0-9]/.test(p)) errors.push('At least one numeric digit');
    return errors;
  }, [formData.password]);

  const passwordsMatch = formData.confirmPassword
    ? formData.password === formData.confirmPassword
    : true;

  // Fetch packages from backend to get live DB IDs
  useEffect(() => {
    api.get('/packages').then((res) => {
      if (res.data?.success && res.data?.packages) {
        setAvailablePackages(res.data.packages);
      }
    }).catch((err) => {
      console.warn('Using catalog fallbacks for packages:', err);
    });
  }, []);

  // Merge live packages with fallback catalog
  const displayedPackages = useMemo(() => {
    return FALLBACK_PACKAGES.map((fallback) => {
      const live = availablePackages.find((p) => p.type === fallback.type);
      return {
        ...fallback,
        _id: live?._id || fallback.type,
        price: live?.price || fallback.price,
        name: live?.name || fallback.name,
      };
    });
  }, [availablePackages]);

  const activePackagesForTier = useMemo(() => {
    return displayedPackages.filter((p) => p.categoryGroup === selectedTier);
  }, [displayedPackages, selectedTier]);

  const activeSelectedPackage = useMemo(() => {
    return (
      displayedPackages.find((p) => p.type === selectedPackageType) ||
      displayedPackages[0]
    );
  }, [displayedPackages, selectedPackageType]);

  const handleTierChange = (tier) => {
    setSelectedTier(tier);
    const firstInTier = displayedPackages.find((p) => p.categoryGroup === tier);
    if (firstInTier) {
      setSelectedPackageType(firstInTier.type);
    }
  };

  const getVehicleIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('bike')) return <Bike className="w-5 h-5" />;
    if (cat.includes('heavy') || cat.includes('bus') || cat.includes('truck')) return <Truck className="w-5 h-5" />;
    if (cat.includes('combo')) return <Layers className="w-5 h-5" />;
    return <Car className="w-5 h-5" />;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!formData.dob) {
      toast.error('Please select your date of birth');
      return;
    }

    if (calculatedAge === null || calculatedAge < 18) {
      toast.error('Under DMT Sri Lanka regulations, applicants must be at least 18 years old to register.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please provide a valid email address');
      return;
    }

    if (!formData.phone.trim() || formData.phone.length < 9) {
      toast.error('Please provide a valid phone number (e.g. 07XXXXXXXX)');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (passwordErrors.length > 0) {
      toast.error(`Password requirement: ${passwordErrors.join(', ')}`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (studentType === 'Type 2' && !selectedPackageType) {
      toast.error('Please select a vehicle package for your Type 2 registration');
      return;
    }

    setSubmitting(true);

    try {
      const activePkg = displayedPackages.find((p) => p.type === selectedPackageType);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        nic: formData.nic.trim() || null,
        dob: formData.dob,
        age: calculatedAge,
        password: formData.password,
        student_type: studentType,
        studentType: studentType,
        branch: formData.branch,
        packageType: studentType === 'Type 2' ? selectedPackageType : null,
        packageId: studentType === 'Type 2' ? (activePkg?._id || null) : null,
        customLessonsCount: studentType === 'Type 2' && activePkg?.isPerLesson ? lessonQty : (activePkg?.lessons || 15),
      };

      const res = await api.post('/auth/register', payload);

      if (res.data?.success) {
        const pendingUserId = res.data.pendingUserId || res.data.user?._id || res.data.student?.userId;

        // Persist pending registration context locally so Step 3 gateway knows who is paying
        const pendingPayload = {
          pendingUserId,
          studentId: res.data.student?._id || null,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          branch: formData.branch,
          student_type: studentType,
          studentType: studentType,
          dob: formData.dob,
          age: calculatedAge,
          advanceAmount: 5000,
          selectedPackage: studentType === 'Type 2' ? {
            type: selectedPackageType,
            name: activePkg?.name,
            price: activePkg?.isPerLesson ? (Number(activePkg.price) * lessonQty) : activePkg?.price,
            lessons: activePkg?.isPerLesson ? lessonQty : (activePkg?.lessons || 15),
            tier: selectedTier,
          } : null,
        };

        try {
          localStorage.setItem('sithma_pending_registration', JSON.stringify(pendingPayload));
          sessionStorage.setItem('sithma_pending_registration', JSON.stringify(pendingPayload));
        } catch (storageErr) {
          console.warn('Storage persistence warning:', storageErr);
        }

        toast.success('Registration details saved! Proceed to advance payment of LKR 5,000.');

        // Navigate directly to Step 3 (Advance Payment Screen) without logging into active dashboard
        navigate('/payment-gateway', { state: pendingPayload });
      } else {
        toast.error(res.data?.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const serverMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).join(', ') : 'Registration request failed. Please check your details.');
      toast.error(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const isType1 = studentType === 'Type 1';

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      {/* Step Header Stepper */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-amber-500/20 border border-white/15 text-xs font-bold text-slate-200 mb-3 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span>Step 2 of 3: Student Registration Form</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Create Your Student Profile
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
          Please fill in your legal details. Once registered, you will proceed directly to Step 3 to complete the mandatory advance payment.
        </p>
      </div>

      {/* Prominent Read-Only Student Type Badge */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-lg bg-slate-900/80 relative overflow-hidden">
        {isType1 ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-cyan-400 pl-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-black flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Category: Type 1 Student</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                    Full Course Learner
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Complete program: DMT medical, written exam preparation, practical training & trial exam.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTypeModalOpen(true)}
              className="text-xs text-cyan-300 hover:text-white font-bold underline cursor-pointer self-end sm:self-center"
            >
              Change Category
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-amber-400 pl-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-black flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Category: Type 2 Student</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Trial Only Learner
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Already DMT-cleared elsewhere. Directly book practical trial sessions upon payment verification.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTypeModalOpen(true)}
              className="text-xs text-amber-300 hover:text-white font-bold underline cursor-pointer self-end sm:self-center"
            >
              Change Category
            </button>
          </div>
        )}
      </div>

      {/* Main Registration Form Card */}
      <div className="backdrop-blur-2xl bg-slate-900/85 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Full Legal Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Kasun Chamara Perera"
                required
                className="w-full bg-slate-950/70 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Enter name exactly as printed on your National Identity Card (NIC) or Passport.
            </p>
          </div>

          {/* Date of Birth & Live Calculated Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Date of Birth <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full bg-slate-950/70 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Live Visual Age Display */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Calculated Age (DMT 18+ Rule)
              </label>
              <div className="h-[46px] rounded-xl flex items-center px-4 transition-all duration-300 border">
                {calculatedAge === null ? (
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>Select DOB to calculate age</span>
                  </div>
                ) : calculatedAge >= 18 ? (
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      {calculatedAge} Years Old — <strong className="font-extrabold text-white">Eligible</strong> under DMT
                    </span>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>
                      {calculatedAge} Years Old — <strong className="font-extrabold text-white">Underage</strong> (Must be 18+)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-950/70 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Phone Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="077 123 4567"
                  required
                  className="w-full bg-slate-950/70 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Preferred Branch & NIC Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Preferred Branch <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950/70 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                >
                  <option value="Maharagama">Maharagama (Headquarters & Training Ground)</option>
                  <option value="Werahara">Werahara (DMT Central Exam Hub)</option>
                  <option value="Delgoda">Delgoda (Gampaha District Center)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                NIC / Passport Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  placeholder="e.g. 200012345678 or 981234567V"
                  className="w-full bg-slate-950/70 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950/70 border border-white/15 rounded-xl pl-4 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Confirm Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={`w-full bg-slate-950/70 border rounded-xl pl-4 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    passwordsMatch
                      ? 'border-white/15 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                      : 'border-rose-500 focus:border-rose-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Guidance Note */}
          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
            <span>Must contain:</span>
            <span className={formData.password.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}>
              ✓ 8+ characters
            </span>
            <span className={/[A-Za-z]/.test(formData.password) ? 'text-emerald-400' : 'text-slate-500'}>
              ✓ Letters
            </span>
            <span className={/[0-9]/.test(formData.password) ? 'text-emerald-400' : 'text-slate-500'}>
              ✓ Numbers
            </span>
            {!passwordsMatch && (
              <span className="text-rose-400 font-bold ml-auto">Passwords do not match</span>
            )}
          </div>

          {/* ========================================================================= */}
          {/* TYPE 2 ONLY: VEHICLE TRAINING PACKAGE SELECTION */}
          {/* ========================================================================= */}
          {studentType === 'Type 2' && (
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      Mandatory For Type 2
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Select Vehicle Package</span>
                  </div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <PackageIcon className="w-5 h-5 text-accent" />
                    Select Your Vehicle Training Package
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    As a Trial-Ready student, choose your full course trial package or pay-per-lesson plan.
                  </p>
                </div>
              </div>

              {/* Category Tier Selector: C (Full Course), A (Individual), B (Standard) */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-white/10">
                <button
                  type="button"
                  onClick={() => handleTierChange('C')}
                  className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 ${
                    selectedTier === 'C'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 font-black'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                    <Layers className="w-3.5 h-3.5" /> Full Packages
                  </span>
                  <span className="text-[10px] opacity-85">Group C • 15 Lessons</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTierChange('A')}
                  className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 ${
                    selectedTier === 'A'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 font-black'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                    <Award className="w-3.5 h-3.5" /> Individual / Private
                  </span>
                  <span className="text-[10px] opacity-85">Group A • Pay-Per-Lesson</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTierChange('B')}
                  className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 ${
                    selectedTier === 'B'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 font-black'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Standard Single
                  </span>
                  <span className="text-[10px] opacity-85">Group B • Pay-Per-Lesson</span>
                </button>
              </div>

              {/* Package Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {activePackagesForTier.map((pkg) => {
                  const isSelected = selectedPackageType === pkg.type;
                  return (
                    <div
                      key={pkg.type}
                      onClick={() => setSelectedPackageType(pkg.type)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-amber-500/20 via-slate-900/95 to-slate-950 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/80'
                          : 'bg-slate-950/60 border-white/10 hover:border-white/25 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950 shadow-md'
                                  : 'bg-white/10 text-cyan-300'
                              }`}
                            >
                              {getVehicleIcon(pkg.vehicleCategory || pkg.type)}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-white leading-snug">
                                {pkg.name}
                              </h4>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {pkg.isPerLesson ? 'Pay-Per-Lesson' : `${pkg.lessons} Standard Lessons`}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 shadow-sm'
                                : 'border border-white/20'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Price Tag */}
                        <div className="pt-2 flex items-baseline justify-between border-t border-white/10">
                          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                            Rate / Price
                          </span>
                          <span className="text-base font-black text-amber-300 font-mono">
                            LKR {Number(pkg.price).toLocaleString()}
                            {pkg.isPerLesson && (
                              <span className="text-xs text-slate-400 font-normal"> / lesson</span>
                            )}
                          </span>
                        </div>

                        {/* Bonus Callout */}
                        {pkg.bonusText && (
                          <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 flex items-center gap-2 mt-1">
                            <Gift className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                            <span>{pkg.bonusText}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stepper for Pay-Per-Lesson packages */}
              {activeSelectedPackage?.isPerLesson && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <span className="text-xs font-bold text-slate-200">
                      Initial Practice Lessons to Register
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Flexible: you can top up more trial lessons anytime.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLessonQty(Math.max(1, lessonQty - 1))}
                      className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 font-bold transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono font-black text-base text-cyan-300">
                      {lessonQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLessonQty(lessonQty + 1)}
                      className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 font-bold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-300 font-mono ml-2">
                      = LKR {(Number(activeSelectedPackage.price) * lessonQty).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Selected Package Confirmation Box */}
              {activeSelectedPackage && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-950 to-cyan-500/10 border border-amber-400/40 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-warning text-[10px] font-black uppercase">
                        Selected Package
                      </span>
                      <span className="text-xs font-bold text-white">
                        {activeSelectedPackage.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-semibold mr-1.5">Package Total:</span>
                      <span className="text-sm font-black text-amber-300 font-mono">
                        LKR{' '}
                        {activeSelectedPackage.isPerLesson
                          ? (Number(activeSelectedPackage.price) * lessonQty).toLocaleString()
                          : Number(activeSelectedPackage.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-normal flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Advance Payment Notice:</strong> Today you only pay the fixed advance deposit of <strong>LKR 5,000</strong> to submit your application for officer verification. Package balance is paid after your account is approved.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fixed Advance Payment Notice Box */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 leading-relaxed">
              <strong className="font-extrabold text-white">Next Step: Fixed Advance Payment of LKR 5,000</strong>
              <p className="mt-0.5 text-amber-300/90">
                Submitting this form creates your account in <em>Pending Payment</em> status. On the next screen, you can choose between Bank Deposit Slip Upload, Online Card Gateway, or Physical Cash Payment at the branch.
              </p>
            </div>
          </div>

          {/* Submit CTA Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || (calculatedAge !== null && calculatedAge < 18)}
              className="w-full py-4 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-accent via-amber-400 to-accent-dark hover:scale-[1.01] active:scale-95 shadow-[0_0_25px_rgba(242,169,59,0.4)] border border-amber-300/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving Registration...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Advance Payment (LKR 5,000)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info link */}
        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
          Already registered and paid?{' '}
          <Link to="/login" className="text-cyan-300 font-bold hover:underline">
            Sign In to Portal
          </Link>
        </div>
      </div>

      {/* Student Type Selection Modal */}
      <StudentTypeSelectModal
        isOpen={typeModalOpen}
        onClose={() => {
          setTypeModalOpen(false);
          if (!searchParams.get('type')) {
            navigate('/register?type=Type%201', { replace: true });
          }
        }}
      />
    </div>
  );
}
