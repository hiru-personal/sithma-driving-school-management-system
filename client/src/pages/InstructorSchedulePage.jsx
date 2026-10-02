import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Calendar,
  Clock,
  Car,
  Bike,
  Bus,
  MapPin,
  Phone,
  Mail,
  User,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Users,
  X,
  Eye,
  ShieldCheck,
  CreditCard,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

export default function InstructorSchedulePage() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBranch, setSelectedBranch] = useState(user?.branch || 'Maharagama');

  // Modal: View Booked Students
  const [activeRosterSlot, setActiveRosterSlot] = useState(null);

  // Modal: Add Daily Lesson
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submittingSlot, setSubmittingSlot] = useState(false);
  const [newLessonForm, setNewLessonForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '08:30',
    endTime: '09:30',
    lessonTitle: 'Morning Highway Driving & Overtaking',
    lessonTopic: 'Speed regulation, lane discipline, safe overtaking techniques',
    vehicleCategory: 'Light',
    vehicleType: 'Car',
    branch: user?.branch || 'Maharagama',
    capacity: 10,
  });

  const PRESET_TOPICS = [
    {
      title: 'Morning Highway Driving & Overtaking',
      topic: 'Speed regulation, lane discipline, dual-carriageway entry/exit, overtaking maneuvers',
      category: 'Light',
      type: 'Car',
    },
    {
      title: 'Parallel Parking, Hill Start & Reverse 90°',
      topic: 'Precision maneuvering, clutch bite control on steep incline, reverse bay alignment',
      category: 'Light',
      type: 'Car',
    },
    {
      title: 'City Traffic, Roundabouts & Complex Junctions',
      topic: 'Traffic light signals, multi-lane roundabouts, pedestrian crossings, mirror-signal-maneuver',
      category: 'Light',
      type: 'Car',
    },
    {
      title: 'Motorcycle Slalom & Balance Mastery',
      topic: 'Emergency braking, cone slalom weaving, figure-8 balance, tight slow-speed turns',
      category: 'Light',
      type: 'Bike',
    },
    {
      title: 'Three-Wheeler Practical Control & Navigation',
      topic: 'Incline throttle coordination, tight turning radius maneuvers, urban obstacle handling',
      category: 'Light',
      type: 'ThreeWheeler',
    },
    {
      title: 'Heavy Transport Bus Road Operation',
      topic: 'Air brake operation, wide turning geometry, rear mirror navigation, blind-spot checks',
      category: 'Heavy',
      type: 'HeavyVehicle_Bus',
    },
  ];

  const fetchSchedule = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await api.get(`/slots/instructor/${user._id}`, {
        params: {
          date: selectedDate,
          branch: selectedBranch,
        },
      });
      if (res.data.success) {
        setSchedule(res.data.schedule || []);
      }
    } catch (err) {
      toast.error('Failed to load instructor schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [user, selectedDate, selectedBranch]);

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setSubmittingSlot(true);
    try {
      const res = await api.post('/slots', {
        ...newLessonForm,
        instructorId: user._id,
        capacity: 10, // System rule: only 10 students can book each lesson
      });

      if (res.data.success) {
        toast.success('🎉 Daily lesson session created successfully! (Capacity: 10 students)');
        setIsAddModalOpen(false);
        // If created for same date, refresh immediately
        setSelectedDate(newLessonForm.date);
        setSelectedBranch(newLessonForm.branch);
        fetchSchedule();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lesson session');
    } finally {
      setSubmittingSlot(false);
    }
  };

  // Metrics
  const totalSessions = schedule.length;
  const totalBookedStudents = schedule.reduce((sum, s) => sum + (s.bookedCount || 0), 0);
  const totalCapacity = schedule.reduce((sum, s) => sum + (s.capacity || 10), 0);
  const totalRemainingSpots = Math.max(0, totalCapacity - totalBookedStudents);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F1FD] border border-[#DBE2EF] text-[#19376D] font-bold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#3F72AF]" /> Certified Instructor Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2447] font-heading flex items-center gap-2.5">
            <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-[#3F72AF]" /> Instructor Daily Session Schedule & Roster
          </h1>
          <p className="text-xs sm:text-sm text-[#4B6584] mt-1">
            Instructor: <strong className="text-[#0B2447]">{user?.name}</strong> • Assigned Branch:{' '}
            <strong className="text-[#3F72AF]">{user?.branch || selectedBranch}</strong> • Max Capacity:{' '}
            <strong className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">10 Students / Lesson</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSchedule}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => {
              setNewLessonForm((prev) => ({
                ...prev,
                date: selectedDate,
                branch: selectedBranch,
              }));
              setIsAddModalOpen(true);
            }}
            className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shadow-sm hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" /> Add Lesson Session
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4.5 bg-white border border-[#DBE2EF] rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-[#4B6584] uppercase tracking-wider block">Sessions Today</span>
          <div className="text-2xl sm:text-3xl font-black text-[#0B2447] mt-1">{totalSessions}</div>
          <span className="text-[11px] font-semibold text-[#3F72AF]">Scheduled on {selectedDate}</span>
        </div>

        <div className="card p-4.5 bg-white border border-[#DBE2EF] rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-[#4B6584] uppercase tracking-wider block">Students Booked</span>
          <div className="text-2xl sm:text-3xl font-black text-[#3F72AF] mt-1">{totalBookedStudents}</div>
          <span className="text-[11px] font-medium text-[#4B6584]">Attending lessons</span>
        </div>

        <div className="card p-4.5 bg-white border border-[#DBE2EF] rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-[#4B6584] uppercase tracking-wider block">Seats Remaining</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{totalRemainingSpots}</div>
          <span className="text-[11px] font-medium text-[#4B6584]">Available to book</span>
        </div>

        <div className="card p-4.5 bg-white border border-[#DBE2EF] rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-[#4B6584] uppercase tracking-wider block">Class Limit</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">10 Max</div>
          <span className="text-[11px] font-medium text-[#4B6584]">Strict cap per lesson</span>
        </div>
      </div>

      {/* Filter & Date Bar */}
      <div className="card p-4.5 bg-white border border-[#DBE2EF] rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-[#4B6584] uppercase mb-1">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl bg-[#F8FAFD] border border-[#DBE2EF] text-xs text-[#0B2447] font-bold outline-none focus:border-[#3F72AF] transition-colors"
            />
          </div>

          <div className="flex items-end gap-1.5 pt-4 md:pt-0">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDate === new Date().toISOString().split('T')[0]
                  ? 'bg-[#3F72AF] text-white shadow-xs'
                  : 'bg-[#F0F4F8] text-[#112D4E] hover:bg-[#DBE2EF]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(addDays(new Date(), 1).toISOString().split('T')[0])}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDate === addDays(new Date(), 1).toISOString().split('T')[0]
                  ? 'bg-[#3F72AF] text-white shadow-xs'
                  : 'bg-[#F0F4F8] text-[#112D4E] hover:bg-[#DBE2EF]'
              }`}
            >
              Tomorrow
            </button>
            <button
              onClick={() => setSelectedDate(addDays(new Date(), 2).toISOString().split('T')[0])}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDate === addDays(new Date(), 2).toISOString().split('T')[0]
                  ? 'bg-[#3F72AF] text-white shadow-xs'
                  : 'bg-[#F0F4F8] text-[#112D4E] hover:bg-[#DBE2EF]'
              }`}
            >
              Day After
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-[#4B6584] uppercase mb-1">Branch:</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl bg-[#F8FAFD] border border-[#DBE2EF] text-xs text-[#0B2447] font-bold outline-none focus:border-[#3F72AF] transition-colors cursor-pointer"
            >
              <option value="Maharagama">Maharagama Branch</option>
              <option value="Werahara">Werahara Branch</option>
              <option value="Delgoda">Delgoda Branch</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#4B6584] flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#3F72AF]" /> Loading daily sessions & student rosters...
        </div>
      ) : schedule.length === 0 ? (
        <div className="card text-center py-16 space-y-4 border-2 border-dashed border-[#DBE2EF] bg-white rounded-2xl">
          <Calendar className="w-12 h-12 text-[#94A3B8] mx-auto" />
          <div>
            <p className="text-base font-bold text-[#0B2447]">No training sessions scheduled for {selectedDate}</p>
            <p className="text-xs text-[#4B6584] mt-1">
              You can add custom sessions for today or choose another date above.
            </p>
          </div>
          <button
            onClick={() => {
              setNewLessonForm((prev) => ({
                ...prev,
                date: selectedDate,
                branch: selectedBranch,
              }));
              setIsAddModalOpen(true);
            }}
            className="btn-primary text-xs py-2.5 px-5 font-bold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add First Lesson for {selectedDate}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schedule.map((slot) => {
            const bookedCount = slot.bookedCount || 0;
            const capacity = slot.capacity || 10;
            const isFull = bookedCount >= capacity;
            const remainingSpots = Math.max(0, capacity - bookedCount);
            const fillPercentage = Math.min(100, Math.round((bookedCount / capacity) * 100));

            return (
              <div
                key={slot._id}
                className="card p-5 space-y-4 border border-[#DBE2EF] hover:border-[#3F72AF] bg-white rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-[#E8F1FD] text-[#19376D] border border-[#DBE2EF] text-[10px] font-black uppercase">
                      {slot.vehicleType || slot.vehicleCategory} Vehicle
                    </span>
                    <span
                      className={`badge text-[10px] font-bold ${
                        isFull
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : bookedCount > 0
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isFull ? 'FULL (10/10)' : `${remainingSpots} spots left`}
                    </span>
                  </div>

                  {/* Title & Topic */}
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B2447] leading-snug">
                      {slot.lessonTitle || `${slot.vehicleType || 'Practical'} Driving Session`}
                    </h3>
                    <p className="text-xs text-[#4B6584] mt-1 line-clamp-2 leading-relaxed font-normal">
                      {slot.lessonTopic || 'Dual-control practical road training and maneuvers.'}
                    </p>
                  </div>

                  {/* Time & Branch Info */}
                  <div className="p-3 bg-[#F8FAFD] rounded-xl border border-[#DBE2EF] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#4B6584] flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#3F72AF]" /> Session Time:
                      </span>
                      <strong className="text-[#112D4E] font-extrabold text-sm">
                        {slot.startTime} – {slot.endTime}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#4B6584] flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" /> Branch:
                      </span>
                      <span className="text-[#0B2447] font-bold">{slot.branch}</span>
                    </div>
                  </div>

                  {/* Booking Progress Meter (Max 10 students) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#4B6584] font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#3F72AF]" /> Booked Students:
                      </span>
                      <strong className="text-[#0B2447] font-extrabold">
                        {bookedCount} / {capacity}
                      </strong>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] border border-[#DBE2EF] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull
                            ? 'bg-rose-500'
                            : fillPercentage >= 70
                            ? 'bg-amber-500'
                            : 'bg-[#3F72AF]'
                        }`}
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => setActiveRosterSlot(slot)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#F0F4F8] hover:bg-[#DBE2EF] text-[#112D4E] hover:text-[#0B2447] border border-[#DBE2EF] text-xs font-bold flex items-center justify-center gap-2 transition-all group mt-2"
                >
                  <Eye className="w-4 h-4 text-[#3F72AF] group-hover:scale-110 transition-transform" />
                  View Booked Students ({bookedCount})
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ROSTER MODAL: VIEW BOOKED STUDENTS */}
      {activeRosterSlot && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DBE2EF] rounded-3xl shadow-[0_25px_70px_rgba(17,45,78,0.22)] max-w-2xl w-full p-5 sm:p-6 space-y-5 max-h-[90vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DBE2EF] pb-4">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-[#E8F1FD] text-[#19376D] border border-[#DBE2EF] text-[10px] font-bold uppercase mb-1 inline-block">
                  Lesson Roster • Max 10 Students
                </span>
                <h3 className="text-lg font-black text-[#0B2447] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#3F72AF]" />
                  {activeRosterSlot.lessonTitle || 'Lesson Roster'}
                </h3>
                <p className="text-xs text-[#4B6584] mt-0.5">
                  {format(new Date(activeRosterSlot.date), 'EEEE, MMMM dd, yyyy')} •{' '}
                  <strong className="text-[#3F72AF]">{activeRosterSlot.startTime} – {activeRosterSlot.endTime}</strong> •{' '}
                  {activeRosterSlot.branch} Branch
                </p>
              </div>

              <button
                onClick={() => setActiveRosterSlot(null)}
                className="w-8 h-8 rounded-full bg-[#F0F4F8] hover:bg-[#DBE2EF] text-[#112D4E] hover:text-[#0B2447] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Attendance Summary */}
            <div className="p-3.5 bg-[#F8FAFD] rounded-2xl border border-[#DBE2EF] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#4B6584] block text-[10px] uppercase font-bold">Enrolled Headcount</span>
                <span className="text-base font-black text-[#0B2447]">
                  {activeRosterSlot.bookedStudents?.length || 0} of {activeRosterSlot.capacity || 10} Students Booked
                </span>
              </div>
              <span
                className={`badge text-xs font-bold ${
                  (activeRosterSlot.bookedStudents?.length || 0) >= (activeRosterSlot.capacity || 10)
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {(activeRosterSlot.bookedStudents?.length || 0) >= (activeRosterSlot.capacity || 10)
                  ? 'Capacity Full'
                  : `${(activeRosterSlot.capacity || 10) - (activeRosterSlot.bookedStudents?.length || 0)} Open Seats`}
              </span>
            </div>

            {/* Students List */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {(!activeRosterSlot.bookedStudents || activeRosterSlot.bookedStudents.length === 0) ? (
                <div className="py-12 text-center space-y-2">
                  <Users className="w-10 h-10 text-[#94A3B8] mx-auto" />
                  <p className="text-sm font-bold text-[#0B2447]">No students booked in this session yet</p>
                  <p className="text-xs text-[#4B6584]">
                    Eligible Type 1 & Type 2 students can book this lesson on their dashboard.
                  </p>
                </div>
              ) : (
                activeRosterSlot.bookedStudents.map((st, idx) => {
                  const isType1 = st.studentType?.includes('1');

                  return (
                    <div
                      key={st.bookingId || idx}
                      className="p-4 rounded-2xl bg-[#F8FAFD] border border-[#DBE2EF] hover:border-[#3F72AF] space-y-3 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#DBE2EF] border border-[#DBE2EF] flex items-center justify-center font-black text-[#112D4E] text-sm">
                            {st.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-extrabold text-[#0B2447]">{st.name}</h4>
                              <span
                                className={`badge text-[9px] font-black uppercase ${
                                  isType1
                                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {isType1 ? 'Type 1: New Learner' : 'Type 2: Trial Ready'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#4B6584] mt-1">
                              <span className="flex items-center gap-1 text-[#112D4E] font-medium">
                                <Phone className="w-3 h-3 text-[#3F72AF]" /> {st.phone}
                              </span>
                              {st.email && st.email !== 'N/A' && (
                                <span className="flex items-center gap-1 text-[#4B6584]">
                                  <Mail className="w-3 h-3 text-[#64748B]" /> {st.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="badge badge-success text-[10px] font-bold capitalize">
                          {st.bookingStatus || 'Confirmed'}
                        </span>
                      </div>

                      {/* Package & Quota Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#DBE2EF] text-[11px]">
                        <div>
                          <span className="text-[#64748B] block text-[10px] font-medium">Package:</span>
                          <strong className="text-[#0B2447] font-bold">{st.packageType || 'Standard Package'}</strong>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[10px] font-medium">Payment Plan:</span>
                          <strong className="text-[#3F72AF] capitalize font-bold">
                            {st.paymentPlan === 'installments'
                              ? '3 Installments'
                              : st.paymentPlan === 'single'
                              ? 'Single Lesson'
                              : 'Full Upfront'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[10px] font-medium">Booking Time:</span>
                          <span className="text-[#4B6584]">
                            {st.bookedAt ? format(new Date(st.bookedAt), 'MMM dd, hh:mm a') : 'Confirmed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-[#DBE2EF] flex justify-end">
              <button
                onClick={() => setActiveRosterSlot(null)}
                className="btn-secondary text-xs py-2 px-4 font-bold"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD DAILY LESSON FOR INSTRUCTORS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DBE2EF] rounded-3xl shadow-[0_25px_70px_rgba(17,45,78,0.22)] max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-[#DBE2EF] pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-[#E8F1FD] text-[#19376D] border border-[#DBE2EF] text-[10px] font-bold uppercase mb-1 inline-block">
                  Instructor Session Creator
                </span>
                <h3 className="text-base font-extrabold text-[#0B2447] flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#3F72AF]" /> Schedule Daily Lesson Session
                </h3>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F0F4F8] hover:bg-[#DBE2EF] text-[#112D4E] hover:text-[#0B2447] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-4 text-xs">
              {/* Quick Topic Preset Selector */}
              <div>
                <label className="block font-bold text-[#112D4E] mb-1.5">Quick Curriculum Preset:</label>
                <select
                  onChange={(e) => {
                    const preset = PRESET_TOPICS[e.target.value];
                    if (preset) {
                      setNewLessonForm((prev) => ({
                        ...prev,
                        lessonTitle: preset.title,
                        lessonTopic: preset.topic,
                        vehicleCategory: preset.category,
                        vehicleType: preset.type,
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFD] border border-[#DBE2EF] text-[#0B2447] font-bold outline-none focus:border-[#3F72AF] transition-colors cursor-pointer"
                >
                  <option value="">-- Choose a standard syllabus topic --</option>
                  {PRESET_TOPICS.map((p, i) => (
                    <option key={i} value={i}>
                      {p.title} ({p.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson Title */}
              <div>
                <label className="block font-bold text-[#112D4E] mb-1">Lesson Title:</label>
                <input
                  type="text"
                  required
                  value={newLessonForm.lessonTitle}
                  onChange={(e) => setNewLessonForm({ ...newLessonForm, lessonTitle: e.target.value })}
                  placeholder="e.g., Morning Highway Driving & Overtaking"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFD] border border-[#DBE2EF] text-[#0B2447] outline-none focus:border-[#3F72AF] transition-colors"
                />
              </div>

              {/* Lesson Topic */}
              <div>
                <label className="block font-bold text-[#112D4E] mb-1">Key Maneuvers / Topic Description:</label>
                <textarea
                  rows={2}
                  value={newLessonForm.lessonTopic}
                  onChange={(e) => setNewLessonForm({ ...newLessonForm, lessonTopic: e.target.value })}
                  placeholder="Describe skills practiced (e.g. parallel parking, hill starts, clutch control)..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8FAFD] border border-[#DBE2EF] text-[#0B2447] outline-none focus:border-[#3F72AF] transition-colors"
                />
              </div>

              {/* Date & Branch */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#112D4E] mb-1">Date:</label>
                  <input
                    type="date"
                    required
                    value={newLessonForm.date}
                    onChange={(e) => setNewLessonForm({ ...newLessonForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFD] border border-[#DBE2EF] text-[#0B2447] outline-none focus:border-[#3F72AF] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#112D4E] mb-1">Branch:</label>
                  <select
                    value={newLessonForm.branch}
                    onChange={(e) => setNewLessonForm({ ...newLessonForm, branch: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFD] border border-[#DBE2EF] text-[#0B2447] font-bold outline-none focus:border-[#3F72AF] transition-colors cursor-pointer"
                  >
                    <option value="Maharagama">Maharagama Branch</option>
                    <option value="Werahara">Werahara Branch</option>
                    <option value="Delgoda">Delgoda Branch</option>
                  </select>
                </div>
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#112D4E] mb-1">Start Time:</label>
                  <input
                    type="time"
                    required
                    value={newLessonForm.startTime}
                    onChange={(e) => setNewLessonForm({ ...newLessonForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFD] border border-[#DBE2EF] text-[#0B2447] outline-none focus:border-[#3F72AF] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#112D4E] mb-1">End Time:</label>
                  <input
                    type="time"
                    required
                    value={newLessonForm.endTime}
                    onChange={(e) => setNewLessonForm({ ...newLessonForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFD] border border-[#DBE2EF] text-[#0B2447] outline-none focus:border-[#3F72AF] transition-colors"
                  />
                </div>
              </div>

              {/* Vehicle Type & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#112D4E] mb-1">Vehicle Type:</label>
                  <select
                    value={newLessonForm.vehicleType}
                    onChange={(e) => {
                      const vType = e.target.value;
                      setNewLessonForm({
                        ...newLessonForm,
                        vehicleType: vType,
                        vehicleCategory: vType === 'HeavyVehicle_Bus' ? 'Heavy' : 'Light',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFD] border border-[#DBE2EF] text-[#0B2447] font-bold outline-none focus:border-[#3F72AF] transition-colors cursor-pointer"
                  >
                    <option value="Car">Car (Auto / Manual)</option>
                    <option value="Bike">Motorcycle / Bike</option>
                    <option value="ThreeWheeler">Three-Wheeler</option>
                    <option value="HeavyVehicle_Bus">Heavy Vehicle (Bus / Truck)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#112D4E] mb-1">Capacity Limit:</label>
                  <div className="w-full px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                    10 Students (System Limit)
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DBE2EF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSlot}
                  className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5"
                >
                  {submittingSlot ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Scheduling...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Create Lesson Session
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
