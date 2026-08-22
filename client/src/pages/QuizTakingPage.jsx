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
    // Check if at least some questions are answered
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
      <div className="min-h-screen bg-neutralBg flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <Clock className="w-5 h-5 animate-spin" /> Preparing your {language} practice paper...
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-neutralBg py-12 px-4 text-center max-w-md mx-auto space-y-4">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-textMain">No questions available</h2>
        <button onClick={() => navigate('/student/quiz')} className="btn-primary text-xs py-2 px-4">
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
    <div className="min-h-screen bg-neutralBg py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-borderColor pb-4">
        <div>
          <span className="badge badge-info text-xs">
            {language} • {vehicleCategory} Vehicle
          </span>
          <h1 className="text-lg font-bold text-textMain mt-1">DMT Written Exam Practice</h1>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="text-textMuted">Answered:</span>
          <span className="text-primary font-bold">
            {answeredCount} of {total} Questions
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-textMuted font-medium">
          <span>Question {currentIndex + 1} of {total}</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card shadow-modal p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Question #{currentIndex + 1}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-textMain leading-snug">
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
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-primary bg-primary-light/40 shadow-sm ring-1 ring-primary'
                    : 'border-borderColor hover:border-primary/40 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-textMuted'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="text-sm font-medium text-textMain">{option}</span>
                </div>

                {isSelected && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Navigation & Submit Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-borderColor">
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
              className="btn-accent text-xs py-2.5 px-6 font-bold text-textMain shadow-md"
            >
              {submitting ? 'Calculating Score...' : 'Submit & Check Answers'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
