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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-300 font-bold text-sm bg-slate-900/80 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" /> Compiling Academy Analytics...
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Executive Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading flex items-center gap-2.5 drop-shadow">
            Executive Administrative Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-branch operational performance, DMT milestone outcomes, and financial overview.
          </p>
        </div>

        {/* Branch Filter & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-300">Branch:</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3.5 py-2 border border-white/20 rounded-xl text-xs bg-slate-900/90 font-bold text-cyan-300 outline-none shadow-sm backdrop-blur-md"
            >
              <option value="All">All Branches Combined</option>
              <option value="Maharagama">Maharagama Branch</option>
              <option value="Werahara">Werahara Branch</option>
              <option value="Delgoda">Delgoda Branch</option>
            </select>
          </div>

          <button onClick={fetchAnalytics} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="card card-hover p-5 space-y-2 border-l-4 border-l-cyan-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Enrolled Learners</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{metrics.totalStudents}</div>
          <p className="text-[11px] text-slate-400">{metrics.activeStudents} active in training</p>
        </div>

        {/* Card 2 */}
        <div className="card card-hover p-5 space-y-2 border-l-4 border-l-amber-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Payment Slips</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-300">{metrics.pendingPaymentsCount}</div>
          <Link
            to="/staff/payments"
            className="text-[11px] font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 transition-colors"
          >
            Review Queue <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3 */}
        <div className="card card-hover p-5 space-y-2 border-l-4 border-l-emerald-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Upcoming DMT Trials</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{metrics.upcomingTrialsCount}</div>
          <p className="text-[11px] text-slate-400">Scheduled in the next 30 days</p>
        </div>

        {/* Card 4 */}
        <div className="card card-hover p-5 space-y-2 border-l-4 border-l-accent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Confirmed Revenue (LKR)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-accent font-heading">
            Rs. {metrics.totalRevenue?.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Across verified packages</p>
        </div>
      </div>

      {/* Visual Charts Grid: Branch Comparison + Trial Pass Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branch Registrations Comparison */}
        <div className="card space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" /> Branch Registrations Comparison
              </h2>
              <p className="text-[11px] text-slate-400">Enrolled learners per operational branch</p>
            </div>
            <span className="badge badge-info text-[10px]">3 Branches</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="branch" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [
                    name === 'students' ? `${val} Learners` : `Rs. ${val.toLocaleString()}`,
                    name === 'students' ? 'Students' : 'Revenue',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="students" fill="#0B5FA5" name="Enrolled Students" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trial Pass Rate Breakdown Donut Chart */}
        <div className="card space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" /> DMT Practical Trial Outcome Distribution
              </h2>
              <p className="text-[11px] text-slate-400">Pass rates across 1st, 2nd, and 3rd trial attempts</p>
            </div>
            <span className="badge badge-success text-[10px]">Trial Success</span>
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Learners`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Upcoming Trials & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Trials List */}
        <div className="card space-y-3 shadow-card">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" /> Upcoming Practical DMT Trials
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">{upcomingTrials.length} Scheduled</span>
          </div>

          {upcomingTrials.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No upcoming trials scheduled in the next 30 days.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {upcomingTrials.map((s) => (
                <div key={s._id} className="py-3 flex items-center justify-between text-xs hover:bg-white/5 px-2 rounded-xl transition-colors">
                  <div>
                    <p className="font-bold text-white text-sm">{s.userId?.name}</p>
                    <p className="text-[11px] text-slate-400">{s.branch} Branch • {s.userId?.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-warning text-[10px]">
                      {s.trial?.scheduledDate ? format(new Date(s.trial.scheduledDate), 'MMM dd, yyyy') : 'Pending'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">Attempt #{s.trial?.currentAttempt || 1}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payment Activity */}
        <div className="card space-y-3 shadow-card">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" /> Recent Payment Activity
            </h3>
            <Link to="/staff/payments" className="text-[11px] text-cyan-300 font-bold hover:underline">
              View All Queue →
            </Link>
          </div>

          {recentActivity?.recentPayments?.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No payment activity recorded yet.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {recentActivity.recentPayments.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between text-xs hover:bg-white/5 px-2 rounded-xl transition-colors">
                  <div>
                    <p className="font-bold text-white text-sm">{p.userId?.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {p.bankName} • {p.uploadedAt ? format(new Date(p.uploadedAt), 'MMM dd, yyyy') : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent text-sm">Rs. {p.amount?.toLocaleString()}</p>
                    <span
                      className={`badge text-[9px] py-0 px-2 mt-1 ${
                        p.status === 'confirmed'
                          ? 'badge-success'
                          : p.status === 'rejected'
                          ? 'badge-danger'
                          : 'badge-warning'
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
