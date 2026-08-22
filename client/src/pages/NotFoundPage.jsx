import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Home, ArrowLeft, Car } from 'lucide-react';

export default function NotFoundPage() {
  const { user } = useAuth();

  return (
    <div className="py-20 px-4 max-w-lg mx-auto text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)]">
        <Car className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <div className="text-5xl font-black text-white font-heading">404</div>
        <h1 className="text-xl font-bold text-slate-200">Page Not Found</h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          The driving route or resource you are looking for does not exist or has been relocated.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" /> Home Page
        </Link>
        <Link
          to={user?.role === 'student' ? '/student/dashboard' : user ? '/staff/students' : '/login'}
          className="btn-accent text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
