'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { EmployeeProfile, UserRole, ResumeData, PrivateInfo, BankDetails, SalaryBreakdown } from '@/lib/types';
import RoleSwitcher, { DEMO_USERS } from '@/components/profile/RoleSwitcher';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs, { TabKey } from '@/components/profile/ProfileTabs';
import ResumeTab from '@/components/profile/ResumeTab';
import PrivateInfoTab from '@/components/profile/PrivateInfoTab';
import SalaryTab from '@/components/profile/SalaryTab';
import DocumentsTab from '@/components/profile/DocumentsTab';
import SecurityTab from '@/components/profile/SecurityTab';
import { 
  Building2, 
  Search, 
  Bell, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  User, 
  Briefcase, 
  Sparkles,
  Lock
} from 'lucide-react';

export default function ProfilePage() {
  // Session & Role Simulator State
  const [sessionUserId, setSessionUserId] = useState<string>('EMP-003'); // Default to John Doe
  const [sessionRole, setSessionRole] = useState<UserRole>('EMPLOYEE');
  const [targetUserId, setTargetUserId] = useState<string>('EMP-003');

  // Profile data & UI state
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('resume');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch target profile with current session context
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/profile?userId=${targetUserId}`, {
        headers: {
          'x-user-id': sessionUserId,
          'x-user-role': sessionRole,
        },
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load employee profile');
      }

      setProfile(result.data);

      // If user switched to an employee without salary permission, fallback to resume
      if (activeTab === 'salary' && !result.data.permissions?.canViewSalary) {
        setActiveTab('resume');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading profile');
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, sessionUserId, sessionRole, activeTab]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Session user switch handler
  const handleSessionChange = (newUserId: string, newRole: UserRole) => {
    setSessionUserId(newUserId);
    setSessionRole(newRole);
    setTargetUserId(newUserId); // default to own profile on login switch
  };

  // Update resume data
  const handleUpdateResume = async (updatedResume: ResumeData) => {
    if (!profile) return;
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': sessionUserId,
        'x-user-role': sessionRole,
      },
      body: JSON.stringify({
        id: targetUserId,
        resume: updatedResume,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update resume');
    }

    setProfile(result.data);
  };

  // Update private & bank data
  const handleUpdatePrivate = async (data: { privateInfo?: PrivateInfo; bankDetails?: BankDetails }) => {
    if (!profile) return;
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': sessionUserId,
        'x-user-role': sessionRole,
      },
      body: JSON.stringify({
        id: targetUserId,
        privateInfo: data.privateInfo,
        bankDetails: data.bankDetails,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update private information');
    }

    setProfile(result.data);
  };

  const currentUserObj = DEMO_USERS.find((u) => u.id === sessionUserId) || DEMO_USERS[0];
  const canViewSalary = profile?.permissions?.canViewSalary ?? false;
  const isOwnerOrPrivileged = (profile?.permissions?.isOwner || profile?.permissions?.canEditOrg) ?? false;

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* 1. Auth & Role Simulation Bar */}
      <RoleSwitcher
        currentSessionUser={sessionUserId}
        currentRole={sessionRole}
        targetUserId={targetUserId}
        onSessionChange={handleSessionChange}
        onTargetUserChange={(id) => setTargetUserId(id)}
      />

      {/* 2. Top App Navigation Header */}
      <header className="bg-white border-b border-brand-border sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-sky flex items-center justify-center text-white font-black text-xl shadow-sm">
              O
            </div>
            <div>
              <span className="text-base font-extrabold text-brand-text tracking-tight flex items-center gap-1.5">
                <span>Odoo HRM Suite</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-tint text-brand-primary border border-brand-sky/30 uppercase">
                  Member 2
                </span>
              </span>
              <p className="text-[11px] text-brand-muted hidden sm:block">Employee Profile, Private Info, Salary & Security</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search employees, skills, departments..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-brand-bg rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Current Logged-in User Badge */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-brand-muted hover:text-brand-text hover:bg-brand-bg rounded-xl relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-warning ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-brand-border">
              <div className="w-9 h-9 rounded-full bg-brand-tint border border-brand-sky/40 flex items-center justify-center text-brand-primary font-bold text-sm">
                {currentUserObj.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-brand-text block leading-tight">
                  {currentUserObj.name}
                </span>
                <span className="text-[10px] text-brand-muted block font-medium">
                  {currentUserObj.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading State */}
        {isLoading && !profile && (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-base font-bold text-brand-text">Loading Employee Profile...</h3>
            <p className="text-xs text-brand-muted mt-1">Applying role authorization and field filters</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center max-w-lg mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-red-800">Profile Loading Error</h3>
            <p className="text-xs text-red-700 mt-1 mb-4">{error}</p>
            <button
              onClick={loadProfile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Profile Content Canvas */}
        {profile && (
          <>
            {/* Header Component */}
            <ProfileHeader
              profile={profile}
              onProfileUpdate={(updated) => setProfile(updated)}
              currentUserId={sessionUserId}
            />

            {/* Tab Navigation */}
            <ProfileTabs
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
              canViewSalary={canViewSalary}
              isOwnerOrPrivileged={isOwnerOrPrivileged}
            />

            {/* Tab Content Panels */}
            <div>
              {/* 1. Resume Tab */}
              {activeTab === 'resume' && (
                <ResumeTab
                  resume={profile.resume}
                  canEdit={Boolean(profile.permissions?.canEditPersonal)}
                  onUpdateResume={handleUpdateResume}
                />
              )}

              {/* 2. Private & Bank Info Tab */}
              {activeTab === 'private' && (
                <PrivateInfoTab
                  privateInfo={profile.privateInfo}
                  bankDetails={profile.bankDetails}
                  canEdit={Boolean(profile.permissions?.canEditPrivate)}
                  canEditOrg={Boolean(profile.permissions?.canEditOrg)}
                  onUpdatePrivate={handleUpdatePrivate}
                />
              )}

              {/* 3. Salary Info Tab (Admin / HR Only) */}
              {activeTab === 'salary' && canViewSalary && (
                <SalaryTab
                  initialConfig={profile.salaryConfig}
                  targetUserId={profile.id}
                  currentUserId={sessionUserId}
                  onSalaryUpdated={(breakdown) => {
                    loadProfile();
                  }}
                />
              )}

              {/* 4. Documents Tab */}
              {activeTab === 'documents' && (
                <DocumentsTab
                  employeeId={profile.id}
                  currentUserId={sessionUserId}
                  canManageDocs={Boolean(profile.permissions?.canManageDocs)}
                />
              )}

              {/* 5. Security & Password Tab */}
              {activeTab === 'security' && isOwnerOrPrivileged && (
                <SecurityTab
                  userId={profile.id}
                  mustChangePassword={sessionUserId === profile.id && DEMO_USERS.find(u => u.id === sessionUserId)?.name === 'Jane Smith'}
                  currentSessionUserId={sessionUserId}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-brand-border py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-muted">
          <span>Odoo Hackathon Selection Round — Member 2: Profile, Salary & Security</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-brand-primary" />
              Role-Enforced APIs
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-brand-sky" />
              Formula-Driven Compensation
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
