'use client';

import React from 'react';
import { UserRole } from '@/lib/types';
import { ShieldCheck, UserCheck, Users, Eye, Sparkles } from 'lucide-react';

interface RoleSwitcherProps {
  currentSessionUser: string;
  currentRole: UserRole;
  targetUserId: string;
  onSessionChange: (userId: string, role: UserRole) => void;
  onTargetUserChange: (targetUserId: string) => void;
}

export const DEMO_USERS = [
  { id: 'EMP-003', name: 'John Doe', role: 'EMPLOYEE' as UserRole, title: 'Senior Software Engineer (Owner/Self)' },
  { id: 'EMP-004', name: 'Jane Smith', role: 'EMPLOYEE' as UserRole, title: 'Lead Product Designer (Other Employee)' },
  { id: 'EMP-002', name: 'Priya Sharma', role: 'HR' as UserRole, title: 'HR Manager (Full Access & Salary)' },
  { id: 'EMP-001', name: 'Alexander Wright', role: 'ADMIN' as UserRole, title: 'Chief Technology Officer (Admin)' },
];

export default function RoleSwitcher({
  currentSessionUser,
  currentRole,
  targetUserId,
  onSessionChange,
  onTargetUserChange,
}: RoleSwitcherProps) {
  const isViewingSelf = currentSessionUser === targetUserId;

  return (
    <div className="bg-brand-text text-white px-4 py-2.5 shadow-md border-b border-gray-800 text-xs transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Role Simulation Label */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-primary text-white font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Auth Simulator
          </span>
          <span className="text-gray-300 hidden sm:inline">
            Test real-time backend authorization & permissions:
          </span>
        </div>

        {/* Center: Session / Role Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-400 font-medium mr-1">Log in as:</span>
          {DEMO_USERS.map((user) => {
            const isActive = currentSessionUser === user.id;
            return (
              <button
                key={user.id}
                onClick={() => onSessionChange(user.id, user.role)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-brand-text ring-2 ring-brand-sky font-semibold shadow-sm'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                title={user.title}
              >
                {user.role === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />}
                {user.role === 'HR' && <UserCheck className="w-3.5 h-3.5 text-blue-400" />}
                {user.role === 'EMPLOYEE' && <Users className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{user.name.split(' ')[0]}</span>
                <span className="opacity-75 text-[10px]">({user.role})</span>
              </button>
            );
          })}
        </div>

        {/* Right: Target Profile Picker */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-800 px-2.5 py-1 rounded text-gray-200">
            <Eye className="w-3.5 h-3.5 text-brand-sky" />
            <span className="text-gray-400">Viewing:</span>
            <select
              value={targetUserId}
              onChange={(e) => onTargetUserChange(e.target.value)}
              className="bg-transparent text-white font-semibold outline-none cursor-pointer text-xs"
            >
              {DEMO_USERS.map((u) => (
                <option key={u.id} value={u.id} className="bg-gray-900 text-white">
                  {u.name} ({u.id})
                </option>
              ))}
            </select>
          </div>

          <span
            className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
              isViewingSelf
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : currentRole === 'ADMIN' || currentRole === 'HR'
                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}
          >
            {isViewingSelf ? 'Self Profile' : currentRole === 'ADMIN' || currentRole === 'HR' ? 'Admin Managing' : 'Read-Only Mode'}
          </span>
        </div>
      </div>
    </div>
  );
}
