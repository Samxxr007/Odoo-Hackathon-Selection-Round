'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { MonthNavigator } from '@/components/attendance/MonthNavigator';
import { TodayAttendanceCard } from '@/components/attendance/TodayAttendanceCard';
import { AttendanceSummaryCards } from '@/components/attendance/AttendanceSummaryCards';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { RefreshCw, AlertCircle, ChevronRight, Info } from 'lucide-react';

export default function EmployeeAttendancePage() {
  const [currentMonth, setCurrentMonth] = useState<string>('2026-08');
  const [user, setUser] = useState<any>(null);
  
  // Today's attendance state
  const [todayState, setTodayState] = useState<{
    isCheckedIn: boolean;
    isCheckedOut: boolean;
    record: any | null;
  }>({
    isCheckedIn: false,
    isCheckedOut: false,
    record: null,
  });

  // Monthly attendance history & summary state
  const [monthlyData, setMonthlyData] = useState<{
    summary: any;
    records: any[];
  }>({
    summary: { present: 0, leave: 0, absent: 0, halfDay: 0, workingDays: 0, extraMinutes: 0, extraHoursFormatted: '00h 00m' },
    records: [],
  });

  const [isLoadingToday, setIsLoadingToday] = useState<boolean>(true);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch authenticated session user
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.user) {
          setUser(json.user);
        }
      })
      .catch((e) => console.error('Failed to fetch session user:', e));
  }, []);

  // Fetch today's state
  const fetchTodayState = useCallback(async () => {
    setIsLoadingToday(true);
    try {
      const res = await fetch('/api/attendance/me/today');
      const json = await res.json();
      if (json.success && json.data) {
        setTodayState(json.data);
      }
    } catch (e: any) {
      console.error('Failed to fetch today state:', e);
    } finally {
      setIsLoadingToday(false);
    }
  }, []);

  // Fetch monthly records & summary
  const fetchMonthlyData = useCallback(async (month: string) => {
    setIsLoadingMonthly(true);
    setError(null);
    try {
      const res = await fetch(`/api/attendance/me?month=${month}`);
      const json = await res.json();
      if (json.success && json.data) {
        setMonthlyData({
          summary: json.data.summary,
          records: json.data.records,
        });
      } else {
        throw new Error(json.error?.message || 'Failed to load monthly attendance.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoadingMonthly(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayState();
  }, [fetchTodayState]);

  useEffect(() => {
    fetchMonthlyData(currentMonth);
  }, [currentMonth, fetchMonthlyData]);

  // Handle Check-In / Check-Out Toggle
  const handleToggleAttendance = async () => {
    setIsToggling(true);
    setError(null);

    try {
      const res = await fetch('/api/attendance/toggle', {
        method: 'POST',
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to record attendance.');
      }

      await fetchTodayState();
      await fetchMonthlyData(currentMonth);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB]">
      <UnifiedHeader initialUser={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
        {/* Breadcrumb Navigation & Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8F9CAE]">
              <Link href="/dashboard" className="hover:text-[#0077FF] transition-colors">
                Employees
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#8F9CAE]/60" />
              <span className="text-[#1A1D24] font-bold">Attendance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D24] tracking-tight">
              My Attendance Portal
            </h1>
            <p className="text-sm text-[#5A687D]">
              Day-wise attendance, working time tracking, and monthly payable log.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchTodayState();
                fetchMonthlyData(currentMonth);
              }}
              className="p-2.5 rounded-xl bg-white border border-[#E5ECF2] hover:bg-[#F4F7FB] text-[#8F9CAE] hover:text-[#1A1D24] shadow-2xs transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <MonthNavigator
              currentMonth={currentMonth}
              onChangeMonth={(newMonth) => setCurrentMonth(newMonth)}
            />
          </div>
        </div>

        {/* Wireframe Note Banner on Attendance & Payroll Rule */}
        <div className="bg-[#EAF3FF] border border-blue-200 rounded-2xl p-4 text-xs text-[#0077FF] flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-[#0077FF]" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-[#1A1D24]">Attendance & Payroll Connection</p>
            <p className="text-[#5A687D] leading-relaxed">
              Your attendance data serves as the direct foundation for monthly payslip generation. The system automatically calculates payable days based on completed shifts. Unexcused absences or unpaid leaves reduce the total payable days count during payroll compilation.
            </p>
          </div>
        </div>

        {/* Global Error Alert if any */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchMonthlyData(currentMonth)}
              className="text-xs font-bold underline hover:text-rose-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Today's Active Check-In/Out Card */}
        <TodayAttendanceCard
          isCheckedIn={todayState.isCheckedIn}
          isCheckedOut={todayState.isCheckedOut}
          record={todayState.record}
          isLoading={isToggling || isLoadingToday}
          onToggle={handleToggleAttendance}
          error={null}
        />

        {/* Monthly Summary Statistics Cards */}
        <AttendanceSummaryCards summary={monthlyData.summary} />

        {/* Day-Wise Attendance Log Table */}
        <AttendanceTable records={monthlyData.records} isLoading={isLoadingMonthly} />
      </main>
    </div>
  );
}
