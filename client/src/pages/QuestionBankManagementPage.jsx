import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Globe2,
  Car,
  Bus,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  X,
  Layers,
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  Search,
  ExternalLink,
  Award,
  Check,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuestionBankManagementPage() {
  // Navigation / View State: 'lists' or 'questions'
  const [selectedList, setSelectedList] = useState(null);

  // Question Lists State
  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [listSearch, setListSearch] = useState('');
  const [listLanguageFilter, setListLanguageFilter] = useState('All');
  const [listCategoryFilter, setListCategoryFilter] = useState('All');

  // Question List Modal State (Create / Edit)
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [listFormData, setListFormData] = useState({
    name: '',
    description: '',
    language: 'English',
    vehicleCategory: 'Light',
    passingScore: 80,
  });

  // Questions inside selected list State
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionSearch, setQuestionSearch] = useState('');

  // Question Modal State (Create / Edit)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionFormData, setQuestionFormData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswerIndex: 0,
    explanation: '',
    language: 'English',
    vehicleCategory: 'Light',
  });

  // ----------------------------------------------------
  // 1. Fetch Question Lists
  // ----------------------------------------------------
  const fetchLists = async () => {
    setLoadingLists(true);
    try {
      const res = await api.get('/quiz/lists', {
        params: {
          search: listSearch || undefined,
          language: listLanguageFilter !== 'All' ? listLanguageFilter : undefined,
          vehicleCategory: listCategoryFilter !== 'All' ? listCategoryFilter : undefined,
        },
      });
      if (res.data.success) {
        setLists(res.data.lists);
        // If a list was selected, update its local data
        if (selectedList) {
          const updated = res.data.lists.find((l) => l._id === selectedList._id);
          if (updated) setSelectedList(updated);
        }
      }
    } catch (err) {
      toast.error('Failed to load question lists');
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, [listSearch, listLanguageFilter, listCategoryFilter]);

  // ----------------------------------------------------
  // 2. Fetch Questions for Selected List
  // ----------------------------------------------------
  const fetchQuestionsForList = async (listId) => {
    if (!listId) return;
    setLoadingQuestions(true);
    try {
      const res = await api.get('/quiz/questions', {
        params: {
          questionListId: listId,
          includeAnswers: 'true',
        },
      });
      if (res.data.success) {
        setQuestions(res.data.questions);
      }
    } catch (err) {
      toast.error('Failed to load questions for this list');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (selectedList) {
      fetchQuestionsForList(selectedList._id);
    }
  }, [selectedList]);

  // ----------------------------------------------------
  // 3. Question List Actions (Create / Edit / Delete)
  // ----------------------------------------------------
  const handleOpenCreateListModal = () => {
    setEditingList(null);
    setListFormData({
      name: '',
      description: '',
      language: 'English',
      vehicleCategory: 'Light',
      passingScore: 80,
    });
    setIsListModalOpen(true);
  };

  const handleOpenEditListModal = (list, e) => {
    if (e) e.stopPropagation();
    setEditingList(list);
    setListFormData({
      name: list.name,
      description: list.description || '',
      language: list.language || 'English',
      vehicleCategory: list.vehicleCategory || 'Light',
      passingScore: list.passingScore || 80,
    });
    setIsListModalOpen(true);
  };

  const handleSaveList = async (e) => {
    e.preventDefault();
    if (!listFormData.name.trim()) {
      toast.error('Please enter a Question List name');
      return;
    }

    try {
      if (editingList) {
        const res = await api.put(`/quiz/lists/${editingList._id}`, listFormData);
        if (res.data.success) {
          toast.success('Question List updated');
          setIsListModalOpen(false);
          fetchLists();
        }
      } else {
        const res = await api.post('/quiz/lists', listFormData);
        if (res.data.success) {
          toast.success('New Question List created');
          setIsListModalOpen(false);
          fetchLists();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save question list');
    }
  };

  const handleDeleteList = async (list, e) => {
    if (e) e.stopPropagation();
    if (
      !window.confirm(
        `Are you sure you want to delete Question List "${list.name}"?\nAll questions in this list will also be deleted.`
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/quiz/lists/${list._id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Question List deleted');
        if (selectedList?._id === list._id) {
          setSelectedList(null);
        }
        fetchLists();
      }
    } catch (err) {
      toast.error('Failed to delete question list');
    }
  };

  // ----------------------------------------------------
  // 4. Question Actions (Create / Edit / Delete)
  // ----------------------------------------------------
  const handleOpenAddQuestionModal = () => {
    setEditingQuestion(null);
    setQuestionFormData({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswerIndex: 0,
      explanation: '',
      language: selectedList?.language !== 'All' ? selectedList?.language : 'English',
      vehicleCategory: selectedList?.vehicleCategory !== 'All' ? selectedList?.vehicleCategory : 'Light',
    });
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestionModal = (q) => {
    setEditingQuestion(q);
    setQuestionFormData({
      questionText: q.questionText,
      optionA: q.options[0] || '',
      optionB: q.options[1] || '',
      optionC: q.options[2] || '',
      optionD: q.options[3] || '',
      correctAnswerIndex: q.correctAnswerIndex ?? 0,
      explanation: q.explanation || '',
      language: q.language || 'English',
      vehicleCategory: q.vehicleCategory || 'Light',
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!selectedList) return;

    const payload = {
      questionListId: selectedList._id,
      questionText: questionFormData.questionText,
      options: [
        questionFormData.optionA,
        questionFormData.optionB,
        questionFormData.optionC,
        questionFormData.optionD,
      ],
      correctAnswerIndex: parseInt(questionFormData.correctAnswerIndex, 10),
      explanation: questionFormData.explanation,
      language: questionFormData.language,
      vehicleCategory: questionFormData.vehicleCategory,
    };

    try {
      if (editingQuestion) {
        const res = await api.put(`/quiz/questions/${editingQuestion._id}`, payload);
        if (res.data.success) {
          toast.success('Question updated successfully');
          setIsQuestionModalOpen(false);
          fetchQuestionsForList(selectedList._id);
          fetchLists();
        }
      } else {
        const res = await api.post('/quiz/questions', payload);
        if (res.data.success) {
          toast.success('Question added to Question List');
          setIsQuestionModalOpen(false);
          fetchQuestionsForList(selectedList._id);
          fetchLists();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to remove this question from this Question List?')) return;
    try {
      const res = await api.delete(`/quiz/questions/${questionId}`);
      if (res.data.success) {
        toast.success('Question removed');
        fetchQuestionsForList(selectedList._id);
        fetchLists();
      }
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  // Filtered questions inside selected list
  const filteredQuestions = questions.filter((q) =>
    questionSearch
      ? q.questionText.toLowerCase().includes(questionSearch.toLowerCase()) ||
        q.options.some((opt) => opt.toLowerCase().includes(questionSearch.toLowerCase()))
      : true
  );

  // Total stats
  const totalQuestionsAllLists = lists.reduce((acc, l) => acc + (l.totalQuestions || 0), 0);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/admin/dashboard" className="hover:text-primary transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button
          onClick={() => setSelectedList(null)}
          className={`hover:text-primary transition-colors ${
            !selectedList ? 'text-[#112D4E] font-bold' : ''
          }`}
        >
          Question Lists
        </button>
        {selectedList && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-primary font-bold truncate max-w-xs">{selectedList.name}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#112D4E] font-bold">Manage Questions</span>
          </>
        )}
      </nav>

      {/* ======================================================== */}
      {/* VIEW A: QUESTION LISTS OVERVIEW (When no list selected)  */}
      {/* ======================================================== */}
      {!selectedList ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-xs mb-2">
                <Sparkles className="w-3.5 h-3.5" /> DMT Exam Repository
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] font-heading flex items-center gap-2.5">
                <Layers className="w-7 h-7 text-primary" /> Question Lists Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Create and manage multiple practice exam question sets, configure paper standards, and organize questions per list.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchLists}
                className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <button
                onClick={handleOpenCreateListModal}
                className="btn-primary text-xs py-2.5 px-4 font-bold shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Question List
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card p-4 space-y-1 border-l-4 border-l-primary">
              <span className="text-[11px] font-semibold text-slate-500">Total Question Lists</span>
              <p className="text-2xl font-black text-[#112D4E]">{lists.length}</p>
            </div>
            <div className="card p-4 space-y-1 border-l-4 border-l-emerald-500">
              <span className="text-[11px] font-semibold text-slate-500">Total Questions In Lists</span>
              <p className="text-2xl font-black text-emerald-600">{totalQuestionsAllLists}</p>
            </div>
            <div className="card p-4 space-y-1 border-l-4 border-l-amber-500">
              <span className="text-[11px] font-semibold text-slate-500">Supported Languages</span>
              <p className="text-sm font-black text-amber-700 mt-1">English, Sinhala, Tamil</p>
            </div>
            <div className="card p-4 space-y-1 border-l-4 border-l-accent">
              <span className="text-[11px] font-semibold text-slate-500">Vehicle Classes</span>
              <p className="text-sm font-black text-slate-900 mt-1">Light (Class B) & Heavy (Class D)</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search question lists by name..."
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div>
              <select
                value={listLanguageFilter}
                onChange={(e) => setListLanguageFilter(e.target.value)}
                className="text-xs font-semibold"
              >
                <option value="All">All Language Versions</option>
                <option value="English">English</option>
                <option value="Sinhala">සිංහල (Sinhala)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
              </select>
            </div>
            <div>
              <select
                value={listCategoryFilter}
                onChange={(e) => setListCategoryFilter(e.target.value)}
                className="text-xs font-semibold"
              >
                <option value="All">All Vehicle Categories</option>
                <option value="Light">Light Vehicle (Dual Purpose / 3-Wheel)</option>
                <option value="Heavy">Heavy Vehicle (Bus / Lorry)</option>
              </select>
            </div>
          </div>

          {/* Question Lists Grid */}
          {loadingLists ? (
            <div className="py-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading Question Lists...
            </div>
          ) : lists.length === 0 ? (
            <div className="card text-center py-12 space-y-3">
              <Layers className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-[#112D4E]">No Question Lists Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No question lists match your search or filter. Create your first Question List to start adding questions.
              </p>
              <button
                onClick={handleOpenCreateListModal}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Question List
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {lists.map((list) => (
                <div
                  key={list._id}
                  onClick={() => setSelectedList(list)}
                  className="card card-hover p-6 flex flex-col justify-between space-y-4 cursor-pointer group border border-[#DBE2EF] transition-all"
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="badge badge-info text-[10px]">{list.language}</span>
                        <span className="badge bg-slate-100 text-slate-700 border border-slate-200 text-[10px]">
                          {list.vehicleCategory}
                        </span>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleOpenEditListModal(list, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors"
                          title="Edit List Settings"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteList(list, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete List"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-[#112D4E] group-hover:text-primary transition-colors line-clamp-1">
                        {list.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {list.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Stats & Action */}
                  <div className="pt-4 border-t border-[#DBE2EF] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-accent text-[11px] font-black">
                        {list.totalQuestions || 0} Questions
                      </span>
                      <span className="text-[10px] text-slate-500">Pass: {list.passingScore || 80}%</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedList(list);
                      }}
                      className="text-xs font-bold text-primary group-hover:text-primary-dark flex items-center gap-1 transition-colors"
                    >
                      Manage Questions <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ======================================================== */
        /* VIEW B: MANAGE QUESTIONS FOR SELECTED LIST               */
        /* ======================================================== */
        <div className="space-y-6">
          {/* Header Banner for Selected Question List */}
          <div className="card p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-primary to-slate-900 text-white rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <button
                  onClick={() => setSelectedList(null)}
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white mb-2 transition-colors font-bold"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to All Question Lists
                </button>
                <div className="flex items-center gap-2">
                  <span className="badge badge-info text-[10px]">{selectedList.language}</span>
                  <span className="badge bg-white/20 text-white border-white/30 text-[10px]">
                    {selectedList.vehicleCategory} Vehicle
                  </span>
                  <span className="badge badge-success text-[10px]">
                    Pass Benchmark: {selectedList.passingScore || 80}%
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white font-heading mt-2">
                  {selectedList.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
                  {selectedList.description || 'Practice exam paper questions for this list.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
                <button
                  onClick={() => handleOpenEditListModal(selectedList)}
                  className="btn-secondary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit List Settings
                </button>
                <button
                  onClick={handleOpenAddQuestionModal}
                  className="btn-accent text-xs py-2.5 px-4 font-bold shadow-lg flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Question to List
                </button>
              </div>
            </div>
          </div>

          {/* Sub Header & Search Bar within this list */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-[#112D4E] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Questions in this List
              </h2>
              <span className="badge badge-accent text-xs">
                {questions.length} Total Questions
              </span>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search questions in this list..."
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          {/* Questions List */}
          {loadingQuestions ? (
            <div className="py-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading questions...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="card text-center py-12 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-[#112D4E]">No Questions in this List</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                This Question List currently has no questions. Click below to add the first question.
              </p>
              <button
                onClick={handleOpenAddQuestionModal}
                className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add First Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => (
                <div key={q._id} className="card p-5 sm:p-6 space-y-4 shadow-sm">
                  {/* Top Bar of Question Card */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-info text-[10px] font-bold">
                        Question #{idx + 1}
                      </span>
                      <span className="badge badge-warning text-[10px]">{q.language}</span>
                      <span className="badge bg-slate-100 text-slate-600 border border-slate-200 text-[10px]">
                        {q.vehicleCategory}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditQuestionModal(q)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors"
                        title="Edit question"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete question from list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <h3 className="text-sm sm:text-base font-bold text-[#112D4E] leading-snug">
                    {q.questionText}
                  </h3>

                  {/* 4 Answer Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {q.options?.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correctAnswerIndex;
                      return (
                        <div
                          key={oIdx}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                            isCorrect
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                              : 'border-slate-200 bg-slate-50/60 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="text-xs">{opt}</span>
                          </div>

                          {isCorrect && (
                            <span className="badge badge-success text-[9px] py-0 px-2 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" /> Correct Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Driver Tip / Explanation */}
                  {q.explanation && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Driver Tip / DMT Rule:</strong>{' '}
                        <span>{q.explanation}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CREATE / EDIT QUESTION LIST                     */}
      {/* ======================================================== */}
      {isListModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DBE2EF] rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DBE2EF] pb-3">
              <h3 className="text-base font-bold text-[#112D4E] flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                {editingList ? 'Edit Question List' : 'Create New Question List'}
              </h3>
              <button
                onClick={() => setIsListModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveList} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Question List Name / Title: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DMT Light Vehicle Mock Exam - Set B"
                  value={listFormData.name}
                  onChange={(e) => setListFormData({ ...listFormData, name: e.target.value })}
                  className="font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description / Purpose (Optional):
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Official Department of Motor Traffic practice paper covering road signs, lane discipline, and vehicle laws."
                  value={listFormData.description}
                  onChange={(e) =>
                    setListFormData({ ...listFormData, description: e.target.value })
                  }
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Language Track:</label>
                  <select
                    value={listFormData.language}
                    onChange={(e) =>
                      setListFormData({ ...listFormData, language: e.target.value })
                    }
                    className="text-xs"
                  >
                    <option value="English">English</option>
                    <option value="Sinhala">සිංහල (Sinhala)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="All">All / Multilingual</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Category:</label>
                  <select
                    value={listFormData.vehicleCategory}
                    onChange={(e) =>
                      setListFormData({ ...listFormData, vehicleCategory: e.target.value })
                    }
                    className="text-xs"
                  >
                    <option value="Light">Light Vehicle (Dual Purpose / 3W)</option>
                    <option value="Heavy">Heavy Vehicle (Bus / Lorry)</option>
                    <option value="All">All Categories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Passing Score Benchmark (%):
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={listFormData.passingScore}
                  onChange={(e) =>
                    setListFormData({ ...listFormData, passingScore: e.target.value })
                  }
                  className="text-xs"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Standard DMT exam passing mark is 80% (32 correct out of 40).
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#DBE2EF]">
                <button
                  type="button"
                  onClick={() => setIsListModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-5 font-bold">
                  {editingList ? 'Update List' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD / EDIT QUESTION IN LIST                     */}
      {/* ======================================================== */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DBE2EF] rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DBE2EF] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#112D4E] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {editingQuestion ? 'Edit Question' : 'Add Question to List'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Target List: <strong className="text-primary">{selectedList?.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Language:</label>
                  <select
                    value={questionFormData.language}
                    onChange={(e) =>
                      setQuestionFormData({ ...questionFormData, language: e.target.value })
                    }
                    className="text-xs"
                  >
                    <option value="English">English</option>
                    <option value="Sinhala">සිංහල (Sinhala)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category:</label>
                  <select
                    value={questionFormData.vehicleCategory}
                    onChange={(e) =>
                      setQuestionFormData({ ...questionFormData, vehicleCategory: e.target.value })
                    }
                    className="text-xs"
                  >
                    <option value="Light">Light Vehicle</option>
                    <option value="Heavy">Heavy Vehicle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Prompt: *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. What does a continuous yellow line in the center of the road indicate?"
                  value={questionFormData.questionText}
                  onChange={(e) =>
                    setQuestionFormData({ ...questionFormData, questionText: e.target.value })
                  }
                  className="text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Options (A, B, C, D): *</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                      A
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Option A"
                      value={questionFormData.optionA}
                      onChange={(e) =>
                        setQuestionFormData({ ...questionFormData, optionA: e.target.value })
                      }
                      className="text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                      B
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Option B"
                      value={questionFormData.optionB}
                      onChange={(e) =>
                        setQuestionFormData({ ...questionFormData, optionB: e.target.value })
                      }
                      className="text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                      C
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Option C"
                      value={questionFormData.optionC}
                      onChange={(e) =>
                        setQuestionFormData({ ...questionFormData, optionC: e.target.value })
                      }
                      className="text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                      D
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Option D"
                      value={questionFormData.optionD}
                      onChange={(e) =>
                        setQuestionFormData({ ...questionFormData, optionD: e.target.value })
                      }
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Which Option is the Correct Answer? *
                </label>
                <select
                  value={questionFormData.correctAnswerIndex}
                  onChange={(e) =>
                    setQuestionFormData({
                      ...questionFormData,
                      correctAnswerIndex: parseInt(e.target.value, 10),
                    })
                  }
                  className="font-bold text-emerald-800 bg-emerald-50 border-emerald-300 text-xs"
                >
                  <option value={0}>Option A is the Correct Answer</option>
                  <option value={1}>Option B is the Correct Answer</option>
                  <option value={2}>Option C is the Correct Answer</option>
                  <option value={3}>Option D is the Correct Answer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Explanation / Driver Tip (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Crossing a solid single continuous line is prohibited under Sri Lanka road regulations."
                  value={questionFormData.explanation}
                  onChange={(e) =>
                    setQuestionFormData({ ...questionFormData, explanation: e.target.value })
                  }
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#DBE2EF]">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-5 font-bold">
                  {editingQuestion ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
