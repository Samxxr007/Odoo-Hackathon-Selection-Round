'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, parseISO, addMonths, subMonths } from 'date-fns';

interface MonthNavigatorProps {
  currentMonth: string; // YYYY-MM
  onChangeMonth: (newMonth: string) => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  currentMonth,
  onChangeMonth,
}) => {
  const date = parseISO(`${currentMonth}-01`);

  const handlePrev = () => {
    const prev = subMonths(date, 1);
    onChangeMonth(format(prev, 'yyyy-MM'));
  };

  const handleNext = () => {
    const next = addMonths(date, 1);
    onChangeMonth(format(next, 'yyyy-MM'));
  };

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
      <button
        onClick={handlePrev}
        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        title="Previous Month"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 px-2">
        <Calendar className="w-4 h-4 text-[#0077FF] dark:text-[#38BDF8]" />
        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight min-w-[120px] text-center">
          {format(date, 'MMMM yyyy')}
        </span>
      </div>

      <button
        onClick={handleNext}
        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        title="Next Month"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
