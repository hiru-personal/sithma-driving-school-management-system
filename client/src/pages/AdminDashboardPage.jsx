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
      <div className="min-h-screen bg-neutralBg flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" /> Compiling Academy Analytics...
        </div>
      </div>
    );
  }

  const { metrics, branchData, trialDistribution, upcomingTrials, recentActivity } = analytics;

  return (
    <div className="min-h-screen bg-neutralBg py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textMain font-heading flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary" /> Executive Administrative Dashboard
          </h1>
          <p className="text-xs text-textMuted mt-0.5">
            Cross-branch operational performance, DMT milestone outcomes, and financial overview.
          </p>
        </div>

        {/* Branch Filter & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-textMain">Branch:</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 border border-borderColor rounded-lg text-xs bg-white font-bold text-primary outline-none shadow-sm"
            >
              <option value="All">All Branches Combined</option>
              <option value="Maharagama">Maharagama Branch</option>
              <option value="Werahara">Werahara Branch</option>
              <option value="Delgoda">Delgoda Branch</option>
            </select>
          </div>

          <button onClick={fetchAnalytics} className="btn-secondary text-xs py-2 px-3">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="card card-hover p-5 space-y-2 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-textMuted">Active Enrolled Learners</span>
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-textMain">{metrics.totalStudents}</div>
          <p className="text-[11px] text-textMuted">{metrics.activeStudents} active in training</p>
        </div>

        {/* Card 2 */}
        <div className="card card-hover p-5 space-y-2 border-l-4 border-l-warning">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-textMuted">Pending Payment Slips</span>
            <div className="w-8 h-8 rounded-lg bg-warning-light flex items-center justify-center text-warning-dark">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-warning-dark">{metrics.pendingPaymentsCount}</div>
          <Link
            to="/staff/payments"
            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
          >
            Review Queue <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3 */}
        <div className="card card-hover p-5 space-y-2 border-l-4 border-l-success">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-textMuted">Upcoming DMT Trials</span>
            <div className="w-8 h-8 rounded-lg bg-success-light flex items-center justify-center text-success">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-textMain">{metrics.upcomingTrialsCount}</div>
          <p className="text-[11px] text-textMuted">Scheduled in the next 30 days</p>
        </div>

        {/* Card 4 */}
        <div className="card card-hover p-5 space-y-2 border-l-4 border-l-accent-dark">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-textMuted">Confirmed Revenue (LKR)</span>
            <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-accent-dark">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-primary font-heading">
            Rs. {metrics.totalRevenue?.toLocaleString()}
          </div>
          <p className="text-[11px] text-textMuted">Across verified packages</p>
        </div>
      </div>

      {/* Visual Charts Grid: Branch Comparison + Trial Pass Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branch Registrations & Revenue Comparison */}
        <div className="card space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-textMain flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Branch Registrations Comparison
              </h2>
              <p className="text-[11px] text-textMuted">Enrolled learners per operational branch</p>
            </div>
            <span className="badge badge-info text-[10px]">3 Branches</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="branch" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [
                    name === 'students' ? `${val} Learners` : `Rs. ${val.toLocaleString()}`,
                    name === 'students' ? 'Students' : 'Revenue',
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="students" fill="#0B5FA5" name="Enrolled Students" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trial Pass Rate Breakdown Donut Chart */}
        <div className="card space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-textMain flex items-center gap-2">
                <Award className="w-4 h-4 text-success" /> DMT Practical Trial Outcome Distribution
              </h2>
              <p className="text-[11px] text-textMuted">Pass rates across 1st, 2nd, and 3rd trial attempts</p>
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
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Upcoming Trials & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Trials List */}
        <div className="card space-y-3 shadow-card">
          <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> Upcoming Practical DMT Trials
          </h3>

          {upcomingTrials.length === 0 ? (
            <p className="text-xs text-textMuted italic py-4">No upcoming trials scheduled in the next 30 days.</p>
          ) : (
            <div className="divide-y divide-borderColor">
              {upcomingTrials.map((s) => (
                <div key={s._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-textMain">{s.userId?.name}</p>
                    <p className="text-[11px] text-textMuted">{s.branch} Branch • {s.userId?.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-warning text-[10px]">
                      {s.trial?.scheduledDate ? format(new Date(s.trial.scheduledDate), 'MMM dd, yyyy') : 'Pending'}
                    </span>
                    <p className="text-[10px] text-textMuted mt-0.5">Attempt #{s.trial?.currentAttempt || 1}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payment Activity */}
        <div className="card space-y-3 shadow-card">
          <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-accent-dark" /> Recent Payment Activity
          </h3>

          {recentActivity?.recentPayments?.length === 0 ? (
            <p className="text-xs text-textMuted italic py-4">No payment activity recorded yet.</p>
          ) : (
            <div className="divide-y divide-borderColor">
              {recentActivity.recentPayments.map((p) => (
                <div key={p._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-textMain">{p.userId?.name}</p>
                    <p className="text-[11px] text-textMuted">
                      {p.bankName} • {p.uploadedAt ? format(new Date(p.uploadedAt), 'MMM dd, yyyy') : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">Rs. {p.amount?.toLocaleString()}</p>
                    <span
                      className={`badge text-[9px] py-0 px-1.5 ${
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
