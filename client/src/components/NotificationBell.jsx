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
    // Poll unread counts every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown on outside click
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
        return <CreditCard className="w-4 h-4 text-accent-dark" />;
      case 'booking':
        return <Calendar className="w-4 h-4 text-primary" />;
      case 'trial':
        return <Award className="w-4 h-4 text-success" />;
      case 'dmt-date':
        return <Clock className="w-4 h-4 text-warning-dark" />;
      default:
        return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-blue-100 hover:text-white hover:bg-primaryDark transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent text-primaryDark text-[10px] font-black flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-modal border border-borderColor overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="p-4 bg-slate-50 border-b border-borderColor flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-textMain">In-App Notifications</h4>
              {unreadCount > 0 && (
                <span className="badge badge-warning text-[10px] py-0 px-2">
                  {unreadCount} New
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-borderColor">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-textMuted space-y-1">
                <Bell className="w-6 h-6 text-slate-300 mx-auto" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.read && handleMarkAsRead(n._id)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-neutralBg transition-colors cursor-pointer ${
                    !n.read ? 'bg-primary-light/30' : 'bg-white'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white border border-borderColor flex-shrink-0 mt-0.5 shadow-sm">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="font-bold text-textMain truncate">{n.title}</p>
                      <span className="text-[10px] text-textMuted flex-shrink-0">
                        {n.createdAt
                          ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                          : 'Just now'}
                      </span>
                    </div>
                    <p className="text-textMuted leading-snug line-clamp-2">{n.message}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></span>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-2 bg-slate-50 border-t border-borderColor text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-primary hover:underline"
            >
              View All Notifications Center →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
