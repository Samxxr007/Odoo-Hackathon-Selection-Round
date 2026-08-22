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
      <div className="bg-white rounded-2xl border border-dayflow-border p-8 text-center space-y-4">
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dayflow-border p-12 text-center text-dayflow-muted">
        No attendance records found for this month.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-dayflow-border shadow-xs overflow-hidden">
      <div className="p-5 border-b border-dayflow-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-dayflow-text">Attendance History</h3>
          <p className="text-xs text-dayflow-muted">Day-wise log of check-ins, check-outs, work hours, and status</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-dayflow-bg text-dayflow-muted">
          {records.length} Days
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-dayflow-bg text-dayflow-muted text-xs uppercase font-semibold border-b border-dayflow-border">
            <tr>
              <th className="py-3.5 px-5">Date</th>
              <th className="py-3.5 px-5">Check In</th>
              <th className="py-3.5 px-5">Check Out</th>
              <th className="py-3.5 px-5">Work Hours</th>
              <th className="py-3.5 px-5">Extra Hours</th>
              <th className="py-3.5 px-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dayflow-border">
            {records.map((r) => {
              const formattedDate = format(parseISO(r.date), 'MMM dd, yyyy (EEE)');
              return (
                <tr key={r.date} className="hover:bg-dayflow-light/40 transition-colors">
                  <td className="py-3.5 px-5 font-medium text-dayflow-text whitespace-nowrap">
                    {formattedDate}
                  </td>
                  <td className="py-3.5 px-5 text-dayflow-text whitespace-nowrap">
                    <span className="font-mono">{r.checkIn}</span>
                    {r.isLate && (
                      <span className="ml-2 text-[10px] uppercase font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                        Late
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-dayflow-text whitespace-nowrap">
                    <span className="font-mono">{r.checkOut}</span>
                    {r.isCorrected && (
                      <span className="ml-2 text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200" title="Corrected by HR">
                        Corrected
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-dayflow-primary font-medium whitespace-nowrap">
                    {r.workHours}
                  </td>
                  <td className="py-3.5 px-5 text-emerald-600 font-medium whitespace-nowrap">
                    {r.extraHours}
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
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
