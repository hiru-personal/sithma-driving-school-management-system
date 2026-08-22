import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  BookOpen,
  Plus,
  Trash2,
  Globe2,
  Car,
  Bus,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuestionBankManagementPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Add Question Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
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

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/quiz/questions', {
        params: {
          language: languageFilter === 'All' ? 'English' : languageFilter,
          vehicleCategory: categoryFilter === 'All' ? 'Light' : categoryFilter,
        },
      });
      if (res.data.success) {
        setQuestions(res.data.questions);
      }
    } catch (err) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [languageFilter, categoryFilter]);

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        questionText: formData.questionText,
        options: [formData.optionA, formData.optionB, formData.optionC, formData.optionD],
        correctAnswerIndex: parseInt(formData.correctAnswerIndex, 10),
        explanation: formData.explanation,
        language: formData.language,
        vehicleCategory: formData.vehicleCategory,
      };

      const res = await api.post('/quiz/questions', payload);
      if (res.data.success) {
        toast.success('Question added to question bank');
        setIsAddModalOpen(false);
        setFormData({
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
        fetchQuestions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create question');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await api.delete(`/quiz/questions/${id}`);
      if (res.data.success) {
        toast.success('Question deleted');
        fetchQuestions();
      }
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> DMT Exam Practice Repository
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2 drop-shadow">
            <BookOpen className="w-6 h-6 text-cyan-400" /> Trilingual Question Bank Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage informal practice questions in Sinhala, Tamil, and English for learner exam prep.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchQuestions} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="btn-accent text-xs py-2 px-4 font-bold shadow-md flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Language Track:</label>
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-white/15 rounded-xl text-xs bg-slate-950/80 font-bold text-cyan-300 outline-none"
          >
            <option value="All">All Language Versions</option>
            <option value="English">English</option>
            <option value="Sinhala">සිංහල (Sinhala)</option>
            <option value="Tamil">தமிழ் (Tamil)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-white/15 rounded-xl text-xs bg-slate-950/80 font-medium text-slate-200 outline-none"
          >
            <option value="All">All Vehicle Classes</option>
            <option value="Light">Light Vehicle (Car / Bike / 3-Wheel)</option>
            <option value="Heavy">Heavy Vehicle (Bus / Lorry)</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Loading question bank...
          </div>
        ) : questions.length === 0 ? (
          <div className="card text-center py-10 space-y-2">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No questions found matching your filter</p>
            <p className="text-xs text-slate-400">Click "Add Question" to seed questions into the bank.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q._id} className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-info text-[10px]">Q{idx + 1}</span>
                    <span className="badge badge-warning text-[10px]">{q.language}</span>
                    <span className="badge bg-white/10 text-slate-300 border border-white/15 text-[10px]">
                      {q.vehicleCategory} Vehicle
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors"
                    title="Delete question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white">{q.questionText}</h3>

                {/* Multiple Choice Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options?.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-3 rounded-xl border flex items-center gap-2 ${
                        oIdx === q.correctAnswerIndex
                          ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : 'border-white/10 bg-white/5 text-slate-300'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center text-[10px] font-bold">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                      {oIdx === q.correctAnswerIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-400 bg-white/5 p-2.5 rounded-xl border border-white/10">
                    💡 <strong>Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" /> Add Practice Question
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Language:</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  >
                    <option value="English">English</option>
                    <option value="Sinhala">සිංහල (Sinhala)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category:</label>
                  <select
                    value={formData.vehicleCategory}
                    onChange={(e) => setFormData({ ...formData, vehicleCategory: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                  >
                    <option value="Light">Light Vehicle</option>
                    <option value="Heavy">Heavy Vehicle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Question Prompt:</label>
                <textarea
                  rows={2}
                  required
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="e.g. What does a continuous yellow line in the center of the road indicate?"
                  className="w-full px-3.5 py-2.5 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-slate-300">Options (A, B, C, D):</label>
                <input
                  type="text"
                  required
                  placeholder="Option A"
                  value={formData.optionA}
                  onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                  className="w-full px-3.5 py-2 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Option B"
                  value={formData.optionB}
                  onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                  className="w-full px-3.5 py-2 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Option C"
                  value={formData.optionC}
                  onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                  className="w-full px-3.5 py-2 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Option D"
                  value={formData.optionD}
                  onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                  className="w-full px-3.5 py-2 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Correct Option:</label>
                <select
                  value={formData.correctAnswerIndex}
                  onChange={(e) =>
                    setFormData({ ...formData, correctAnswerIndex: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3.5 py-2.5 border border-emerald-400/40 bg-slate-900/90 text-emerald-400 font-bold rounded-xl"
                >
                  <option value={0}>Option A is Correct</option>
                  <option value={1}>Option B is Correct</option>
                  <option value={2}>Option C is Correct</option>
                  <option value={3}>Option D is Correct</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Explanation / Driver Tip (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Crossing a solid continuous line is prohibited under Sri Lanka traffic law."
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="w-full px-3.5 py-2 border border-white/15 bg-slate-900/90 text-white rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-5 font-bold">
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
