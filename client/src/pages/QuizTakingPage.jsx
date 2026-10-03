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
        <div className="flex items-center gap-3 text-[#1B3D59] font-bold text-sm bg-white px-6 py-4 rounded-2xl border border-[#D4EEF8] shadow-xl">
          <Clock className="w-5 h-5 animate-spin text-[#1B3D59]" /> Preparing practice exam paper...
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-16 px-4 text-center max-w-md mx-auto space-y-4">
        <BookOpen className="w-12 h-12 text-[#6A97C0] mx-auto" />
        <h2 className="text-lg font-bold text-[#152026]">No Questions Available</h2>
        <p className="text-xs text-[#6A97C0] font-medium">
          This question list has no questions loaded for the selected category.
        </p>
        <button onClick={() => navigate('/student/quiz')} className="btn-primary text-xs py-2.5 px-5 font-bold">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4EEF8] pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#B3D5F1]/30 border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-xs">
              {language} • {vehicleCategory} Vehicle
            </span>
            {questionListName && (
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/30 font-semibold text-xs flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#1B3D59]" /> {questionListName}
              </span>
            )}
          </div>
          <h1 className="text-xl font-extrabold text-[#152026] mt-2">
            {questionListName || 'DMT Written Exam Practice'}
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="text-[#6A97C0]">Progress:</span>
          <span className="text-[#1B3D59] font-extrabold text-sm">
            {answeredCount} of {total} Questions Answered
          </span>
        </div>
      </div>

      {/* Progress Bar (Windstorm / Deep Ocean) */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-[#6A97C0]">
          <span>Question {currentIndex + 1} of {total}</span>
          <span className="text-[#1B3D59] font-bold">{progressPercent}% Complete</span>
        </div>
        <div className="w-full bg-[#D4EEF8] h-3 rounded-full overflow-hidden border border-[#B3D5F1] p-0.5">
          <div
            className="bg-[#1B3D59] h-2 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card (White surface, Deep Ocean header, Black Pine question text) */}
      <div className="bg-white border border-[#D4EEF8] rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#1B3D59] uppercase tracking-wider block">
            Question #{currentIndex + 1} of {total}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-[#152026] leading-snug">
            {currentQ.questionText}
          </h2>
        </div>

        {/* 4 Options Grid (Melting Ice selected, Avalanche hover) */}
        <div className="space-y-3">
          {currentQ.options.map((option, optIdx) => {
            const isSelected = userAnswers[currentQ._id] === optIdx;

            return (
              <div
                key={optIdx}
                onClick={() => handleSelectOption(currentQ._id, optIdx)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-[#1B3D59] bg-[#B3D5F1] text-[#152026] shadow-sm ring-2 ring-[#1B3D59]'
                    : 'border-[#D4EEF8] hover:bg-[#D4EEF8] bg-white text-[#152026]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#1B3D59] text-white shadow-sm'
                        : 'bg-[#D4EEF8] text-[#1B3D59]'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="text-sm font-semibold leading-relaxed">{option}</span>
                </div>

                {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1B3D59] flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Attention Notice if near end and unanswered questions remain */}
        {currentIndex === total - 1 && answeredCount < total && (
          <div className="p-3 bg-[#F3EED8] border border-[#6A97C0]/40 rounded-2xl flex items-center gap-2.5 text-xs text-[#152026] font-medium">
            <AlertCircle className="w-4 h-4 text-[#1B3D59] shrink-0" />
            <span>
              You have unanswered questions ({total - answeredCount} remaining). You can still navigate back using "Previous" to answer them before submitting.
            </span>
          </div>
        )}

        {/* Navigation & Submit Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-[#D4EEF8]">
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
              className="btn-primary text-xs py-2.5 px-6 font-bold shadow-md hover:scale-[1.02] transition-transform"
            >
              {submitting ? 'Submitting & Evaluating Answers...' : 'Submit & Check Answers'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
