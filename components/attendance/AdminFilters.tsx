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
    <div className="bg-white p-5 rounded-2xl border border-dayflow-border shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDate}
            className="p-2 rounded-lg bg-dayflow-bg border border-dayflow-border hover:bg-dayflow-light text-dayflow-text transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-2 bg-dayflow-bg border border-dayflow-border rounded-lg">
            <Calendar className="w-4 h-4 text-dayflow-primary" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => e.target.value && onChangeDate(e.target.value)}
              className="bg-transparent font-bold text-dayflow-text text-sm focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleNextDate}
            className="p-2 rounded-lg bg-dayflow-bg border border-dayflow-border hover:bg-dayflow-light text-dayflow-text transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Search Employee Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-dayflow-muted" />
          <input
            type="text"
            placeholder="Search employee by name, email, or department..."
            value={search}
            onChange={(e) => onChangeSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dayflow-bg border border-dayflow-border rounded-xl text-sm text-dayflow-text placeholder-dayflow-muted focus:outline-none focus:ring-2 focus:ring-dayflow-primary/20 focus:border-dayflow-primary"
          />
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dayflow-border">
        <span className="text-xs font-semibold text-dayflow-muted uppercase tracking-wider mr-2">Filter Status:</span>
        {statusOptions.map((st) => {
          const isActive = selectedStatus.toUpperCase() === st;
          return (
            <button
              key={st}
              onClick={() => onChangeStatus(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-dayflow-primary text-white shadow-xs'
                  : 'bg-dayflow-bg text-dayflow-muted hover:bg-dayflow-light hover:text-dayflow-text border border-dayflow-border'
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
