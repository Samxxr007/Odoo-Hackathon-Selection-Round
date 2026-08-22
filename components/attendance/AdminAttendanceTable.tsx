'use client';

import React from 'react';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';
import { Edit3, CheckCircle, ShieldAlert } from 'lucide-react';

interface AdminRecord {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  avatarUrl?: string | null;
  attendanceId?: string | null;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  extraHours: string;
  status: string;
  isMissingCheckout: boolean;
  isLate: boolean;
  isCorrected: boolean;
  correctedBy?: string;
  correctionReason?: string;
}

interface AdminAttendanceTableProps {
  records: AdminRecord[];
  isLoading: boolean;
  onOpenCorrection: (record: AdminRecord) => void;
}

export const AdminAttendanceTable: React.FC<AdminAttendanceTableProps> = ({
  records,
  isLoading,
  onOpenCorrection,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4 shadow-xs">
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
        No employee attendance records match the selected date and filters.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Employee Daily Attendance Log</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time attendance tracking and HR correction management</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
          {records.length} Employees
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-5">Employee</th>
              <th className="py-3.5 px-5">Check In</th>
              <th className="py-3.5 px-5">Check Out</th>
              <th className="py-3.5 px-5">Work Hours</th>
              <th className="py-3.5 px-5">Extra Hours</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.map((r) => (
              <tr key={r.employeeId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-3.5 px-5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=0077FF&color=fff`}
                      alt={r.name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{r.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{r.department} • {r.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs">
                  <span className="font-mono">{r.checkIn}</span>
                  {r.isLate && (
                    <span className="ml-2 text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      Late
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs">
                  <span className="font-mono">{r.checkOut}</span>
                  {r.isMissingCheckout && (
                    <span className="ml-2 text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800" title="Missing Check Out">
                      Missing
                    </span>
                  )}
                  {r.isCorrected && (
                    <span className="ml-2 text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800" title="Corrected by HR">
                      Corrected
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-[#0077FF] dark:text-[#38BDF8] font-bold whitespace-nowrap text-xs">
                  {r.workHours}
                </td>
                <td className="py-3.5 px-5 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap text-xs">
                  {r.extraHours}
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap">
                  <AttendanceStatusBadge status={r.status} isMissingCheckout={r.isMissingCheckout} />
                </td>
                <td className="py-3.5 px-5 text-right whitespace-nowrap">
                  <button
                    onClick={() => onOpenCorrection(r)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Correct</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
