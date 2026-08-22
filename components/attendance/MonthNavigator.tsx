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
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-dayflow-border shadow-2xs">
      <button
        onClick={handlePrev}
        className="p-1.5 rounded-lg hover:bg-dayflow-bg text-dayflow-muted hover:text-dayflow-text transition-colors"
        title="Previous Month"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 px-2">
        <Calendar className="w-4 h-4 text-dayflow-primary" />
        <span className="text-sm font-bold text-dayflow-text tracking-tight min-w-[120px] text-center">
          {format(date, 'MMMM yyyy')}
        </span>
      </div>

      <button
        onClick={handleNext}
        className="p-1.5 rounded-lg hover:bg-dayflow-bg text-dayflow-muted hover:text-dayflow-text transition-colors"
        title="Next Month"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
