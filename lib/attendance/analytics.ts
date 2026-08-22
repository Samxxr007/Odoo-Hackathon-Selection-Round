import { prisma } from '@/lib/prisma';
import { getDaysInMonthString, isWeekendDay, formatDurationMinutes } from './timezone';

export interface MonthlyAnalyticsResponse {
  month: string;
  summary: {
    present: number;
    absent: number;
    halfDay: number;
    leave: number;
    workingDays: number;
    extraMinutes: number;
    extraHoursFormatted: string;
    lateArrivals: number;
    missingCheckouts: number;
  };
}

/**
 * MODULE I — ATTENDANCE ANALYTICS SERVICE
 * 
 * Exposes getMonthlyAttendanceAnalytics(employeeId, month) for dashboards and reports.
 */
export async function getMonthlyAttendanceAnalytics(
  employeeId: string,
  monthString: string
): Promise<MonthlyAnalyticsResponse> {
  const days = getDaysInMonthString(monthString);

  const holidays = await prisma.holiday.findMany({
    where: { date: { startsWith: monthString }, isNonWorkingDay: true },
  });
  const holidayDates = new Set(holidays.map((h) => h.date));

  const leaves = await prisma.leave.findMany({
    where: {
      employeeId,
      status: 'APPROVED',
      OR: [
        { startDate: { startsWith: monthString } },
        { endDate: { startsWith: monthString } },
      ],
    },
  });

  const attendances = await prisma.attendance.findMany({
    where: {
      employeeId,
      businessDate: { startsWith: monthString },
    },
  });

  const attendanceMap = new Map(attendances.map((a) => [a.businessDate, a]));

  let present = 0;
  let absent = 0;
  let halfDay = 0;
  let leave = 0;
  let workingDays = 0;
  let extraMinutes = 0;
  let lateArrivals = 0;
  let missingCheckouts = 0;

  for (const dateStr of days) {
    const isWeekend = isWeekendDay(dateStr);
    const isHoliday = holidayDates.has(dateStr);

    if (isWeekend || isHoliday) continue;

    workingDays++;

    const activeLeave = leaves.find(
      (l) => l.startDate <= dateStr && l.endDate >= dateStr
    );
    if (activeLeave) {
      leave++;
      continue;
    }

    const att = attendanceMap.get(dateStr);
    if (att) {
      if (att.status === 'HALF_DAY') {
        halfDay++;
      } else {
        present++;
      }
      if (att.extraHoursMinutes) {
        extraMinutes += att.extraHoursMinutes;
      }
      if (att.isLate) {
        lateArrivals++;
      }
      if (att.checkIn && !att.checkOut) {
        missingCheckouts++;
      }
    } else {
      absent++;
    }
  }

  return {
    month: monthString,
    summary: {
      present,
      absent,
      halfDay,
      leave,
      workingDays,
      extraMinutes,
      extraHoursFormatted: formatDurationMinutes(extraMinutes),
      lateArrivals,
      missingCheckouts,
    },
  };
}
