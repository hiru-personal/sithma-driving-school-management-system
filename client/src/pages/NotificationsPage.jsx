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
        return <CreditCard className="w-5 h-5 text-accent-dark" />;
      case 'booking':
        return <Calendar className="w-5 h-5 text-primary" />;
      case 'trial':
        return <Award className="w-5 h-5 text-success" />;
      case 'dmt-date':
        return <Clock className="w-5 h-5 text-warning-dark" />;
      default:
        return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutralBg py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textMain font-heading flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Notifications Center
          </h1>
          <p className="text-xs text-textMuted mt-0.5">
            Real-time milestone updates, payment confirmations, and scheduling alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchNotifications} className="btn-secondary text-xs py-2 px-3">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={handleMarkAllRead}
            className="btn-primary text-xs py-2 px-3.5 font-bold"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card p-3 flex flex-wrap gap-2 text-xs">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'payment', label: '💳 Payments' },
          { id: 'dmt-date', label: '⏱️ DMT Dates' },
          { id: 'booking', label: '📅 Lesson Bookings' },
          { id: 'trial', label: '🏆 Trial Results' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterType === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-neutralBg text-textMuted hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-textMuted flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12 space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-textMain">No notifications found</p>
            <p className="text-xs text-textMuted">You're all caught up!</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.read && handleMarkAsRead(n._id)}
              className={`card p-4 sm:p-5 flex items-start gap-4 transition-all ${
                !n.read
                  ? 'border-l-4 border-l-primary bg-primary-light/20 shadow-card'
                  : 'bg-white'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white border border-borderColor shadow-sm flex-shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h3 className="text-sm font-bold text-textMain">{n.title}</h3>
                  <span className="text-xs text-textMuted font-medium">
                    {n.createdAt ? format(new Date(n.createdAt), 'MMM dd, yyyy • hh:mm a') : ''}
                  </span>
                </div>
                <p className="text-xs text-textMuted leading-relaxed">{n.message}</p>
              </div>

              {!n.read && (
                <span className="badge badge-warning text-[10px] py-0.5 px-2 flex-shrink-0 self-center">
                  Unread
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
