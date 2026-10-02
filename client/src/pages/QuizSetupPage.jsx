import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  BookOpen,
  Globe2,
  Car,
  Bus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  History,
  Info,
  Layers,
  CheckCircle2,
  Clock,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuizSetupPage() {
  const navigate = useNavigate();
  const { student, user } = useAuth();

  const [language, setLanguage] = useState('English');
  const [vehicleCategory, setVehicleCategory] = useState('Light');
  const [questionLists, setQuestionLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [loadingLists, setLoadingLists] = useState(true);

  // Recent attempts preview
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch available Question Lists
  useEffect(() => {
    const fetchLists = async () => {
      setLoadingLists(true);
      try {
        const res = await api.get('/quiz/lists');
        if (res.data.success && res.data.lists) {
          setQuestionLists(res.data.lists);
          // Auto-select first matching list or first list
          const match = res.data.lists.find(
            (l) =>
              (l.language === language || l.language === 'All') &&
              (l.vehicleCategory === vehicleCategory || l.vehicleCategory === 'All')
          );
          if (match) {
            setSelectedListId(match._id);
          } else if (res.data.lists.length > 0) {
            setSelectedListId(res.data.lists[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load question lists:', err);
      } finally {
        setLoadingLists(false);
      }
    };

    fetchLists();
  }, []);

  // Fetch recent attempts preview for the student
  useEffect(() => {
    const studentId = student?._id || user?.studentId || user?._id;
    if (!studentId) return;

    const fetchRecent = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get(`/quiz/attempts/student/${studentId}`);
        if (res.data.success) {
          setRecentAttempts(res.data.attempts.slice(0, 3));
        }
      } catch (err) {
        // Silent catch for preview
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchRecent();
  }, [student, user]);

  // When language or vehicleCategory changes, update selectedListId if necessary
  useEffect(() => {
    if (questionLists.length > 0) {
      const match = questionLists.find(
        (l) =>
          (l.language === language || l.language === 'All') &&
          (l.vehicleCategory === vehicleCategory || l.vehicleCategory === 'All')
      );
      if (match) {
        setSelectedListId(match._id);
      }
    }
  }, [language, vehicleCategory, questionLists]);

  const handleStartQuiz = () => {
    let url = `/student/quiz/take?language=${language}&category=${vehicleCategory}`;
    if (selectedListId) {
      url += `&listId=${selectedListId}`;
    }
    navigate(url);
  };

  const matchingLists = questionLists.filter(
    (l) =>
      (l.language === language || l.language === 'All') &&
      (l.vehicleCategory === vehicleCategory || l.vehicleCategory === 'All')
  );

  const listsToShow = matchingLists.length > 0 ? matchingLists : questionLists;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header Banner */}
      <div className="relative backdrop-blur-2xl bg-gradient-to-r from-slate-900 via-primary to-slate-900 rounded-3xl text-white p-7 sm:p-8 border border-white/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-cyan-300 font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5" /> DMT Written Exam Preparation Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white drop-shadow">
            DMT Theory Practice Examination
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm max-w-xl leading-relaxed">
            Choose an exam paper or question list, select your preferred language, and simulate the official Department of Motor Traffic written test format.
          </p>
        </div>

        <Link
          to="/student/quiz/history"
          className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5 self-start sm:self-center font-bold relative z-10 shrink-0"
        >
          <History className="w-4 h-4 text-primary" /> View My Completed Exams
        </Link>
      </div>

      {/* Informal Practice Note */}
      <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-start gap-3 text-xs text-cyan-950">
        <Info className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-cyan-900">Informal Self-Study Preparation Aid</p>
          <p className="mt-0.5 text-cyan-800 leading-relaxed">
            This module provides authentic practice questions on Sri Lankan traffic rules, priority crossings, road signs, and safe driving principles. You can review your completed exams and past submitted answers at any time.
          </p>
        </div>
      </div>

      {/* Setup Card */}
      <div className="card p-6 sm:p-8 space-y-8 shadow-sm">
        {/* Step 1: Language Selection */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-[#112D4E] flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-primary" /> 1. Select Examination Language:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'English', label: 'English', sub: 'Standard English Paper' },
              { id: 'Sinhala', label: 'සිංහල (Sinhala)', sub: 'ශ්‍රී ලංකා ප්‍රමිති ප්‍රශ්නාවලිය' },
              { id: 'Tamil', label: 'தமிழ் (Tamil)', sub: 'இலங்கை நிலையான வினாத்தாள்' },
            ].map((l) => (
              <div
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  language === l.id
                    ? 'border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-[#112D4E]">{l.label}</p>
                  {language === l.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{l.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Vehicle Category */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-[#112D4E] flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-600" /> 2. Select Vehicle Category:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setVehicleCategory('Light')}
              className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                vehicleCategory === 'Light'
                  ? 'border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-[#112D4E]">Light Vehicle Category</p>
                  {vehicleCategory === 'Light' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Dual Purpose Cars, Light Vans, Motorcycles, and Auto Rickshaws (3-Wheelers).
                </p>
                <span className="badge badge-info text-[10px] mt-2">Class B / A1</span>
              </div>
            </div>

            <div
              onClick={() => setVehicleCategory('Heavy')}
              className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                vehicleCategory === 'Heavy'
                  ? 'border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                <Bus className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-[#112D4E]">Heavy Vehicle Category</p>
                  {vehicleCategory === 'Heavy' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Passenger Buses, Heavy Goods Vehicles (Lorries), and Prime Movers.
                </p>
                <span className="badge badge-warning text-[10px] mt-2">Class D / C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Question List Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[#112D4E] flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600" /> 3. Select Question List / Exam Paper:
            </label>
            <span className="text-xs text-slate-500 font-semibold">
              {listsToShow.length} Question Lists Available
            </span>
          </div>

          {loadingLists ? (
            <div className="py-6 text-center text-xs text-slate-500">Loading Question Lists...</div>
          ) : listsToShow.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
              No question lists found for this category. Standard practice exam will be loaded.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {listsToShow.map((list) => {
                const isSelected = selectedListId === list._id;
                return (
                  <div
                    key={list._id}
                    onClick={() => setSelectedListId(list._id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="badge badge-info text-[9px]">{list.language}</span>
                          <span className="badge bg-slate-100 text-slate-600 border border-slate-200 text-[9px]">
                            {list.vehicleCategory}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                      </div>

                      <h4 className="font-bold text-sm text-[#112D4E] mt-2 line-clamp-1">
                        {list.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {list.description || 'Practice exam paper covering DMT theory questions.'}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-[#112D4E]">
                        {list.totalQuestions || list.questionCount || 0} Questions
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Pass Mark: {list.passingScore || 80}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Start Button */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            DMT Passing Benchmark: <strong className="text-emerald-600 font-bold">80% (Pass standard)</strong> • Practice exam results are saved to your exam history
          </div>
          <button
            onClick={handleStartQuiz}
            className="btn-primary px-8 py-3.5 font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 hover:scale-105"
          >
            Start Practice Exam <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent Completed Exams Quick Section */}
      {recentAttempts.length > 0 && (
        <div className="card p-6 space-y-4 shadow-sm border border-[#DBE2EF]">
          <div className="flex items-center justify-between border-b border-[#DBE2EF] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#112D4E] flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> My Recent Completed Practice Exams
              </h3>
              <p className="text-xs text-slate-500">Review your recent exam answers and performance.</p>
            </div>
            <Link
              to="/student/quiz/history"
              className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1"
            >
              View All Past Exams <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentAttempts.map((att) => (
              <Link
                key={att._id}
                to={`/student/quiz/history?review=${att._id}`}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-primary/50 transition-all group block"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`badge text-[9px] py-0 px-2 font-bold ${
                      att.passed ? 'badge-success' : 'badge-danger'
                    }`}
                  >
                    {att.passed ? 'Passed' : 'Needs Practice'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {att.takenAt ? new Date(att.takenAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[#112D4E] group-hover:text-primary truncate">
                  {att.questionListName || att.questionListId?.name || 'DMT Practice Exam'}
                </h4>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Score:</span>
                  <span className="font-black text-slate-900">
                    {att.score} / {att.totalQuestions} ({att.percentage}%)
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
