import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
} from 'lucide-react';

export default function QuizSetupPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('English');
  const [vehicleCategory, setVehicleCategory] = useState('Light');

  const handleStartQuiz = () => {
    navigate(`/student/quiz/take?language=${language}&category=${vehicleCategory}`);
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 space-y-8 max-w-4xl mx-auto w-full">
      {/* Header Banner */}
      <div className="relative backdrop-blur-2xl bg-gradient-to-r from-slate-900/90 via-primary/70 to-slate-900/90 rounded-3xl text-white p-8 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5" /> Multilingual Exam Practice Module
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white drop-shadow">
            DMT Written Exam Practice Test
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            Simulate the Department of Motor Traffic written test format in your preferred language to boost your confidence.
          </p>
        </div>

        <Link
          to="/student/quiz/history"
          className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5 self-start sm:self-center font-bold relative z-10"
        >
          <History className="w-4 h-4 text-cyan-300" /> View Past Scores
        </Link>
      </div>

      {/* Informal Practice Note */}
      <div className="p-4 bg-cyan-500/10 border border-cyan-400/20 rounded-2xl backdrop-blur-md flex items-start gap-3 text-xs text-slate-200">
        <Info className="w-5 h-5 text-cyan-300 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-cyan-300">Informal Preparation Practice</p>
          <p className="mt-0.5 text-slate-300">
            This module provides self-study practice questions on road safety, traffic signals, and vehicle laws. This is an informal training aid to help you prepare before sitting the official government DMT examination.
          </p>
        </div>
      </div>

      {/* Setup Card */}
      <div className="card shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-6 sm:p-8 space-y-8">
        {/* Step 1: Language Selection */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-cyan-400" /> 1. Select Examination Language:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'English', label: 'English', sub: 'Standard English Format' },
              { id: 'Sinhala', label: 'සිංහල (Sinhala)', sub: 'ශ්‍රී ලංකා ප්‍රමිති ප්‍රශ්නාවලිය' },
              { id: 'Tamil', label: 'தமிழ் (Tamil)', sub: 'இலங்கை நிலையான வினாத்தாள்' },
            ].map((l) => (
              <div
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  language === l.id
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                    : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-300'
                }`}
              >
                <p className="font-bold text-sm text-white">{l.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{l.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Vehicle Category */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-400" /> 2. Select Vehicle Category:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setVehicleCategory('Light')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                vehicleCategory === 'Light'
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                  : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-300'
              }`}
            >
              <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                <Car className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Light Vehicle Category</p>
                <p className="text-xs text-slate-400 mt-1">Dual Purpose Cars, Motorcycles, and Auto Rickshaws (3-Wheelers).</p>
                <span className="badge badge-info text-[10px] mt-2">Class B / A1</span>
              </div>
            </div>

            <div
              onClick={() => setVehicleCategory('Heavy')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                vehicleCategory === 'Heavy'
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                  : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-300'
              }`}
            >
              <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                <Bus className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Heavy Vehicle Category</p>
                <p className="text-xs text-slate-400 mt-1">Passenger Buses, Heavy Goods Lorries, and Prime Movers.</p>
                <span className="badge badge-warning text-[10px] mt-2">Class D / C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Pass Benchmark: <strong className="text-emerald-400 font-bold">80% (32 / 40 correct)</strong> • Standard timer provided
          </div>
          <button
            onClick={handleStartQuiz}
            className="btn-accent px-8 py-3.5 font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 hover:scale-105"
          >
            Start Practice Exam <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
