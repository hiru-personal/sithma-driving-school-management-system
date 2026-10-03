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

const safeFormatDate = (dateVal, formatStr = 'MMM dd, yyyy • hh:mm a', fallback = '') => {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
};
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
      date: safeFormatDate(att?.takenAt, 'MM/dd', ''),
    }));

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B3D5F1]/30 border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> Learner Performance Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#152026] font-heading flex items-center gap-2.5">
            <History className="w-7 h-7 text-[#1B3D59]" /> Practice Exam History / My Exams
          </h1>
          <p className="text-xs text-[#6A97C0] mt-0.5 font-medium">
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
            className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-white" /> Take Practice Exam
          </Link>
        </div>
      </div>

      {/* Analytics KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D4EEF8] rounded-2xl p-4 space-y-1 border-l-4 border-l-[#1B3D59] shadow-sm">
          <span className="text-[11px] font-semibold text-[#6A97C0]">Completed Exams</span>
          <p className="text-2xl font-black text-[#152026]">{totalCompleted}</p>
        </div>
        <div className="bg-white border border-[#D4EEF8] rounded-2xl p-4 space-y-1 border-l-4 border-l-emerald-600 shadow-sm">
          <span className="text-[11px] font-semibold text-[#6A97C0]">Exams Passed (≥80%)</span>
          <p className="text-2xl font-black text-emerald-700">{passedCount}</p>
        </div>
        <div className="bg-white border border-[#D4EEF8] rounded-2xl p-4 space-y-1 border-l-4 border-l-[#6A97C0] shadow-sm">
          <span className="text-[11px] font-semibold text-[#6A97C0]">Pass Rate</span>
          <p className="text-2xl font-black text-[#1B3D59]">{passRate}%</p>
        </div>
        <div className="bg-white border border-[#D4EEF8] rounded-2xl p-4 space-y-1 border-l-4 border-l-[#B3D5F1] shadow-sm">
          <span className="text-[11px] font-semibold text-[#6A97C0]">Highest Score</span>
          <p className="text-2xl font-black text-[#152026]">{highestScore}%</p>
        </div>
      </div>

      {/* Progress Chart (if attempts > 0) */}
      {attempts.length > 1 && (
        <div className="bg-white border border-[#D4EEF8] rounded-3xl p-6 space-y-3 shadow-sm">
          <h2 className="text-sm font-bold text-[#152026] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1B3D59]" /> Score Progression (% Over Time)
          </h2>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4EEF8" />
                <XAxis dataKey="attempt" tick={{ fill: '#6A97C0', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6A97C0', fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Score']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#D4EEF8',
                    borderRadius: '12px',
                    color: '#152026',
                    boxShadow: '0 4px 12px rgba(27,61,89,0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#1B3D59"
                  strokeWidth={3}
                  dot={{ fill: '#1B3D59', r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Completed Exams History List */}
      <div className="bg-white border border-[#D4EEF8] rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-[#D4EEF8] bg-[#FAFCFE] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#152026]">Completed Practice Exams</h2>
            <p className="text-xs text-[#6A97C0] font-medium">Select any completed exam attempt to review questions & answers.</p>
          </div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#B3D5F1]/30 border border-[#6A97C0]/30 text-[#1B3D59] text-xs font-bold">
            {attempts.length} Recorded Attempts
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-[#6A97C0] font-medium flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#1B3D59]" /> Loading exam history...
          </div>
        ) : attempts.length === 0 ? (
          <div className="py-14 text-center space-y-3 px-4">
            <Award className="w-12 h-12 text-[#6A97C0] mx-auto" />
            <h3 className="text-base font-bold text-[#152026]">No Practice Exams Completed Yet</h3>
            <p className="text-xs text-[#6A97C0] max-w-sm mx-auto font-medium">
              You haven't completed any DMT theory practice exams yet. Start a practice exam now to prepare for your official test.
            </p>
            <Link
              to="/student/quiz"
              className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-1.5 font-bold shadow-sm"
            >
              Start Your First Practice Exam <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1B3D59] text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Exam / Question List</th>
                  <th className="px-4 py-3.5">Language & Category</th>
                  <th className="px-4 py-3.5">Date Completed</th>
                  <th className="px-4 py-3.5">Score / Result</th>
                  <th className="px-4 py-3.5">Completion Status</th>
                  <th className="px-4 py-3.5 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4EEF8] text-[#152026]">
                {attempts.map((att, idx) => {
                  const examName =
                    att.questionListName ||
                    att.questionListId?.name ||
                    'General DMT Practice Exam';

                  return (
                    <tr
                      key={att._id}
                      className="hover:bg-[#D4EEF8]/40 transition-colors cursor-pointer group"
                      onClick={() => openReviewModal(att._id)}
                    >
                      {/* Exam / Question List Name */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-[#152026] group-hover:text-[#1B3D59] transition-colors flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-[#1B3D59] shrink-0" />
                          <span>{examName}</span>
                        </div>
                        <span className="text-[10px] text-[#6A97C0] font-medium">
                          Attempt #{attempts.length - idx} • {att.totalQuestions} Questions
                        </span>
                      </td>

                      {/* Language & Category */}
                      <td className="px-4 py-4">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-[#B3D5F1]/30 border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-[10px]">
                          {att.language}
                        </span>
                        <span className="text-[11px] text-[#152026] ml-2 font-medium">
                          {att.vehicleCategory} Vehicle
                        </span>
                      </td>

                      {/* Date Completed */}
                      <td className="px-4 py-4 text-[#6A97C0] text-xs whitespace-nowrap font-medium">
                        {safeFormatDate(att?.takenAt, 'MMM dd, yyyy • hh:mm a', 'Completed')}
                      </td>

                      {/* Score / Result */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-[#152026] text-sm">
                          {att.score} / {att.totalQuestions}
                          <span className="text-xs font-bold text-[#1B3D59] ml-1.5">
                            ({att.percentage}%)
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6A97C0] font-medium">
                          Passing Standard: 80%
                        </span>
                      </td>

                      {/* Completion Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            att.passed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40'
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
                          className="bg-[#D4EEF8] hover:bg-[#B3D5F1] text-[#1B3D59] text-[11px] py-1.5 px-3 rounded-xl font-bold inline-flex items-center gap-1.5 transition-colors"
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
        <div className="fixed inset-0 bg-[#152026]/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 text-[#152026]">
            {loadingReview || !reviewAttempt ? (
              <div className="py-20 text-center text-xs text-[#6A97C0] font-medium flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#1B3D59]" /> Loading completed exam review...
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-[#D4EEF8] pb-4 gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B3D5F1]/30 border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-[10px] mb-1.5">
                      <Lock className="w-3 h-3 text-[#1B3D59]" /> Read-Only Exam Review
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#152026] font-heading">
                      {reviewAttempt.questionListName || reviewAttempt.questionListId?.name || 'DMT Practice Exam'}
                    </h2>
                    <p className="text-xs text-[#6A97C0] mt-0.5 font-medium">
                      Completed on{' '}
                      {safeFormatDate(reviewAttempt?.takenAt, 'MMMM dd, yyyy • hh:mm a', 'Completed')}
                    </p>
                  </div>

                  <button
                    onClick={closeReviewModal}
                    className="w-8 h-8 rounded-full bg-[#D4EEF8] hover:bg-[#B3D5F1] text-[#1B3D59] flex items-center justify-center text-xs transition-colors shrink-0"
                    title="Close Review"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Read-Only Notice Banner */}
                <div className="p-3.5 bg-[#D4EEF8]/40 border border-[#B3D5F1] rounded-2xl flex items-center gap-3 text-xs text-[#152026]">
                  <ShieldCheck className="w-5 h-5 text-[#1B3D59] shrink-0" />
                  <div>
                    <strong className="font-bold text-[#1B3D59]">Archived Submission:</strong>{' '}
                    <span className="font-medium">
                      This completed practice exam is read-only. Your submitted choices and the official DMT correct answers are preserved below.
                    </span>
                  </div>
                </div>

                {/* Score & Outcome Card */}
                <div className="p-5 bg-gradient-to-r from-[#152026] via-[#1B3D59] to-[#152026] text-white rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#B3D5F1]/20 border border-[#B3D5F1]/30 text-[#D4EEF8] font-bold text-[10px]">
                      {reviewAttempt.language} • {reviewAttempt.vehicleCategory} Vehicle
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {reviewAttempt.passed
                        ? '🎉 Passed Practice Exam'
                        : 'Practice Exam Completed'}
                    </h3>
                    <p className="text-xs text-[#D4EEF8]">
                      Passing standard: 80% (DMT requirement)
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                      <div className="text-2xl font-black text-[#D4EEF8]">{reviewAttempt.percentage}%</div>
                      <div className="text-[10px] text-[#B3D5F1] font-bold">
                        {reviewAttempt.score} / {reviewAttempt.totalQuestions} Correct
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                          reviewAttempt.passed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40'
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
                    <h3 className="text-sm font-bold text-[#152026] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#1B3D59]" /> Questions & Submitted Answers
                    </h3>
                    <span className="text-xs text-[#6A97C0] font-semibold">
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
                          className={`bg-white border border-[#D4EEF8] rounded-2xl p-5 space-y-3.5 border-l-4 shadow-sm transition-all ${
                            isCorrect
                              ? 'border-l-emerald-600'
                              : 'border-l-rose-500'
                          }`}
                        >
                          {/* Question header */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#6A97C0]">
                              Question #{idx + 1}
                            </span>
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isCorrect
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {isCorrect ? 'Correct Answer (+1)' : 'Incorrect (0)'}
                            </span>
                          </div>

                          {/* Question text */}
                          <h4 className="text-sm font-bold text-[#152026] leading-snug">
                            {qText}
                          </h4>

                          {/* Options */}
                          <div className="space-y-2 text-xs">
                            {options.map((opt, optIdx) => {
                              const isStudentPick = userChoice === optIdx;
                              const isCorrectOpt = correctChoice === optIdx;

                              let containerClass =
                                'border-[#D4EEF8] bg-[#FAFCFE] text-[#152026]';

                              if (isCorrectOpt) {
                                containerClass =
                                  'border-emerald-300 bg-emerald-50/90 text-emerald-950 font-bold ring-1 ring-emerald-300';
                              } else if (isStudentPick && !isCorrect) {
                                containerClass =
                                  'border-rose-300 bg-rose-50/90 text-rose-950 font-bold ring-1 ring-rose-300';
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
                                          ? 'bg-emerald-700 text-white'
                                          : isStudentPick
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-[#D4EEF8] text-[#1B3D59]'
                                      }`}
                                    >
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span className="font-medium">{opt}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {isCorrectOpt && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold">
                                        <Check className="w-3 h-3 text-emerald-700" /> Correct Answer
                                      </span>
                                    )}
                                    {isStudentPick && (
                                      <span
                                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                          isCorrect
                                            ? 'bg-[#B3D5F1] text-[#1B3D59] border border-[#6A97C0]/40'
                                            : 'bg-rose-100 text-rose-800 border border-rose-300'
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
                            <div className="p-3 bg-[#F3EED8] border border-[#6A97C0]/30 rounded-xl text-xs text-[#152026] flex items-start gap-2">
                              <HelpCircle className="w-4 h-4 text-[#1B3D59] shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-bold text-[#1B3D59]">Explanation / Driver Tip:</strong>{' '}
                                <span className="font-medium">{ans.explanation}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[#D4EEF8]">
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
