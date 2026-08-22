import { toZonedTime, format as formatZoned } from 'date-fns-tz';
import { format, parseISO, startOfMonth, endOfMonth, isWeekend } from 'date-fns';
import { ATTENDANCE_CONFIG } from './config';

/**
 * Get the business date string (YYYY-MM-DD) for a given UTC Date object
 * using the configured company timezone.
 */
export function getBusinessDateString(
  date: Date = new Date(),
  timezone: string = ATTENDANCE_CONFIG.DEFAULT_TIMEZONE
): string {
  const zonedDate = toZonedTime(date, timezone);
  return formatZoned(zonedDate, 'yyyy-MM-dd', { timeZone: timezone });
}

/**
 * Format a Date object into a readable 12-hour time string (e.g. "09:02 AM")
 * in the configured company timezone.
 */
export function formatTimeInTimezone(
  date: Date | string | null | undefined,
  timezone: string = ATTENDANCE_CONFIG.DEFAULT_TIMEZONE
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  const zonedDate = toZonedTime(d, timezone);
  return formatZoned(zonedDate, 'hh:mm a', { timeZone: timezone });
}

/**
 * Format duration minutes into standard "08h 39m" display string.
 */
export function formatDurationMinutes(minutes: number | null | undefined): string {
  if (minutes == null || isNaN(minutes) || minutes <= 0) return '00h 00m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}h ${pad(mins)}m`;
}

/**
 * Check if a timestamp is in the future beyond allowed clock skew.
 */
export function isFutureTimestamp(
  date: Date,
  toleranceSeconds: number = ATTENDANCE_CONFIG.ALLOWED_CLOCK_SKEW_SECONDS
): boolean {
  const nowMs = Date.now();
  return date.getTime() > nowMs + toleranceSeconds * 1000;
}

/**
 * Parse a year-month string ("2026-08") into all business date strings (YYYY-MM-DD) in that month.
 */
export function getDaysInMonthString(monthString: string): string[] {
  const [yearStr, monthStr] = monthString.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed
  
  const days: string[] = [];
  const date = new Date(Date.UTC(year, month, 1));
  
  while (date.getUTCMonth() === month) {
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    days.push(`${yyyy}-${mm}-${dd}`);
    date.setUTCDate(date.getUTCDate() + 1);
  }
  
  return days;
}

/**
 * Check if a date string YYYY-MM-DD falls on a weekend (Saturday or Sunday).
 */
export function isWeekendDay(dateStr: string): boolean {
  const d = parseISO(dateStr);
  return isWeekend(d);
}
