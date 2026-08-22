'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { EmployeeProfile, UserRole, ResumeData, PrivateInfo, BankDetails } from '@/lib/types';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs, { TabKey } from '@/components/profile/ProfileTabs';
import ResumeTab from '@/components/profile/ResumeTab';
import PrivateInfoTab from '@/components/profile/PrivateInfoTab';
import SalaryTab from '@/components/profile/SalaryTab';
import DocumentsTab from '@/components/profile/DocumentsTab';
import SecurityTab from '@/components/profile/SecurityTab';
import { 
  AlertCircle, 
  RefreshCw, 
  ChevronRight,
  ShieldCheck, 
  Sparkles
} from 'lucide-react';

export default function ProfilePage() {
  const [sessionUserId, setSessionUserId] = useState<string>('');
  const [sessionRole, setSessionRole] = useState<UserRole>('EMPLOYEE');
  const [targetUserId, setTargetUserId] = useState<string>('');

  // Profile data & UI state
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('resume');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch session profile
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.user) {
          setSessionUserId(json.user.id);
          setSessionRole(json.user.role as UserRole);
          setTargetUserId(json.user.id);
        }
      })
      .catch((e) => console.error('Failed to fetch session user:', e));
  }, []);

  // Fetch target profile with current session context
  const loadProfile = useCallback(async () => {
    if (!targetUserId) return;
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

  const canViewSalary = profile?.permissions?.canViewSalary ?? false;
  const isOwnerOrPrivileged = (profile?.permissions?.isOwner || profile?.permissions?.canEditOrg) ?? false;

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8F9CAE]">
          <Link href="/employee-dashboard" className="hover:text-[#0077FF] transition-colors">
            Employee Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#8F9CAE]/60" />
          <span className="text-[#1A1D24] font-bold">My Profile</span>
        </div>

        {/* Loading State */}
        {isLoading && !profile && (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-[#0077FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-base font-bold text-[#1A1D24]">Loading Employee Profile...</h3>
            <p className="text-xs text-[#8F9CAE] mt-1">Applying role authorization and field filters</p>
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
                  onSalaryUpdated={() => {
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
                  mustChangePassword={false}
                  currentSessionUserId={sessionUserId}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5ECF2] py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8F9CAE]">
          <span>DAYFLOW HRMS Portal — Employee Profile & Settings</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#0077FF]" />
              Role-Enforced Authorization
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#00B7FE]" />
              Integrated HRMS Suite
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
