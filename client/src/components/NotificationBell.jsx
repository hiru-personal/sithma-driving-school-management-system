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
        return <CreditCard className="w-4 h-4 text-[#1B3D59]" />;
      case 'booking':
        return <Calendar className="w-4 h-4 text-[#1B3D59]" />;
      case 'trial':
        return <Award className="w-4 h-4 text-emerald-600" />;
      case 'dmt-date':
        return <Clock className="w-4 h-4 text-[#1B3D59]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#6A97C0]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-full bg-[#FAFCFE] hover:bg-[#D4EEF8] text-[#152026] border border-[#D4EEF8] transition-all duration-300 shadow-xs flex items-center justify-center cursor-pointer group"
        title="Notifications Center"
      >
        <Bell className="w-4 h-4 text-[#152026] group-hover:text-[#1B3D59] transition-colors" strokeWidth={2.2} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] h-[18px] rounded-full bg-[#1B3D59] text-white text-[10px] font-black flex items-center justify-center shadow-md ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Solid White Dropdown Menu */}
      {isOpen && (
        <div className="absolute -right-2 sm:right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white border border-[#D4EEF8] rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 bg-[#FAFCFE] border-b border-[#D4EEF8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-[#152026] uppercase tracking-wider">In-App Alerts</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4EEF8] text-[#1B3D59] border border-[#6A97C0]/30 shadow-xs">
                  {unreadCount} New
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-[#1B3D59] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#D4EEF8] bg-white">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6A97C0] space-y-1">
                <Bell className="w-6 h-6 text-[#6A97C0] mx-auto" />
                <p className="text-[#152026] font-bold">No notifications yet</p>
                <p className="text-[11px] text-[#6A97C0]">You're completely up to date!</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.read && handleMarkAsRead(n._id)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    !n.read
                      ? 'bg-[#FAFCFE] hover:bg-[#D4EEF8]/40'
                      : 'bg-white hover:bg-[#FAFCFE]'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-[#D4EEF8] border border-[#6A97C0]/30 flex-shrink-0 mt-0.5 shadow-xs">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="font-bold text-[#152026] truncate">{n.title}</p>
                      <span className="text-[10px] text-[#6A97C0] flex-shrink-0 font-medium">
                        {n.createdAt
                          ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                          : 'Just now'}
                      </span>
                    </div>
                    <p className="text-[#152026]/75 text-[11px] leading-snug line-clamp-2">{n.message}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#1B3D59] flex-shrink-0 mt-2"></span>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-[#FAFCFE] border-t border-[#D4EEF8] text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#1B3D59] hover:underline transition-colors"
            >
              View Full Notifications Center →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
