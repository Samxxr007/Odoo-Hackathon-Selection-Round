/**
 * Dayflow Work Policy & Attendance Configuration
 * Isolated policy settings - No hardcoded magic numbers in business logic!
 */

export type Role = 'EMPLOYEE' | 'ADMIN';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
export type LeaveType = 'PAID' | 'UNPAID' | 'SICK';
export type LeaveStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export const ATTENDANCE_CONFIG = {
  // Business timezone (e.g. Asia/Kolkata, America/New_York, UTC)
  DEFAULT_TIMEZONE: process.env.COMPANY_TIMEZONE || 'Asia/Kolkata',

  // Standard shift duration in minutes (8 hours = 480 minutes)
  STANDARD_SHIFT_MINUTES: Number(process.env.STANDARD_SHIFT_MINUTES || 480),

  // Half day threshold in minutes (4 hours = 240 minutes)
  HALF_DAY_THRESHOLD_MINUTES: Number(process.env.HALF_DAY_THRESHOLD_MINUTES || 240),

  // Standard shift start time (HH:mm 24-hour format)
  DEFAULT_SHIFT_START: process.env.DEFAULT_SHIFT_START || '09:00',

  // Grace period before marking check-in as late (minutes)
  DEFAULT_GRACE_PERIOD_MINUTES: Number(process.env.DEFAULT_GRACE_PERIOD_MINUTES || 15),

  // Maximum allowed clock skew for future timestamps (seconds)
  ALLOWED_CLOCK_SKEW_SECONDS: 300, // 5 minutes
} as const;
