import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentTypeSelectModal from '../components/StudentTypeSelectModal';
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
  const [typeModalOpen, setTypeModalOpen] = useState(false);

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
      color: 'border-[#1B3D59]',
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
      color: 'border-[#6A97C0]',
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
      color: 'border-[#152026]',
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
      color: 'border-[#1B3D59]',
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
      color: 'border-[#6A97C0]',
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
      color: 'border-[#152026]',
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
      color: 'border-[#1B3D59]',
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
      <section className="relative bg-white rounded-3xl p-6 sm:p-10 md:p-12 lg:p-14 border border-[#D4EEF8] shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-[11px] sm:text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> Sri Lanka's Modern Driving Academy Management System
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-[#152026] leading-tight">
              Master the Road with <span className="text-[#1B3D59]">Sithma</span> Driving School
            </h1>
            <p className="text-[#152026]/75 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl font-medium">
              Serving Maharagama, Werahara, and Delgoda branches with professional certified instructors, automated DMT milestone stepper, seamless online lesson booking, and multilingual exam practice.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {user ? (
                <Link
                  to={user.role === 'student' ? '/student/dashboard' : '/staff/students'}
                  className="btn-primary w-full sm:w-auto px-8 py-3.5 font-bold text-sm shadow-sm flex items-center justify-center gap-2"
                >
                  Go to {user.role === 'student' ? 'Student Dashboard' : 'Staff Portal'} <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setTypeModalOpen(true)}
                    className="btn-primary w-full sm:w-auto px-8 py-3.5 font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Enroll as Student <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    to="/login"
                    className="btn-secondary w-full sm:w-auto px-6 py-3.5 font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
                  >
                    Portal Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Visual Photo Card */}
          <div className="lg:col-span-5 relative group">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#D4EEF8] shadow-md group-hover:border-[#6A97C0] transition-all duration-300">
              <img
                src="/images/hero-driving-school.jpg"
                alt="Sithma Driving School professional dual-control car in road lesson"
                className="w-full h-[300px] sm:h-[350px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#152026]/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white border border-[#D4EEF8] flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[10px] font-bold text-[#6A97C0] uppercase tracking-wider block">Official Training Ground</span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#152026]">Dual-Control Learner Fleet</h4>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">98% Pass Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Metrics Pill */}
        <div className="mt-10 pt-8 border-t border-[#D4EEF8] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#1B3D59]">3 Branches</div>
            <p className="text-xs text-[#6A97C0] font-bold mt-0.5">Maharagama • Werahara • Delgoda</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">98%</div>
            <p className="text-xs text-[#6A97C0] font-bold mt-0.5">First-Time Trial Pass Rate</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#6A97C0]">6 Instructors</div>
            <p className="text-xs text-[#6A97C0] font-bold mt-0.5">Certified 1-on-1 Road Trainers</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#152026]">3 Languages</div>
            <p className="text-xs text-[#6A97C0] font-bold mt-0.5">Sinhala • Tamil • English Prep</p>
          </div>
        </div>
      </section>

      {/* DMT 5-Stage Stepper Roadmap */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B3D59] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#1B3D59]" /> Official Sri Lanka DMT Protocol
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#152026]">
            Your Structured Path to a Driving License
          </h2>
          <p className="text-xs sm:text-sm text-[#6A97C0]">
            From your first medical appointment to your final practical trial pass, our system tracks every milestone in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4">
          {dmtSteps.map((s) => (
            <div
              key={s.step}
              className="bg-white rounded-3xl p-5 space-y-3 relative flex flex-col justify-between border border-[#D4EEF8] hover:border-[#6A97C0] transition-colors shadow-sm"
            >
              <div>
                <div className="w-8 h-8 rounded-full bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/30 flex items-center justify-center font-black text-xs mb-3">
                  {s.step}
                </div>
                <h3 className="text-sm font-bold text-[#152026] mb-1">{s.title}</h3>
                <p className="text-xs text-[#152026]/75 leading-relaxed">{s.desc}</p>
              </div>
              <div className="text-[10px] font-bold text-[#1B3D59] pt-2 border-t border-[#D4EEF8] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#1B3D59]" /> Tracked in Portal
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Operating Branches */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B3D59] uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-[#1B3D59]" /> 3 Modern Training Hubs
            </div>
            <h2 className="text-2xl font-black text-[#152026] mt-1">
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
                    ? 'bg-[#1B3D59] text-white shadow-sm'
                    : 'text-[#152026] hover:bg-[#D4EEF8]/40'
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
              className={`bg-white rounded-3xl p-6 space-y-4 cursor-pointer transition-all border shadow-sm ${
                selectedBranch === b.id
                  ? 'border-2 border-[#1B3D59] shadow-md ring-1 ring-[#1B3D59]'
                  : 'border-[#D4EEF8] hover:border-[#6A97C0]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] text-[10px] font-bold">{b.tag}</span>
                <MapPin className="w-5 h-5 text-[#1B3D59]" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#152026]">{b.name}</h3>
                <p className="text-xs text-[#6A97C0] mt-1">{b.address}</p>
              </div>

              <div className="space-y-2 text-xs text-[#152026]/75 border-t border-[#D4EEF8] pt-3">
                <p className="flex items-center gap-2 font-medium">
                  <Users className="w-3.5 h-3.5 text-[#1B3D59]" />
                  <span>{b.instructors}</span>
                </p>
                <p className="flex items-center gap-2 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#6A97C0]" />
                  <span>{b.timings}</span>
                </p>
                <p className="flex items-center gap-2 font-medium">
                  <Phone className="w-3.5 h-3.5 text-[#1B3D59]" />
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
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B3D59] uppercase tracking-wider">
              <Camera className="w-4 h-4 text-[#1B3D59]" /> Real Practice Grounds & Fleet
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#152026] mt-1">
              State-of-the-Art Training Fleet & Grounds
            </h2>
            <p className="text-xs sm:text-sm text-[#6A97C0] mt-1 max-w-xl">
              Inspect our certified dual-control fleet, official Werahara Figure-8 tracks, and specialized test rigs designed to guarantee your 1st-attempt license pass.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] text-[10px] font-bold shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-[#1B3D59]" /> DMT Exam Certified
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleetPhotos.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl overflow-hidden border border-[#D4EEF8] group flex flex-col justify-between shadow-sm hover:border-[#6A97C0] transition-colors"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#152026]/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/95 text-[#1B3D59] text-[10px] font-bold border border-[#D4EEF8] shadow-sm">
                      {item.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 font-bold text-xs text-white">
                      <MapPin className="w-3.5 h-3.5 text-[#B3D5F1] flex-shrink-0" />
                      {item.tag}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-[11px] font-bold text-[#6A97C0] uppercase tracking-wider">
                    {item.category}
                  </div>
                  <h3 className="text-base font-bold text-[#152026] group-hover:text-[#1B3D59] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#152026]/75 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-[#D4EEF8] flex items-center justify-between text-[11px] text-[#1B3D59] font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> Hands-On Coaching
                </span>
                <span className="text-[#6A97C0] font-semibold">100% Practical</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Course Packages & Pricing */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B3D59] uppercase tracking-wider">
            <Award className="w-4 h-4 text-[#1B3D59]" /> Transparent Pricing Catalog
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#152026]">
            {pricingTab === 'individual' ? 'Individual Vehicle Packages' : 'Comprehensive Driving Packages'}
          </h2>
          <p className="text-xs sm:text-sm text-[#6A97C0]">
            {pricingTab === 'individual'
              ? 'Flexible pay-as-you-learn individual hourly packages for targeted trial revision or skill enhancement.'
              : 'Complete all-inclusive courses from registration and theory to practical trial accompaniment.'}
          </p>

          {/* Pricing Catalog Switcher */}
          <div className="flex justify-center pt-3">
            <div className="p-1 bg-[#FAFCFE] rounded-2xl border border-[#D4EEF8] inline-flex items-center gap-1 shadow-sm">
              <button
                onClick={() => setPricingTab('individual')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  pricingTab === 'individual'
                    ? 'bg-[#1B3D59] text-white shadow-sm'
                    : 'text-[#152026] hover:bg-[#D4EEF8]/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B3D5F1]" />
                Individual Packages (Hourly)
                <span className="text-[10px] py-0.5 px-1.5 rounded-md bg-[#D4EEF8] text-[#1B3D59] font-black">
                  4 Vehicles
                </span>
              </button>
              <button
                onClick={() => setPricingTab('comprehensive')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pricingTab === 'comprehensive'
                    ? 'bg-[#1B3D59] text-white shadow-sm'
                    : 'text-[#152026] hover:bg-[#D4EEF8]/40'
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
                  className="bg-white rounded-3xl flex flex-col justify-between border border-[#D4EEF8] hover:border-[#1B3D59] relative group overflow-hidden shadow-sm transition-all"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-[#152026] via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/95 text-[#1B3D59] text-[10px] font-bold border border-[#D4EEF8] shadow-sm">
                          {pkg.badge}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/95 border border-[#D4EEF8] flex items-center justify-center text-[#1B3D59] shadow-sm">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-[#152026] group-hover:text-[#1B3D59] transition-colors">
                          {pkg.name}
                        </h3>
                        <p className="text-xs text-[#6A97C0]">{pkg.type}</p>
                      </div>

                      <div className="p-3 bg-[#FAFCFE] rounded-2xl border border-[#D4EEF8] space-y-0.5">
                        <div className="text-2xl font-black text-[#1B3D59]">{pkg.price}</div>
                        <p className="text-xs font-bold text-[#6A97C0] capitalize">{pkg.lessons}</p>
                      </div>

                      <p className="text-xs text-[#152026]/75 leading-relaxed">{pkg.bonus}</p>

                      <div className="space-y-2 pt-2 text-xs text-[#152026]/75 border-t border-[#D4EEF8]">
                        {pkg.features.map((f, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => setTypeModalOpen(true)}
                      className="btn-primary w-full py-3 font-bold text-xs text-center shadow-sm block"
                    >
                      Register to Enroll
                    </button>
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
                  className="bg-white rounded-3xl flex flex-col justify-between border border-[#D4EEF8] hover:border-[#1B3D59] relative group overflow-hidden shadow-sm transition-all"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-[#152026] via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F3EED8] text-[#152026] text-[10px] font-bold border border-[#6A97C0]/30 shadow-sm">
                          {pkg.badge}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/95 border border-[#D4EEF8] flex items-center justify-center text-[#1B3D59] shadow-sm">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#152026] group-hover:text-[#1B3D59] transition-colors">
                          {pkg.name}
                        </h3>
                        <p className="text-xs text-[#6A97C0]">{pkg.type}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="text-3xl font-black text-[#1B3D59]">{pkg.price}</div>
                        <p className="text-xs font-bold text-[#6A97C0]">{pkg.lessons}</p>
                      </div>

                      <p className="text-xs font-bold text-[#152026] bg-[#F3EED8] p-2.5 rounded-xl border border-[#6A97C0]/30">
                        {pkg.bonus}
                      </p>

                      <div className="space-y-2 pt-2 text-xs text-[#152026]/75 border-t border-[#D4EEF8]">
                        {pkg.features.map((f, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      type="button"
                      onClick={() => setTypeModalOpen(true)}
                      className="btn-primary w-full py-3 font-bold text-xs text-center shadow-sm block"
                    >
                      Register to Enroll
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Trilingual Quiz Feature Highlight Banner */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D4EEF8] shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-xs">
            <BookOpen className="w-3.5 h-3.5 text-[#1B3D59]" /> Informal Self-Study Aid
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#152026]">
            Trilingual DMT Written Exam Practice
          </h2>
          <p className="text-xs sm:text-sm text-[#152026]/75 leading-relaxed">
            Practice realistic multiple-choice questions on road safety, priority signs, and traffic rules in <strong>Sinhala (සිංහල)</strong>, <strong>Tamil (தமிழ்)</strong>, or <strong>English</strong>. Real-time scoring against the official 80% passing benchmark.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FAFCFE] text-[#152026] border border-[#D4EEF8] text-xs font-bold">English Practice</span>
            <span className="inline-block px-3 py-1 rounded-full bg-[#FAFCFE] text-[#152026] border border-[#D4EEF8] text-xs font-bold">සිංහල පුහුණුව</span>
            <span className="inline-block px-3 py-1 rounded-full bg-[#FAFCFE] text-[#152026] border border-[#D4EEF8] text-xs font-bold">தமிழ் பயிற்சி</span>
          </div>
        </div>

        <div className="w-full lg:w-auto flex-shrink-0">
          <Link
            to="/student/quiz"
            className="btn-primary px-8 py-3.5 font-bold text-sm shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            Try Practice Exam <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D4EEF8] pt-10 text-xs text-[#6A97C0] space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-[#152026] font-black text-sm mb-2">
              <Car className="w-4 h-4 text-[#1B3D59]" /> Sithma Driving School (Pvt) Ltd
            </div>
            <p className="text-[11px] text-[#6A97C0] leading-relaxed">
              Official accredited driving academy registered under the Department of Motor Traffic (DMT) Sri Lanka.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#152026] mb-2">Quick Navigation</h4>
            <div className="space-y-1.5 text-[11px] text-[#6A97C0]">
              <p>
                <button
                  type="button"
                  onClick={() => setTypeModalOpen(true)}
                  className="hover:text-[#1B3D59] text-left cursor-pointer transition-colors"
                >
                  Student Self-Registration
                </button>
              </p>
              <p><Link to="/login" className="hover:text-[#1B3D59] transition-colors">Student & Staff Portal Sign In</Link></p>
              <p><Link to="/student/quiz" className="hover:text-[#1B3D59] transition-colors">Multilingual Practice Quiz</Link></p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#152026] mb-2">Inquiries & Support</h4>
            <div className="space-y-1 text-[11px] text-[#6A97C0]">
              <p>Hotline: 011 284 9201 / 077 123 4567</p>
              <p>Email: support@sithma.lk</p>
              <p>Branches: Maharagama • Werahara • Delgoda</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#D4EEF8] text-center text-[10px] text-[#6A97C0]">
          © {new Date().getFullYear()} Sithma Driving School Management System. Designed for academic demonstration & evaluation.
        </div>
      </footer>

      {/* Student Type Selection Modal (Step 1) */}
      <StudentTypeSelectModal
        isOpen={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
      />
    </div>
  );
}
