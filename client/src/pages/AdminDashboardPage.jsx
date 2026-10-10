import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Users,
  CreditCard,
  Calendar,
  Award,
  TrendingUp,
  MapPin,
  RefreshCw,
  Clock,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Search,
  User,
  Building2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const safeFormatDate = (dateVal, formatStr = 'MMM dd, yyyy', fallback = '') => {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
};

const PALETTE_CHART_COLORS = ['#1B3D59', '#6A97C0', '#B3D5F1', '#F3EED8', '#152026'];

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [availableBranches, setAvailableBranches] = useState([]);

  // Student Account Management & Verification State
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentVerificationFilter, setStudentVerificationFilter] = useState('all'); // 'all' | 'pending' | 'verified'
  const [studentSearch, setStudentSearch] = useState('');
  const [verifyingStudentId, setVerifyingStudentId] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics', {
        params: { branch: selectedBranch },
      });
      if (res.data.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      toast.error('Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await api.get('/students', {
        params: { branch: selectedBranch !== 'All' ? selectedBranch : undefined },
      });
      if (res.data?.success && Array.isArray(res.data.students)) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.warn('Failed to load students in admin dashboard:', err.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchAvailableBranches = async () => {
    try {
      const res = await api.get('/branches/active');
      if (res.data?.success && Array.isArray(res.data.branches)) {
        setAvailableBranches(res.data.branches);
      }
    } catch (err) {
      console.warn('Failed to load active branches:', err.message);
    }
  };

  useEffect(() => {
    fetchAvailableBranches();
  }, []);

  useEffect(() => {
    fetchAnalytics();
    fetchStudents();
  }, [selectedBranch]);

  const handleVerifyStudent = async (studentId, studentName = 'Student') => {
    setVerifyingStudentId(studentId);
    try {
      const res = await api.patch(`/admin/students/${studentId}/verify`, { status: 'Verified' });
      if (res.data?.success) {
        toast.success(`Student "${studentName}" has been successfully verified!`);
        // Immediately reflect the updated status in the Admin Dashboard
        setStudents((prev) =>
          prev.map((s) => {
            if (s._id === studentId || s.userId?._id === studentId) {
              return {
                ...s,
                verificationStatus: 'Verified',
                account_status: 'Verified',
                accountStatus: 'active',
                verifiedAt: new Date(),
                userId: s.userId
                  ? {
                      ...s.userId,
                      verificationStatus: 'Verified',
                      status: 'active',
                      account_status: 'Verified',
                    }
                  : s.userId,
              };
            }
            return s;
          })
        );
        fetchAnalytics();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify student');
    } finally {
      setVerifyingStudentId(null);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-[#1B3D59] font-bold text-sm bg-white px-6 py-3 rounded-2xl border border-[#D4EEF8] shadow-md">
          <RefreshCw className="w-5 h-5 animate-spin text-[#1B3D59]" /> Compiling Academy Analytics...
        </div>
      </div>
    );
  }

  const { metrics, branchData, trialDistribution, upcomingTrials, recentActivity } = analytics;

  const pendingCount = students.filter(
    (s) => (s.verificationStatus || s.userId?.verificationStatus) === 'Pending Verification'
  ).length;

  const verifiedCount = students.filter(
    (s) => (s.verificationStatus || s.userId?.verificationStatus) === 'Verified'
  ).length;

  const filteredStudents = students.filter((s) => {
    const status = s.verificationStatus || s.userId?.verificationStatus || 'Pending Verification';
    if (studentVerificationFilter === 'pending' && status !== 'Pending Verification') return false;
    if (studentVerificationFilter === 'verified' && status !== 'Verified') return false;
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase().trim();
      const name = (s.userId?.name || s.name || '').toLowerCase();
      const email = (s.userId?.email || s.email || '').toLowerCase();
      const phone = (s.userId?.phone || s.phone || '').toLowerCase();
      const nic = (s.userId?.nic || s.nic || '').toLowerCase();
      if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !nic.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-xs mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> Executive Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#152026] flex items-center gap-2.5">
            Executive Administrative Dashboard
          </h1>
          <p className="text-xs text-slate-700 mt-0.5 font-semibold">
            Cross-branch operational performance, DMT milestone outcomes, and financial overview.
          </p>
        </div>

        {/* Branch Filter & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#152026]">Branch:</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3.5 py-2 border border-[#D4EEF8] rounded-xl text-xs bg-white font-bold text-[#152026] outline-none shadow-xs focus:border-[#1B3D59]"
            >
              <option value="All">All Branches Combined</option>
              {availableBranches.length > 0 ? (
                availableBranches.map((b) => (
                  <option key={b._id} value={b.name}>
                    {b.name} Branch ({b.code})
                  </option>
                ))
              ) : (
                <>
                  <option value="Maharagama">Maharagama Branch</option>
                  <option value="Werahara">Werahara Branch</option>
                  <option value="Delgoda">Delgoda Branch</option>
                </>
              )}
            </select>
          </div>

          <button onClick={() => { fetchAnalytics(); fetchStudents(); }} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold shadow-xs cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5 text-[#1B3D59]" /> Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        {/* Card 1: Active Learners */}
        <div className="card p-5 space-y-2 border-l-4 border-l-[#1B3D59] border-[#D4EEF8] bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Active Enrolled Learners</span>
            <div className="w-8 h-8 rounded-xl bg-[#D4EEF8] border border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#152026]">{metrics.totalStudents}</div>
          <p className="text-[11px] text-slate-600 font-medium">{metrics.activeStudents} active in training</p>
        </div>

        {/* Card 2: Pending Student Account Verifications */}
        <div className="card p-5 space-y-2 border-l-4 border-l-amber-500 border-amber-200 bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Pending Student Verifications</span>
            <div className="w-8 h-8 rounded-xl bg-[#F3EED8] border border-amber-300 flex items-center justify-center text-amber-800">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-800">{pendingCount}</div>
          <button
            type="button"
            onClick={() => {
              setStudentVerificationFilter('pending');
              const el = document.getElementById('student-management-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-[11px] font-bold text-[#1B3D59] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
          >
            Review & Verify Students <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3: Pending Payments */}
        <div className="card p-5 space-y-2 border-l-4 border-l-amber-500 border-amber-200 bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Pending Payment Slips</span>
            <div className="w-8 h-8 rounded-xl bg-[#F3EED8] border border-amber-300 flex items-center justify-center text-amber-800">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-800">{metrics.pendingPaymentsCount}</div>
          <Link
            to="/staff/payments"
            className="text-[11px] font-bold text-[#1B3D59] hover:underline flex items-center gap-1 transition-colors"
          >
            Review Queue <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3: Upcoming DMT Trials */}
        <div className="card p-5 space-y-2 border-l-4 border-l-[#1B3D59] border-[#D4EEF8] bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Upcoming DMT Trials</span>
            <div className="w-8 h-8 rounded-xl bg-[#D4EEF8] border border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#152026]">{metrics.upcomingTrialsCount}</div>
          <p className="text-[11px] text-slate-600 font-medium">Scheduled in the next 30 days</p>
        </div>

        {/* Card 4: Confirmed Revenue */}
        <div className="card p-5 space-y-2 border-l-4 border-l-emerald-600 border-[#D4EEF8] bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Confirmed Revenue (LKR)</span>
            <div className="w-8 h-8 rounded-xl bg-[#D4EEF8] border border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#1B3D59]">
            Rs. {metrics.totalRevenue?.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-600 font-medium">Across verified packages</p>
        </div>
      </div>

      {/* Executive Quick Links Bar: Question Lists */}
      <div className="p-5 sm:p-6 bg-[#1B3D59] text-white rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-[#B3D5F1]/20">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0 shadow-inner">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-wide" style={{ color: '#FFFFFF' }}>
              DMT Exam Question Lists Management
            </h3>
            <p className="text-xs text-[#D4EEF8] font-medium mt-0.5">
              Create multiple question lists, manage trilingual questions, and configure exam pass benchmarks.
            </p>
          </div>
        </div>
        <Link
          to="/admin/question-lists"
          className="px-4 py-2.5 rounded-xl bg-white text-[#1B3D59] hover:bg-[#D4EEF8] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors shrink-0 self-start sm:self-center cursor-pointer"
        >
          Manage Question Lists <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branch Registrations Comparison */}
        <div className="card p-6 rounded-2xl bg-white border border-[#D4EEF8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#1B3D59] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1B3D59]" /> Branch Registrations Comparison
              </h2>
              <p className="text-[11px] text-[#475569]">Enrolled learners per operational branch</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] text-[10px] font-bold">3 Branches</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4EEF8" />
                <XAxis dataKey="branch" tick={{ fill: '#6A97C0', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6A97C0', fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [
                    name === 'students' ? `${val} Learners` : `Rs. ${val.toLocaleString()}`,
                    name === 'students' ? 'Students' : 'Revenue',
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#D4EEF8',
                    borderRadius: '12px',
                    color: '#152026',
                    boxShadow: '0 4px 15px rgba(21, 32, 38, 0.08)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#6A97C0' }} />
                <Bar dataKey="students" fill="#1B3D59" name="Enrolled Students" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trial Pass Rate Breakdown Donut Chart */}
        <div className="card p-6 rounded-2xl bg-white border border-[#D4EEF8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#1B3D59] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#1B3D59]" /> DMT Practical Trial Outcome Distribution
              </h2>
              <p className="text-[11px] text-[#475569]">Pass rates across 1st, 2nd, and 3rd trial attempts</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">Trial Success</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trialDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {trialDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE_CHART_COLORS[index % PALETTE_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Learners`, name]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#D4EEF8',
                    borderRadius: '12px',
                    color: '#152026',
                    boxShadow: '0 4px 15px rgba(21, 32, 38, 0.08)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#6A97C0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Branch Management Section */}
      <div id="branch-management-section" className="card p-6 sm:p-7 rounded-3xl bg-white border border-[#D4EEF8] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4EEF8] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-xs mb-1.5 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-[#1B3D59]" /> Multi-Branch Infrastructure
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#152026] flex items-center gap-2.5">
              Branch Management & Operations
            </h2>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Manage driving school branches, facility managers, student distribution, and center allocations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/branches"
              className="btn-primary text-xs py-2 px-4.5 font-bold flex items-center gap-2 rounded-xl shadow-xs"
            >
              <Building2 className="w-4 h-4" /> Open Branch Management Portal <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Branch Cards Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableBranches.map((b) => {
            const branchStat = branchData?.find((bd) => bd.branch === b.name);
            return (
              <div
                key={b._id}
                className="p-4 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] hover:border-[#6A97C0] transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#D4EEF8] text-[#1B3D59] flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#152026] text-sm">{b.name} Branch</h4>
                      <span className="text-[10px] font-mono font-bold text-slate-500">{b.code}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                    Active
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#1B3D59] shrink-0" />
                    <span className="truncate">{b.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Manager: <strong>{b.manager || 'Assigned Staff'}</strong></span>
                  </p>
                </div>

                <div className="pt-2 border-t border-[#D4EEF8] flex items-center justify-between text-xs font-bold text-[#1B3D59]">
                  <span>{branchStat ? `${branchStat.students} Enrolled` : 'Operational Center'}</span>
                  <Link
                    to="/admin/branches"
                    className="text-[11px] text-[#1B3D59] hover:underline flex items-center gap-1"
                  >
                    Manage →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Management & Account Verification */}
      <div id="student-management-section" className="card p-6 sm:p-7 rounded-3xl bg-white border border-[#D4EEF8] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4EEF8] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-xs mb-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1B3D59]" /> Student Account Verification
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#152026] flex items-center gap-2.5">
              Student Management
            </h2>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Display registered student profiles, verify pending accounts, and manage learner access.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026]">
              All Students: <strong>{students.length}</strong>
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F3EED8] text-[#152026] border border-amber-300 flex items-center gap-1.5 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              Pending: <strong>{pendingCount}</strong>
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified: <strong>{verifiedCount}</strong>
            </span>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setStudentVerificationFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                studentVerificationFilter === 'all'
                  ? 'bg-[#1B3D59] text-white shadow-xs'
                  : 'bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] hover:bg-[#D4EEF8]/40'
              }`}
            >
              All Students ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setStudentVerificationFilter('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                studentVerificationFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-[#F3EED8] border border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending Verification ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStudentVerificationFilter('verified')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                studentVerificationFilter === 'verified'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified ({verifiedCount})
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#6A97C0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search student name, email, NIC..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] rounded-xl text-xs font-medium focus:bg-white focus:border-[#1B3D59] outline-none transition-all placeholder:text-[#6A97C0]"
            />
          </div>
        </div>

        {/* Table of Students */}
        <div className="overflow-x-auto rounded-2xl border border-[#D4EEF8]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1B3D59] text-white text-[11px] font-black uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student Name & Account</th>
                <th className="py-3 px-4">Contact & Branch</th>
                <th className="py-3 px-4">Curriculum</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-center">Verification Status</th>
                <th className="py-3 px-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4EEF8] text-xs">
              {loadingStudents ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6A97C0] font-medium">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#1B3D59] mb-2" />
                    Loading student list...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6A97C0] font-medium">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const studentName = st.userId?.name || st.name || 'Student';
                  const studentEmail = st.userId?.email || st.email || '—';
                  const studentPhone = st.userId?.phone || st.phone || '—';
                  const studentBranch = st.branch || st.userId?.branch || 'Maharagama';
                  const isVerified = (st.verificationStatus || st.userId?.verificationStatus) === 'Verified';
                  const studentCategory =
                    st.studentType === 'Type2_TrialReady' || st.student_type === 'Type 2'
                      ? 'Type 2 (Trial-Ready)'
                      : 'Type 1 (New Learner)';

                  return (
                    <tr key={st._id} className="hover:bg-[#D4EEF8]/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-[#152026] text-sm">{studentName}</div>
                        <div className="text-[11px] text-[#6A97C0] font-medium truncate max-w-[220px]">{studentEmail}</div>
                        {st.userId?.username && (
                          <div className="text-[10px] text-[#1B3D59] font-mono">@{st.userId.username}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#152026]">{studentPhone}</div>
                        <div className="text-[11px] text-slate-600 font-medium">{studentBranch} Branch</div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-[#152026]">
                        {studentCategory}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {safeFormatDate(st.createdAt || st.userId?.createdAt, 'MMM dd, yyyy', 'Recent')}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#F3EED8] text-[#152026] border border-amber-300 shadow-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                            Pending Verification
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isVerified ? (
                          <div className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Approved</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleVerifyStudent(st._id, studentName)}
                            disabled={verifyingStudentId === st._id}
                            className="btn-primary text-xs py-1.5 px-3.5 font-bold inline-flex items-center gap-1.5 rounded-xl shadow-xs cursor-pointer hover:shadow transition-all"
                            title="Verify and approve student account"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-300" />
                            <span>{verifyingStudentId === st._id ? 'Verifying...' : 'Verify Student'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section: Upcoming Trials & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Trials List */}
        <div className="card p-6 rounded-2xl bg-white border border-[#D4EEF8] space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-2.5">
            <h3 className="text-sm font-bold text-[#1B3D59] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1B3D59]" /> Upcoming Practical DMT Trials
            </h3>
            <span className="text-[11px] text-[#6A97C0] font-semibold">{upcomingTrials.length} Scheduled</span>
          </div>

          {upcomingTrials.length === 0 ? (
            <p className="text-xs text-[#6A97C0] italic py-4">No upcoming trials scheduled in the next 30 days.</p>
          ) : (
            <div className="divide-y divide-[#D4EEF8]">
              {upcomingTrials.map((s) => (
                <div key={s._id} className="py-3 flex items-center justify-between text-xs hover:bg-[#D4EEF8]/20 px-2 rounded-xl transition-colors">
                  <div>
                    <p className="font-bold text-[#152026] text-sm">{s.userId?.name}</p>
                    <p className="text-[11px] text-[#475569]">{s.branch} Branch • {s.userId?.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F3EED8] text-[#152026] border border-amber-300 text-[10px] font-bold">
                      {safeFormatDate(s.trial_date || s.trial?.trialDate || s.trial?.scheduledDate, 'MMM dd, yyyy', 'Pending')}
                    </span>
                    <p className="text-[10px] text-[#6A97C0] mt-1">Attempt #{s.trial?.attempts?.length ? s.trial.attempts.length + 1 : (s.trial?.currentAttempt || 1)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payment Activity */}
        <div className="card p-6 rounded-2xl bg-white border border-[#D4EEF8] space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-2.5">
            <h3 className="text-sm font-bold text-[#1B3D59] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#1B3D59]" /> Recent Payment Activity
            </h3>
            <Link to="/staff/payments" className="text-[11px] text-[#1B3D59] font-bold hover:underline">
              View All Queue →
            </Link>
          </div>

          {recentActivity?.recentPayments?.length === 0 ? (
            <p className="text-xs text-[#6A97C0] italic py-4">No payment activity recorded yet.</p>
          ) : (
            <div className="divide-y divide-[#D4EEF8]">
              {recentActivity.recentPayments.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between text-xs hover:bg-[#D4EEF8]/20 px-2 rounded-xl transition-colors">
                  <div>
                    <p className="font-bold text-[#152026] text-sm">{p.userId?.name}</p>
                    <p className="text-[11px] text-[#475569]">
                      {p.bankName} • {safeFormatDate(p?.uploadedAt, 'MMM dd, yyyy', '')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1B3D59] text-sm">Rs. {p.amount?.toLocaleString()}</p>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold mt-1 ${
                        p.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : p.status === 'rejected'
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-[#F3EED8] text-[#152026] border border-amber-300'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
