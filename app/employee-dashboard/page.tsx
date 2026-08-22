'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  Calendar as CalendarIcon,
  Umbrella,
  User,
  DollarSign,
  RefreshCw,
  Bell,
  Activity,
} from 'lucide-react';
import { formatTimeInTimezone, formatDurationMinutes } from '@/lib/attendance/timezone';

export default function EmployeeDashboardPage() {
  const [userName, setUserName] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [todayState, setTodayState] = useState<{
    isCheckedIn: boolean;
    isCheckedOut: boolean;
    record: any | null;
  }>({
    isCheckedIn: false,
    isCheckedOut: false,
    record: null,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch session user profile
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.user) {
          const rawName = json.user.name || '';
          const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
          setUserName(cleanName);
        }
      })
      .catch((e) => console.error('Failed to fetch session user:', e));

    // Fetch recent notifications
    fetch('/api/notifications?limit=5')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setNotifications(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch today's real attendance state
  const fetchTodayState = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/attendance/me/today');
      const json = await res.json();
      if (json.success && json.data) {
        setTodayState(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch today state:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayState();
  }, [fetchTodayState]);

  const record = todayState.record;
  const checkInFormatted = record?.checkIn ? formatTimeInTimezone(record.checkIn) : null;
  const checkOutFormatted = record?.checkOut ? formatTimeInTimezone(record.checkOut) : null;
  const workHoursFormatted = record?.workHoursMinutes ? formatDurationMinutes(record.workHoursMinutes) : null;

  // Time-of-day dynamic greeting
  const currentHour = new Date().getHours();
  const timeOfDayGreeting =
    currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  // Format today's date header (e.g. SATURDAY, AUGUST 22, 2026)
  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();

  const displayName = userName ? userName.replace(/\s*\([^)]*\)/g, '').trim() : '';

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5ECF2] shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00B7FE]">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{todayDateString}</span>
            </div>
            <h1 className="text-3xl font-black text-[#1A1D24] tracking-tight">
              {timeOfDayGreeting}, {displayName || 'Employee'}
            </h1>
            <p className="text-sm text-[#8F9CAE]">
              Here is your daily HRMS overview and work status.
            </p>
          </div>

          <button
            onClick={fetchTodayState}
            className="self-start sm:self-auto p-2.5 rounded-xl bg-[#F4F7FB] border border-[#E5ECF2] hover:bg-[#EAF3FF] text-[#8F9CAE] hover:text-[#1A1D24] shadow-2xs transition-colors"
            title="Refresh Overview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Access Modules Navigation */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1A1D24] tracking-tight">Quick Access Modules</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Profile Card */}
            <Link
              href="/profile"
              className="bg-white p-6 rounded-2xl border border-[#E5ECF2] shadow-xs hover:shadow-md hover:border-[#0077FF]/30 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1A1D24] group-hover:text-[#0077FF] transition-colors">
                    My Profile
                  </h3>
                  <p className="text-xs text-[#8F9CAE] mt-1 leading-relaxed">
                    View personal info, job details, avatar, and security settings.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-[#0077FF] pt-2 border-t border-[#E5ECF2]/50">
                <span>View Profile</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Attendance Card */}
            <Link
              href="/attendance"
              className="bg-white p-6 rounded-2xl border border-[#E5ECF2] shadow-xs hover:shadow-md hover:border-[#0077FF]/30 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0077FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1A1D24] group-hover:text-[#0077FF] transition-colors">
                    My Attendance
                  </h3>
                  <p className="text-xs text-[#8F9CAE] mt-1 leading-relaxed">
                    Check-in/out, live shift timer, monthly attendance logs & overtime.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-[#0077FF] pt-2 border-t border-[#E5ECF2]/50">
                <span>View Attendance</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Leave Requests Card */}
            <Link
              href="/leave"
              className="bg-white p-6 rounded-2xl border border-[#E5ECF2] shadow-xs hover:shadow-md hover:border-[#0077FF]/30 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Umbrella className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1A1D24] group-hover:text-[#0077FF] transition-colors">
                    Leave Requests
                  </h3>
                  <p className="text-xs text-[#8F9CAE] mt-1 leading-relaxed">
                    Apply for paid/unpaid/sick leaves and track approval requests.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-[#0077FF] pt-2 border-t border-[#E5ECF2]/50">
                <span>View Leave</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Payroll Card */}
            <Link
              href="/payroll"
              className="bg-white p-6 rounded-2xl border border-[#E5ECF2] shadow-xs hover:shadow-md hover:border-[#0077FF]/30 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1A1D24] group-hover:text-[#0077FF] transition-colors">
                    Payroll & Salary
                  </h3>
                  <p className="text-xs text-[#8F9CAE] mt-1 leading-relaxed">
                    View monthly salary breakdown, payable days, and download payslips.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-[#0077FF] pt-2 border-t border-[#E5ECF2]/50">
                <span>View Payroll</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Primary Today's Attendance Summary Banner Card */}
        <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5ECF2] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF3FF] text-[#0077FF] flex items-center justify-center border border-blue-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1A1D24]">Today's Attendance Summary</h2>
                <p className="text-xs text-[#8F9CAE]">Real-time status from your attendance log</p>
              </div>
            </div>

            {record?.status && (
              <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                {record.status}
              </span>
            )}
          </div>

          {/* Dynamic State Display */}
          {isLoading ? (
            <div className="py-8 text-center text-sm font-semibold text-[#8F9CAE] animate-pulse">
              Loading today's attendance status...
            </div>
          ) : !todayState.isCheckedIn ? (
            /* STATE A: NOT CHECKED IN */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-[#EAF3FF] to-white border border-blue-100">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8F9CAE]">Current Shift Status</span>
                <div className="text-xl font-bold text-[#1A1D24]">Not checked in today</div>
                <p className="text-xs text-[#8F9CAE]">Start your shift by recording your attendance check-in.</p>
              </div>

              <Link
                href="/attendance"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0077FF] hover:bg-[#0084FF] text-white font-bold text-sm shadow-sm transition-all"
              >
                <span>View Attendance & Check In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : !todayState.isCheckedOut ? (
            /* STATE B: CURRENTLY CHECKED IN */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-white border border-emerald-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Currently Working</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <div>
                    <span className="text-xs text-[#8F9CAE]">Checked In At:</span>
                    <div className="text-2xl font-black text-[#1A1D24]">{checkInFormatted}</div>
                  </div>
                </div>
              </div>

              <Link
                href="/attendance"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0077FF] hover:bg-[#0084FF] text-white font-bold text-sm shadow-sm transition-all"
              >
                <span>View Attendance & Check Out</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            /* STATE C: CHECKED OUT */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-white border border-blue-200">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-800">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Attendance Completed Today</span>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-xs text-[#8F9CAE]">Check In:</span>
                    <div className="text-base font-bold text-[#1A1D24]">{checkInFormatted}</div>
                  </div>
                  <div>
                    <span className="text-xs text-[#8F9CAE]">Check Out:</span>
                    <div className="text-base font-bold text-[#1A1D24]">{checkOutFormatted}</div>
                  </div>
                  <div>
                    <span className="text-xs text-[#8F9CAE]">Work Hours:</span>
                    <div className="text-base font-bold text-[#0077FF]">{workHoursFormatted}</div>
                  </div>
                </div>
              </div>

              <Link
                href="/attendance"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0077FF] hover:bg-[#0084FF] text-white font-bold text-sm shadow-sm transition-all"
              >
                <span>View Attendance Logs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity / Alerts Section */}
        <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#E5ECF2]">
            <Activity className="w-5 h-5 text-[#0077FF]" />
            <h2 className="text-lg font-bold text-[#1A1D24]">Recent Activity & Alerts</h2>
          </div>

          {notifications.length > 0 ? (
            <div className="divide-y divide-[#E5ECF2]">
              {notifications.map((item: any) => (
                <div key={item.id} className="py-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF3FF] text-[#0077FF] flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1D24]">{item.message}</p>
                    <span className="text-xs text-[#8F9CAE]">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : todayState.record?.checkIn ? (
            <div className="py-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1D24]">
                  Checked in today at {checkInFormatted}
                </p>
                <span className="text-xs text-[#8F9CAE]">Attendance System Activity</span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-[#8F9CAE]">
              No recent activity
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
