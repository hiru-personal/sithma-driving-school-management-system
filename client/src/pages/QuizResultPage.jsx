import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export default function QuizResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state;
  if (!state || !state.resultData) {
    return (
      <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4">
        <p className="text-sm text-slate-400">No quiz results found.</p>
        <Link to="/student/quiz" className="btn-primary text-xs py-2.5 px-5">
          Go to Practice Quiz
        </Link>
      </div>
    );
  }

  const { resultData, questions = [], language, vehicleCategory } = state;
  const { score, totalQuestions, percentage, passed, answers = [] } = resultData;

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
    if (percentage >= 50) return 'text-amber-300 border-amber-500/40 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.3)]';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/15 shadow-[0_0_20px_rgba(244,63,94,0.3)]';
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-4xl mx-auto w-full">
      {/* Score Summary Card */}
      <div className="card shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-6 sm:p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 mx-auto">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="badge badge-info text-xs">
            {language} • {vehicleCategory} Category
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-2">
            {passed ? '🎉 Practice Exam Passed!' : 'Practice Exam Completed'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {passed
              ? 'Excellent performance! You met the DMT 80% passing standard.'
              : 'Keep reviewing traffic rules and take another practice test to reach the 80% mark.'}
          </p>
        </div>

        {/* Circular Percentage Box */}
        <div
          className={`inline-block border-2 rounded-3xl p-6 my-3 min-w-[200px] backdrop-blur-xl ${getScoreColor()}`}
        >
          <div className="text-4xl font-black">{percentage}%</div>
          <div className="text-xs font-bold mt-1">
            {score} / {totalQuestions} Correct Answers
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to={`/student/quiz/take?language=${language}&category=${vehicleCategory}`}
            className="btn-accent text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 shadow-md hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </Link>
          <Link
            to="/student/quiz/history"
            className="btn-secondary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5"
          >
            View Attempt History <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Question Review Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" /> Detailed Answer Key & Review
        </h2>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const ans = answers.find((a) => a.questionId?.toString() === q._id?.toString());
            const isCorrect = ans?.isCorrect;
            const selectedOpt = ans?.selectedOption;
            const correctOpt = ans?.correctOption;

            return (
              <div
                key={q._id || idx}
                className={`card p-5 space-y-3 border-l-4 ${
                  isCorrect
                    ? 'border-l-emerald-400 bg-emerald-500/10'
                    : 'border-l-rose-500 bg-rose-500/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    Question #{idx + 1}
                  </span>
                  <span
                    className={`badge text-[10px] ${
                      isCorrect ? 'badge-success' : 'badge-danger'
                    }`}
                  >
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{q.questionText}</h3>

                <div className="space-y-2 text-xs">
                  {q.options.map((opt, oIdx) => {
                    let borderClass = 'border-white/10 bg-white/5 text-slate-300';
                    if (oIdx === correctOpt) {
                      borderClass = 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300 font-bold';
                    } else if (oIdx === selectedOpt && !isCorrect) {
                      borderClass = 'border-rose-500/50 bg-rose-500/20 text-rose-300 font-bold';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${borderClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center text-[10px] font-bold">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {oIdx === correctOpt && (
                          <span className="badge badge-success text-[9px] py-0 px-1.5">
                            Correct Answer
                          </span>
                        )}
                        {oIdx === selectedOpt && !isCorrect && (
                          <span className="badge badge-danger text-[9px] py-0 px-1.5">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-400 bg-white/5 p-2.5 rounded-xl border border-white/10">
                    💡 <strong>Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
