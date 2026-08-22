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
        No employee attendance records match the selected filters.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-dayflow-border shadow-xs overflow-hidden">
      <div className="p-5 border-b border-dayflow-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-dayflow-text">Employee Daily Attendance Log</h3>
          <p className="text-xs text-dayflow-muted">Real-time attendance tracking and HR correction management</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-dayflow-bg text-dayflow-muted">
          {records.length} Employees
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-dayflow-bg text-dayflow-muted text-xs uppercase font-semibold border-b border-dayflow-border">
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
          <tbody className="divide-y divide-dayflow-border">
            {records.map((r) => (
              <tr key={r.employeeId} className="hover:bg-dayflow-light/40 transition-colors">
                <td className="py-3.5 px-5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=0077FF&color=fff`}
                      alt={r.name}
                      className="w-9 h-9 rounded-full object-cover border border-dayflow-border"
                    />
                    <div>
                      <div className="font-bold text-dayflow-text">{r.name}</div>
                      <div className="text-xs text-dayflow-muted">{r.department} • {r.email}</div>
                    </div>
                  </div>
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
                    <span
                      className="ml-2 text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 cursor-help"
                      title={`Corrected by HR. Reason: ${r.correctionReason || 'N/A'}`}
                    >
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
                <td className="py-3.5 px-5 text-right whitespace-nowrap">
                  {r.isMissingCheckout && r.attendanceId ? (
                    <button
                      onClick={() => onOpenCorrection(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                      Correct Checkout
                    </button>
                  ) : r.isCorrected ? (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Audited
                    </span>
                  ) : (
                    <span className="text-xs text-dayflow-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
