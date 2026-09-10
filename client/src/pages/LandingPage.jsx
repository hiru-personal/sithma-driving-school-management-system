import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  Bike,
  Bus,
  ShieldCheck,
  Award,
  Calendar,
  CreditCard,
  BookOpen,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Phone,
  Building2,
  Users,
  Check,
  Star,
  Camera,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState('Maharagama');

  const branches = [
    {
      id: 'Maharagama',
      name: 'Maharagama Branch',
      tag: 'Headquarters & Training Ground',
      address: 'No. 248, High Level Road, Maharagama',
      phone: '011 284 9201 / 077 123 4567',
      instructors: '2 Certified Instructors',
      timings: '3 Daily Sessions (07:30, 10:00, 16:30)',
    },
    {
      id: 'Werahara',
      name: 'Werahara Branch',
      tag: 'DMT Central Exam Hub',
      address: 'Opposite DMT Head Office, Werahara, Boralesgamuwa',
      phone: '011 251 8832 / 071 987 6543',
      instructors: '2 Certified Instructors',
      timings: '3 Daily Sessions (08:00, 11:30, 15:00)',
    },
    {
      id: 'Delgoda',
      name: 'Delgoda Branch',
      tag: 'Gampaha District Center',
      address: 'Main Street, Delgoda Junction, Delgoda',
      phone: '033 224 5590 / 075 444 3210',
      instructors: '2 Certified Instructors',
      timings: '3 Daily Sessions (08:30, 13:00, 16:30)',
    },
  ];

  const [pricingTab, setPricingTab] = useState('individual');

  const fleetPhotos = [
    {
      title: 'Dual-Control Car Training',
      category: 'Light Vehicle',
      tag: 'Maharagama & Delgoda Grounds',
      desc: '1-on-1 practical on-road coaching with certified instructors in modern dual-control automatic and manual hatchbacks.',
      src: '/images/hero-driving-school.jpg',
      badge: 'Car Driving',
    },
    {
      title: 'DMT Figure-8 Obstacle Track',
      category: 'Motorcycle Standard',
      tag: 'Werahara Exam Ground',
      desc: 'Official painted Figure-8 test circuit, smooth clutch control, emergency stop drills, and trial balance mastery.',
      src: '/images/motorcycle-figure8-training.jpg',
      badge: 'Motorbike',
    },
    {
      title: 'Three-Wheeler Reverse Bay Practice',
      category: 'Three-Wheeler Class',
      tag: 'Headquarters Ground',
      desc: 'Handlebar coordination, tight radius cornering, and reverse bay parking between precision test cones.',
      src: '/images/threewheeler-reverse-training.jpg',
      badge: 'Three-Wheeler',
    },
    {
      title: 'Commercial Heavy Bus Coaching',
      category: 'Commercial Heavy Class',
      tag: 'Werahara Commercial Ground',
      desc: 'Commercial coach steering, pneumatic air brake pressure management, and blind-spot trial navigation.',
      src: '/images/heavy-vehicle-bus-training.jpg',
      badge: 'Commercial Bus',
    },
  ];

  const packages = [
    {
      name: 'Car Full License Course',
      type: 'Light Vehicle (Dual Purpose)',
      price: 'Rs. 45,000',
      lessons: '15 Practical Road Lessons (30 min)',
      badge: 'Most Popular',
      bonus: '🎁 +2 FREE Motorbike & +2 FREE Three-Wheeler Lessons',
      image: '/images/hero-driving-school.jpg',
      features: [
        'Complete DMT Medical & Learner registration assistance',
        'Theory exam preparation in 3 languages',
        'Reverse maneuvering and hill start coaching',
        'Official trial day vehicle provision & accompaniment',
      ],
      icon: Car,
      color: 'border-cyan-400',
      packageType: 'Car_Full',
    },
    {
      name: 'Car Refresher Course',
      type: 'Light Vehicle',
      price: 'Rs. 15,000',
      lessons: '6 Intensive Driving Lessons',
      badge: 'Confidence Booster',
      bonus: 'Ideal for existing license holders',
      image: '/images/hero-driving-school.jpg',
      features: [
        'Highway and heavy traffic driving practice',
        'Parallel parking & tight reversing mastery',
        'Night driving & bad-weather coaching',
        'Flexible custom scheduling',
      ],
      icon: Car,
      color: 'border-blue-400',
      packageType: 'Car_Refresher',
    },
    {
      name: 'Heavy Vehicle (Bus) Training',
      type: 'Commercial Heavy Class',
      price: 'Rs. 65,000',
      lessons: '15 Heavy Vehicle Lessons',
      badge: 'Commercial Grade',
      bonus: 'Requirement: 2+ Years Light License',
      image: '/images/heavy-vehicle-bus-training.jpg',
      features: [
        'Air brake mechanics & transmission handling',
        'DMT commercial driver standard trials',
        'Passenger safety & route management',
        'Experienced heavy transport instructors',
      ],
      icon: Bus,
      color: 'border-amber-400',
      packageType: 'HeavyVehicle_Bus',
    },
  ];

  const individualPackages = [
    {
      name: 'Car (Auto/Manual)',
      type: 'Light Vehicle (Dual Control)',
      price: 'Rs. 3,000.00',
      lessons: 'one lesson per hour',
      badge: 'Auto & Manual Options',
      bonus: 'Custom 1-on-1 Practical Coaching',
      image: '/images/hero-driving-school.jpg',
      features: [
        'One lesson per hour (60 min dedicated session)',
        'Automatic or Manual transmission selection',
        'Reverse parking, hill start & junction mastery',
        'Certified instructor in dual-control vehicle',
      ],
      icon: Car,
      color: 'border-cyan-400',
      packageType: 'Car_Individual',
    },
    {
      name: 'Bike',
      type: 'Motorcycle Standard',
      price: 'Rs. 1,500.00',
      lessons: 'one lesson per hour',
      badge: 'Figure-8 & Trial Track',
      bonus: 'Pay-As-You-Learn Flexible Rate',
      image: '/images/motorcycle-figure8-training.jpg',
      features: [
        'One lesson per hour (60 min dedicated session)',
        'Figure-8 test track obstacle navigation',
        'Clutch control, balance & emergency braking',
        'Trial bike & safety gear provided',
      ],
      icon: Bike,
      color: 'border-emerald-400',
      packageType: 'Bike_Individual',
    },
    {
      name: 'Heavy Vehicle',
      type: 'Commercial Heavy Class',
      price: 'Rs. 3,500.00',
      lessons: 'one lesson per hour',
      badge: 'Commercial Grade',
      bonus: 'Requirement: 2+ Years Light License',
      image: '/images/heavy-vehicle-bus-training.jpg',
      features: [
        'One lesson per hour (60 min dedicated coaching)',
        'Air brake systems & commercial bus handling',
        'Wide turn positioning & blind spot management',
        'Government DMT road trial exam prep',
      ],
      icon: Bus,
      color: 'border-purple-400',
      packageType: 'HeavyVehicle_Individual',
    },
    {
      name: 'Three Wheel',
      type: 'Light Three-Wheeler Class',
      price: 'Rs. 2,000.00',
      lessons: 'one lesson per hour',
      badge: 'Maneuvering & Bay Parking',
      bonus: 'Steering & Reverse Mastery',
      image: '/images/threewheeler-reverse-training.jpg',
      features: [
        'One lesson per hour (60 min dedicated session)',
        'Tight cornering & handlebar throttle control',
        'Reverse parking into marked examination bays',
        'Trial vehicle & practice track accompaniment',
      ],
      icon: Car,
      color: 'border-amber-400',
      packageType: 'ThreeWheeler_Individual',
    },
  ];

  const dmtSteps = [
    {
      step: '01',
      title: 'Sithma Enrollment',
      desc: 'Choose Type 1 (New Learner) or Type 2 (Trial-Ready) with branch & package selection.',
    },
    {
      step: '02',
      title: 'DMT Medical Exam',
      desc: 'National Transport Medical Institute appointment scheduling and fitness clearance.',
    },
    {
      step: '03',
      title: 'Written Theory Exam',
      desc: 'Prepare with our in-app trilingual practice questions and sit the government written test.',
    },
    {
      step: '04',
      title: 'Practical Road Lessons',
      desc: 'Attend 3 daily sessions across Maharagama, Werahara, or Delgoda with 1-on-1 coaching.',
    },
    {
      step: '05',
      title: 'DMT Practical Trial',
      desc: 'Eligible 3 months post-written test. Up to 3 attempts tracked within the 1.5-year window.',
    },
  ];

  return (
    <div className="space-y-20 py-10 px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto w-full">
      {/* Hero Section */}
      <section className="relative backdrop-blur-2xl bg-gradient-to-r from-slate-900/90 via-primary/70 to-slate-900/90 rounded-3xl text-white p-8 sm:p-12 lg:p-14 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] overflow-hidden">
        <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Sri Lanka's Modern Driving Academy Management System
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white font-heading leading-tight drop-shadow">
              Master the Road with <span className="text-accent">Sithma</span> Driving School
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Serving Maharagama, Werahara, and Delgoda branches with professional certified instructors, automated DMT milestone stepper, seamless online lesson booking, and multilingual exam practice.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              {user ? (
                <Link
                  to={user.role === 'student' ? '/student/dashboard' : '/staff/students'}
                  className="btn-accent px-8 py-3.5 font-extrabold text-sm shadow-xl flex items-center gap-2 hover:scale-105"
                >
                  Go to {user.role === 'student' ? 'Student Dashboard' : 'Staff Portal'} <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-accent px-8 py-3.5 font-extrabold text-sm shadow-xl flex items-center gap-2 hover:scale-105"
                  >
                    Enroll as Student <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary px-6 py-3.5 font-bold text-sm bg-white/10 hover:bg-white/20 border-white/20 text-white flex items-center gap-2"
                  >
                    Portal Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Visual Photo Card */}
          <div className="lg:col-span-5 relative group">
            <div className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.7)] group-hover:border-cyan-400/60 transition-all duration-500">
              <img
                src="/images/hero-driving-school.jpg"
                alt="Sithma Driving School professional dual-control car in road lesson"
                className="w-full h-[300px] sm:h-[350px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">Official Training Ground</span>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Dual-Control Learner Fleet</h4>
                </div>
                <span className="badge badge-success text-[11px] font-bold">98% Pass Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Metrics Pill */}
        <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-300">3 Branches</div>
            <p className="text-[11px] text-slate-400 font-medium">Maharagama • Werahara • Delgoda</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">98%</div>
            <p className="text-[11px] text-slate-400 font-medium">First-Time Trial Pass Rate</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">6 Instructors</div>
            <p className="text-[11px] text-slate-400 font-medium">Certified 1-on-1 Road Trainers</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">3 Languages</div>
            <p className="text-[11px] text-slate-400 font-medium">Sinhala • Tamil • English Prep</p>
          </div>
        </div>
      </section>

      {/* DMT 5-Stage Stepper Roadmap */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Official Sri Lanka DMT Protocol
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Your Structured Path to a Driving License
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From your first medical appointment to your final practical trial pass, our system tracks every milestone in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4">
          {dmtSteps.map((s, idx) => (
            <div
              key={s.step}
              className="card p-5 space-y-3 relative flex flex-col justify-between hover:border-cyan-400/50 transition-colors"
            >
              <div>
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center font-black text-xs mb-3">
                  {s.step}
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
              <div className="text-[10px] font-semibold text-cyan-300/80 pt-2 border-t border-white/10 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Tracked in Portal
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Operating Branches */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Building2 className="w-4 h-4" /> 3 Modern Training Hubs
            </div>
            <h2 className="text-2xl font-extrabold text-white font-heading mt-1">
              Select Your Training Branch
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBranch(b.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedBranch === b.id
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {b.name.replace(' Branch', '')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBranch(b.id)}
              className={`card p-6 space-y-4 cursor-pointer transition-all ${
                selectedBranch === b.id
                  ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                  : 'hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-info text-[10px]">{b.tag}</span>
                <MapPin className="w-5 h-5 text-cyan-400" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{b.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{b.address}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-300 border-t border-white/10 pt-3">
                <p className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{b.instructors}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>{b.timings}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{b.phone}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* State-of-the-Art Training Fleet & Grounds Photo Gallery */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Camera className="w-4 h-4" /> Real Practice Grounds & Fleet
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-1">
              State-of-the-Art Training Fleet & Grounds
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Inspect our certified dual-control fleet, official Werahara Figure-8 tracks, and specialized test rigs designed to guarantee your 1st-attempt license pass.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-info text-[10px] font-bold px-3 py-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> DMT Exam Certified
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleetPhotos.map((item, idx) => (
            <div
              key={idx}
              className="card card-hover overflow-hidden border border-white/10 group flex flex-col justify-between bg-slate-900/60"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="badge badge-info text-[10px] font-bold shadow-lg backdrop-blur-md bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
                      {item.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200">
                    <span className="flex items-center gap-1 font-semibold text-xs text-white">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      {item.tag}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    {item.category}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-cyan-300/90 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Hands-On Coaching
                </span>
                <span className="text-slate-500 font-semibold">100% Practical</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Course Packages & Pricing */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
            <Award className="w-4 h-4" /> Transparent Pricing Catalog
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            {pricingTab === 'individual' ? 'Individual Vehicle Packages' : 'Comprehensive Driving Packages'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {pricingTab === 'individual'
              ? 'Flexible pay-as-you-learn individual hourly packages for targeted trial revision or skill enhancement.'
              : 'Complete all-inclusive courses from registration and theory to practical trial accompaniment.'}
          </p>

          {/* Pricing Catalog Switcher */}
          <div className="flex justify-center pt-3">
            <div className="p-1 bg-slate-900/90 rounded-2xl border border-white/15 inline-flex items-center gap-1 shadow-xl">
              <button
                onClick={() => setPricingTab('individual')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  pricingTab === 'individual'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Individual Packages (Hourly)
                <span className="text-[10px] py-0.5 px-1.5 rounded-md bg-amber-400/20 text-amber-300 font-extrabold">
                  4 Vehicles
                </span>
              </button>
              <button
                onClick={() => setPricingTab('comprehensive')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pricingTab === 'comprehensive'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Full Course Packages
              </button>
            </div>
          </div>
        </div>

        {/* Individual Packages Grid (4 Columns) */}
        {pricingTab === 'individual' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {individualPackages.map((pkg) => {
              const Icon = pkg.icon;

              return (
                <div
                  key={pkg.name}
                  className="card card-hover flex flex-col justify-between border border-white/10 hover:border-cyan-500/40 relative group overflow-hidden bg-slate-900/60"
                >
                  <div>
                    {/* Vehicle Photo Header */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="badge badge-info text-[10px] font-bold shadow-md bg-cyan-950/90 border border-cyan-400/40 text-cyan-300">
                          {pkg.badge}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-cyan-300 shadow-md">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {pkg.name}
                        </h3>
                        <p className="text-xs text-slate-400">{pkg.type}</p>
                      </div>

                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-0.5">
                        <div className="text-2xl font-black text-accent">{pkg.price}</div>
                        <p className="text-xs font-semibold text-cyan-300 capitalize">{pkg.lessons}</p>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{pkg.bonus}</p>

                      <div className="space-y-2 pt-2 text-xs text-slate-300 border-t border-white/10">
                        {pkg.features.map((f, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      to={`/register?pkg=${pkg.packageType}`}
                      className="btn-accent w-full py-3 font-bold text-xs text-center shadow-lg hover:scale-105 block"
                    >
                      Enroll in Package
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Comprehensive Packages Grid (3 Columns) */}
        {pricingTab === 'comprehensive' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {packages.map((pkg) => {
              const Icon = pkg.icon;

              return (
                <div
                  key={pkg.name}
                  className="card card-hover flex flex-col justify-between border border-white/10 hover:border-amber-400/40 relative group overflow-hidden bg-slate-900/60"
                >
                  <div>
                    {/* Course Photo Header */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="badge badge-warning text-[10px] font-bold shadow-md bg-amber-950/90 border border-amber-400/40 text-amber-300">
                          {pkg.badge}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-cyan-300 shadow-md">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {pkg.name}
                        </h3>
                        <p className="text-xs text-slate-400">{pkg.type}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="text-3xl font-black text-accent">{pkg.price}</div>
                        <p className="text-xs font-semibold text-cyan-300">{pkg.lessons}</p>
                      </div>

                      <p className="text-xs font-bold text-amber-300 bg-white/5 p-2 rounded-xl border border-white/10">
                        {pkg.bonus}
                      </p>

                      <div className="space-y-2 pt-2 text-xs text-slate-300 border-t border-white/10">
                        {pkg.features.map((f, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link
                      to={`/register?pkg=${pkg.packageType}`}
                      className="btn-accent w-full py-3 font-bold text-xs text-center shadow-lg hover:scale-105 block"
                    >
                      Enroll in Package
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Trilingual Quiz Feature Highlight Banner */}
      <section className="backdrop-blur-2xl bg-slate-900/80 rounded-3xl p-8 sm:p-10 border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-bold text-xs">
            <BookOpen className="w-3.5 h-3.5" /> Informal Self-Study Aid
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Trilingual DMT Written Exam Practice
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Practice realistic multiple-choice questions on road safety, priority signs, and traffic rules in <strong>Sinhala (සිංහල)</strong>, <strong>Tamil (தமிழ்)</strong>, or <strong>English</strong>. Real-time scoring against the official 80% passing benchmark.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="badge bg-white/10 text-cyan-300 border border-white/15 text-xs">English Practice</span>
            <span className="badge bg-white/10 text-cyan-300 border border-white/15 text-xs">සිංහල පුහුණුව</span>
            <span className="badge bg-white/10 text-cyan-300 border border-white/15 text-xs">தமிழ் பயிற்சி</span>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Link
            to="/student/quiz"
            className="btn-accent px-8 py-3.5 font-bold text-sm shadow-xl flex items-center gap-2 hover:scale-105"
          >
            Try Practice Exam <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 pt-10 text-xs text-slate-400 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold font-heading text-sm mb-2">
              <Car className="w-4 h-4 text-cyan-400" /> Sithma Driving School (Pvt) Ltd
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Official accredited driving academy registered under the Department of Motor Traffic (DMT) Sri Lanka.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2">Quick Navigation</h4>
            <div className="space-y-1.5 text-[11px]">
              <p><Link to="/register" className="hover:text-cyan-300">Student Self-Registration</Link></p>
              <p><Link to="/login" className="hover:text-cyan-300">Student & Staff Portal Sign In</Link></p>
              <p><Link to="/student/quiz" className="hover:text-cyan-300">Multilingual Practice Quiz</Link></p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2">Inquiries & Support</h4>
            <div className="space-y-1 text-[11px]">
              <p>Hotline: 011 284 9201 / 077 123 4567</p>
              <p>Email: support@sithma.lk</p>
              <p>Branches: Maharagama • Werahara • Delgoda</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 text-center text-[10px] text-slate-500">
          © {new Date().getFullYear()} Sithma Driving School Management System. Designed for academic demonstration & evaluation.
        </div>
      </footer>
    </div>
  );
}
