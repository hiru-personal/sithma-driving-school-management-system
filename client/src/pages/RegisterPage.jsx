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

  const rawType = searchParams.get('type') || '';
  const initialStudentType = rawType.toLowerCase().includes('2') ? 'Type 2' : 'Type 1';

  const [studentType, setStudentType] = useState(initialStudentType);
  const [typeModalOpen, setTypeModalOpen] = useState(!rawType);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const currentType = searchParams.get('type');
    if (currentType) {
      setStudentType(currentType.toLowerCase().includes('2') ? 'Type 2' : 'Type 1');
      setTypeModalOpen(false);
    } else {
      setTypeModalOpen(true);
    }
  }, [searchParams]);

  const [availablePackages, setAvailablePackages] = useState([]);
  const [selectedTier, setSelectedTier] = useState('C');
  const [selectedPackageType, setSelectedPackageType] = useState('Car_Full');
  const [lessonQty, setLessonQty] = useState(1);

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

  const [activeBranches, setActiveBranches] = useState([]);

  useEffect(() => {
    const fetchActiveBranches = async () => {
      try {
        const res = await api.get('/branches/active');
        if (res.data?.success && Array.isArray(res.data.branches) && res.data.branches.length > 0) {
          setActiveBranches(res.data.branches);
          setFormData((prev) => {
            const hasCurrent = res.data.branches.some((b) => b.name === prev.branch);
            return hasCurrent ? prev : { ...prev, branch: res.data.branches[0].name };
          });
        }
      } catch (err) {
        console.warn('Could not load branches in register page:', err);
      }
    };
    fetchActiveBranches();
  }, []);

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

  const passwordErrors = useMemo(() => {
    const p = formData.password;
    if (!p) return [];
    const errors = [];
    if (p.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(p)) errors.push('At least one uppercase letter (A-Z)');
    if (!/[a-z]/.test(p)) errors.push('At least one lowercase letter (a-z)');
    if (!/[0-9]/.test(p)) errors.push('At least one numeric digit (0-9)');
    return errors;
  }, [formData.password]);

  const passwordsMatch = formData.confirmPassword
    ? formData.password === formData.confirmPassword
    : true;

  useEffect(() => {
    api.get('/packages').then((res) => {
      if (res.data?.success && res.data?.packages) {
        setAvailablePackages(res.data.packages);
      }
    }).catch((err) => {
      console.warn('Using catalog fallbacks for packages:', err);
    });
  }, []);

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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-xs font-bold text-[#1B3D59] mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" />
          <span>Step 2 of 3: Student Registration Form</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-[#152026] tracking-tight">
          Create Your Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#6A97C0] mt-2 max-w-xl mx-auto">
          Please fill in your legal details. Once registered, you will proceed directly to Step 3 to complete the mandatory advance payment.
        </p>
      </div>

      {/* Prominent Read-Only Student Type Badge */}
      <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-white border border-[#D4EEF8] shadow-sm relative overflow-hidden transition-all duration-300">
        {isType1 ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-[#1B3D59] pl-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] flex items-center justify-center font-black flex-shrink-0 shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm sm:text-base font-black text-[#152026]">Category: Type 1 Student</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59]">
                    Full Course Learner
                  </span>
                </div>
                <p className="text-xs text-[#152026]/75 mt-0.5">
                  Complete program: DMT medical, written exam preparation, practical training & trial exam.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTypeModalOpen(true)}
              className="text-xs text-[#1B3D59] hover:underline font-bold cursor-pointer self-end sm:self-center transition-colors"
            >
              Change Category
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-[#1B3D59] pl-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#F3EED8] border border-[#6A97C0]/30 text-[#152026] flex items-center justify-center font-black flex-shrink-0 shadow-xs">
                <Award className="w-6 h-6 text-[#1B3D59]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm sm:text-base font-black text-[#152026]">Category: Type 2 Student</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/30">
                    Trial Only Learner
                  </span>
                </div>
                <p className="text-xs text-[#152026]/75 mt-0.5">
                  Already DMT-cleared elsewhere. Directly book practical trial sessions upon payment verification.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTypeModalOpen(true)}
              className="text-xs text-[#1B3D59] hover:underline font-bold cursor-pointer self-end sm:self-center transition-colors"
            >
              Change Category
            </button>
          </div>
        )}
      </div>

      {/* Main Registration Form Card */}
      <div className="bg-white border border-[#D4EEF8] rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#152026] mb-2">
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
                className="w-full bg-[#FAFCFE] border border-[#D4EEF8] rounded-xl px-4 py-3 text-sm text-[#152026] font-medium placeholder-[#6A97C0] focus:outline-none focus:border-[#1B3D59] focus:ring-2 focus:ring-[#B3D5F1] transition-all"
              />
            </div>
            <p className="text-[11px] text-[#6A97C0] mt-1.5">
              Enter name exactly as printed on your National Identity Card (NIC) or Passport.
            </p>
          </div>

          {/* Date of Birth & Live Calculated Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#152026] mb-2">
                Date of Birth <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-[#6A97C0] absolute left-3.5 pointer-events-none" />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full bg-[#FAFCFE] border border-[#D4EEF8] rounded-xl pl-10 pr-3.5 py-3 text-sm text-[#152026] font-bold placeholder-[#6A97C0] focus:outline-none focus:border-[#1B3D59] focus:ring-2 focus:ring-[#B3D5F1] transition-all cursor-pointer shadow-xs"
                />
              </div>
            </div>

            {/* Live Visual Age Display */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#152026] mb-2">
                Calculated Age (DMT 18+ Rule)
              </label>
              <div
                className={`min-h-[46px] py-2 rounded-xl flex items-center px-4 transition-all duration-300 border ${calculatedAge === null
                    ? 'bg-[#FAFCFE] border-[#D4EEF8] text-[#6A97C0]'
                    : calculatedAge >= 18
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
              >
                {calculatedAge === null ? (
                  <div className="text-xs text-[#6A97C0] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#6A97C0]" />
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
              <label className="block text-xs font-bold uppercase tracking-wider text-[#152026] mb-2">
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
                  className="w-full bg-[#FAFCFE] border border-[#D4EEF8] rounded-xl px-4 py-3 text-sm text-[#152026] font-medium placeholder-[#6A97C0] focus:outline-none focus:border-[#1B3D59] focus:ring-2 focus:ring-[#B3D5F1] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#152026] mb-2">
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
                  className="w-full bg-[#FAFCFE] border border-[#D4EEF8] rounded-xl px-4 py-3 text-sm text-[#152026] font-medium placeholder-[#6A97C0] focus:outline-none focus:border-[#1B3D59] focus:ring-2 focus:ring-[#B3D5F1] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Preferred Branch & NIC Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#152026] mb-2">
                Preferred Branch <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#FAFCFE] border border-[#D4EEF8] rounded-xl px-4 py-3 text-sm text-[#152026] font-bold focus:outline-none focus:border-[#1B3D59] focus:ring-2 focus:ring-[#B3D5F1] transition-all cursor-pointer"
                >
                  {activeBranches.length > 0 ? (
                    activeBranches.map((b) => (
                      <option key={b._id} value={b.name}>
                        {b.name} ({b.code}) - {b.address}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Maharagama">Maharagama (Headquarters & Training Ground)</option>
                      <option value="Werahara">Werahara (DMT Central Exam Hub)</option>
                      <option value="Delgoda">Delgoda (Gampaha District Center)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#152026] mb-2">
                NIC / Passport Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  placeholder="e.g. 200012345678 or 981234567V"
                  className="w-full bg-[#FAFCFE] border border-[#D4EEF8] rounded-xl px-4 py-3 text-sm text-[#152026] font-medium placeholder-[#6A97C0] focus:outline-none focus:border-[#1B3D59] focus:ring-2 focus:ring-[#B3D5F1] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#152026] mb-2">
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
                  className="w-full bg-[#FAFCFE] border border-[#D4EEF8] rounded-xl pl-4 pr-11 py-3 text-sm text-[#152026] font-medium placeholder-[#6A97C0] focus:outline-none focus:border-[#1B3D59] focus:ring-2 focus:ring-[#B3D5F1] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6A97C0] hover:text-[#152026] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#152026] mb-2">
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
                  className={`w-full bg-[#FAFCFE] rounded-xl pl-4 pr-11 py-3 text-sm text-[#152026] font-medium placeholder-[#6A97C0] focus:outline-none transition-all border ${passwordsMatch
                      ? 'border-[#D4EEF8] focus:border-[#1B3D59] focus:ring-2 focus:ring-[#B3D5F1]'
                      : 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6A97C0] hover:text-[#152026] transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Guidance Note */}
          <div className="text-[11px] text-[#6A97C0] flex flex-wrap items-center gap-3">
            <span className="font-bold text-[#152026]">Must contain:</span>
            <span className={formData.password.length >= 8 ? 'text-emerald-700 font-bold' : 'text-[#6A97C0]'}>
              ✓ 8+ chars
            </span>
            <span className={/[A-Z]/.test(formData.password) ? 'text-emerald-700 font-bold' : 'text-[#6A97C0]'}>
              ✓ Uppercase (A-Z)
            </span>
            <span className={/[a-z]/.test(formData.password) ? 'text-emerald-700 font-bold' : 'text-[#6A97C0]'}>
              ✓ Lowercase (a-z)
            </span>
            <span className={/[0-9]/.test(formData.password) ? 'text-emerald-700 font-bold' : 'text-[#6A97C0]'}>
              ✓ Number (0-9)
            </span>
            {!passwordsMatch && (
              <span className="text-rose-600 font-bold ml-auto">Passwords do not match</span>
            )}
          </div>

          {/* ========================================================================= */}
          {/* TYPE 2 ONLY: VEHICLE TRAINING PACKAGE SELECTION */}
          {/* ========================================================================= */}
          {studentType === 'Type 2' && (
            <div className="pt-6 border-t border-[#D4EEF8] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/30">
                      Mandatory For Type 2
                    </span>
                    <span className="text-xs text-[#6A97C0] font-semibold">Select Vehicle Package</span>
                  </div>
                  <h3 className="text-lg font-black text-[#152026] flex items-center gap-2">
                    <PackageIcon className="w-5 h-5 text-[#1B3D59]" />
                    Select Your Vehicle Training Package
                  </h3>
                  <p className="text-xs text-[#152026]/75 mt-0.5">
                    As a Trial-Ready student, choose your full course trial package or pay-per-lesson plan.
                  </p>
                </div>
              </div>

              {/* Category Tier Selector: C (Full Course), A (Individual), B (Standard) */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8]">
                <button
                  type="button"
                  onClick={() => handleTierChange('C')}
                  className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${selectedTier === 'C'
                      ? 'bg-[#1B3D59] text-white shadow-sm font-black'
                      : 'text-[#152026] hover:bg-[#D4EEF8]/40'
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
                  className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${selectedTier === 'A'
                      ? 'bg-[#1B3D59] text-white shadow-sm font-black'
                      : 'text-[#152026] hover:bg-[#D4EEF8]/40'
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
                  className={`py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${selectedTier === 'B'
                      ? 'bg-[#1B3D59] text-white shadow-sm font-black'
                      : 'text-[#152026] hover:bg-[#D4EEF8]/40'
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
                      className={`cursor-pointer rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${isSelected
                          ? 'bg-[#FAFCFE] border-2 border-[#1B3D59] shadow-sm'
                          : 'bg-white border border-[#D4EEF8] hover:border-[#6A97C0]'
                        }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isSelected
                                  ? 'bg-[#1B3D59] text-white shadow-sm'
                                  : 'bg-[#D4EEF8] text-[#1B3D59]'
                                }`}
                            >
                              {getVehicleIcon(pkg.vehicleCategory || pkg.type)}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-[#152026] leading-snug">
                                {pkg.name}
                              </h4>
                              <span className="text-[11px] text-[#6A97C0] font-medium">
                                {pkg.isPerLesson ? 'Pay-Per-Lesson' : `${pkg.lessons} Standard Lessons`}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                                ? 'bg-[#1B3D59] text-white shadow-xs'
                                : 'border border-[#D4EEF8]'
                              }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Price Tag */}
                        <div className="pt-2 flex items-baseline justify-between border-t border-[#D4EEF8]">
                          <span className="text-[11px] text-[#6A97C0] font-semibold uppercase tracking-wider">
                            Rate / Price
                          </span>
                          <span className="text-base font-black text-[#1B3D59] font-mono">
                            LKR {Number(pkg.price).toLocaleString()}
                            {pkg.isPerLesson && (
                              <span className="text-xs text-[#6A97C0] font-normal"> / lesson</span>
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
                <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <span className="text-xs font-bold text-[#152026]">
                      Initial Practice Lessons to Register
                    </span>
                    <p className="text-[11px] text-[#6A97C0]">
                      Flexible: you can top up more trial lessons anytime.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLessonQty(Math.max(1, lessonQty - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-[#D4EEF8] text-[#152026] flex items-center justify-center hover:bg-[#D4EEF8] font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono font-black text-base text-[#1B3D59]">
                      {lessonQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLessonQty(lessonQty + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-[#D4EEF8] text-[#152026] flex items-center justify-center hover:bg-[#D4EEF8] font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-[#152026] font-mono ml-2">
                      = LKR {(Number(activeSelectedPackage.price) * lessonQty).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Selected Package Confirmation Box */}
              {activeSelectedPackage && (
                <div className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] text-[10px] font-bold uppercase">
                        Selected Package
                      </span>
                      <span className="text-xs font-bold text-[#152026]">
                        {activeSelectedPackage.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#6A97C0] font-semibold mr-1.5">Package Total:</span>
                      <span className="text-sm font-black text-[#1B3D59] font-mono">
                        LKR{' '}
                        {activeSelectedPackage.isPerLesson
                          ? (Number(activeSelectedPackage.price) * lessonQty).toLocaleString()
                          : Number(activeSelectedPackage.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#152026]/80 leading-normal flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#1B3D59] flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Advance Payment Notice:</strong> Today you only pay the fixed advance deposit of <strong>LKR 5,000</strong> to submit your application for officer verification. Package balance is paid after your account is approved.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Executive Fixed Advance Payment Milestone Card */}
          <div className="rounded-3xl bg-[#FAFCFE] border-2 border-[#D4EEF8] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#D4EEF8] border border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59] shadow-xs shrink-0">
                  <CreditCard className="w-6 h-6 text-[#1B3D59]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/30">
                      Step 3 Milestone
                    </span>
                    <span className="text-xs font-bold text-[#1B3D59]">Mandatory Deposit</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-[#152026] mt-0.5">
                    Fixed Advance Payment of <span className="text-[#1B3D59]">LKR 5,000</span>
                  </h4>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[11px] font-semibold text-[#6A97C0] block uppercase tracking-wider">Amount Due Today</span>
                <span className="text-xl sm:text-2xl font-black text-[#152026] font-mono">
                  LKR 5,000
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#152026]/75 leading-relaxed">
              Submitting this registration form reserves your official learner seat in <strong className="text-[#152026] font-bold">Pending Payment</strong> status. On the next screen, you can choose any of the 3 official payment methods below to activate your account:
            </p>

            {/* 3 Payment Methods Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-white border border-[#D4EEF8] flex items-center gap-2.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#D4EEF8] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#1B3D59]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#152026] truncate">Bank Deposit Slip</p>
                  <p className="text-[10px] text-[#6A97C0] truncate">Upload receipt photo</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#D4EEF8] flex items-center gap-2.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#152026] truncate">Online Gateway</p>
                  <p className="text-[10px] text-[#6A97C0] truncate">Visa / Master card</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#D4EEF8] flex items-center gap-2.5 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#F3EED8] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-[#152026]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#152026] truncate">Branch Cash</p>
                  <p className="text-[10px] text-[#6A97C0] truncate">Pay at training ground</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit CTA Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || (calculatedAge !== null && calculatedAge < 18)}
              className="btn-primary w-full py-4 rounded-2xl font-black text-sm sm:text-base text-white shadow-sm flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="mt-6 pt-6 border-t border-[#D4EEF8] text-center text-xs text-[#6A97C0]">
          Already registered and paid?{' '}
          <Link to="/login" className="text-[#1B3D59] font-bold hover:underline transition-colors">
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
