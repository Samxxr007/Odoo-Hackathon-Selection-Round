'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/attendance/Navbar';
import { MonthNavigator } from '@/components/attendance/MonthNavigator';
import { TodayAttendanceCard } from '@/components/attendance/TodayAttendanceCard';
import { AttendanceSummaryCards } from '@/components/attendance/AttendanceSummaryCards';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';

export default function EmployeeAttendancePage() {
  const [currentMonth, setCurrentMonth] = useState<string>('2026-08');
  const [user, setUser] = useState<any>({ name: '' });
  
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
          setUser({ name: json.user.name });
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

      // Re-fetch state & monthly history
      await fetchTodayState();
      await fetchMonthlyData(currentMonth);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dayflow-bg">
      <Navbar currentUserName={user.name} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb Navigation & Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-dayflow-muted">
              <Link href="/employee-dashboard" className="hover:text-dayflow-primary transition-colors">
                Employee Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-dayflow-muted/60" />
              <span className="text-dayflow-text font-bold">Attendance</span>
            </div>
            <h1 className="text-2xl font-black text-dayflow-text tracking-tight">My Attendance Dashboard</h1>
            <p className="text-sm text-dayflow-muted">Track your daily shift duration, extra hours, and monthly logs</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchTodayState();
                fetchMonthlyData(currentMonth);
              }}
              className="p-2.5 rounded-xl bg-white border border-dayflow-border hover:bg-dayflow-light text-dayflow-muted hover:text-dayflow-text shadow-2xs transition-colors"
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

        {/* Global Error Alert if any */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchMonthlyData(currentMonth)}
              className="text-xs font-bold underline hover:text-rose-900"
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
