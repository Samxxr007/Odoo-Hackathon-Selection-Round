'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { AdminFilters } from '@/components/attendance/AdminFilters';
import { AdminAttendanceTable } from '@/components/attendance/AdminAttendanceTable';
import { CorrectionModal } from '@/components/attendance/CorrectionModal';
import { Users, CheckCircle2, XCircle, Umbrella, Clock, RefreshCw, AlertTriangle, Info } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F17] transition-colors duration-200">
      <UnifiedHeader initialUser={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Attendance Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Review and manage company-wide daily attendance records and punch corrections.
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0077FF] dark:text-[#38BDF8]" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
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

        {/* Summary Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Staff</span>
              <Users className="w-4 h-4 text-[#0077FF] dark:text-[#38BDF8]" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{data.summary.totalEmployees}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Present</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{data.summary.present}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Absent</span>
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{data.summary.absent}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/50 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Half-Day</span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{data.summary.halfDay}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-sky-100 dark:border-sky-900/50 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider">On Leave</span>
              <Umbrella className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{data.summary.leave}</div>
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
