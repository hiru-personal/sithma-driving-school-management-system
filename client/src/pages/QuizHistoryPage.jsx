import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, Link } from 'react-router-dom';
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
  Eye,
  Lock,
  X,
  Layers,
  HelpCircle,
  Check,
  ShieldCheck,
  RotateCcw,
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
import toast from 'react-hot-toast';

export default function QuizHistoryPage() {
  const { student, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [reviewAttempt, setReviewAttempt] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  const fetchAttempts = async () => {
    const studentId = student?._id || user?.studentId || user?._id;
    if (!studentId) return;

    setLoading(true);
    try {
      const res = await api.get(`/quiz/attempts/student/${studentId}`);
      if (res.data.success) {
        setAttempts(res.data.attempts || []);
      }
    } catch (err) {
      toast.error('Failed to load past quiz attempts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [student, user]);

  // Handle URL param ?review=attemptId to directly open review
  useEffect(() => {
    const reviewId = searchParams.get('review');
    if (reviewId) {
      openReviewModal(reviewId);
    }
  }, [searchParams]);

  const openReviewModal = async (attemptId) => {
    setSelectedAttemptId(attemptId);
    setLoadingReview(true);
    try {
      const res = await api.get(`/quiz/attempts/${attemptId}`);
      if (res.data.success) {
        setReviewAttempt(res.data.attempt);
      } else {
        toast.error('Could not load exam attempt review');
      }
    } catch (err) {
      toast.error('Failed to load exam review details');
    } finally {
      setLoadingReview(false);
    }
  };

  const closeReviewModal = () => {
    setSelectedAttemptId(null);
    setReviewAttempt(null);
    if (searchParams.get('review')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('review');
      setSearchParams(newParams);
    }
  };

  // Performance calculations
  const totalCompleted = attempts.length;
  const passedCount = attempts.filter((a) => a.passed).length;
  const passRate = totalCompleted > 0 ? Math.round((passedCount / totalCompleted) * 100) : 0;
  const highestScore = totalCompleted > 0 ? Math.max(...attempts.map((a) => a.percentage || 0)) : 0;

  const chartData = [...attempts]
    .reverse()
    .map((att, idx) => ({
      attempt: `Exam ${idx + 1}`,
      percentage: att.percentage,
      date: att.takenAt ? format(new Date(att.takenAt), 'MM/dd') : '',
    }));

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Learner Performance Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] font-heading flex items-center gap-2.5">
            <History className="w-7 h-7 text-primary" /> Practice Exam History / My Exams
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review all completed DMT theory practice exams, inspect your submitted answers, and track your pass benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAttempts}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link
            to="/student/quiz"
            className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shadow-md"
          >
            <BookOpen className="w-4 h-4 text-white" /> Take Practice Exam
          </Link>
        </div>
      </div>

      {/* Analytics KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 space-y-1 border-l-4 border-l-primary">
          <span className="text-[11px] font-semibold text-slate-500">Completed Exams</span>
          <p className="text-2xl font-black text-[#112D4E]">{totalCompleted}</p>
        </div>
        <div className="card p-4 space-y-1 border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-semibold text-slate-500">Exams Passed (≥80%)</span>
          <p className="text-2xl font-black text-emerald-600">{passedCount}</p>
        </div>
        <div className="card p-4 space-y-1 border-l-4 border-l-cyan-500">
          <span className="text-[11px] font-semibold text-slate-500">Pass Rate</span>
          <p className="text-2xl font-black text-cyan-700">{passRate}%</p>
        </div>
        <div className="card p-4 space-y-1 border-l-4 border-l-amber-500">
          <span className="text-[11px] font-semibold text-slate-500">Highest Score</span>
          <p className="text-2xl font-black text-amber-600">{highestScore}%</p>
        </div>
      </div>

      {/* Progress Chart (if attempts > 0) */}
      {attempts.length > 1 && (
        <div className="card space-y-3">
          <h2 className="text-sm font-bold text-[#112D4E] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Score Progression (% Over Time)
          </h2>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="attempt" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Score']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#0B5FA5"
                  strokeWidth={3}
                  dot={{ fill: '#0B5FA5', r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Completed Exams History List */}
      <div className="card p-0 overflow-hidden shadow-sm border border-[#DBE2EF]">
        <div className="p-4 sm:p-5 border-b border-[#DBE2EF] bg-slate-50/70 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#112D4E]">Completed Practice Exams</h2>
            <p className="text-xs text-slate-500">Select any completed exam attempt to review questions & answers.</p>
          </div>
          <span className="badge badge-info text-xs font-bold">
            {attempts.length} Recorded Attempts
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading exam history...
          </div>
        ) : attempts.length === 0 ? (
          <div className="py-14 text-center space-y-3 px-4">
            <Award className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-[#112D4E]">No Practice Exams Completed Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't completed any DMT theory practice exams yet. Start a practice exam now to prepare for your official test.
            </p>
            <Link
              to="/student/quiz"
              className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-1.5 font-bold shadow-md"
            >
              Start Your First Practice Exam <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0F4F8] border-b border-[#DBE2EF] text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Exam / Question List</th>
                  <th className="px-4 py-3.5">Language & Category</th>
                  <th className="px-4 py-3.5">Date Completed</th>
                  <th className="px-4 py-3.5">Score / Result</th>
                  <th className="px-4 py-3.5">Completion Status</th>
                  <th className="px-4 py-3.5 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DBE2EF]">
                {attempts.map((att, idx) => {
                  const examName =
                    att.questionListName ||
                    att.questionListId?.name ||
                    'General DMT Practice Exam';

                  return (
                    <tr
                      key={att._id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => openReviewModal(att._id)}
                    >
                      {/* Exam / Question List Name */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{examName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Attempt #{attempts.length - idx} • {att.totalQuestions} Questions
                        </span>
                      </td>

                      {/* Language & Category */}
                      <td className="px-4 py-4">
                        <span className="badge badge-info text-[10px]">{att.language}</span>
                        <span className="text-[11px] text-slate-600 ml-2 font-medium">
                          {att.vehicleCategory} Vehicle
                        </span>
                      </td>

                      {/* Date Completed */}
                      <td className="px-4 py-4 text-slate-600 text-xs whitespace-nowrap">
                        {att.takenAt
                          ? format(new Date(att.takenAt), 'MMM dd, yyyy • hh:mm a')
                          : 'Completed'}
                      </td>

                      {/* Score / Result */}
                      <td className="px-4 py-4">
                        <div className="font-black text-slate-900 text-sm">
                          {att.score} / {att.totalQuestions}
                          <span className="text-xs font-bold text-primary ml-1.5">
                            ({att.percentage}%)
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          Passing Standard: 80%
                        </span>
                      </td>

                      {/* Completion Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`badge text-[10px] font-bold ${
                            att.passed ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {att.passed ? 'Completed • Passed' : 'Completed • Needs Practice'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openReviewModal(att._id);
                          }}
                          className="btn-secondary text-[11px] py-1.5 px-3 font-bold inline-flex items-center gap-1.5 hover:border-primary text-primary"
                        >
                          <Eye className="w-3.5 h-3.5" /> Review Exam
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* READ-ONLY COMPLETED EXAM REVIEW MODAL                    */}
      {/* ======================================================== */}
      {selectedAttemptId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white border border-[#DBE2EF] rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {loadingReview || !reviewAttempt ? (
              <div className="py-20 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" /> Loading completed exam review...
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-[#DBE2EF] pb-4 gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-bold text-[10px] mb-1.5">
                      <Lock className="w-3 h-3 text-slate-600" /> Read-Only Exam Review
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#112D4E] font-heading">
                      {reviewAttempt.questionListName || reviewAttempt.questionListId?.name || 'DMT Practice Exam'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Completed on{' '}
                      {reviewAttempt.takenAt
                        ? format(new Date(reviewAttempt.takenAt), 'MMMM dd, yyyy • hh:mm a')
                        : 'Completed'}
                    </p>
                  </div>

                  <button
                    onClick={closeReviewModal}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs transition-colors shrink-0"
                    title="Close Review"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Read-Only Notice Banner */}
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-xs text-blue-900">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <strong className="font-bold">Archived Submission:</strong>{' '}
                    <span>
                      This completed practice exam is read-only. Your submitted choices and the official DMT correct answers are preserved below.
                    </span>
                  </div>
                </div>

                {/* Score & Outcome Card */}
                <div className="card p-5 bg-gradient-to-r from-slate-900 via-primary to-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
                  <div className="space-y-1">
                    <span className="badge badge-info text-[10px]">
                      {reviewAttempt.language} • {reviewAttempt.vehicleCategory} Vehicle
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {reviewAttempt.passed
                        ? '🎉 Passed Practice Exam'
                        : 'Practice Exam Completed'}
                    </h3>
                    <p className="text-xs text-slate-300">
                      Passing standard: 80% (DMT requirement)
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                      <div className="text-2xl font-black text-cyan-300">{reviewAttempt.percentage}%</div>
                      <div className="text-[10px] text-slate-300 font-bold">
                        {reviewAttempt.score} / {reviewAttempt.totalQuestions} Correct
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`badge text-xs font-black ${
                          reviewAttempt.passed ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {reviewAttempt.passed ? 'PASSED' : 'NEEDS PRACTICE'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Questions & Answers Review List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#112D4E] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" /> Questions & Submitted Answers
                    </h3>
                    <span className="text-xs text-slate-500 font-semibold">
                      {reviewAttempt.answers?.length || 0} Questions Total
                    </span>
                  </div>

                  <div className="space-y-4">
                    {reviewAttempt.answers?.map((ans, idx) => {
                      const isCorrect = ans.isCorrect;
                      const userChoice = ans.selectedOption;
                      const correctChoice = ans.correctOption;
                      const qText = ans.questionText || `Question #${idx + 1}`;
                      const options = ans.options || [];

                      return (
                        <div
                          key={ans.questionId || idx}
                          className={`card p-5 space-y-3.5 border-l-4 transition-all ${
                            isCorrect
                              ? 'border-l-emerald-500 bg-white'
                              : 'border-l-rose-500 bg-white'
                          }`}
                        >
                          {/* Question header */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-500">
                              Question #{idx + 1}
                            </span>
                            <span
                              className={`badge text-[10px] font-bold ${
                                isCorrect ? 'badge-success' : 'badge-danger'
                              }`}
                            >
                              {isCorrect ? 'Correct Answer (+1)' : 'Incorrect (0)'}
                            </span>
                          </div>

                          {/* Question text */}
                          <h4 className="text-sm font-bold text-[#112D4E] leading-snug">
                            {qText}
                          </h4>

                          {/* Options */}
                          <div className="space-y-2 text-xs">
                            {options.map((opt, optIdx) => {
                              const isStudentPick = userChoice === optIdx;
                              const isCorrectOpt = correctChoice === optIdx;

                              let containerClass =
                                'border-slate-200 bg-slate-50/60 text-slate-700';

                              if (isCorrectOpt) {
                                containerClass =
                                  'border-emerald-400 bg-emerald-50/90 text-emerald-900 font-bold ring-1 ring-emerald-400/50';
                              } else if (isStudentPick && !isCorrect) {
                                containerClass =
                                  'border-rose-400 bg-rose-50/90 text-rose-900 font-bold ring-1 ring-rose-400/50';
                              }

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${containerClass}`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span
                                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                        isCorrectOpt
                                          ? 'bg-emerald-600 text-white'
                                          : isStudentPick
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-slate-200 text-slate-700'
                                      }`}
                                    >
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>{opt}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {isCorrectOpt && (
                                      <span className="badge badge-success text-[9px] py-0 px-2 flex items-center gap-1">
                                        <Check className="w-3 h-3 text-emerald-700" /> Correct Answer
                                      </span>
                                    )}
                                    {isStudentPick && (
                                      <span
                                        className={`badge text-[9px] py-0 px-2 font-bold ${
                                          isCorrect ? 'badge-info' : 'badge-danger'
                                        }`}
                                      >
                                        {isCorrect ? 'Your Pick (Correct)' : 'Your Pick (Wrong)'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Driver Explanation */}
                          {ans.explanation && (
                            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-bold">Explanation / Driver Tip:</strong>{' '}
                                <span>{ans.explanation}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[#DBE2EF]">
                  <button
                    onClick={closeReviewModal}
                    className="btn-secondary text-xs py-2 px-4 font-bold"
                  >
                    Close Review
                  </button>
                  <Link
                    to="/student/quiz"
                    className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5"
                  >
                    Take Another Practice Exam <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
