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
          // Auto-select first matching list for the initial language and category
          const match = res.data.lists.find(
            (l) =>
              l.language?.toLowerCase() === language.toLowerCase() &&
              (l.vehicleCategory === vehicleCategory || l.vehicleCategory === 'All')
          );
          if (match) {
            setSelectedListId(match._id);
          } else {
            setSelectedListId('');
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

  // When language or vehicleCategory changes, update selectedListId strictly
  useEffect(() => {
    if (questionLists.length > 0) {
      const match = questionLists.find(
        (l) =>
          l.language?.toLowerCase() === language.toLowerCase() &&
          (l.vehicleCategory === vehicleCategory || l.vehicleCategory === 'All')
      );
      if (match) {
        setSelectedListId(match._id);
      } else {
        setSelectedListId('');
      }
    }
  }, [language, vehicleCategory, questionLists]);

  const handleStartQuiz = () => {
    if (listsToShow.length === 0) {
      toast.error(`No question lists are available in ${language} for the selected vehicle category.`);
      return;
    }
    const chosenList = questionLists.find((l) => l._id === selectedListId);
    if (!chosenList) {
      toast.error('Please select a question list to start the exam.');
      return;
    }
    if (chosenList.language?.toLowerCase() !== language?.toLowerCase()) {
      toast.error(`Selected question list language (${chosenList.language}) does not match current exam language (${language}).`);
      return;
    }
    let url = `/student/quiz/take?language=${language}&category=${vehicleCategory}&listId=${chosenList._id}`;
    navigate(url);
  };

  // Strictly filter lists by selected language and category (NO fallback to other languages)
  const matchingLists = questionLists.filter(
    (l) =>
      l.language?.toLowerCase() === language.toLowerCase() &&
      (l.vehicleCategory === vehicleCategory || l.vehicleCategory === 'All')
  );

  const listsToShow = matchingLists;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Header Banner */}
      <div className="relative rounded-3xl text-white p-7 sm:p-8 bg-gradient-to-r from-[#152026] via-[#1B3D59] to-[#152026] border border-[#6A97C0]/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B3D5F1]/20 border border-[#B3D5F1]/30 text-[#D4EEF8] font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#B3D5F1]" /> DMT Written Exam Preparation Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white drop-shadow">
            DMT Theory Practice Examination
          </h1>
          <p className="text-[#D4EEF8] text-xs sm:text-sm max-w-xl leading-relaxed">
            Choose an exam paper or question list, select your preferred language, and simulate the official Department of Motor Traffic written test format.
          </p>
        </div>

        <Link
          to="/student/quiz/history"
          className="bg-[#D4EEF8] hover:bg-[#B3D5F1] text-[#1B3D59] text-xs py-2.5 px-4 rounded-xl font-bold flex items-center gap-1.5 self-start sm:self-center shrink-0 shadow-sm transition-all"
        >
          <History className="w-4 h-4 text-[#1B3D59]" /> View My Completed Exams
        </Link>
      </div>

      {/* Informal Practice Note */}
      <div className="p-4 bg-[#D4EEF8]/40 border border-[#B3D5F1] rounded-2xl flex items-start gap-3 text-xs text-[#152026]">
        <Info className="w-5 h-5 text-[#1B3D59] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#1B3D59]">Informal Self-Study Preparation Aid</p>
          <p className="mt-0.5 text-[#152026]/80 leading-relaxed font-medium">
            This module provides authentic practice questions on Sri Lankan traffic rules, priority crossings, road signs, and safe driving principles. You can review your completed exams and past submitted answers at any time.
          </p>
        </div>
      </div>

      {/* Setup Card */}
      <div className="bg-white border border-[#D4EEF8] rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
        {/* Step 1: Language Selection */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-[#152026] flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#1B3D59]" /> 1. Select Examination Language:
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
                    ? 'border-[#1B3D59] bg-[#D4EEF8]/40 text-[#152026] shadow-sm ring-1 ring-[#1B3D59]'
                    : 'border-[#D4EEF8] hover:border-[#6A97C0] bg-white text-[#152026]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-[#152026]">{l.label}</p>
                  {language === l.id && <CheckCircle2 className="w-4 h-4 text-[#1B3D59]" />}
                </div>
                <p className="text-[11px] text-[#6A97C0] mt-0.5 font-medium">{l.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Vehicle Category */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-[#152026] flex items-center gap-2">
            <Car className="w-4 h-4 text-[#1B3D59]" /> 2. Select Vehicle Category:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setVehicleCategory('Light')}
              className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                vehicleCategory === 'Light'
                  ? 'border-[#1B3D59] bg-[#D4EEF8]/40 text-[#152026] shadow-sm ring-1 ring-[#1B3D59]'
                  : 'border-[#D4EEF8] hover:border-[#6A97C0] bg-white text-[#152026]'
              }`}
            >
              <div className="p-3 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] shrink-0">
                <Car className="w-6 h-6 text-[#1B3D59]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-[#152026]">Light Vehicle Category</p>
                  {vehicleCategory === 'Light' && <CheckCircle2 className="w-4 h-4 text-[#1B3D59]" />}
                </div>
                <p className="text-xs text-[#6A97C0] mt-1 font-medium leading-relaxed">
                  Dual Purpose Cars, Light Vans, Motorcycles, and Auto Rickshaws (3-Wheelers).
                </p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[#B3D5F1]/30 border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-[10px]">
                  Class B / A1
                </span>
              </div>
            </div>

            <div
              onClick={() => setVehicleCategory('Heavy')}
              className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                vehicleCategory === 'Heavy'
                  ? 'border-[#1B3D59] bg-[#D4EEF8]/40 text-[#152026] shadow-sm ring-1 ring-[#1B3D59]'
                  : 'border-[#D4EEF8] hover:border-[#6A97C0] bg-white text-[#152026]'
              }`}
            >
              <div className="p-3 rounded-xl bg-[#FAFCFE] border border-[#D4EEF8] shrink-0">
                <Bus className="w-6 h-6 text-[#1B3D59]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-[#152026]">Heavy Vehicle Category</p>
                  {vehicleCategory === 'Heavy' && <CheckCircle2 className="w-4 h-4 text-[#1B3D59]" />}
                </div>
                <p className="text-xs text-[#6A97C0] mt-1 font-medium leading-relaxed">
                  Passenger Buses, Heavy Goods Vehicles (Lorries), and Prime Movers.
                </p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[#F3EED8] border border-[#6A97C0]/30 text-[#152026] font-bold text-[10px]">
                  Class D / C
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Question List Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[#152026] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1B3D59]" /> 3. Select Question List / Exam Paper:
            </label>
            <span className="text-xs text-[#6A97C0] font-semibold">
              {listsToShow.length} Question Lists Available
            </span>
          </div>

          {loadingLists ? (
            <div className="py-8 text-center text-xs text-[#6A97C0] font-medium">Loading Question Lists...</div>
          ) : listsToShow.length === 0 ? (
            <div className="p-8 bg-[#FAFCFE] border border-[#D4EEF8] rounded-2xl text-center space-y-2">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-bold text-sm text-[#152026]">No Question Lists Available</p>
              <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                There are currently no question lists available for {language}.
              </p>
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
                        ? 'border-[#1B3D59] bg-[#D4EEF8]/40 shadow-sm ring-1 ring-[#1B3D59]'
                        : 'border-[#D4EEF8] hover:border-[#6A97C0] bg-white text-[#152026]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-bold text-[9px] ${
                              list.language === 'Sinhala'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : list.language === 'Tamil'
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}
                          >
                            {list.language}
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#FAFCFE] border border-[#D4EEF8] text-[#152026] font-semibold text-[9px]">
                            {list.vehicleCategory}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1B3D59] shrink-0" />}
                      </div>

                      <h4 className="font-bold text-sm text-[#152026] mt-2 line-clamp-1">
                        {list.name}
                      </h4>
                      <p className="text-xs text-[#6A97C0] mt-1 line-clamp-2 leading-relaxed font-medium">
                        {list.description || 'Practice exam paper covering DMT theory questions.'}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#D4EEF8] flex items-center justify-between text-xs">
                      <span className="font-bold text-[#152026]">
                        {list.totalQuestions || list.questionCount || 0} Questions
                      </span>
                      <span className="text-[11px] text-[#6A97C0] font-semibold">
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
        <div className="pt-5 border-t border-[#D4EEF8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#6A97C0] font-medium">
            DMT Passing Benchmark: <strong className="text-emerald-700 font-bold">80% (Pass standard)</strong> • Practice exam results are saved to your exam history
          </div>
          <button
            onClick={handleStartQuiz}
            disabled={listsToShow.length === 0 || !selectedListId}
            className="btn-primary px-8 py-3.5 font-bold text-sm shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Start Practice Exam <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent Completed Exams Quick Section */}
      {recentAttempts.length > 0 && (
        <div className="bg-white border border-[#D4EEF8] rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D4EEF8] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#152026] flex items-center gap-2">
                <History className="w-4 h-4 text-[#1B3D59]" /> My Recent Completed Practice Exams
              </h3>
              <p className="text-xs text-[#6A97C0] font-medium">Review your recent exam answers and performance.</p>
            </div>
            <Link
              to="/student/quiz/history"
              className="text-xs font-bold text-[#1B3D59] hover:text-[#152026] flex items-center gap-1 transition-colors"
            >
              View All Past Exams <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentAttempts.map((att) => (
              <Link
                key={att._id}
                to={`/student/quiz/history?review=${att._id}`}
                className="p-3.5 rounded-2xl bg-[#FAFCFE] border border-[#D4EEF8] hover:border-[#1B3D59] transition-all group block"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      att.passed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#F3EED8] text-[#152026] border border-[#6A97C0]/40'
                    }`}
                  >
                    {att.passed ? 'Passed' : 'Needs Practice'}
                  </span>
                  <span className="text-[10px] text-[#6A97C0]">
                    {att.takenAt ? new Date(att.takenAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[#152026] group-hover:text-[#1B3D59] truncate transition-colors">
                  {att.questionListName || att.questionListId?.name || 'DMT Practice Exam'}
                </h4>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-[#6A97C0] font-medium">Score:</span>
                  <span className="font-bold text-[#152026]">
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
