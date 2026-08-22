'use client';

import React from 'react';
import { 
  FileText, 
  Shield, 
  IndianRupee, 
  FolderLock, 
  KeyRound, 
  Lock 
} from 'lucide-react';

export type TabKey = 'resume' | 'private' | 'salary' | 'documents' | 'security';

interface ProfileTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  canViewSalary: boolean;
  isOwnerOrPrivileged: boolean;
}

export default function ProfileTabs({
  activeTab,
  onTabChange,
  canViewSalary,
  isOwnerOrPrivileged,
}: ProfileTabsProps) {
  const tabs: { id: TabKey; label: string; icon: React.ReactNode; badge?: string; isPrivileged?: boolean }[] = [
    {
      id: 'resume',
      label: 'Resume & Skills',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'private',
      label: 'Private & Bank Info',
      icon: <Shield className="w-4 h-4" />,
      badge: isOwnerOrPrivileged ? undefined : 'Confidential',
    },
    ...(canViewSalary
      ? [
          {
            id: 'salary' as TabKey,
            label: 'Salary & Compensation',
            icon: <IndianRupee className="w-4 h-4" />,
            badge: 'Admin/HR Only',
            isPrivileged: true,
          },
        ]
      : []),
    {
      id: 'documents',
      label: 'Documents',
      icon: <FolderLock className="w-4 h-4" />,
    },
    ...(isOwnerOrPrivileged
      ? [
          {
            id: 'security' as TabKey,
            label: 'Security & Password',
            icon: <KeyRound className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  return (
    <div className="bg-brand-white rounded-2xl shadow-sm border border-brand-border mb-6 p-2 overflow-x-auto transition-all">
      <div className="flex items-center gap-1.5 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                isActive
                  ? 'bg-brand-tint text-brand-primary shadow-sm ring-1 ring-brand-sky/30'
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg'
              }`}
            >
              <span className={isActive ? 'text-brand-primary' : 'text-brand-muted'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>

              {tab.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                    tab.isPrivileged
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}
                >
                  <Lock className="w-2.5 h-2.5" />
                  {tab.badge}
                </span>
              )}

              {isActive && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
