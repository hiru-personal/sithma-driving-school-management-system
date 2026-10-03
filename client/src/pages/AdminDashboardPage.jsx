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

  useEffect(() => {
    fetchAnalytics();
  }, [selectedBranch]);

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
          <p className="text-xs text-[#475569] mt-0.5">
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
              <option value="Maharagama">Maharagama Branch</option>
              <option value="Werahara">Werahara Branch</option>
              <option value="Delgoda">Delgoda Branch</option>
            </select>
          </div>

          <button onClick={fetchAnalytics} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold shadow-xs cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5 text-[#1B3D59]" /> Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Learners */}
        <div className="card p-5 space-y-2 border-l-4 border-l-[#1B3D59] border-[#D4EEF8] bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6A97C0]">Active Enrolled Learners</span>
            <div className="w-8 h-8 rounded-xl bg-[#D4EEF8] border border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#152026]">{metrics.totalStudents}</div>
          <p className="text-[11px] text-[#475569]">{metrics.activeStudents} active in training</p>
        </div>

        {/* Card 2: Pending Payments */}
        <div className="card p-5 space-y-2 border-l-4 border-l-amber-400 border-amber-200 bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Pending Payment Slips</span>
            <div className="w-8 h-8 rounded-xl bg-[#F3EED8] border border-amber-300 flex items-center justify-center text-amber-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-700">{metrics.pendingPaymentsCount}</div>
          <Link
            to="/staff/payments"
            className="text-[11px] font-bold text-[#1B3D59] hover:underline flex items-center gap-1 transition-colors"
          >
            Review Queue <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3: Upcoming DMT Trials */}
        <div className="card p-5 space-y-2 border-l-4 border-l-[#6A97C0] border-[#D4EEF8] bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6A97C0]">Upcoming DMT Trials</span>
            <div className="w-8 h-8 rounded-xl bg-[#D4EEF8] border border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#152026]">{metrics.upcomingTrialsCount}</div>
          <p className="text-[11px] text-[#475569]">Scheduled in the next 30 days</p>
        </div>

        {/* Card 4: Confirmed Revenue */}
        <div className="card p-5 space-y-2 border-l-4 border-l-[#152026] border-[#D4EEF8] bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6A97C0]">Confirmed Revenue (LKR)</span>
            <div className="w-8 h-8 rounded-xl bg-[#D4EEF8] border border-[#6A97C0]/30 flex items-center justify-center text-[#1B3D59]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#1B3D59]">
            Rs. {metrics.totalRevenue?.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#475569]">Across verified packages</p>
        </div>
      </div>

      {/* Executive Quick Links Bar: Question Lists */}
      <div className="card p-5 sm:p-6 bg-[#1B3D59] text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border border-[#6A97C0]/30">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-[#D4EEF8] shrink-0">
            <Layers className="w-5 h-5 text-[#D4EEF8]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">DMT Exam Question Lists Management</h3>
            <p className="text-xs text-[#D4EEF8]">Create multiple question lists, manage trilingual questions, and configure exam pass benchmarks.</p>
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
                      {safeFormatDate(s.trial?.scheduledDate, 'MMM dd, yyyy', 'Pending')}
                    </span>
                    <p className="text-[10px] text-[#6A97C0] mt-1">Attempt #{s.trial?.currentAttempt || 1}</p>
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
