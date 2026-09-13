import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  UserPlus,
  Car,
  Bike,
  Bus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Building2,
  Sparkles,
  ShieldAlert,
  CreditCard,
  FileCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPkg = searchParams.get('pkg');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittedType2, setSubmittedType2] = useState(null);
  const [dbPackages, setDbPackages] = useState([]);

  // Fetch dynamic packages maintained by Data Entry Officer (US-13, US-14)
  useEffect(() => {
    const fetchPkgs = async () => {
      try {
        const res = await api.get('/packages');
        if (res.data?.success && res.data?.packages) {
          setDbPackages(res.data.packages);
        }
      } catch (e) {
        console.warn('Could not fetch dynamic packages:', e);
      }
    };
    fetchPkgs();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    studentType: 'Type1_NewLearner',
    branch: 'Maharagama',
    packageType: initialPkg || 'Car_Individual',
    customLessonsCount: 1,
    lightVehicleLicenseDate: '',
    name: '',
    email: '',
    phone: '',
    nic: '',
    advanceAmount: 5000,
    password: '',
    confirmPassword: '',
  });

  const [packageCategoryTab, setPackageCategoryTab] = useState(
    ['Car_Full', 'Car_Refresher', 'HeavyVehicle_Bus'].includes(initialPkg)
      ? 'comprehensive'
      : 'individual'
  );

  const individualPackagesList = [
    {
      id: 'Car_Individual',
      name: 'Car (Auto/Manual) — Individual Package',
      category: 'Light Vehicle',
      rate: 3000,
      price: 'Rs. 3,000 / hr',
      lessons: 'One lesson per hour',
      bonus: 'Automatic & Manual Options',
      desc: 'Car(Auto/Manual) one lesson per hour - Rs.3000.00. 1-on-1 practical driving session with certified coach.',
      icon: Car,
    },
    {
      id: 'Bike_Individual',
      name: 'Bike — Individual Package',
      category: 'Light Vehicle',
      rate: 1500,
      price: 'Rs. 1,500 / hr',
      lessons: 'One lesson per hour',
      bonus: 'Balance & Figure-8 Training',
      desc: 'Bike one lesson per hour - Rs.1500.00. Obstacle and Figure-8 test track coaching.',
      icon: Bike,
    },
    {
      id: 'HeavyVehicle_Individual',
      name: 'Heavy Vehicle — Individual Package',
      category: 'Heavy Vehicle',
      rate: 3500,
      price: 'Rs. 3,500 / hr',
      lessons: 'One lesson per hour',
      bonus: 'Strict Requirement: 2+ Years Light License',
      desc: 'Heavy Vehicle one lesson per hour - Rs.3500. Commercial bus coaching & air brake mechanics.',
      icon: Bus,
    },
    {
      id: 'ThreeWheeler_Individual',
      name: 'Three Wheel — Individual Package',
      category: 'Light Vehicle',
      rate: 2000,
      price: 'Rs. 2,000 / hr',
      lessons: 'One lesson per hour',
      bonus: 'Maneuvering & Bay Parking',
      desc: 'Three Wheel one lesson per hour - Rs.2000.00. Handlebar control & reverse trial maneuvers.',
      icon: Car,
    },
  ];

  const comprehensivePackagesList = [
    {
      id: 'Car_Full',
      name: 'Car — Full License Package',
      category: 'Light Vehicle',
      lessons: '15 Lessons (30 min each)',
      price: 'Rs. 45,000',
      bonus: '🎁 Includes 2 FREE Bike + 2 FREE Three-Wheeler Lessons',
      desc: 'Complete training from basic controls to DMT trial examination readiness.',
      icon: Car,
    },
    {
      id: 'Car_Refresher',
      name: 'Car — Refresher Package',
      category: 'Light Vehicle',
      lessons: '6 Lessons (30 min each)',
      price: 'Rs. 15,000',
      bonus: 'For existing license holders needing road confidence',
      desc: 'Tailored for students who already hold a driving license and want to refresh skills.',
      icon: Car,
    },
    {
      id: 'HeavyVehicle_Bus',
      name: 'Heavy Vehicle (Bus) Package',
      category: 'Heavy Vehicle',
      lessons: '15 Lessons (30 min each)',
      price: 'Rs. 65,000',
      bonus: 'Strict Requirement: Must have held Light Vehicle license for 2+ years',
      desc: 'Comprehensive heavy vehicle commercial driver training and DMT trial coaching.',
      icon: Bus,
    },
  ];

  const getHourlyRate = (pkgId) => {
    switch (pkgId) {
      case 'Car_Individual':
        return 3000;
      case 'Bike_Individual':
      case 'Bike':
        return 1500;
      case 'HeavyVehicle_Individual':
        return 3500;
      case 'ThreeWheeler_Individual':
      case 'ThreeWheeler':
        return 2000;
      default:
        return 0;
    }
  };

  const isIndividualPackage = [
    'Car_Individual',
    'Bike_Individual',
    'Bike',
    'ThreeWheeler_Individual',
    'ThreeWheeler',
    'HeavyVehicle_Individual',
  ].includes(formData.packageType);

  const handleNext = () => {
    if (
      step === 3 &&
      (formData.packageType === 'HeavyVehicle_Bus' ||
        formData.packageType === 'HeavyVehicle_Individual')
    ) {
      if (!formData.lightVehicleLicenseDate) {
        toast.error('Please specify your Light Vehicle license issued date');
        return;
      }
      const issued = new Date(formData.lightVehicleLicenseDate);
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      if (issued > twoYearsAgo) {
        toast.error(
          'DMT Rule: You must have held a light vehicle license for at least 2 years before enrolling for heavy vehicle!'
        );
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      toast.error('Password must contain at least one uppercase letter (A-Z)');
      return;
    }
    if (!/[a-z]/.test(formData.password)) {
      toast.error('Password must contain at least one lowercase letter (a-z)');
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      toast.error('Password must contain at least one numeric digit (0-9)');
      return;
    }

    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      nic: formData.nic,
      branch: formData.branch,
      studentType: formData.studentType,
      packageType: formData.packageType,
      customLessonsCount: formData.customLessonsCount,
      lightVehicleLicenseDate: formData.lightVehicleLicenseDate || null,
      advanceAmount: formData.advanceAmount || 5000,
      advanceReference: `ADV-${Date.now().toString().slice(-6)}`,
    };


    const res = await register(payload);
    setLoading(false);

    if (res && res.success) {
      const pendingData = {
        studentName: formData.name,
        studentId: res.student?._id || null,
        userId: res.user?.id || null,
        branch: formData.branch,
        nic: formData.nic,
        email: formData.email,
        advanceAmount: payload.advanceAmount || 5000,
        registrationReference: payload.advanceReference,
      };

      try {
        sessionStorage.setItem('sithma_pending_registration', JSON.stringify(pendingData));
      } catch (e) {}

      // Category 2 (Type 2: Trial-Ready) redirects directly to student dashboard
      navigate('/student/dashboard');
    }
  };

  if (submittedType2) {
    return (
      <div className="py-12 px-4 sm:px-6 max-w-2xl mx-auto w-full text-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-amber-400/30 shadow-[0_20px_60px_rgba(245,158,11,0.2)] space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <span className="badge badge-warning text-xs font-bold uppercase tracking-wider mb-2">
              Registration Submitted • Pending Verification
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Advance Payment Awaiting Officer Approval
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Thank you, <strong className="text-white">{submittedType2.name}</strong>. Your Type 2 (Trial-Ready) registration and advance payment slip of <strong className="text-amber-300">Rs. {submittedType2.amount.toLocaleString()}</strong> have been queued.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-2.5 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">NIC Number:</span>
              <span className="font-semibold text-white">{submittedType2.nic || 'Provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Branch:</span>
              <span className="font-semibold text-white">{submittedType2.branch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Transaction Reference:</span>
              <span className="font-semibold text-accent">{submittedType2.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Account Status:</span>
              <span className="text-amber-400 font-bold">Pending Officer Verification (Login Blocked)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed text-left">
            ℹ️ <strong>What happens next?</strong> Our branch Data Entry Officer will verify your deposit slip. As soon as verified, your account will be activated, granting you portal access to select your course package and start booking lessons.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/login" className="btn-primary py-3 px-6 text-xs font-bold">
              Go to Sign In Portal
            </Link>
            <Link to="/" className="btn-secondary py-3 px-6 text-xs font-bold">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary via-blue-600 to-accent text-white shadow-[0_0_25px_rgba(11,95,165,0.7)] border border-white/30">
          <UserPlus className="w-6 h-6 drop-shadow" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading drop-shadow">
          Student Registration
        </h1>
        <p className="text-xs text-slate-400">
          Join Sithma Driving School across Maharagama, Werahara, or Delgoda
        </p>
      </div>

      {/* Step Progress Indicators */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[
          { num: 1, label: 'Student Type' },
          { num: 2, label: 'Branch' },
          { num: 3, label: 'Course Package' },
          { num: 4, label: 'Account Details' },
        ].map((s) => (
          <div
            key={s.num}
            className={`text-center pb-2 border-b-2 transition-colors ${
              step >= s.num
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-white/10 text-slate-500 font-medium'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider">Step {s.num}</span>
            <p className="text-xs hidden sm:block mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <div className="card shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-6 sm:p-8">
        {/* STEP 1: Student Category */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Step 1: Choose Your Student Category</h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your current progress with the Department of Motor Traffic (DMT).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type 1 Card */}
              <div
                onClick={() => setFormData({ ...formData, studentType: 'Type1_NewLearner' })}
                className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                  formData.studentType === 'Type1_NewLearner'
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                    : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="badge badge-info">Category 1</span>
                  {formData.studentType === 'Type1_NewLearner' && (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <h3 className="text-base font-bold text-white mb-2">Type 1 - New Learner Student</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  You have <strong>not yet registered with the DMT</strong>. Sithma Driving School will assist you with medical appointments, learner license registration, and exam milestones.
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 text-left">
                  <li>DMT Medical exam assistance</li>
                  <li>Learner written exam tracking</li>
                  <li>Full practical driving lessons</li>
                </ul>
              </div>

              {/* Type 2 Card */}
              <div
                onClick={() => setFormData({ ...formData, studentType: 'Type2_TrialReady' })}
                className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                  formData.studentType === 'Type2_TrialReady'
                    ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                    : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="badge badge-warning">Category 2</span>
                  {formData.studentType === 'Type2_TrialReady' && (
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <h3 className="text-base font-bold text-white mb-2">Type 2 - Trial-Ready Student</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  You have <strong>already passed your DMT Medical & Learner's Exam</strong> independently and are joining specifically for practical Trial preparation.
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 text-left">
                  <li>Direct practical Trial slot booking</li>
                  <li>Track 1.5-year Trial exam deadline</li>
                  <li>Up to 3 Trial attempt tracking</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button type="button" onClick={handleNext} className="btn-primary">
                Continue to Branch Selection <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Branch Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Step 2: Choose Your Training Branch</h2>
              <p className="text-xs text-slate-400 mt-1">
                Select the branch where you will attend driving lessons and practical trials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: 'Maharagama', addr: 'High Level Road, Maharagama', instructors: '2 Assigned Instructors' },
                { name: 'Werahara', addr: 'DMT Main Hub, Werahara', instructors: '2 Assigned Instructors' },
                { name: 'Delgoda', addr: 'Main Town Road, Delgoda', instructors: '2 Assigned Instructors' },
              ].map((b) => (
                <div
                  key={b.name}
                  onClick={() => setFormData({ ...formData, branch: b.name })}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    formData.branch === b.name
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                      : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-300'
                  }`}
                >
                  <Building2 className="w-6 h-6 text-cyan-400 mb-2" />
                  <h3 className="text-base font-bold text-white">{b.name} Branch</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-3">{b.addr}</p>
                  <span className="text-[11px] font-semibold text-cyan-300">{b.instructors}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-white/10">
              <button type="button" onClick={handlePrev} className="btn-secondary">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="button" onClick={handleNext} className="btn-primary">
                Continue to Package Selection <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Course Package Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Step 3: Choose Your Course Package</h2>
              <p className="text-xs text-slate-400 mt-1">
                Select an individual hourly package or an all-inclusive comprehensive course package.
              </p>
            </div>

            {/* Package Category Switcher */}
            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 w-fit">
              <button
                type="button"
                onClick={() => {
                  setPackageCategoryTab('individual');
                  if (!isIndividualPackage) {
                    setFormData({ ...formData, packageType: 'Car_Individual' });
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  packageCategoryTab === 'individual'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Individual Packages (Hourly)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPackageCategoryTab('comprehensive');
                  if (isIndividualPackage) {
                    setFormData({ ...formData, packageType: 'Car_Full' });
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  packageCategoryTab === 'comprehensive'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Full Course Packages
              </button>
            </div>

            {/* Packages List */}
            <div className="space-y-3">
              {(packageCategoryTab === 'individual'
                ? individualPackagesList
                : comprehensivePackagesList
              ).map((pkg) => {
                const Icon = pkg.icon;
                const isSelected = formData.packageType === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setFormData({ ...formData, packageType: pkg.id })}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                        : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{pkg.name}</h3>
                          <span className="badge badge-info text-[10px] py-0 px-2">{pkg.category}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{pkg.desc}</p>
                        <p className="text-xs font-semibold text-amber-300 mt-1">{pkg.bonus}</p>
                      </div>
                    </div>

                    <div className="text-right sm:flex-shrink-0">
                      <div className="text-base font-black text-accent">{pkg.price}</div>
                      <div className="text-xs text-slate-400">{pkg.lessons}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Heavy Vehicle Regulatory Prerequisite */}
            {(formData.packageType === 'HeavyVehicle_Bus' ||
              formData.packageType === 'HeavyVehicle_Individual') && (
              <div className="p-4 bg-amber-500/10 border border-amber-400/20 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Heavy Vehicle Regulatory Prerequisite
                </div>
                <p className="text-slate-300">
                  Department of Motor Traffic regulations require holding a Light Vehicle driving license for at least <strong>2 years</strong> before enrolling for a Heavy Vehicle license or lesson.
                </p>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Light Vehicle License Issued Date:
                  </label>
                  <input
                    type="date"
                    value={formData.lightVehicleLicenseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, lightVehicleLicenseDate: e.target.value })
                    }
                    className="px-3.5 py-2 border border-white/15 rounded-xl text-xs bg-slate-900/90 text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* Flexible quantity for Individual Packages */}
            {isIndividualPackage && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Number of Practical Hours to book:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Rate: Rs. {getHourlyRate(formData.packageType).toLocaleString()} / hour
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 4, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormData({ ...formData, customLessonsCount: num })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                          formData.customLessonsCount === num
                            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {num}h
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.customLessonsCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customLessonsCount: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-16 px-2 py-1.5 border border-white/15 bg-slate-900/90 text-white rounded-xl text-sm text-center font-bold"
                  />
                  <span className="text-xs text-accent font-bold whitespace-nowrap pl-1">
                    = Rs.{' '}
                    {(
                      formData.customLessonsCount * getHourlyRate(formData.packageType)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-white/10">
              <button type="button" onClick={handlePrev} className="btn-secondary">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="button" onClick={handleNext} className="btn-primary">
                Continue to Personal Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Personal & Account Details */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Step 4: Personal & Account Details</h2>
              <p className="text-xs text-slate-400 mt-1">
                Create your student login credentials.
              </p>
            </div>

            {/* Summary Pill */}
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-300">
                <strong className="text-white">Selected:</strong> {formData.branch} Branch •{' '}
                {formData.studentType === 'Type1_NewLearner' ? 'Type 1 (New Learner)' : 'Type 2 (Trial Ready)'}
              </span>
              <span className="font-bold text-accent">
                Package: {formData.packageType.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Perera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950/80 text-white rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  National Identity Card (NIC) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 200012345678 or 981234567V"
                  value={formData.nic}
                  onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950/80 text-white rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Phone (WhatsApp) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0771234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950/80 text-white rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. student@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950/80 text-white rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950/80 text-white rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-950/80 text-white rounded-xl text-sm outline-none"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 -mt-2">
              Password must be at least <span className="text-cyan-300 font-semibold">8 characters</span> and include an <span className="text-cyan-300 font-semibold">uppercase letter</span> (A-Z), <span className="text-cyan-300 font-semibold">lowercase letter</span> (a-z), and a <span className="text-cyan-300 font-semibold">number</span> (0-9).
            </p>

            {/* Type 2 Immediate Advance Payment Section (Exact Business Rule Flow) */}
            {formData.studentType === 'Type2_TrialReady' && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Mandatory Advance Payment (Type 2 Trial-Ready)</span>
                  </div>
                  <span className="badge badge-warning text-xs font-bold">Rs. 5,000</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Trial-ready students are required to submit an initial advance deposit of <strong>Rs. 5,000</strong>. Your account will remain in <code className="text-amber-300 bg-amber-950/60 px-1 py-0.5 rounded">pending_verification</code> status until our Data Entry Officer verifies your payment.
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-white/10">
              <button type="button" onClick={handlePrev} className="btn-secondary">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-accent px-6 py-2.5 font-bold shadow-lg"
              >
                {loading ? 'Submitting Registration...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="text-center mt-6 text-xs text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="text-cyan-300 font-bold hover:underline">
          Login to your portal
        </Link>
      </div>
    </div>
  );
}
