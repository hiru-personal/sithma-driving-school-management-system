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
  Layers,
  History,
  Check,
} from 'lucide-react';

export default function QuizResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state;
  if (!state || !state.resultData) {
    return (
      <div className="py-16 px-4 text-center max-w-md mx-auto space-y-4">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-[#112D4E]">No Recent Quiz Results Found</h2>
        <p className="text-xs text-slate-500">
          Take a practice exam or visit your exam history to review past completed exams.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/student/quiz" className="btn-primary text-xs py-2.5 px-5">
            Take Practice Exam
          </Link>
          <Link to="/student/quiz/history" className="btn-secondary text-xs py-2.5 px-5">
            View My Exams
          </Link>
        </div>
      </div>
    );
  }

  const { resultData, questions = [], language, vehicleCategory, questionListName } = state;
  const { score, totalQuestions, percentage, passed, answers = [] } = resultData;
  const examTitle = questionListName || resultData.questionListName || 'DMT Written Practice Exam';

  const getScoreColor = () => {
    if (percentage >= 80)
      return 'text-emerald-700 border-emerald-400 bg-emerald-50 shadow-sm';
    if (percentage >= 50)
      return 'text-amber-700 border-amber-400 bg-amber-50 shadow-sm';
    return 'text-rose-700 border-rose-400 bg-rose-50 shadow-sm';
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-4xl mx-auto w-full">
      {/* Score Summary Card */}
      <div className="card p-6 sm:p-8 text-center space-y-4 border border-[#DBE2EF] shadow-md">
        <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="badge badge-info text-xs">
              {language} • {vehicleCategory} Category
            </span>
            <span className="badge bg-slate-100 text-slate-700 border border-slate-200 text-xs flex items-center gap-1">
              <Layers className="w-3 h-3 text-primary" /> {examTitle}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] font-heading mt-2.5">
            {passed ? '🎉 Practice Exam Passed!' : 'Practice Exam Completed'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
            {passed
              ? 'Outstanding! You achieved the official DMT 80% passing benchmark standard.'
              : 'Good effort! Review the answer key below to improve your score and reach the 80% benchmark.'}
          </p>
        </div>

        {/* Circular Percentage Box */}
        <div
          className={`inline-block border-2 rounded-3xl p-6 my-2 min-w-[220px] ${getScoreColor()}`}
        >
          <div className="text-4xl font-black">{percentage}%</div>
          <div className="text-xs font-bold mt-1">
            {score} / {totalQuestions} Correct Answers
          </div>
          <span
            className={`badge mt-2.5 text-[10px] font-black ${
              passed ? 'badge-success' : 'badge-danger'
            }`}
          >
            {passed ? 'PASSED (≥80%)' : 'NEEDS PRACTICE (<80%)'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Link
            to="/student/quiz"
            className="btn-accent text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 shadow-md hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" /> Take Another Exam
          </Link>
          <Link
            to="/student/quiz/history"
            className="btn-secondary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-primary" /> Practice Exam History / My Exams
          </Link>
        </div>
      </div>

      {/* Question Review Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#DBE2EF] pb-3">
          <h2 className="text-base sm:text-lg font-bold text-[#112D4E] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Answer Key & Question Review
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {questions.length} Questions Evaluated
          </span>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const ans = answers.find(
              (a) =>
                a.questionId?.toString() === q._id?.toString() ||
                a.questionText === q.questionText
            );
            const isCorrect = ans?.isCorrect;
            const selectedOpt = ans?.selectedOption;
            const correctOpt = ans?.correctOption;

            return (
              <div
                key={q._id || idx}
                className={`card p-5 sm:p-6 space-y-3.5 border-l-4 shadow-sm ${
                  isCorrect
                    ? 'border-l-emerald-500 bg-white'
                    : 'border-l-rose-500 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    Question #{idx + 1}
                  </span>
                  <span
                    className={`badge text-[10px] font-bold ${
                      isCorrect ? 'badge-success' : 'badge-danger'
                    }`}
                  >
                    {isCorrect ? 'Correct Answer (+1)' : 'Incorrect Answer (0)'}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#112D4E]">
                  {q.questionText}
                </h3>

                <div className="space-y-2 text-xs">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedOpt === oIdx;
                    const isCorrectAnswer = correctOpt === oIdx;

                    let borderClass = 'border-slate-200 bg-slate-50/70 text-slate-700';

                    if (isCorrectAnswer) {
                      borderClass =
                        'border-emerald-400 bg-emerald-50/90 text-emerald-900 font-bold ring-1 ring-emerald-400/50';
                    } else if (isSelected && !isCorrect) {
                      borderClass =
                        'border-rose-400 bg-rose-50/90 text-rose-900 font-bold ring-1 ring-rose-400/50';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${borderClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isCorrectAnswer
                                ? 'bg-emerald-600 text-white'
                                : isSelected
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isCorrectAnswer && (
                            <span className="badge badge-success text-[9px] py-0 px-2 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-700" /> Correct Answer
                            </span>
                          )}
                          {isSelected && !isCorrect && (
                            <span className="badge badge-danger text-[9px] py-0 px-2 font-bold">
                              Your Choice (Wrong)
                            </span>
                          )}
                          {isSelected && isCorrect && (
                            <span className="badge badge-info text-[9px] py-0 px-2 font-bold">
                              Your Choice
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Driver Tip / Explanation:</strong>{' '}
                      <span>{q.explanation}</span>
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
