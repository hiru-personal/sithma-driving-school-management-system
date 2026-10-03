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
        <BookOpen className="w-12 h-12 text-[#6A97C0] mx-auto" />
        <h2 className="text-lg font-bold text-[#152026]">No Recent Quiz Results Found</h2>
        <p className="text-xs text-[#6A97C0] font-medium">
          Take a practice exam or visit your exam history to review past completed exams.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/student/quiz" className="btn-primary text-xs py-2.5 px-5 font-bold">
            Take Practice Exam
          </Link>
          <Link to="/student/quiz/history" className="btn-secondary text-xs py-2.5 px-5 font-bold">
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
      return 'text-emerald-800 border-emerald-300 bg-emerald-50 shadow-sm';
    if (percentage >= 50)
      return 'text-[#152026] border-[#6A97C0]/40 bg-[#F3EED8] shadow-sm';
    return 'text-rose-800 border-rose-300 bg-rose-50 shadow-sm';
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-4xl mx-auto w-full">
      {/* Score Summary Card */}
      <div className="bg-white border border-[#D4EEF8] rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm text-[#152026]">
        <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-[#B3D5F1]/30 border border-[#6A97C0]/30 text-[#1B3D59] mx-auto">
          <Award className="w-8 h-8 text-[#1B3D59]" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#B3D5F1]/30 border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-xs">
              {language} • {vehicleCategory} Category
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/30 text-xs font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#1B3D59]" /> {examTitle}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#152026] font-heading mt-3">
            {passed ? '🎉 Practice Exam Passed!' : 'Practice Exam Completed'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6A97C0] mt-1 max-w-lg mx-auto font-medium">
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
            className={`inline-block mt-2.5 px-3 py-0.5 rounded-full text-[10px] font-black ${
              passed
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40'
            }`}
          >
            {passed ? 'PASSED (≥80%)' : 'NEEDS PRACTICE (<80%)'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Link
            to="/student/quiz"
            className="btn-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition-transform"
          >
            <RotateCcw className="w-4 h-4" /> Take Another Exam
          </Link>
          <Link
            to="/student/quiz/history"
            className="btn-secondary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-[#1B3D59]" /> Practice Exam History / My Exams
          </Link>
        </div>
      </div>

      {/* Question Review Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
          <h2 className="text-base sm:text-lg font-bold text-[#152026] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#1B3D59]" /> Answer Key & Question Review
          </h2>
          <span className="text-xs text-[#6A97C0] font-semibold">
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
                className={`bg-white border border-[#D4EEF8] rounded-2xl p-5 sm:p-6 space-y-3.5 border-l-4 shadow-sm text-[#152026] ${
                  isCorrect
                    ? 'border-l-emerald-600'
                    : 'border-l-rose-500'
                }`}
              >
                <div className="flex items-center justify-between">
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
                    {isCorrect ? 'Correct Answer (+1)' : 'Incorrect Answer (0)'}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#152026]">
                  {q.questionText}
                </h3>

                <div className="space-y-2 text-xs">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedOpt === oIdx;
                    const isCorrectAnswer = correctOpt === oIdx;

                    let borderClass = 'border-[#D4EEF8] bg-[#FAFCFE] text-[#152026]';

                    if (isCorrectAnswer) {
                      borderClass =
                        'border-emerald-300 bg-emerald-50/90 text-emerald-950 font-bold ring-1 ring-emerald-400/50';
                    } else if (isSelected && !isCorrect) {
                      borderClass =
                        'border-rose-300 bg-rose-50/90 text-rose-950 font-bold ring-1 ring-rose-400/50';
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
                                ? 'bg-emerald-700 text-white'
                                : isSelected
                                ? 'bg-rose-600 text-white'
                                : 'bg-[#D4EEF8] text-[#1B3D59]'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="font-medium">{opt}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isCorrectAnswer && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold">
                              <Check className="w-3 h-3 text-emerald-700" /> Correct Answer
                            </span>
                          )}
                          {isSelected && !isCorrect && (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[9px] font-bold">
                              Your Choice (Wrong)
                            </span>
                          )}
                          {isSelected && isCorrect && (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-[#B3D5F1] text-[#1B3D59] border border-[#6A97C0]/40 text-[9px] font-bold">
                              Your Choice
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="p-3.5 bg-[#F3EED8] border border-[#6A97C0]/40 rounded-xl text-xs text-[#152026] flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-[#1B3D59] shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-[#1B3D59]">Driver Tip / Explanation:</strong>{' '}
                      <span className="font-medium">{q.explanation}</span>
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
