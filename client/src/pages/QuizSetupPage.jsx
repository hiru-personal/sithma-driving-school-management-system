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
    <div className="min-h-screen bg-neutralBg py-10 px-4 sm:px-6 lg:px-8 space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primaryDark via-primary to-[#1875c4] rounded-3xl text-white p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent font-semibold text-xs border border-white/10">
            <Sparkles className="w-3.5 h-3.5" /> Multilingual Exam Practice Module
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            DMT Written Exam Practice Test
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
            Simulate the Department of Motor Traffic written test format in your preferred language to boost your confidence.
          </p>
        </div>

        <Link
          to="/student/quiz/history"
          className="btn-secondary text-xs py-2 px-3 bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-1.5 self-start sm:self-center font-bold"
        >
          <History className="w-4 h-4" /> View My Past Scores
        </Link>
      </div>

      {/* Informal Practice Note */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Informal Preparation Practice</p>
          <p className="mt-0.5 text-blue-800">
            This module provides self-study practice questions on road safety, traffic signals, and vehicle laws. This is an informal training aid to help you prepare before sitting the official government DMT examination.
          </p>
        </div>
      </div>

      {/* Setup Card */}
      <div className="card shadow-modal p-6 sm:p-8 space-y-8">
        {/* Step 1: Language Selection */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-textMain flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-primary" /> 1. Select Examination Language:
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
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  language === l.id
                    ? 'border-primary bg-primary-light/40 shadow-sm ring-1 ring-primary'
                    : 'border-borderColor hover:border-primary/40 bg-white'
                }`}
              >
                <p className="font-bold text-sm text-textMain">{l.label}</p>
                <p className="text-[11px] text-textMuted mt-0.5">{l.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Vehicle Category */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-textMain flex items-center gap-2">
            <Car className="w-4 h-4 text-accent-dark" /> 2. Select Vehicle Category:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setVehicleCategory('Light')}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                vehicleCategory === 'Light'
                  ? 'border-primary bg-primary-light/40 shadow-sm ring-1 ring-primary'
                  : 'border-borderColor hover:border-primary/40 bg-white'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-textMain">Light Vehicles</p>
                <p className="text-xs text-textMuted mt-0.5">
                  Motor Cars, Dual-Purpose, Motorcycles, and Three-Wheelers.
                </p>
              </div>
            </div>

            <div
              onClick={() => setVehicleCategory('Heavy')}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                vehicleCategory === 'Heavy'
                  ? 'border-primary bg-primary-light/40 shadow-sm ring-1 ring-primary'
                  : 'border-borderColor hover:border-primary/40 bg-white'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center text-accent-dark flex-shrink-0">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-textMain">Heavy Vehicles</p>
                <p className="text-xs text-textMuted mt-0.5">
                  Commercial Buses, Motor Coaches, Heavy Lorries, and Prime Movers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-4 border-t border-borderColor flex justify-end">
          <button
            onClick={handleStartQuiz}
            className="btn-accent px-8 py-3 font-bold text-sm text-textMain shadow-md flex items-center gap-2"
          >
            Start Practice Quiz Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
