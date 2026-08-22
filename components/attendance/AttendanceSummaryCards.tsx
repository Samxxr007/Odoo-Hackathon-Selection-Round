'use client';

import React from 'react';
import { CheckCircle2, XCircle, Clock, Umbrella, CalendarDays, Zap } from 'lucide-react';

interface SummaryData {
  present: number;
  leave: number;
  absent: number;
  halfDay: number;
  workingDays: number;
  extraMinutes: number;
  extraHoursFormatted: string;
}

interface SummaryCardsProps {
  summary: SummaryData;
}

export const AttendanceSummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Present',
      value: summary.present,
      subtitle: 'Days worked',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
    },
    {
      title: 'Leave',
      value: summary.leave,
      subtitle: 'Approved leave',
      icon: Umbrella,
      iconBg: 'bg-blue-50 text-dayflow-primary',
      border: 'border-blue-100',
    },
    {
      title: 'Absent',
      value: summary.absent,
      subtitle: 'Unexcused days',
      icon: XCircle,
      iconBg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
    },
    {
      title: 'Half Day',
      value: summary.halfDay,
      subtitle: '< 4h shift',
      icon: Clock,
      iconBg: 'bg-orange-50 text-orange-600',
      border: 'border-orange-100',
    },
    {
      title: 'Working Days',
      value: summary.workingDays,
      subtitle: 'Total workdays',
      icon: CalendarDays,
      iconBg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
    },
    {
      title: 'Overtime',
      value: summary.extraHoursFormatted,
      subtitle: 'Extra hours',
      icon: Zap,
      iconBg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`bg-white p-4 rounded-xl border ${c.border} shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-dayflow-muted">{c.title}</span>
              <div className={`p-2 rounded-lg ${c.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-dayflow-text tracking-tight">{c.value}</div>
              <div className="text-xs text-dayflow-muted mt-0.5">{c.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
