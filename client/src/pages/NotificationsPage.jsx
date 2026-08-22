import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Bell,
  CreditCard,
  Calendar,
  Award,
  Clock,
  Sparkles,
  CheckCheck,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const filtered = notifications.filter(
    (n) => filterType === 'all' || n.type === filterType
  );

  const getIcon = (type) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-5 h-5 text-accent" />;
      case 'booking':
        return <Calendar className="w-5 h-5 text-cyan-400" />;
      case 'trial':
        return <Award className="w-5 h-5 text-emerald-400" />;
      case 'dmt-date':
        return <Clock className="w-5 h-5 text-amber-300" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-300" />;
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-semibold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Real-Time Notifications
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2 drop-shadow">
            <Bell className="w-6 h-6 text-cyan-400" /> Notifications Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time milestone updates, payment confirmations, and scheduling alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchNotifications} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={handleMarkAllRead}
            className="btn-primary text-xs py-2 px-4 font-bold shadow-md flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card p-2 flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'payment', label: 'Payments' },
          { id: 'booking', label: 'Lesson Bookings' },
          { id: 'trial', label: 'Trials' },
          { id: 'dmt-date', label: 'DMT Dates' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)] border border-cyan-300'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12 space-y-2">
            <Bell className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No notifications in this category</p>
            <p className="text-xs text-slate-400">You're all caught up with your updates.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.read && handleMarkAsRead(n._id)}
              className={`card p-4 flex items-start gap-4 transition-all cursor-pointer ${
                !n.read
                  ? 'border-l-4 border-l-cyan-400 bg-cyan-500/10'
                  : 'bg-slate-900/60'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 shadow-sm flex-shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h3 className="font-bold text-sm text-white">{n.title}</h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {n.createdAt ? format(new Date(n.createdAt), 'MMM dd, yyyy • hh:mm a') : 'N/A'}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">{n.message}</p>
              </div>

              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] flex-shrink-0 mt-2"></span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
