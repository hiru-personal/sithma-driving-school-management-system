import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuizTakingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const language = searchParams.get('language') || 'English';
  const vehicleCategory = searchParams.get('category') || 'Light';

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/quiz/questions', {
          params: { language, vehicleCategory },
        });
        if (res.data.success && res.data.questions.length > 0) {
          setQuestions(res.data.questions);
        } else {
          toast.error('No practice questions available for this selection');
        }
      } catch (err) {
        toast.error('Failed to load quiz questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [language, vehicleCategory]);

  const handleSelectOption = (questionId, optionIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    const answeredEntries = Object.entries(userAnswers);
    if (answeredEntries.length === 0) {
      toast.error('Please answer at least one question before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        language,
        vehicleCategory,
        userAnswers: questions.map((q) => ({
          questionId: q._id,
          selectedOption: userAnswers[q._id] !== undefined ? userAnswers[q._id] : -1,
        })),
      };

      const res = await api.post('/quiz/attempt', payload);
      if (res.data.success) {
        navigate('/student/quiz/result', {
          state: {
            resultData: res.data,
            questions,
            language,
            vehicleCategory,
          },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz attempt');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-300 font-bold text-sm bg-slate-900/80 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
          <Clock className="w-5 h-5 animate-spin text-cyan-400" /> Preparing your {language} practice paper...
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4">
        <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-lg font-bold text-white">No questions available</h2>
        <button onClick={() => navigate('/student/quiz')} className="btn-primary text-xs py-2.5 px-5">
          Back to Quiz Setup
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-4xl mx-auto w-full">
      {/* Top Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <span className="badge badge-info text-xs">
            {language} • {vehicleCategory} Vehicle
          </span>
          <h1 className="text-lg font-bold text-white mt-1">DMT Written Exam Practice</h1>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="text-slate-400">Answered:</span>
          <span className="text-cyan-300 font-bold">
            {answeredCount} of {total} Questions
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>Question {currentIndex + 1} of {total}</span>
          <span className="text-cyan-300 font-semibold">{progressPercent}% Complete</span>
        </div>
        <div className="w-full bg-slate-950/80 h-2.5 rounded-full overflow-hidden border border-white/15 p-0.5">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.7)]"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
            Question #{currentIndex + 1}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
            {currentQ.questionText}
          </h2>
        </div>

        {/* 4 Options Grid */}
        <div className="space-y-3">
          {currentQ.options.map((option, optIdx) => {
            const isSelected = userAnswers[currentQ._id] === optIdx;

            return (
              <div
                key={optIdx}
                onClick={() => handleSelectOption(currentQ._id, optIdx)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                    : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="text-sm font-medium">{option}</span>
                </div>

                {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Navigation & Submit Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className="btn-secondary text-xs py-2.5 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {currentIndex < total - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary text-xs py-2.5 px-5 font-bold"
            >
              Next Question <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitQuiz}
              className="btn-accent text-xs py-2.5 px-6 font-bold shadow-lg"
            >
              {submitting ? 'Calculating Score...' : 'Submit & Check Answers'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
