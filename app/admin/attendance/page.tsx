'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/attendance/Navbar';
import { AdminFilters } from '@/components/attendance/AdminFilters';
import { AdminAttendanceTable } from '@/components/attendance/AdminAttendanceTable';
import { CorrectionModal } from '@/components/attendance/CorrectionModal';
import { Users, CheckCircle2, XCircle, Umbrella, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { getBusinessDateString } from '@/lib/attendance/timezone';

export default function AdminAttendancePage() {
  const [currentDate, setCurrentDate] = useState<string>(getBusinessDateString());
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
  }, [currentDate, search, statusFilter]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleOpenCorrection = (record: any) => {
    setSelectedRecordForCorrection(record);
    setIsCorrectionOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dayflow-bg">
      <Navbar currentRole="ADMIN" currentUserName="Sarah Connor (HR Admin)" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-dayflow-text tracking-tight">Admin Attendance Management</h1>
            <p className="text-sm text-dayflow-muted">Review, search, filter, and audit company-wide employee attendance</p>
          </div>

          <button
            onClick={fetchAdminData}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-dayflow-border hover:bg-dayflow-light text-dayflow-text text-sm font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-dayflow-primary" />
            Refresh
          </button>
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
              className="text-xs font-bold underline hover:text-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Counter Cards for Admin */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-dayflow-border shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-dayflow-muted uppercase">Total Staff</span>
              <Users className="w-4 h-4 text-dayflow-primary" />
            </div>
            <div className="text-2xl font-black text-dayflow-text">{data.summary.totalEmployees}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-800 uppercase">Present</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">{data.summary.present}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-800 uppercase">Absent</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-700">{data.summary.absent}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-orange-800 uppercase">Half-Day</span>
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-orange-700">{data.summary.halfDay}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-800 uppercase">On Leave</span>
              <Umbrella className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-700">{data.summary.leave}</div>
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
