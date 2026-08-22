import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  Phone,
  User,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function InstructorSchedulePage() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await api.get(`/slots/instructor/${user._id}`);
      if (res.data.success) {
        setSchedule(res.data.schedule);
      }
    } catch (err) {
      toast.error('Failed to load assigned sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [user]);

  return (
    <div className="min-h-screen bg-neutralBg py-8 px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textMain font-heading flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" /> Instructor Daily Session Schedule
          </h1>
          <p className="text-xs text-textMuted mt-0.5">
            Instructor: <strong>{user?.name}</strong> • Assigned Branch: <strong>{user?.branch}</strong>
          </p>
        </div>

        <button onClick={fetchSchedule} className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Schedule
        </button>
      </div>

      {/* Schedule Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-textMuted flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading sessions...
        </div>
      ) : schedule.length === 0 ? (
        <div className="card text-center py-12 space-y-2">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-textMain">No assigned training sessions found</p>
          <p className="text-xs text-textMuted">Upcoming booked sessions will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedule.map((slot) => {
            const studentUser = slot.bookedBy?.userId;

            return (
              <div key={slot._id} className="card card-hover p-5 space-y-3 border-l-4 border-l-primary">
                <div className="flex items-center justify-between">
                  <span className="badge badge-info">{slot.vehicleCategory} Vehicle</span>
                  <span className="badge badge-success">Assigned</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-sm font-bold text-textMain">
                    {format(new Date(slot.date), 'EEEE, MMMM dd, yyyy')}
                  </p>
                  <p className="font-extrabold text-primary text-sm">
                    {slot.startTime} – {slot.endTime} (1 Hour)
                  </p>
                  <p className="text-textMuted flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {slot.branch} Branch
                  </p>
                </div>

                {studentUser && (
                  <div className="pt-3 border-t border-borderColor space-y-1 text-xs">
                    <p className="font-bold text-textMain flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" /> Student: {studentUser.name}
                    </p>
                    <p className="text-textMuted flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-accent-dark" /> {studentUser.phone}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
