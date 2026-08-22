'use client';

import React from 'react';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

interface CheckInOutButtonProps {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export const CheckInOutButton: React.FC<CheckInOutButtonProps> = ({
  isCheckedIn,
  isCheckedOut,
  isLoading,
  onToggle,
}) => {
  if (isCheckedOut) {
    return (
      <div className="w-full sm:w-auto text-center px-6 py-3 bg-emerald-50 text-emerald-800 font-semibold rounded-xl border border-emerald-200 shadow-xs">
        Shift Completed Today
      </div>
    );
  }

  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-white shadow-md transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
        isCheckedIn
          ? 'bg-dayflow-warning hover:bg-orange-600 focus:ring-4 focus:ring-orange-200'
          : 'bg-dayflow-primary hover:bg-dayflow-secondary focus:ring-4 focus:ring-blue-200'
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : isCheckedIn ? (
        <>
          <LogOut className="w-5 h-5" />
          <span>CHECK OUT</span>
        </>
      ) : (
        <>
          <LogIn className="w-5 h-5" />
          <span>CHECK IN</span>
        </>
      )}
    </button>
  );
};
