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
    <div className="bg-white rounded-2xl border border-dayflow-border p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-dayflow-border">
        <div>
          <h2 className="text-xl font-bold text-dayflow-text">Today's Attendance</h2>
          <p className="text-sm text-dayflow-muted">Track your daily shift duration and status</p>
        </div>
        {record && (
          <div className="self-start sm:self-auto">
            <AttendanceStatusBadge status={record.status} />
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      <AttendanceClock
        checkInTime={record?.checkIn}
        isCheckedIn={isCheckedIn}
        isCheckedOut={isCheckedOut}
      />

      <div className="bg-dayflow-bg rounded-xl p-5 border border-dayflow-border">
        {!isCheckedIn ? (
          <div className="text-center py-4 space-y-4">
            <div className="text-dayflow-muted font-medium">You have not checked in today.</div>
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
              <span className="text-xs uppercase tracking-wider font-semibold text-dayflow-muted">Checked In At</span>
              <div className="text-2xl font-extrabold text-dayflow-text">{checkInTimeFormatted}</div>
              {record?.isLate && (
                <span className="inline-block text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
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
                <span className="text-xs uppercase tracking-wider font-semibold text-dayflow-muted">Check In</span>
                <div className="text-base font-bold text-dayflow-text">{checkInTimeFormatted}</div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-dayflow-muted">Check Out</span>
                <div className="text-base font-bold text-dayflow-text">{checkOutTimeFormatted}</div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-dayflow-muted">Work Hours</span>
                <div className="text-base font-bold text-dayflow-primary">{workHoursFormatted}</div>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-dayflow-muted">Extra Hours</span>
                <div className="text-base font-bold text-emerald-600">{extraHoursFormatted}</div>
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
