import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  Calendar,
  Award,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnread = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data.success) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      // Ignore polling errors
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      // Ignore
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-4 h-4 text-accent" />;
      case 'booking':
        return <Calendar className="w-4 h-4 text-cyan-300" />;
      case 'trial':
        return <Award className="w-4 h-4 text-emerald-400" />;
      case 'dmt-date':
        return <Clock className="w-4 h-4 text-amber-300" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-300" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Liquid Glass Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-full bg-white/15 hover:bg-cyan-500/20 text-white hover:text-cyan-300 border border-white/30 backdrop-blur-xl transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center justify-center cursor-pointer group"
        title="Notifications Center"
      >
        <Bell className="w-4 h-4 text-white group-hover:text-cyan-300 transition-colors" strokeWidth={2.2} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] h-[18px] rounded-full bg-gradient-to-tr from-accent via-amber-400 to-amber-300 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-[0_0_12px_rgba(242,169,59,0.9)] ring-2 ring-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Liquid Glass Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 backdrop-blur-3xl bg-slate-950/95 border border-white/20 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">In-App Alerts</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent border border-accent/30 shadow-[0_0_8px_rgba(242,169,59,0.3)]">
                  {unreadCount} New
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-cyan-300 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-white/10">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <Bell className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-medium">No notifications yet</p>
                <p className="text-[11px] text-slate-500">You're completely up to date!</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.read && handleMarkAsRead(n._id)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    !n.read
                      ? 'bg-cyan-500/15 hover:bg-cyan-500/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white/10 border border-white/15 flex-shrink-0 mt-0.5 shadow-sm">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="font-bold text-white truncate">{n.title}</p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {n.createdAt
                          ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                          : 'Just now'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-snug line-clamp-2">{n.message}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] flex-shrink-0 mt-2"></span>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-white/5 border-t border-white/10 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              View Full Notifications Center →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
