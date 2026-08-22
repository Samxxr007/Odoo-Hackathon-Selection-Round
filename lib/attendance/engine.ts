import { prisma } from '@/lib/prisma';
import { AttendanceStatus } from './config';
import { isWeekendDay } from './timezone';

export interface DailyStatusResult {
  date: string;
  status: AttendanceStatus | 'NON_WORKING_DAY';
  isAbsence: boolean;
  leaveType?: string;
  reason?: string;
  attendanceId?: string;
}

/**
 * MODULE C — DAILY STATUS ENGINE
 * 
 * Determines daily attendance status following strict precedence rules:
 * 1. Holiday / Weekend -> NON_WORKING_DAY (Not counted as absence)
 * 2. Approved Leave -> LEAVE (Overrides absence and un-approved records)
 * 3. Attendance record present -> HALF_DAY (if work hours < threshold) or PRESENT
 * 4. No Attendance record -> ABSENT
 */
export async function getEmployeeDailyStatus(
  employeeId: string,
  dateString: string
): Promise<AttendanceStatus | 'NON_WORKING_DAY'> {
  const result = await getEmployeeDailyStatusDetailed(employeeId, dateString);
  return result.status;
}

export async function getEmployeeDailyStatusDetailed(
  employeeId: string,
  dateString: string
): Promise<DailyStatusResult> {
  // 1. Check Holiday / Work Calendar
  const holiday = await prisma.holiday.findUnique({
    where: { date: dateString },
  });

  const isWeekend = isWeekendDay(dateString);

  if (holiday?.isNonWorkingDay || isWeekend) {
    return {
      date: dateString,
      status: 'NON_WORKING_DAY',
      isAbsence: false,
      reason: holiday ? holiday.name : 'Weekend',
    };
  }

  // 2. Priority: Approved Leave
  const leave = await prisma.leave.findFirst({
    where: {
      employeeId,
      status: 'APPROVED',
      startDate: { lte: dateString },
      endDate: { gte: dateString },
    },
  });

  if (leave) {
    return {
      date: dateString,
      status: 'LEAVE',
      isAbsence: false,
      leaveType: leave.type,
      reason: leave.reason || `${leave.type} Leave`,
    };
  }

  // 3. Check Attendance Record
  const attendance = await prisma.attendance.findUnique({
    where: {
      unique_employee_daily_attendance: {
        employeeId,
        businessDate: dateString,
      },
    },
  });

  if (attendance) {
    return {
      date: dateString,
      status: attendance.status as AttendanceStatus,
      isAbsence: false,
      attendanceId: attendance.id,
    };
  }

  // 4. Default if no attendance record and not on leave -> ABSENT
  return {
    date: dateString,
    status: 'ABSENT',
    isAbsence: true,
    reason: 'No attendance recorded',
  };
}
