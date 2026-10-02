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
    <div className="py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      {/* Step Header Stepper */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F1FD] border border-[#DBE2EF] text-xs font-bold text-[#19376D] mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#3F72AF]" />
          <span>Step 2 of 3: Student Registration Form</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-[#0B2447] tracking-tight font-heading">
          Create Your Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#4B6584] mt-2 max-w-xl mx-auto font-normal">
          Please fill in your legal details. Once registered, you will proceed directly to Step 3 to complete the mandatory advance payment.
        </p>
      </div>

      {/* Prominent Read-Only Student Type Badge */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white border border-[#DBE2EF] shadow-xs relative overflow-hidden transition-all duration-300">
        {isType1 ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-[#3F72AF] pl-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F1FD] border border-[#DBE2EF] text-[#3F72AF] flex items-center justify-center font-black flex-shrink-0 shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-[#0B2447]">Category: Type 1 Student</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-[#E8F1FD] text-[#19376D] border border-[#DBE2EF]">
                    Full Course Learner
                  </span>
                </div>
                <p className="text-xs text-[#4B6584] mt-0.5 font-normal">
                  Complete program: DMT medical, written exam preparation, practical training & trial exam.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTypeModalOpen(true)}
              className="text-xs text-[#3F72AF] hover:text-[#0B2447] font-bold underline cursor-pointer self-end sm:self-center transition-colors"
            >
              Change Category
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-amber-500 pl-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-black flex-shrink-0 shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-[#0B2447]">Category: Type 2 Student</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Trial Only Learner
                  </span>
                </div>
                <p className="text-xs text-[#4B6584] mt-0.5 font-normal">
                  Already DMT-cleared elsewhere. Directly book practical trial sessions upon payment verification.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTypeModalOpen(true)}
              className="text-xs text-[#3F72AF] hover:text-[#0B2447] font-bold underline cursor-pointer self-end sm:self-center transition-colors"
            >
              Change Category
            </button>
          </div>
        )}
      </div>

      {/* Main Registration Form Card */}
      <div className="card bg-white border border-[#DBE2EF] rounded-3xl p-5 sm:p-8 md:p-10 shadow-[0_10px_40px_rgba(17,45,78,0.06)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#112D4E] mb-2">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Kasun Chamara Perera"
                required
                className="w-full bg-[#F8FAFD] border border-[#DBE2EF] rounded-xl px-4 py-3 text-sm text-[#0B2447] font-medium placeholder-[#94A3B8] focus:outline-none focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all"
              />
            </div>
            <p className="text-[11px] text-[#64748B] mt-1.5 font-normal">
              Enter name exactly as printed on your National Identity Card (NIC) or Passport.
            </p>
          </div>

          {/* Date of Birth & Live Calculated Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#112D4E] mb-2">
                Date of Birth <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-[#3F72AF] absolute left-3.5 pointer-events-none" />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full bg-[#F8FAFD] border border-[#DBE2EF] rounded-xl pl-10 pr-3.5 py-3 text-sm text-[#0B2447] font-semibold placeholder-[#94A3B8] focus:outline-none focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all cursor-pointer shadow-xs"
                />
              </div>
            </div>

            {/* Live Visual Age Display */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#112D4E] mb-2">
                Calculated Age (DMT 18+ Rule)
              </label>
              <div
                className={`min-h-[46px] py-2 rounded-xl flex items-center px-4 transition-all duration-300 border ${
                  calculatedAge === null
                    ? 'bg-[#F8FAFD] border-[#DBE2EF] text-[#64748B]'
                    : calculatedAge >= 18
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {calculatedAge === null ? (
                  <div className="text-xs text-[#64748B] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#94A3B8]" />
                    <span>Select DOB to calculate age</span>
                  </div>
                ) : calculatedAge >= 18 ? (
                  <div className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      {calculatedAge} Years Old — <strong className="font-extrabold text-emerald-950">Eligible</strong> under DMT
                    </span>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>
                      {calculatedAge} Years Old — <strong className="font-extrabold text-rose-950">Underage</strong> (Must be 18+)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#112D4E] mb-2">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#F8FAFD] border border-[#DBE2EF] rounded-xl px-4 py-3 text-sm text-[#0B2447] font-medium placeholder-[#94A3B8] focus:outline-none focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#112D4E] mb-2">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="077 123 4567"
                  required
                  className="w-full bg-[#F8FAFD] border border-[#DBE2EF] rounded-xl px-4 py-3 text-sm text-[#0B2447] font-medium placeholder-[#94A3B8] focus:outline-none focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Preferred Branch & NIC Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#112D4E] mb-2">
                Preferred Branch <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#F8FAFD] border border-[#DBE2EF] rounded-xl px-4 py-3 text-sm text-[#0B2447] font-semibold focus:outline-none focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all cursor-pointer"
                >
                  <option value="Maharagama">Maharagama (Headquarters & Training Ground)</option>
                  <option value="Werahara">Werahara (DMT Central Exam Hub)</option>
                  <option value="Delgoda">Delgoda (Gampaha District Center)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#112D4E] mb-2">
                NIC / Passport Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  placeholder="e.g. 200012345678 or 981234567V"
                  className="w-full bg-[#F8FAFD] border border-[#DBE2EF] rounded-xl px-4 py-3 text-sm text-[#0B2447] font-medium placeholder-[#94A3B8] focus:outline-none focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#112D4E] mb-2">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#F8FAFD] border border-[#DBE2EF] rounded-xl pl-4 pr-11 py-3 text-sm text-[#0B2447] font-medium placeholder-[#94A3B8] focus:outline-none focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] hover:text-[#0B2447] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#112D4E] mb-2">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={`w-full bg-[#F8FAFD] rounded-xl pl-4 pr-11 py-3 text-sm text-[#0B2447] font-medium placeholder-[#94A3B8] focus:outline-none transition-all border ${
                    passwordsMatch
                      ? 'border-[#DBE2EF] focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20'
                      : 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] hover:text-[#0B2447] transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Guidance Note */}
          <div className="text-[11px] text-[#64748B] flex flex-wrap items-center gap-3">
            <span className="font-semibold text-[#112D4E]">Must contain:</span>
            <span className={formData.password.length >= 8 ? 'text-emerald-700 font-bold' : 'text-[#94A3B8]'}>
              ✓ 8+ characters
            </span>
            <span className={/[A-Za-z]/.test(formData.password) ? 'text-emerald-700 font-bold' : 'text-[#94A3B8]'}>
              ✓ Letters
            </span>
            <span className={/[0-9]/.test(formData.password) ? 'text-emerald-700 font-bold' : 'text-[#94A3B8]'}>
              ✓ Numbers
            </span>
            {!passwordsMatch && (
              <span className="text-rose-600 font-bold ml-auto">Passwords do not match</span>
            )}
          </div>

          {/* ========================================================================= */}
          {/* TYPE 2 ONLY: VEHICLE TRAINING PACKAGE SELECTION */}
          {/* ========================================================================= */}
          {studentType === 'Type 2' && (
            <div className="pt-6 border-t border-[#DBE2EF] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                      Mandatory For Type 2
                    </span>
                    <span className="text-xs text-[#4B6584] font-semibold">Select Vehicle Package</span>
                  </div>
                  <h3 className="text-lg font-black text-[#0B2447] flex items-center gap-2">
                    <PackageIcon className="w-5 h-5 text-[#3F72AF]" />
                    Select Your Vehicle Training Package
                  </h3>
                  <p className="text-xs text-[#4B6584] mt-0.5">
                    As a Trial-Ready student, choose your full course trial package or pay-per-lesson plan.
                  </p>
                </div>
              </div>

              {/* Category Tier Selector: C (Full Course), A (Individual), B (Standard) */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#F0F4F8] border border-[#DBE2EF]">
                <button
                  type="button"
                  onClick={() => handleTierChange('C')}
                  className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
                    selectedTier === 'C'
                      ? 'bg-[#3F72AF] text-white shadow-sm font-black'
                      : 'text-[#112D4E] hover:text-[#0B2447] hover:bg-white'
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
                  className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
                    selectedTier === 'A'
                      ? 'bg-[#3F72AF] text-white shadow-sm font-black'
                      : 'text-[#112D4E] hover:text-[#0B2447] hover:bg-white'
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
                  className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
                    selectedTier === 'B'
                      ? 'bg-[#3F72AF] text-white shadow-sm font-black'
                      : 'text-[#112D4E] hover:text-[#0B2447] hover:bg-white'
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
                          ? 'bg-[#F8FAFD] border-2 border-[#3F72AF] shadow-md ring-2 ring-[#3F72AF]/20'
                          : 'bg-white border border-[#DBE2EF] hover:border-[#3F72AF]/60 shadow-xs'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-[#3F72AF] text-white shadow-sm'
                                  : 'bg-[#E8F1FD] text-[#3F72AF]'
                              }`}
                            >
                              {getVehicleIcon(pkg.vehicleCategory || pkg.type)}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-[#0B2447] leading-snug">
                                {pkg.name}
                              </h4>
                              <span className="text-[11px] text-[#64748B] font-medium">
                                {pkg.isPerLesson ? 'Pay-Per-Lesson' : `${pkg.lessons} Standard Lessons`}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#3F72AF] text-white shadow-xs'
                                : 'border border-[#DBE2EF]'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Price Tag */}
                        <div className="pt-2 flex items-baseline justify-between border-t border-[#DBE2EF]">
                          <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">
                            Rate / Price
                          </span>
                          <span className="text-base font-black text-[#3F72AF] font-mono">
                            LKR {Number(pkg.price).toLocaleString()}
                            {pkg.isPerLesson && (
                              <span className="text-xs text-[#64748B] font-normal"> / lesson</span>
                            )}
                          </span>
                        </div>

                        {/* Bonus Callout */}
                        {pkg.bonusText && (
                          <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 mt-1">
                            <Gift className="w-4 h-4 flex-shrink-0 text-emerald-600" />
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
                <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#DBE2EF] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <span className="text-xs font-bold text-[#0B2447]">
                      Initial Practice Lessons to Register
                    </span>
                    <p className="text-[11px] text-[#64748B]">
                      Flexible: you can top up more trial lessons anytime.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLessonQty(Math.max(1, lessonQty - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-[#DBE2EF] text-[#112D4E] flex items-center justify-center hover:bg-[#DBE2EF] font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono font-black text-base text-[#3F72AF]">
                      {lessonQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLessonQty(lessonQty + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-[#DBE2EF] text-[#112D4E] flex items-center justify-center hover:bg-[#DBE2EF] font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-[#0B2447] font-mono ml-2">
                      = LKR {(Number(activeSelectedPackage.price) * lessonQty).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Selected Package Confirmation Box */}
              {activeSelectedPackage && (
                <div className="p-4 rounded-2xl bg-[#E8F1FD] border border-[#DBE2EF] space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-info text-[10px] font-black uppercase">
                        Selected Package
                      </span>
                      <span className="text-xs font-bold text-[#0B2447]">
                        {activeSelectedPackage.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#64748B] font-semibold mr-1.5">Package Total:</span>
                      <span className="text-sm font-black text-[#3F72AF] font-mono">
                        LKR{' '}
                        {activeSelectedPackage.isPerLesson
                          ? (Number(activeSelectedPackage.price) * lessonQty).toLocaleString()
                          : Number(activeSelectedPackage.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#4B6584] leading-normal flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#3F72AF] flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Advance Payment Notice:</strong> Today you only pay the fixed advance deposit of <strong>LKR 5,000</strong> to submit your application for officer verification. Package balance is paid after your account is approved.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Executive Fixed Advance Payment Milestone Card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#F8FAFD] via-white to-[#F0F5FF] border-2 border-[#DBE2EF] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F1FD] border border-[#DBE2EF] flex items-center justify-center text-[#3F72AF] shadow-xs shrink-0">
                  <CreditCard className="w-6 h-6 text-[#3F72AF]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                      Step 3 Milestone
                    </span>
                    <span className="text-xs font-bold text-[#3F72AF]">Mandatory Deposit</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-[#0B2447] mt-0.5">
                    Fixed Advance Payment of <span className="text-[#3F72AF]">LKR 5,000</span>
                  </h4>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[11px] font-semibold text-[#64748B] block uppercase tracking-wider">Amount Due Today</span>
                <span className="text-xl sm:text-2xl font-black text-[#0B2447] font-mono">
                  LKR 5,000
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#4B6584] leading-relaxed">
              Submitting this registration form reserves your official learner seat in <strong className="text-[#0B2447] font-bold">Pending Payment</strong> status. On the next screen, you can choose any of the 3 official payment methods below to activate your account:
            </p>

            {/* 3 Payment Methods Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-white border border-[#DBE2EF] flex items-center gap-2.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#E8F1FD] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#3F72AF]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0B2447] truncate">Bank Deposit Slip</p>
                  <p className="text-[10px] text-[#64748B] truncate">Upload receipt photo</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#DBE2EF] flex items-center gap-2.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0B2447] truncate">Online Gateway</p>
                  <p className="text-[10px] text-[#64748B] truncate">Visa / Master card</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#DBE2EF] flex items-center gap-2.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0B2447] truncate">Branch Cash</p>
                  <p className="text-[10px] text-[#64748B] truncate">Pay at training ground</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit CTA Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || (calculatedAge !== null && calculatedAge < 18)}
              className="btn-primary w-full py-4 rounded-2xl font-black text-sm sm:text-base text-white shadow-md hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-white font-black">Saving Registration...</span>
                </>
              ) : (
                <>
                  <span className="text-white font-black tracking-wide">
                    Proceed to Advance Payment (LKR 5,000)
                  </span>
                  <ArrowRight className="w-4 h-4 text-white shrink-0" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info link */}
        <div className="mt-6 pt-6 border-t border-[#DBE2EF] text-center text-xs text-[#4B6584]">
          Already registered and paid?{' '}
          <Link to="/login" className="text-[#3F72AF] font-bold hover:underline hover:text-[#0B2447] transition-colors">
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
