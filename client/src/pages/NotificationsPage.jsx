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

const safeFormatDate = (dateVal, formatStr = 'MMM dd, yyyy • hh:mm a', fallback = 'N/A') => {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
};

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
        return <CreditCard className="w-5 h-5 text-[#1B3D59]" />;
      case 'booking':
        return <Calendar className="w-5 h-5 text-[#1B3D59]" />;
      case 'trial':
        return <Award className="w-5 h-5 text-emerald-600" />;
      case 'dmt-date':
        return <Clock className="w-5 h-5 text-[#1B3D59]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#6A97C0]" />;
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4EEF8] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4EEF8] border border-[#6A97C0]/30 text-[#1B3D59] font-bold text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#1B3D59]" /> Real-Time Notifications
          </div>
          <h1 className="text-2xl font-black text-[#152026] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#1B3D59]" /> Notifications Center
          </h1>
          <p className="text-xs text-[#6A97C0] mt-0.5">
            Real-time milestone updates, payment confirmations, and scheduling alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchNotifications} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={handleMarkAllRead}
            className="btn-primary text-xs py-2 px-4 font-bold shadow-sm flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-[#D4EEF8] shadow-sm flex items-center gap-1.5 overflow-x-auto">
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
                ? 'bg-[#1B3D59] text-white shadow-sm'
                : 'text-[#152026] hover:bg-[#D4EEF8]/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#6A97C0] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#1B3D59]" /> Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-2 border border-[#D4EEF8] shadow-sm">
            <Bell className="w-10 h-10 text-[#6A97C0] mx-auto" />
            <p className="text-sm font-bold text-[#152026]">No notifications in this category</p>
            <p className="text-xs text-[#6A97C0]">You're all caught up with your updates.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.read && handleMarkAsRead(n._id)}
              className={`bg-white rounded-3xl p-4 flex items-start gap-4 border transition-all cursor-pointer shadow-sm ${
                !n.read
                  ? 'border-l-4 border-l-[#1B3D59] border-[#D4EEF8] bg-[#FAFCFE]'
                  : 'border-[#D4EEF8] hover:border-[#6A97C0]'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-[#D4EEF8] border border-[#6A97C0]/30 shadow-xs flex-shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h3 className="font-bold text-sm text-[#152026]">{n.title}</h3>
                  <span className="text-[11px] text-[#6A97C0] font-medium">
                    {safeFormatDate(n?.createdAt, 'MMM dd, yyyy • hh:mm a', 'N/A')}
                  </span>
                </div>
                <p className="text-[#152026]/75 leading-relaxed text-xs">{n.message}</p>
              </div>

              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#1B3D59] flex-shrink-0 mt-2"></span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
