import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  History,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function QuizHistoryPage() {
  const { student } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttempts = async () => {
    if (!student?._id) return;
    setLoading(true);
    try {
      const res = await api.get(`/quiz/attempts/student/${student._id}`);
      if (res.data.success) {
        setAttempts(res.data.attempts);
      }
    } catch (err) {
      toast.error('Failed to load past quiz attempts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const chartData = [...attempts]
    .reverse()
    .map((att, idx) => ({
      attempt: `Attempt ${idx + 1}`,
      percentage: att.percentage,
      date: format(new Date(att.takenAt), 'MM/dd'),
    }));

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Performance Analytics
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2 drop-shadow">
            <History className="w-6 h-6 text-cyan-400" /> Practice Exam Score History
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track your performance improvements across multilingual DMT practice quizzes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchAttempts} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link to="/student/quiz" className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 shadow-md">
            <BookOpen className="w-4 h-4" /> Take Another Quiz
          </Link>
        </div>
      </div>

      {/* Progress Chart (if attempts > 0) */}
      {attempts.length > 0 && (
        <div className="card space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Score Progression (% Over Time)
          </h2>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="attempt" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Score']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    color: '#ffffff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ fill: '#38bdf8', r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Attempt History List */}
      <div className="card p-0 overflow-hidden shadow-2xl border border-white/10">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Loading score history...
          </div>
        ) : attempts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Award className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No practice quiz attempts recorded</p>
            <Link to="/student/quiz" className="btn-accent text-xs py-2 px-4 inline-flex items-center gap-1 font-bold">
              Take Your First Quiz <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 border-b border-white/10 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Attempt #</th>
                  <th className="px-4 py-3.5">Language & Category</th>
                  <th className="px-4 py-3.5">Score</th>
                  <th className="px-4 py-3.5">Percentage</th>
                  <th className="px-4 py-3.5">Outcome</th>
                  <th className="px-4 py-3.5 text-right">Date Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {attempts.map((att, idx) => (
                  <tr key={att._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-white">Attempt #{attempts.length - idx}</td>
                    <td className="px-4 py-3.5">
                      <span className="badge badge-info text-[10px]">{att.language}</span>
                      <span className="text-[11px] text-slate-400 ml-2">{att.vehicleCategory}</span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-white">
                      {att.score} / {att.totalQuestions}
                    </td>
                    <td className="px-4 py-3.5 font-black text-cyan-300">{att.percentage}%</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`badge text-[10px] ${
                          att.passed ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {att.passed ? 'PASSED (≥80%)' : 'NEEDS PRACTICE'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-400 text-[11px]">
                      {format(new Date(att.takenAt), 'MMM dd, yyyy • hh:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
