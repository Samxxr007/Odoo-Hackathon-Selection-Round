import { prisma } from '@/lib/prisma';
import { getDaysInMonthString, isWeekendDay } from './timezone';

export interface DeductionDay {
  date: string;
  reason: 'ABSENT' | 'UNPAID_LEAVE' | 'MISSING_CHECKOUT' | 'HALF_DAY_DEDUCTION';
  details?: string;
}

export interface PayableDaysResponse {
  month: string;
  payableDays: number;
  workingDays: number;
  breakdown: {
    present: number;
    halfDay: number;
    paidLeave: number;
    unpaidLeave: number;
    absent: number;
    holidays: number;
  };
  deductionDays: DeductionDay[];
}

/**
 * MODULE H — PAYROLL HELPER
 * 
 * Exposes getPayableDays(userId, month) for consumption by the Payroll module.
 * Never calculates money with floating point arithmetic - exposes duration & payable days breakdown.
 */
export async function getPayableDays(
  employeeId: string,
  monthString: string // YYYY-MM
): Promise<PayableDaysResponse> {
  const days = getDaysInMonthString(monthString);

  // Fetch all holidays in month in single query
  const holidays = await prisma.holiday.findMany({
    where: {
      date: { startsWith: monthString },
      isNonWorkingDay: true,
    },
  });
  const holidayDates = new Set(holidays.map((h) => h.date));

  // Fetch all leaves in month in single query
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

  // Fetch all attendance records in month in single query
  const attendances = await prisma.attendance.findMany({
    where: {
      employeeId,
      businessDate: { startsWith: monthString },
    },
  });

  const attendanceMap = new Map(attendances.map((a) => [a.businessDate, a]));

  let presentCount = 0;
  let halfDayCount = 0;
  let paidLeaveCount = 0;
  let unpaidLeaveCount = 0;
  let absentCount = 0;
  let holidayCount = 0;
  let totalWorkingDays = 0;

  const deductionDays: DeductionDay[] = [];

  for (const dateStr of days) {
    const isWeekend = isWeekendDay(dateStr);
    const isHoliday = holidayDates.has(dateStr);

    if (isWeekend || isHoliday) {
      holidayCount++;
      continue; // Weekend or company holiday is a non-working day
    }

    totalWorkingDays++;

    // Check if on approved leave
    const activeLeave = leaves.find(
      (l) => l.startDate <= dateStr && l.endDate >= dateStr
    );

    if (activeLeave) {
      if (activeLeave.type === 'UNPAID') {
        unpaidLeaveCount++;
        deductionDays.push({
          date: dateStr,
          reason: 'UNPAID_LEAVE',
          details: activeLeave.reason || 'Approved Unpaid Leave',
        });
      } else {
        // PAID or SICK leave
        paidLeaveCount++;
      }
      continue;
    }

    // Check attendance record
    const att = attendanceMap.get(dateStr);
    if (att) {
      if (att.status === 'HALF_DAY') {
        halfDayCount++;
        deductionDays.push({
          date: dateStr,
          reason: 'HALF_DAY_DEDUCTION',
          details: 'Half-day worked (0.5 day payable)',
        });
      } else {
        presentCount++;
      }
    } else {
      absentCount++;
      deductionDays.push({
        date: dateStr,
        reason: 'ABSENT',
        details: 'No attendance recorded on working day',
      });
    }
  }

  // Calculate net payable days
  // Present + PaidLeave + (HalfDay * 0.5)
  const payableDays = presentCount + paidLeaveCount + halfDayCount * 0.5;

  return {
    month: monthString,
    payableDays,
    workingDays: totalWorkingDays,
    breakdown: {
      present: presentCount,
      halfDay: halfDayCount,
      paidLeave: paidLeaveCount,
      unpaidLeave: unpaidLeaveCount,
      absent: absentCount,
      holidays: holidayCount,
    },
    deductionDays,
  };
}
