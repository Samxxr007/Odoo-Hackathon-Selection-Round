'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentRole: 'EMPLOYEE' | 'ADMIN';
  currentUserName: string;
  onRoleSwitch?: (newRole: 'EMPLOYEE' | 'ADMIN') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentUserName,
  onRoleSwitch,
}) => {
  const pathname = usePathname();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleRoleToggle = async () => {
    const nextRole = currentRole === 'EMPLOYEE' ? 'ADMIN' : 'EMPLOYEE';
    setIsSwitching(true);

    try {
      await fetch('/api/auth/dev-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });

      if (onRoleSwitch) {
        onRoleSwitch(nextRole);
      } else {
        window.location.reload();
      }
    } catch (e) {
      console.error('Failed to switch role', e);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <header className="bg-white border-b border-dayflow-border sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-dayflow-primary via-dayflow-secondary to-dayflow-sky flex items-center justify-center text-white font-black text-lg shadow-sm">
                D
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-dayflow-text leading-none">
                  DAYFLOW
                </span>
                <span className="text-[10px] font-bold text-dayflow-sky tracking-wider uppercase">
                  HRMS Attendance
                </span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
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

              <Link
                href="/admin/attendance"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                  pathname.startsWith('/admin')
                    ? 'bg-dayflow-light text-dayflow-primary'
                    : 'text-dayflow-muted hover:text-dayflow-text hover:bg-dayflow-bg'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Management
              </Link>
            </nav>
          </div>

          {/* User Profile & Role Switcher Badge */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dayflow-bg border border-dayflow-border">
              <UserCheck className="w-4 h-4 text-dayflow-primary" />
              <span className="text-xs font-semibold text-dayflow-text">{currentUserName}</span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  currentRole === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                {currentRole}
              </span>
            </div>

            {/* Role Switcher Button */}
            <button
              onClick={handleRoleToggle}
              disabled={isSwitching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-dayflow-border bg-white hover:bg-dayflow-light text-dayflow-text shadow-2xs transition-all active:scale-95 disabled:opacity-50"
              title="Toggle role between Employee and Admin HR"
            >
              <Sparkles className="w-3.5 h-3.5 text-dayflow-warning" />
              <span>Switch to {currentRole === 'EMPLOYEE' ? 'Admin' : 'Employee'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
