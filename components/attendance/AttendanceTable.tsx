'use client';

import React from 'react';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';
import { format, parseISO } from 'date-fns';

interface RecordItem {
  date: string; // YYYY-MM-DD
  checkIn: string;
  checkOut: string;
  workHours: string;
  extraHours: string;
  status: string;
  isMissingCheckout: boolean;
  isLate: boolean;
  isCorrected: boolean;
}

interface AttendanceTableProps {
  records: RecordItem[];
  isLoading: boolean;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ records, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center space-y-4 shadow-xs">
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 shadow-xs">
        No attendance records found for this month.
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Attendance History</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Day-wise log of check-ins, check-outs, work hours, and status</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
          {records.length} Days
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th className="py-4 px-5">Date</th>
              <th className="py-4 px-5">Check In</th>
              <th className="py-4 px-5">Check Out</th>
              <th className="py-4 px-5">Work Hours</th>
              <th className="py-4 px-5">Extra Hours</th>
              <th className="py-4 px-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.map((r) => {
              const formattedDate = format(parseISO(r.date), 'MMM dd, yyyy (EEE)');
              return (
                <tr key={r.date} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    {formattedDate}
                  </td>
                  <td className="py-4 px-5 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    <span className="font-mono">{r.checkIn}</span>
                    {r.isLate && (
                      <span className="ml-2 text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                        Late
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    <span className="font-mono">{r.checkOut}</span>
                    {r.isCorrected && (
                      <span className="ml-2 text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800" title="Corrected by HR">
                        Corrected
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-[#0077FF] dark:text-[#38BDF8] font-bold whitespace-nowrap">
                    {r.workHours}
                  </td>
                  <td className="py-4 px-5 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                    {r.extraHours}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    <AttendanceStatusBadge status={r.status} isMissingCheckout={r.isMissingCheckout} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
