'use client';

import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon, Timer } from 'lucide-react';

interface AttendanceClockProps {
  checkInTime?: string | null;
  isCheckedIn: boolean;
  isCheckedOut: boolean;
}

export const AttendanceClock: React.FC<AttendanceClockProps> = ({
  checkInTime,
  isCheckedIn,
  isCheckedOut,
}) => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live elapsed time if checked in but not checked out
  const getElapsedString = () => {
    if (!isCheckedIn || isCheckedOut || !checkInTime || !now) return null;
    const checkInDate = new Date(checkInTime);
    if (isNaN(checkInDate.getTime())) return null;

    const diffMs = Math.max(0, now.getTime() - checkInDate.getTime());
    const totalSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  };

  const elapsed = getElapsedString();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-dayflow-light to-white border border-dayflow-border shadow-xs">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-dayflow-primary/10 rounded-lg text-dayflow-primary">
          <ClockIcon className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-dayflow-muted">Current Time</span>
          <div
            className="text-2xl font-bold text-dayflow-text tracking-tight font-mono"
            suppressHydrationWarning
          >
            {now
              ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : '--:--:-- --'}
          </div>
        </div>
      </div>

      {elapsed && (
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Timer className="w-5 h-5 text-emerald-600 animate-pulse" />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Elapsed Shift Time</span>
            <div
              className="text-lg font-bold text-emerald-900 font-mono tracking-wide"
              suppressHydrationWarning
            >
              {elapsed}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
