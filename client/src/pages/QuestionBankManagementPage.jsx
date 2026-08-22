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
    <div className="min-h-screen bg-neutralBg py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textMain font-heading flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Exam Practice Question Bank
          </h1>
          <p className="text-xs text-textMuted mt-0.5">
            Manage multilingual (Sinhala, Tamil, English) practice questions and answer explanations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchQuestions} className="btn-secondary text-xs py-2 px-3">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-textMain mb-1">Language:</label>
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs bg-white font-medium"
          >
            <option value="All">English (Default)</option>
            <option value="Sinhala">සිංහල (Sinhala)</option>
            <option value="Tamil">தமிழ் (Tamil)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-textMain mb-1">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-borderColor rounded-lg text-xs bg-white font-medium"
          >
            <option value="All">Light Vehicle</option>
            <option value="Heavy">Heavy Vehicle (Bus)</option>
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <div className="card p-0 overflow-hidden shadow-card">
        {loading ? (
          <div className="py-12 text-center text-xs text-textMuted flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading question bank...
          </div>
        ) : questions.length === 0 ? (
          <div className="card text-center py-12 space-y-2">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-textMain">No questions found</p>
            <p className="text-xs text-textMuted">Click "Add Question" to create new test questions.</p>
          </div>
        ) : (
          <div className="divide-y divide-borderColor">
            {questions.map((q, idx) => (
              <div key={q._id} className="p-4 sm:p-5 hover:bg-primary-light/10 transition-colors space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-info text-[10px]">{q.language}</span>
                      <span className="badge badge-warning text-[10px]">{q.vehicleCategory} Vehicle</span>
                    </div>
                    <h3 className="font-bold text-sm text-textMain">{q.questionText}</h3>
                  </div>

                  <button
                    onClick={() => handleDelete(q._id)}
                    className="p-1.5 rounded text-danger hover:bg-danger-light transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className="p-2 rounded bg-neutralBg border border-borderColor text-textMuted flex items-center gap-2"
                    >
                      <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-primary pt-1">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-modal max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-borderColor pb-3">
              <h3 className="text-base font-bold text-textMain">Add New Practice Question</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-textMain text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-textMain mb-1">Language:</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-borderColor rounded-lg bg-white"
                  >
                    <option value="English">English</option>
                    <option value="Sinhala">සිංහල (Sinhala)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-textMain mb-1">Vehicle Category:</label>
                  <select
                    value={formData.vehicleCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleCategory: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-borderColor rounded-lg bg-white"
                  >
                    <option value="Light">Light Vehicle</option>
                    <option value="Heavy">Heavy Vehicle (Bus)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-textMain mb-1">Question Text:</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Enter the question text..."
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  className="w-full px-3 py-2 border border-borderColor rounded-lg"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-textMain mb-1">Option A:</label>
                <input
                  type="text"
                  required
                  value={formData.optionA}
                  onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                  className="w-full px-3 py-1.5 border border-borderColor rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-textMain mb-1">Option B:</label>
                <input
                  type="text"
                  required
                  value={formData.optionB}
                  onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                  className="w-full px-3 py-1.5 border border-borderColor rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-textMain mb-1">Option C:</label>
                <input
                  type="text"
                  required
                  value={formData.optionC}
                  onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                  className="w-full px-3 py-1.5 border border-borderColor rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-textMain mb-1">Option D:</label>
                <input
                  type="text"
                  required
                  value={formData.optionD}
                  onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                  className="w-full px-3 py-1.5 border border-borderColor rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-textMain mb-1">Correct Answer:</label>
                <select
                  value={formData.correctAnswerIndex}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      correctAnswerIndex: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-3 py-2 border border-borderColor rounded-lg bg-white font-bold text-success"
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-textMain mb-1">Explanation / Legal Rule:</label>
                <input
                  type="text"
                  placeholder="Explain why this option is correct..."
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="w-full px-3 py-1.5 border border-borderColor rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-borderColor">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary py-2 px-3 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-4 text-xs font-bold">
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
