'use client';

import React from 'react';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';
import { Edit3 } from 'lucide-react';

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
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-8 text-center space-y-4 shadow-xs">
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-[#F4F7FB] rounded-xl w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-12 text-center text-[#8F9CAE] shadow-xs">
        No employee attendance records match the selected date and filters.
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] shadow-xs overflow-hidden">
      <div className="p-5 border-b border-[#E5ECF2] flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#1A1D24]">Employee Daily Attendance Log</h3>
          <p className="text-xs text-[#8F9CAE] mt-0.5">Real-time attendance tracking and HR correction management</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[#EAF3FF] text-[#0077FF] border border-[#E5ECF2]">
          {records.length} Employees
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F4F7FB] text-[#8F9CAE] text-xs uppercase font-bold border-b border-[#E5ECF2]">
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
          <tbody className="divide-y divide-[#E5ECF2]">
            {records.map((r) => (
              <tr key={r.employeeId} className="hover:bg-[#F4F7FB] transition-colors">
                <td className="py-3.5 px-5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=0077FF&color=fff`}
                      alt={r.name}
                      className="w-9 h-9 rounded-xl object-cover border border-[#E5ECF2] bg-[#F4F7FB]"
                    />
                    <div>
                      <div className="font-bold text-[#1A1D24] text-xs">{r.name}</div>
                      <div className="text-[11px] text-[#8F9CAE]">{r.department} • {r.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-5 text-[#1A1D24] whitespace-nowrap text-xs">
                  <span className="font-mono font-bold">{r.checkIn}</span>
                  {r.isLate && (
                    <span className="ml-2 text-[10px] uppercase font-bold text-[#F9911E] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                      Late
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-[#1A1D24] whitespace-nowrap text-xs">
                  <span className="font-mono font-bold">{r.checkOut}</span>
                  {r.isMissingCheckout && (
                    <span className="ml-2 text-[10px] uppercase font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      Missing
                    </span>
                  )}
                  {r.isCorrected && (
                    <span className="ml-2 text-[10px] uppercase font-bold text-[#0077FF] bg-[#EAF3FF] px-1.5 py-0.5 rounded border border-[#E5ECF2]">
                      Corrected
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-[#0077FF] font-bold whitespace-nowrap text-xs">
                  {r.workHours}
                </td>
                <td className="py-3.5 px-5 text-[#22C55E] font-bold whitespace-nowrap text-xs">
                  {r.extraHours}
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap">
                  <AttendanceStatusBadge status={r.status} isMissingCheckout={r.isMissingCheckout} />
                </td>
                <td className="py-3.5 px-5 text-right whitespace-nowrap">
                  <button
                    onClick={() => onOpenCorrection(r)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F7FB] hover:bg-[#EAF3FF] text-[#1A1D24] hover:text-[#0077FF] border border-[#E5ECF2] font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#8F9CAE]" />
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
