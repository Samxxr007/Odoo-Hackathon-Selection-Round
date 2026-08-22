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
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200/60 dark:border-emerald-900/50',
    },
    {
      title: 'Leave',
      value: summary.leave,
      subtitle: 'Approved leave',
      icon: Umbrella,
      iconBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
      border: 'border-sky-200/60 dark:border-sky-900/50',
    },
    {
      title: 'Absent',
      value: summary.absent,
      subtitle: 'Unexcused days',
      icon: XCircle,
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      border: 'border-rose-200/60 dark:border-rose-900/50',
    },
    {
      title: 'Half Day',
      value: summary.halfDay,
      subtitle: '< 4h shift',
      icon: Clock,
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      border: 'border-amber-200/60 dark:border-amber-900/50',
    },
    {
      title: 'Working Days',
      value: summary.workingDays,
      subtitle: 'Total workdays',
      icon: CalendarDays,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-[#0077FF] dark:text-[#38BDF8]',
      border: 'border-blue-200/60 dark:border-blue-900/50',
    },
    {
      title: 'Overtime',
      value: summary.extraHoursFormatted,
      subtitle: 'Extra hours',
      icon: Zap,
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
      border: 'border-purple-200/60 dark:border-purple-900/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-3xl border ${c.border} shadow-xs hover:shadow-xl transition-all flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{c.title}</span>
              <div className={`p-2 rounded-xl ${c.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{c.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
