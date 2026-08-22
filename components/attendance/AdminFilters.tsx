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
    <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5ECF2] shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDate}
            className="p-2 rounded-xl bg-[#F4F7FB] border border-[#E5ECF2] hover:bg-white text-[#1A1D24] transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4 text-[#8F9CAE]" />
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#F4F7FB] border border-[#E5ECF2] rounded-xl">
            <Calendar className="w-4 h-4 text-[#0077FF]" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => e.target.value && onChangeDate(e.target.value)}
              className="bg-transparent font-bold text-[#1A1D24] text-xs sm:text-sm focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleNextDate}
            className="p-2 rounded-xl bg-[#F4F7FB] border border-[#E5ECF2] hover:bg-white text-[#1A1D24] transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4 text-[#8F9CAE]" />
          </button>
        </div>

        {/* Search Employee Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F9CAE]" />
          <input
            type="text"
            placeholder="Search employee by name, email, or department..."
            value={search}
            onChange={(e) => onChangeSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F4F7FB] border border-[#E5ECF2] rounded-xl text-xs sm:text-sm text-[#1A1D24] placeholder:text-[#8F9CAE] focus:outline-none focus:ring-2 focus:ring-[#0077FF]/20 focus:border-[#0077FF]"
          />
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5ECF2]">
        <span className="text-xs font-bold text-[#8F9CAE] uppercase tracking-wider mr-2">Filter Status:</span>
        {statusOptions.map((st) => {
          const isActive = selectedStatus.toUpperCase() === st;
          return (
            <button
              key={st}
              onClick={() => onChangeStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#EAF3FF] text-[#0077FF] border border-[#E5ECF2] shadow-2xs'
                  : 'bg-[#F4F7FB] text-[#8F9CAE] hover:text-[#1A1D24] hover:bg-white border border-[#E5ECF2]'
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
