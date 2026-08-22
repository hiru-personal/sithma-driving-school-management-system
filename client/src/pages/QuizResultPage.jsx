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
      <div className="min-h-screen bg-neutralBg py-12 px-4 text-center max-w-md mx-auto space-y-4">
        <p className="text-sm text-textMuted">No quiz results found.</p>
        <Link to="/student/quiz" className="btn-primary text-xs py-2 px-4">
          Go to Practice Quiz
        </Link>
      </div>
    );
  }

  const { resultData, questions = [], language, vehicleCategory } = state;
  const { score, totalQuestions, percentage, passed, answers = [] } = resultData;

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-success border-success bg-success-light/30';
    if (percentage >= 50) return 'text-warning-dark border-warning bg-warning-light/30';
    return 'text-danger border-danger bg-danger-light/30';
  };

  return (
    <div className="min-h-screen bg-neutralBg py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-4xl mx-auto">
      {/* Score Summary Card */}
      <div className="card shadow-modal p-6 sm:p-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary-light text-primary mx-auto">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="badge badge-info text-xs">
            {language} • {vehicleCategory} Category
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textMain font-heading mt-2">
            {passed ? '🎉 Practice Exam Passed!' : 'Practice Exam Completed'}
          </h1>
          <p className="text-xs text-textMuted mt-1">
            {passed
              ? 'Excellent performance! You met the DMT 80% passing standard.'
              : 'Keep reviewing traffic rules and take another practice test to reach the 80% mark.'}
          </p>
        </div>

        {/* Circular Percentage Box */}
        <div
          className={`inline-block border-4 rounded-3xl p-6 my-3 min-w-[200px] ${getScoreColor()}`}
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
            className="btn-accent text-xs py-2.5 px-5 font-bold flex items-center gap-1.5"
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
        <h2 className="text-lg font-bold text-textMain flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Detailed Answer Key & Review
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
                  isCorrect ? 'border-l-success bg-white' : 'border-l-danger bg-red-50/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-textMuted uppercase">
                      Question #{idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-textMain">{q.questionText}</h3>
                  </div>

                  <span
                    className={`badge text-[10px] py-1 px-2.5 flex-shrink-0 ${
                      isCorrect ? 'badge-success' : 'badge-danger'
                    }`}
                  >
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                {/* Options Breakdown */}
                <div className="space-y-1.5 text-xs pt-2">
                  {q.options.map((opt, oIdx) => {
                    const wasSelected = selectedOpt === oIdx;
                    const isRight = correctOpt === oIdx;

                    let rowStyle = 'bg-neutralBg border-slate-200 text-textMuted';
                    if (isRight) {
                      rowStyle = 'bg-success-light border-success/40 text-success-dark font-bold';
                    } else if (wasSelected && !isRight) {
                      rowStyle = 'bg-danger-light border-danger/40 text-danger-dark font-bold';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${rowStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                        </div>
                        {isRight && (
                          <span className="text-[10px] uppercase font-bold text-success flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                          </span>
                        )}
                        {wasSelected && !isRight && (
                          <span className="text-[10px] uppercase font-bold text-danger flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-primary">Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
