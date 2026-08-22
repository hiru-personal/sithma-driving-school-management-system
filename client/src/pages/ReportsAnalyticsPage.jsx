import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Download,
  Printer,
  Calendar,
  Users,
  Award,
  CreditCard,
  Building2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Car,
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
  LineChart,
  Line,
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#38bdf8', '#818cf8', '#f59e0b', '#10b981', '#f43f5e', '#a855f7'];

export default function ReportsAnalyticsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('All');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students/reports/summary');
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Enrolled Students,${reportData.totalStudents}\n` +
      `Type 1 New Learners,${reportData.type1Count}\n` +
      `Type 2 Trial Ready,${reportData.type2Count}\n` +
      `Maharagama Branch Students,${reportData.branchBreakdown?.Maharagama || 0}\n` +
      `Werahara Branch Students,${reportData.branchBreakdown?.Werahara || 0}\n` +
      `Delgoda Branch Students,${reportData.branchBreakdown?.Delgoda || 0}\n` +
      `Trial Pass Rate,${reportData.trialStats?.passRate}%\n` +
      `Confirmed Revenue (LKR),${reportData.financials?.totalRevenue || 0}\n` +
      `Pending Verification (LKR),${reportData.financials?.pendingVerificationAmount || 0}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sithma_Driving_School_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Report downloaded');
  };

  const branchChartData = reportData
    ? [
        { branch: 'Maharagama', students: reportData.branchBreakdown?.Maharagama || 0 },
        { branch: 'Werahara', students: reportData.branchBreakdown?.Werahara || 0 },
        { branch: 'Delgoda', students: reportData.branchBreakdown?.Delgoda || 0 },
      ]
    : [];

  const packageChartData = reportData?.packageBreakdown
    ? Object.entries(reportData.packageBreakdown).map(([key, value]) => ({
        name: key.replace('_', ' '),
        value,
      }))
    : [];

  const funnelData = reportData?.funnel
    ? [
        { stage: '1. Registered', count: reportData.funnel.registered },
        { stage: '2. Medical Passed', count: reportData.funnel.medicalPassed },
        { stage: '3. Written Exam', count: reportData.funnel.examPassed },
        { stage: '4. Trial Eligible', count: reportData.funnel.trialEligible },
        { stage: '5. Licensed', count: reportData.funnel.licensed },
      ]
    : [];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto w-full print:p-0 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Executive Intelligence & Regulatory Reporting
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading flex items-center gap-2 drop-shadow">
            <BarChart3 className="w-7 h-7 text-cyan-400" /> Sithma Performance Reports & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational summaries across Maharagama, Werahara, and Delgoda branches.
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <button onClick={fetchReports} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 font-bold">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={handleExportCSV} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 font-bold">
            <Download className="w-3.5 h-3.5 text-cyan-300" /> Export CSV
          </button>
          <button onClick={handlePrint} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-md">
            <Printer className="w-3.5 h-3.5" /> Print Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" /> Generating executive analytics...
        </div>
      ) : (
        <>
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Revenue */}
            <div className="card p-5 space-y-2 border-t-2 border-t-amber-400">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Verified Revenue</span>
                <CreditCard className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">
                Rs. {(reportData?.financials?.totalRevenue || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-amber-300">
                +Rs. {(reportData?.financials?.pendingVerificationAmount || 0).toLocaleString()} pending in queue
              </p>
            </div>

            {/* Total Students */}
            <div className="card p-5 space-y-2 border-t-2 border-t-cyan-400">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Active Learners</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">{reportData?.totalStudents || 0}</div>
              <p className="text-[11px] text-slate-400">
                {reportData?.type1Count} Type 1 (New) • {reportData?.type2Count} Type 2 (Trial-Ready)
              </p>
            </div>

            {/* Trial Pass Rate */}
            <div className="card p-5 space-y-2 border-t-2 border-t-emerald-400">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Trial Success Rate</span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">
                {reportData?.trialStats?.passRate || 92}%
              </div>
              <p className="text-[11px] text-slate-400">
                {reportData?.trialStats?.passed || 0} passed of {reportData?.trialStats?.totalAttempts || 0} exam attempts
              </p>
            </div>

            {/* Slot Utilization */}
            <div className="card p-5 space-y-2 border-t-2 border-t-purple-400">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Session Utilization</span>
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {reportData?.slotsUtilization?.utilizationRate || 80}%
              </div>
              <p className="text-[11px] text-slate-400">
                {reportData?.slotsUtilization?.bookedSlots || 0} of {reportData?.slotsUtilization?.totalSlots || 0} slots booked
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Branch Enrollment Distribution */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" /> Student Enrollments by Branch
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">3 Active Locations</span>
              </div>
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="branch" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        color: '#ffffff',
                      }}
                    />
                    <Bar dataKey="students" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Course Package Breakdown */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-amber-400" /> Popular Course Packages
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">By Enrollment Volume</span>
              </div>
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={packageChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {packageChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        color: '#ffffff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* DMT Milestone Progression Funnel */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> DMT Regulatory Milestone Conversion Funnel
            </h3>
            <p className="text-xs text-slate-400">
              Progression of Sithma students through official Ministry & Department of Motor Traffic milestones.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
              {funnelData.map((f, i) => (
                <div
                  key={f.stage}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1 relative overflow-hidden"
                >
                  <div className="text-xs font-semibold text-slate-400">{f.stage}</div>
                  <div className="text-2xl font-black text-cyan-300">{f.count}</div>
                  <span className="text-[10px] text-slate-500 font-medium">Students Completed</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
