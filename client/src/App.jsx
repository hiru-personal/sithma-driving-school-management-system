import React, { useState, useEffect } from 'react';
import { 
  Car, 
  MapPin, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  FileCheck2, 
  Sparkles,
  Server,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from './api/axios';

export default function App() {
  const [apiStatus, setApiStatus] = useState({ loading: true, online: false, data: null });

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get('/health');
        setApiStatus({ loading: false, online: true, data: response.data });
      } catch (err) {
        setApiStatus({ loading: false, online: false, data: null });
      }
    };
    checkBackend();
  }, []);

  const branches = [
    { name: 'Maharagama Branch', address: 'High Level Road, Maharagama', slots: '3 sessions / day' },
    { name: 'Werahara Branch', address: 'Near DMT Office, Werahara', slots: '3 sessions / day' },
    { name: 'Delgoda Branch', address: 'Main Street, Delgoda', slots: '3 sessions / day' },
  ];

  const epics = [
    { id: 'EPIC-01', title: 'Student Registration & DMT Tracking', desc: 'Type 1 & 2 workflows, milestone timeline, 1.5-yr trial deadline & 3 attempts rule.' },
    { id: 'EPIC-02', title: 'Lesson & Time Slot Scheduling', desc: 'Light & Heavy vehicle booking, 3 sessions/day, prevent double-booking, instructor schedules.' },
    { id: 'EPIC-03', title: 'Payment Verification & Notifications', desc: 'Bank slip upload, staff verification queue, real-time in-app alerts.' },
    { id: 'EPIC-04', title: 'Multilingual Practice Quiz', desc: 'DMT exam questions in Sinhala, Tamil, English with automatic score tracking.' }
  ];

  return (
    <div className="min-h-screen bg-neutralBg flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-textMain font-bold">
              <Car className="w-6 h-6 text-primaryDark" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold tracking-tight">Sithma Driving School</span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-primaryDark/60 px-2 py-0.5 rounded text-blue-100 font-medium">Management System</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-primaryDark/40 px-3 py-1.5 rounded-full text-xs">
              <Server className="w-3.5 h-3.5 text-accent" />
              <span>Backend Status:</span>
              {apiStatus.loading ? (
                <span className="text-yellow-300">Checking...</span>
              ) : apiStatus.online ? (
                <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online (Port 5000)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-300">
                  <AlertCircle className="w-3.5 h-3.5" /> Offline
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        <div className="bg-gradient-to-r from-primaryDark via-primary to-[#1875c4] rounded-2xl text-white p-8 sm:p-12 shadow-card relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent font-medium text-xs backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5" /> Part 0 Initialized — MERN Stack Core Architecture
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-heading">
              Sithma Driving School Management System
            </h1>
            <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
              Centralized platform connecting students, data entry officers, and instructors across Maharagama, Werahara, and Delgoda branches with automated DMT milestone tracking, lesson scheduling, and multilingual quizzes.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <span className="badge badge-success text-xs py-1.5 px-3">React + Vite + Tailwind</span>
              <span className="badge badge-warning text-xs py-1.5 px-3">Express REST API</span>
              <span className="badge badge-info text-xs py-1.5 px-3">MongoDB & Mongoose</span>
            </div>
          </div>
          <div className="absolute right-[-40px] bottom-[-40px] opacity-10 pointer-events-none hidden lg:block">
            <Car className="w-96 h-96 text-white" />
          </div>
        </div>

        {/* Design System & Core Metrics Showcase */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-textMain flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> Active Design System Tokens
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="card p-4 border-t-4 border-t-primary text-center">
              <p className="text-xs text-textMuted uppercase font-semibold">Primary Blue</p>
              <p className="font-mono text-sm font-bold text-primary">#0B5FA5</p>
            </div>
            <div className="card p-4 border-t-4 border-t-primaryDark text-center">
              <p className="text-xs text-textMuted uppercase font-semibold">Primary Dark</p>
              <p className="font-mono text-sm font-bold text-primaryDark">#073B68</p>
            </div>
            <div className="card p-4 border-t-4 border-t-accent text-center">
              <p className="text-xs text-textMuted uppercase font-semibold">Accent Amber</p>
              <p className="font-mono text-sm font-bold text-accent-dark">#F2A93B</p>
            </div>
            <div className="card p-4 border-t-4 border-t-success text-center">
              <p className="text-xs text-textMuted uppercase font-semibold">Success</p>
              <p className="font-mono text-sm font-bold text-success">#2E9E6B</p>
            </div>
            <div className="card p-4 border-t-4 border-t-warning text-center">
              <p className="text-xs text-textMuted uppercase font-semibold">Warning</p>
              <p className="font-mono text-sm font-bold text-warning-dark">#E0A32E</p>
            </div>
            <div className="card p-4 border-t-4 border-t-danger text-center">
              <p className="text-xs text-textMuted uppercase font-semibold">Danger</p>
              <p className="font-mono text-sm font-bold text-danger">#D64545</p>
            </div>
          </div>
        </section>

        {/* Operating Branches */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-textMain flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent-dark" /> Operating Branches (3 Branches • 6 Instructors)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map((b, idx) => (
              <div key={idx} className="card card-hover flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-textMain mb-1">{b.name}</h3>
                  <p className="text-xs text-textMuted mb-3">{b.address}</p>
                </div>
                <div className="pt-3 border-t border-borderColor flex items-center justify-between text-xs">
                  <span className="text-textMuted flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Sessions:</span>
                  <span className="font-semibold text-primary">{b.slots}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap / Epics from Sprint 0 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-textMain flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Roadmap Epics (Parts 1 to 7)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {epics.map((epic) => (
              <div key={epic.id} className="card card-hover space-y-2">
                <div className="flex items-center justify-between">
                  <span className="badge badge-info">{epic.id}</span>
                  <span className="text-xs text-textMuted font-medium">Sprint Backlog Item</span>
                </div>
                <h3 className="text-base font-bold text-textMain">{epic.title}</h3>
                <p className="text-sm text-textMuted leading-relaxed">{epic.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-borderColor py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-textMuted">
          <p>© 2026 Sithma Driving School Management System — Sri Lanka Institute of Information Technology (SLIIT)</p>
          <div className="flex items-center gap-4">
            <span>Maharagama</span> • <span>Werahara</span> • <span>Delgoda</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
