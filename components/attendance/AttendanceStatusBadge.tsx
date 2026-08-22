import React from 'react';
import { CheckCircle2, XCircle, Clock, Calendar, Umbrella } from 'lucide-react';

export type StatusType = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY' | 'WEEKEND';

interface BadgeProps {
  status: StatusType | string;
  isMissingCheckout?: boolean;
}

export const AttendanceStatusBadge: React.FC<BadgeProps> = ({ status, isMissingCheckout }) => {
  if (isMissingCheckout) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        Missing Checkout
      </span>
    );
  }

  switch (status.toUpperCase()) {
    case 'PRESENT':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Present
        </span>
      );
    case 'ABSENT':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Absent
        </span>
      );
    case 'HALF_DAY':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
          <Clock className="w-3.5 h-3.5 text-orange-600" />
          Half-Day
        </span>
      );
    case 'LEAVE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Umbrella className="w-3.5 h-3.5 text-blue-600" />
          Leave
        </span>
      );
    case 'HOLIDAY':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <Calendar className="w-3.5 h-3.5 text-purple-600" />
          Holiday
        </span>
      );
    case 'WEEKEND':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          Weekend
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
};
