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
    <div className="min-h-screen bg-neutralBg py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textMain font-heading flex items-center gap-2">
            <History className="w-6 h-6 text-primary" /> Practice Exam Score History
          </h1>
          <p className="text-xs text-textMuted mt-0.5">
            Track your performance improvements across multilingual DMT practice quizzes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchAttempts} className="btn-secondary text-xs py-2 px-3">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link to="/student/quiz" className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1">
            <BookOpen className="w-4 h-4" /> Take Another Quiz
          </Link>
        </div>
      </div>

      {/* Progress Chart (if attempts > 1) */}
      {attempts.length > 0 && (
        <div className="card space-y-3">
          <h2 className="text-sm font-bold text-textMain flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Score Progression (% Over Time)
          </h2>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="attempt" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Score']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#0B5FA5"
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: '#F2A93B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Attempts Table */}
      <div className="card p-0 overflow-hidden shadow-card">
        {loading ? (
          <div className="py-12 text-center text-xs text-textMuted flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading attempt records...
          </div>
        ) : attempts.length === 0 ? (
          <div className="card text-center py-12 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-textMain">No practice quizzes attempted yet</p>
            <Link to="/student/quiz" className="btn-primary text-xs py-2 px-4 inline-block">
              Start Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-borderColor text-textMuted uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Percentage</th>
                  <th className="px-4 py-3 text-right">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor">
                {attempts.map((att) => (
                  <tr key={att._id} className="hover:bg-primary-light/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-textMain">
                      {format(new Date(att.takenAt), 'MMM dd, yyyy • hh:mm a')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-info text-[10px]">{att.language}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-textMuted">
                      {att.vehicleCategory} Vehicle
                    </td>
                    <td className="px-4 py-3 font-bold text-textMain">
                      {att.score} / {att.totalQuestions}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-black ${
                          att.percentage >= 80 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`badge ${
                          att.passed ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {att.passed ? 'Passed (≥80%)' : 'Needs Practice'}
                      </span>
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
