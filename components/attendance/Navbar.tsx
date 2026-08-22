'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Clock, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentUserName: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUserName }) => {
  const pathname = usePathname();
  const cleanName = currentUserName ? currentUserName.replace(/\s*\([^)]*\)/g, '').trim() : '';

  return (
    <header className="bg-white border-b border-dayflow-border sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/employee-dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-dayflow-primary via-dayflow-secondary to-dayflow-sky flex items-center justify-center text-white font-black text-lg shadow-sm">
                D
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-dayflow-text leading-none">
                  DAYFLOW
                </span>
                <span className="text-[10px] font-bold text-dayflow-sky tracking-wider uppercase">
                  HRMS Portal
                </span>
              </div>
            </Link>

            {/* Employee Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/employee-dashboard"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                  pathname === '/employee-dashboard'
                    ? 'bg-dayflow-light text-dayflow-primary'
                    : 'text-dayflow-muted hover:text-dayflow-text hover:bg-dayflow-bg'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Employee Dashboard
              </Link>

              <Link
                href="/attendance"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                  pathname === '/attendance'
                    ? 'bg-dayflow-light text-dayflow-primary'
                    : 'text-dayflow-muted hover:text-dayflow-text hover:bg-dayflow-bg'
                }`}
              >
                <Clock className="w-4 h-4" />
                My Attendance
              </Link>
            </nav>
          </div>

          {/* User Badge - Pure Employee Name, Zero Role Text */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-dayflow-bg border border-dayflow-border shadow-2xs">
              <UserCheck className="w-4 h-4 text-dayflow-primary" />
              <span className="text-xs font-bold text-dayflow-text">{cleanName || 'Employee'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
