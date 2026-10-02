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
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuizTakingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const language = searchParams.get('language') || 'English';
  const vehicleCategory = searchParams.get('category') || 'Light';
  const listId = searchParams.get('listId') || '';

  const [questionListName, setQuestionListName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        // If listId provided, optionally fetch list info
        if (listId) {
          try {
            const listRes = await api.get(`/quiz/lists/${listId}`);
            if (listRes.data.success && listRes.data.list) {
              setQuestionListName(listRes.data.list.name);
            }
          } catch (e) {
            // fallback
          }
        }

        const res = await api.get('/quiz/questions', {
          params: {
            language,
            vehicleCategory,
            questionListId: listId || undefined,
          },
        });

        if (res.data.success && res.data.questions.length > 0) {
          setQuestions(res.data.questions);
        } else {
          toast.error('No practice questions available for this question list selection');
        }
      } catch (err) {
        toast.error('Failed to load quiz questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [language, vehicleCategory, listId]);

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
        questionListId: listId || undefined,
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
            questionListName: res.data.questionListName || questionListName,
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
          <Clock className="w-5 h-5 animate-spin text-cyan-400" /> Preparing practice exam paper...
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-[#112D4E]">No Questions Available</h2>
        <p className="text-xs text-slate-500">
          This question list has no questions loaded for the selected category.
        </p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DBE2EF] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-info text-xs">
              {language} • {vehicleCategory} Vehicle
            </span>
            {questionListName && (
              <span className="badge bg-slate-100 text-slate-700 border border-slate-200 text-xs flex items-center gap-1">
                <Layers className="w-3 h-3 text-primary" /> {questionListName}
              </span>
            )}
          </div>
          <h1 className="text-lg font-bold text-[#112D4E] mt-1.5">
            {questionListName || 'DMT Written Exam Practice'}
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="text-slate-500">Progress:</span>
          <span className="text-primary font-bold text-sm">
            {answeredCount} of {total} Questions Answered
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>Question {currentIndex + 1} of {total}</span>
          <span className="text-primary font-bold">{progressPercent}% Complete</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-[#DBE2EF] p-0.5">
          <div
            className="bg-gradient-to-r from-primary to-cyan-500 h-1.5 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card shadow-lg p-6 sm:p-8 space-y-6 border border-[#DBE2EF]">
        <div className="space-y-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Question #{currentIndex + 1} of {total}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-[#112D4E] leading-snug">
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
                    ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="text-sm font-medium">{option}</span>
                </div>

                {isSelected && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Navigation & Submit Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-[#DBE2EF]">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className="btn-secondary text-xs py-2.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
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
              {submitting ? 'Submitting & Evaluating Answers...' : 'Submit & Check Answers'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
