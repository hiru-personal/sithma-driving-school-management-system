import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentType: 'Type1_NewLearner',
    branch: 'Maharagama',
    packageType: 'Car_Full',
    customLessonsCount: 5,
    lightVehicleLicenseDate: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const packages = [
    {
      id: 'Car_Full',
      name: 'Car — Full License Package',
      category: 'Light Vehicle',
      lessons: '15 Lessons (30 min each)',
      price: 'Rs. 45,000',
      bonus: '🎁 Includes 2 FREE Bike + 2 FREE Three-Wheeler Lessons',
      desc: 'Complete training from basic controls to DMT trial examination readiness.',
      icon: Car,
      color: 'border-primary',
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
      color: 'border-blue-400',
    },
    {
      id: 'Bike',
      name: 'Motorbike (Standalone)',
      category: 'Light Vehicle',
      lessons: 'Flexible quantity',
      price: 'Rs. 850 / lesson',
      bonus: 'Pay as you learn',
      desc: 'Individual motorcycle practice and trial obstacle navigation.',
      icon: Bike,
      color: 'border-amber-400',
    },
    {
      id: 'ThreeWheeler',
      name: 'Three-Wheeler (Standalone)',
      category: 'Light Vehicle',
      lessons: 'Flexible quantity',
      price: 'Rs. 1,000 / lesson',
      bonus: 'Pay as you learn',
      desc: 'Hands-on three-wheeler driving and reverse maneuvering practice.',
      icon: Car,
      color: 'border-emerald-400',
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
      color: 'border-purple-500',
    },
  ];

  const handleNext = () => {
    if (step === 3 && formData.packageType === 'HeavyVehicle_Bus') {
      if (!formData.lightVehicleLicenseDate) {
        toast.error('Please enter the date you obtained your Light Vehicle driving license.');
        return;
      }
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      if (new Date(formData.lightVehicleLicenseDate) > twoYearsAgo) {
        toast.error(
          'Eligibility requirement not met: You must hold a Light Vehicle license for at least 2 full years to enroll for Heavy Vehicle (Bus).'
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

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      branch: formData.branch,
      studentType: formData.studentType,
      packageType: formData.packageType,
      customLessonsCount: formData.customLessonsCount,
      lightVehicleLicenseDate: formData.lightVehicleLicenseDate || null,
    });
    setLoading(false);

    if (result.success) {
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-neutralBg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white mb-3 shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textMain font-heading">
            Student Registration
          </h1>
          <p className="text-sm text-textMuted mt-1">
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
                  ? 'border-primary text-primary font-bold'
                  : 'border-slate-200 text-textMuted font-medium'
              }`}
            >
              <span className="text-xs uppercase tracking-wider">Step {s.num}</span>
              <p className="text-xs hidden sm:block">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="card shadow-modal p-6 sm:p-8">
          {/* STEP 1: Student Category */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-textMain">Step 1: Choose Your Student Category</h2>
                <p className="text-xs text-textMuted mt-1">
                  Select your current progress with the Department of Motor Traffic (DMT).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type 1 Card */}
                <div
                  onClick={() => setFormData({ ...formData, studentType: 'Type1_NewLearner' })}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.studentType === 'Type1_NewLearner'
                      ? 'border-primary bg-primary-light/40 shadow-cardHover ring-2 ring-primary/20'
                      : 'border-borderColor hover:border-primary/40 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge badge-info">Category 1</span>
                    {formData.studentType === 'Type1_NewLearner' && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-textMain mb-2">Type 1 — New Learner Student</h3>
                  <p className="text-xs text-textMuted leading-relaxed mb-4">
                    You have <strong>not yet registered with the DMT</strong>. Sithma Driving School will assist you with medical appointments, learner license registration, and exam milestones.
                  </p>
                  <ul className="text-xs text-textMain space-y-1.5 list-disc pl-4 text-left">
                    <li>DMT Medical exam assistance</li>
                    <li>Learner written exam tracking</li>
                    <li>Full practical driving lessons</li>
                  </ul>
                </div>

                {/* Type 2 Card */}
                <div
                  onClick={() => setFormData({ ...formData, studentType: 'Type2_TrialReady' })}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.studentType === 'Type2_TrialReady'
                      ? 'border-accent bg-accent-light/50 shadow-cardHover ring-2 ring-accent/30'
                      : 'border-borderColor hover:border-accent/40 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge badge-warning">Category 2</span>
                    {formData.studentType === 'Type2_TrialReady' && (
                      <CheckCircle2 className="w-5 h-5 text-accent-dark" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-textMain mb-2">Type 2 — Trial-Ready Student</h3>
                  <p className="text-xs text-textMuted leading-relaxed mb-4">
                    You have <strong>already passed your DMT Medical & Learner's Exam</strong> independently and are joining specifically for practical Trial preparation.
                  </p>
                  <ul className="text-xs text-textMain space-y-1.5 list-disc pl-4 text-left">
                    <li>Direct practical Trial slot booking</li>
                    <li>Track 1.5-year Trial exam deadline</li>
                    <li>Up to 3 Trial attempt tracking</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-4">
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
                <h2 className="text-xl font-bold text-textMain">Step 2: Choose Your Training Branch</h2>
                <p className="text-xs text-textMuted mt-1">
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
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.branch === b.name
                        ? 'border-primary bg-primary-light/40 shadow-cardHover ring-2 ring-primary/20'
                        : 'border-borderColor hover:border-primary/40 bg-white'
                    }`}
                  >
                    <Building2 className="w-6 h-6 text-primary mb-2" />
                    <h3 className="text-base font-bold text-textMain">{b.name} Branch</h3>
                    <p className="text-xs text-textMuted mt-1 mb-3">{b.addr}</p>
                    <span className="text-[11px] font-semibold text-primary">{b.instructors}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button type="button" onClick={handlePrev} className="btn-secondary">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={handleNext} className="btn-primary">
                  Continue to Package Selection <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Course Package & Pricing Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-textMain">Step 3: Choose Your Course Package</h2>
                <p className="text-xs text-textMuted mt-1">
                  Official pricing catalog of Sithma Driving School.
                </p>
              </div>

              <div className="space-y-3">
                {packages.map((pkg) => {
                  const Icon = pkg.icon;
                  const isSelected = formData.packageType === pkg.id;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setFormData({ ...formData, packageType: pkg.id })}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-primary bg-primary-light/30 shadow-card ring-1 ring-primary'
                          : 'border-borderColor hover:border-primary/40 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-textMain">{pkg.name}</h3>
                            <span className="badge badge-info text-[10px] py-0 px-2">{pkg.category}</span>
                          </div>
                          <p className="text-xs text-textMuted mt-0.5">{pkg.desc}</p>
                          <p className="text-xs font-semibold text-accent-dark mt-1">{pkg.bonus}</p>
                        </div>
                      </div>

                      <div className="text-right sm:flex-shrink-0">
                        <div className="text-base font-extrabold text-primary">{pkg.price}</div>
                        <div className="text-xs text-textMuted">{pkg.lessons}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Heavy Vehicle License Date Verification */}
              {formData.packageType === 'HeavyVehicle_Bus' && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-accent-dark" />
                    Heavy Vehicle (Bus) Regulatory Prerequisite
                  </div>
                  <p className="text-xs text-amber-800">
                    Department of Motor Traffic regulations require holding a Light Vehicle driving license for at least <strong>2 years</strong> before enrolling for a Heavy Vehicle license.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-amber-900 mb-1">
                      Light Vehicle License Issued Date:
                    </label>
                    <input
                      type="date"
                      value={formData.lightVehicleLicenseDate}
                      onChange={(e) =>
                        setFormData({ ...formData, lightVehicleLicenseDate: e.target.value })
                      }
                      className="px-3 py-2 border border-amber-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Flexible quantity for Bike and Three-Wheeler */}
              {(formData.packageType === 'Bike' || formData.packageType === 'ThreeWheeler') && (
                <div className="p-4 bg-slate-50 border border-borderColor rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-textMain">Number of Lessons to book:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.customLessonsCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customLessonsCount: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="w-20 px-3 py-1.5 border border-borderColor rounded-lg text-sm text-center font-bold"
                    />
                    <span className="text-xs text-textMuted">
                      = Rs.{' '}
                      {(
                        formData.customLessonsCount *
                        (formData.packageType === 'Bike' ? 850 : 1000)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
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
                <h2 className="text-xl font-bold text-textMain">Step 4: Personal & Account Details</h2>
                <p className="text-xs text-textMuted mt-1">
                  Create your student login credentials.
                </p>
              </div>

              {/* Summary Pill */}
              <div className="p-3 bg-neutralBg rounded-lg border border-borderColor text-xs flex flex-wrap items-center justify-between gap-2">
                <span>
                  <strong>Selected:</strong> {formData.branch} Branch •{' '}
                  {formData.studentType === 'Type1_NewLearner' ? 'Type 1 (New Learner)' : 'Type 2 (Trial Ready)'}
                </span>
                <span className="font-bold text-primary">
                  Package: {formData.packageType.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun Perera"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-borderColor rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">
                    Contact Phone (WhatsApp) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0771234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-borderColor rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-textMain mb-1">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-borderColor rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">
                    Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-borderColor rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-borderColor rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button type="button" onClick={handlePrev} className="btn-secondary">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-accent px-6 py-2.5 text-textMain font-bold"
                >
                  {loading ? 'Submitting Registration...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center mt-6 text-xs text-textMuted">
          Already registered?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Login to your portal
          </Link>
        </div>
      </div>
    </div>
  );
}
