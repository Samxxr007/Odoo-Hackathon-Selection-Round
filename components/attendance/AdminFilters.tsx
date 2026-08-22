'use client';

import React from 'react';
import { Search, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, parseISO, addDays, subDays } from 'date-fns';

interface AdminFiltersProps {
  currentDate: string; // YYYY-MM-DD
  search: string;
  selectedStatus: string;
  onChangeDate: (newDate: string) => void;
  onChangeSearch: (val: string) => void;
  onChangeStatus: (status: string) => void;
}

export const AdminFilters: React.FC<AdminFiltersProps> = ({
  currentDate,
  search,
  selectedStatus,
  onChangeDate,
  onChangeSearch,
  onChangeStatus,
}) => {
  const dateObj = parseISO(currentDate);

  const handlePrevDate = () => {
    const prev = subDays(dateObj, 1);
    onChangeDate(format(prev, 'yyyy-MM-dd'));
  };

  const handleNextDate = () => {
    const next = addDays(dateObj, 1);
    onChangeDate(format(next, 'yyyy-MM-dd'));
  };

  const statusOptions = ['ALL', 'PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'];

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDate}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <Calendar className="w-4 h-4 text-[#0077FF] dark:text-[#38BDF8]" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => e.target.value && onChangeDate(e.target.value)}
              className="bg-transparent font-bold text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleNextDate}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Search Employee Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee by name, email, or department..."
            value={search}
            onChange={(e) => onChangeSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0077FF]/20 focus:border-[#0077FF]"
          />
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Filter Status:</span>
        {statusOptions.map((st) => {
          const isActive = selectedStatus.toUpperCase() === st;
          return (
            <button
              key={st}
              onClick={() => onChangeStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#0077FF] text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              {st === 'ALL' ? 'All Status' : st.replace('_', ' ')}
            </button>
          );
        })}
      </div>
    </div>
  );
};
