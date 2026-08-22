'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { AdminFilters } from '@/components/attendance/AdminFilters';
import { AdminAttendanceTable } from '@/components/attendance/AdminAttendanceTable';
import { CorrectionModal } from '@/components/attendance/CorrectionModal';
import { Users, CheckCircle2, XCircle, Umbrella, Clock, RefreshCw, AlertTriangle, Shield, Info } from 'lucide-react';
import { getBusinessDateString } from '@/lib/attendance/timezone';

export default function AdminAttendancePage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<string>('2026-08-22');
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [user, setUser] = useState<any>(null);

  const [data, setData] = useState<{
    summary: { totalEmployees: number; present: number; absent: number; halfDay: number; leave: number };
    records: any[];
  }>({
    summary: { totalEmployees: 0, present: 0, absent: 0, halfDay: 0, leave: 0 },
    records: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Correction Modal State
  const [selectedRecordForCorrection, setSelectedRecordForCorrection] = useState<any | null>(null);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((json) => {
        const u = json.data || json.user
        if (!json.success || !u || (u.role !== 'ADMIN' && u.role !== 'HR')) {
          router.replace('/attendance')
        } else {
          setUser({ name: u.name, role: u.role })
        }
      })
      .catch(() => router.replace('/attendance'))
  }, [router])

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        date: currentDate,
        search,
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/attendance?${query.toString()}`);
      if (res.status === 403 || res.status === 401) {
        router.replace('/unauthorized');
        return;
      }

      const json = await res.json();

      if (json.success && json.data) {
        setData({
          summary: json.data.summary,
          records: json.data.records,
        });
      } else {
        throw new Error(json.error?.message || 'Failed to load admin attendance log.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, search, statusFilter, router]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleOpenCorrection = (record: any) => {
    setSelectedRecordForCorrection(record);
    setIsCorrectionOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB]">
      <UnifiedHeader initialUser={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700 uppercase">
                Admin Control
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D24] tracking-tight mt-1">
              Admin Attendance Management
            </h1>
            <p className="text-sm text-[#5A687D]">
              Review, filter, and audit company-wide employee attendance records and punch corrections.
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E5ECF2] hover:bg-[#F4F7FB] text-[#1A1D24] text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#0077FF]" />
            Refresh
          </button>
        </div>

        {/* Note banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs text-purple-900 flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-purple-600" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-purple-950">Admin Attendance & Audit Rules</p>
            <p className="text-purple-800 leading-relaxed">
              Admins and HR officers can inspect real-time presence across all departments. Missing check-outs can be corrected using the <strong>Correct</strong> action, which requires a mandatory reason for the audit trail.
            </p>
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchAdminData}
              className="text-xs font-bold underline hover:text-rose-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Counter Cards for Admin */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E5ECF2] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8F9CAE] uppercase tracking-wider">Total Staff</span>
              <Users className="w-4 h-4 text-[#0077FF]" />
            </div>
            <div className="text-2xl font-black text-[#1A1D24]">{data.summary.totalEmployees}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Present</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">{data.summary.present}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Absent</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-700">{data.summary.absent}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-orange-800 uppercase tracking-wider">Half-Day</span>
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-orange-700">{data.summary.halfDay}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">On Leave</span>
              <Umbrella className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-sky-700">{data.summary.leave}</div>
          </div>
        </div>

        {/* Filters */}
        <AdminFilters
          currentDate={currentDate}
          search={search}
          selectedStatus={statusFilter}
          onChangeDate={(d) => setCurrentDate(d)}
          onChangeSearch={(s) => setSearch(s)}
          onChangeStatus={(st) => setStatusFilter(st)}
        />

        {/* Multi-Employee Attendance Table */}
        <AdminAttendanceTable
          records={data.records}
          isLoading={isLoading}
          onOpenCorrection={handleOpenCorrection}
        />

        {/* HR Correction Modal */}
        <CorrectionModal
          isOpen={isCorrectionOpen}
          onClose={() => setIsCorrectionOpen(false)}
          record={selectedRecordForCorrection}
          onSuccess={fetchAdminData}
        />
      </main>
    </div>
  );
}
