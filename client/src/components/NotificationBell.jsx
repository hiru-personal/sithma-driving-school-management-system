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
        return <CreditCard className="w-4 h-4 text-[#3F72AF]" />;
      case 'booking':
        return <Calendar className="w-4 h-4 text-[#112D4E]" />;
      case 'trial':
        return <Award className="w-4 h-4 text-emerald-600" />;
      case 'dmt-date':
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#3F72AF]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
        {/* Light Glass Bell Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-9 h-9 rounded-full bg-[#F0F4F8] hover:bg-[#DBE2EF] text-[#112D4E] border border-[#DBE2EF] transition-all duration-300 shadow-xs flex items-center justify-center cursor-pointer group"
          title="Notifications Center"
        >
          <Bell className="w-4 h-4 text-[#112D4E] group-hover:text-[#0B2447] transition-colors" strokeWidth={2.2} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] h-[18px] rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-md ring-2 ring-white animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Executive Frosted Glass Dropdown Menu */}
        {isOpen && (
          <div className="absolute -right-2 sm:right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white/98 backdrop-blur-2xl border border-[#DBE2EF] rounded-3xl shadow-[0_25px_70px_rgba(17,45,78,0.22)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#F8FAFD] border-b border-[#DBE2EF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-[#0B2447] uppercase tracking-wider">In-App Alerts</h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
                    {unreadCount} New
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-[#3F72AF] hover:text-[#0B2447] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-[#DBE2EF] bg-white">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#64748B] space-y-1">
                  <Bell className="w-6 h-6 text-[#94A3B8] mx-auto" />
                  <p className="text-[#112D4E] font-bold">No notifications yet</p>
                  <p className="text-[11px] text-[#64748B]">You're completely up to date!</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.read && handleMarkAsRead(n._id)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      !n.read
                        ? 'bg-[#F0F4F8] hover:bg-[#E2E8F0]'
                        : 'bg-white hover:bg-[#F8FAFD]'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-[#DBE2EF] border border-[#DBE2EF] flex-shrink-0 mt-0.5 shadow-xs">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="font-bold text-[#112D4E] truncate">{n.title}</p>
                        <span className="text-[10px] text-[#64748B] flex-shrink-0">
                          {n.createdAt
                            ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                            : 'Just now'}
                        </span>
                      </div>
                      <p className="text-[#4B6584] text-[11px] leading-snug line-clamp-2">{n.message}</p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#3F72AF] shadow-xs flex-shrink-0 mt-2"></span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-[#F8FAFD] border-t border-[#DBE2EF] text-center">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-[#3F72AF] hover:text-[#0B2447] transition-colors"
              >
                View Full Notifications Center →
              </Link>
            </div>
          </div>
        )}
      </div>
  );
}
