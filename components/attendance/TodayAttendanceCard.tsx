'use client';

import React from 'react';
import { AttendanceClock } from './AttendanceClock';
import { CheckInOutButton } from './CheckInOutButton';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';
import { formatTimeInTimezone, formatDurationMinutes } from '@/lib/attendance/timezone';

interface TodayAttendanceCardProps {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  record: any | null;
  isLoading: boolean;
  onToggle: () => void;
  error?: string | null;
}

export const TodayAttendanceCard: React.FC<TodayAttendanceCardProps> = ({
  isCheckedIn,
  isCheckedOut,
  record,
  isLoading,
  onToggle,
  error,
}) => {
  const checkInTimeFormatted = record ? formatTimeInTimezone(record.checkIn) : null;
  const checkOutTimeFormatted = record?.checkOut ? formatTimeInTimezone(record.checkOut) : null;
  const workHoursFormatted = record?.workHoursMinutes ? formatDurationMinutes(record.workHoursMinutes) : null;
  const extraHoursFormatted = record?.extraHoursMinutes ? formatDurationMinutes(record.extraHoursMinutes) : null;

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Today&apos;s Attendance</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Track your daily shift duration and status</p>
        </div>
        {record && (
          <div className="self-start sm:self-auto">
            <AttendanceStatusBadge status={record.status} />
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      <AttendanceClock
        checkInTime={record?.checkIn}
        isCheckedIn={isCheckedIn}
        isCheckedOut={isCheckedOut}
      />

      <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700">
        {!isCheckedIn ? (
          <div className="text-center py-4 space-y-4">
            <div className="text-slate-500 dark:text-slate-400 font-medium text-sm">You have not checked in today.</div>
            <CheckInOutButton
              isCheckedIn={false}
              isCheckedOut={false}
              isLoading={isLoading}
              onToggle={onToggle}
            />
          </div>
        ) : !isCheckedOut ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Checked In At</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{checkInTimeFormatted}</div>
              {record?.isLate && (
                <span className="inline-block text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Late Arrival
                </span>
              )}
            </div>

            <CheckInOutButton
              isCheckedIn={true}
              isCheckedOut={false}
              isLoading={isLoading}
              onToggle={onToggle}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Check In</span>
                <div className="text-base font-bold text-slate-900 dark:text-white">{checkInTimeFormatted}</div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Check Out</span>
                <div className="text-base font-bold text-slate-900 dark:text-white">{checkOutTimeFormatted}</div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Work Hours</span>
                <div className="text-base font-bold text-[#0077FF] dark:text-[#38BDF8]">{workHoursFormatted}</div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Extra Hours</span>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{extraHoursFormatted}</div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <CheckInOutButton
                isCheckedIn={true}
                isCheckedOut={true}
                isLoading={isLoading}
                onToggle={onToggle}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
