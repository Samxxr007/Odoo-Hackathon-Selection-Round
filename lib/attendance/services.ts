import { prisma } from '@/lib/prisma';
import { ATTENDANCE_CONFIG, AttendanceStatus } from './config';
import {
  getBusinessDateString,
  isFutureTimestamp,
  formatTimeInTimezone,
  formatDurationMinutes,
  getDaysInMonthString,
  isWeekendDay,
} from './timezone';
import { getMonthlyAttendanceAnalytics } from './analytics';

export class AttendanceError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = 'AttendanceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Toggle Check-In / Check-Out for an employee
 * Transactional & concurrency safe.
 */
export async function toggleAttendance(
  employeeId: string,
  timestamp: Date = new Date()
) {
  // Validate future timestamp
  if (isFutureTimestamp(timestamp)) {
    throw new AttendanceError(
      'Attendance timestamp cannot be in the future.',
      'INVALID_TIMESTAMP',
      400
    );
  }

  // Retrieve employee record
  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new AttendanceError(
      'Employee record not found.',
      'EMPLOYEE_NOT_FOUND',
      404
    );
  }

  const businessDate = getBusinessDateString(timestamp);

  // Perform database transaction for concurrency safety
  return await prisma.$transaction(async (tx) => {
    // Find existing attendance record for today
    const existing = await tx.attendance.findUnique({
      where: {
        unique_employee_daily_attendance: {
          employeeId,
          businessDate,
        },
      },
    });

    if (!existing) {
      // CASE 1: INITIAL CHECK-IN
      const [shiftHour, shiftMin] = (employee.shiftStartTime || '09:00').split(':').map(Number);
      const shiftStartDate = new Date(timestamp);
      shiftStartDate.setHours(shiftHour, shiftMin + (employee.gracePeriodMinutes || 15), 0, 0);
      const isLate = timestamp.getTime() > shiftStartDate.getTime();

      const newRecord = await tx.attendance.create({
        data: {
          employeeId,
          businessDate,
          checkIn: timestamp,
          checkOut: null,
          status: 'PRESENT',
          isLate,
        },
      });

      return {
        action: 'CHECKED_IN' as const,
        attendance: newRecord,
      };
    } else {
      // CASE 2: CHECK-OUT
      if (existing.checkOut !== null) {
        throw new AttendanceError(
          'Already checked out for today.',
          'ALREADY_CHECKED_OUT',
          400
        );
      }

      if (!existing.checkIn) {
        throw new AttendanceError('Check-in timestamp is missing.', 'INVALID_TIMESTAMP', 400);
      }

      if (timestamp.getTime() <= existing.checkIn.getTime()) {
        throw new AttendanceError(
          'Check-out timestamp must be later than check-in timestamp.',
          'INVALID_TIMESTAMP',
          400
        );
      }

      const durationMs = timestamp.getTime() - existing.checkIn.getTime();
      const workHoursMinutes = Math.round(durationMs / (1000 * 60));

      const shiftDuration = employee.shiftDurationMinutes || ATTENDANCE_CONFIG.STANDARD_SHIFT_MINUTES;
      const extraHoursMinutes = Math.max(0, workHoursMinutes - shiftDuration);
      const halfDayThreshold = ATTENDANCE_CONFIG.HALF_DAY_THRESHOLD_MINUTES;
      const status: AttendanceStatus =
        workHoursMinutes < halfDayThreshold ? 'HALF_DAY' : 'PRESENT';

      const updatedRecord = await tx.attendance.update({
        where: { id: existing.id },
        data: {
          checkOut: timestamp,
          workHoursMinutes,
          extraHoursMinutes,
          status,
        },
      });

      return {
        action: 'CHECKED_OUT' as const,
        attendance: updatedRecord,
      };
    }
  });
}

/**
 * Get Today's attendance state for employee dashboard clock card
 */
export async function getTodayAttendance(
  employeeId: string,
  now: Date = new Date()
) {
  const businessDate = getBusinessDateString(now);

  const record = await prisma.attendance.findUnique({
    where: {
      unique_employee_daily_attendance: {
        employeeId,
        businessDate,
      },
    },
  });

  if (!record) {
    return {
      isCheckedIn: false,
      isCheckedOut: false,
      record: null,
    };
  }

  return {
    isCheckedIn: true,
    isCheckedOut: record.checkOut !== null,
    record,
  };
}

/**
 * Get employee monthly attendance history with daily status breakdown
 */
export async function getEmployeeMonthlyAttendance(
  employeeId: string,
  monthString: string // YYYY-MM
) {
  const analytics = await getMonthlyAttendanceAnalytics(employeeId, monthString);
  const days = getDaysInMonthString(monthString);

  const holidays = await prisma.holiday.findMany({
    where: { date: { startsWith: monthString } },
  });
  const holidayMap = new Map(holidays.map((h) => [h.date, h]));

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
    orderBy: { businessDate: 'asc' },
  });
  const attendanceMap = new Map(attendances.map((a) => [a.businessDate, a]));

  const records = days.map((dateStr) => {
    const isWeekend = isWeekendDay(dateStr);
    const holiday = holidayMap.get(dateStr);
    const activeLeave = leaves.find((l) => l.startDate <= dateStr && l.endDate >= dateStr);
    const att = attendanceMap.get(dateStr);

    let statusDisplay: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY' | 'WEEKEND' = 'ABSENT';
    let checkInStr = '—';
    let checkOutStr = '—';
    let workHoursStr = '—';
    let extraHoursStr = '—';
    let isMissingCheckout = false;

    if (isWeekend) {
      statusDisplay = 'WEEKEND';
    } else if (holiday?.isNonWorkingDay) {
      statusDisplay = 'HOLIDAY';
    } else if (activeLeave) {
      statusDisplay = 'LEAVE';
    } else if (att) {
      statusDisplay = att.status as any;
      checkInStr = formatTimeInTimezone(att.checkIn);
      checkOutStr = formatTimeInTimezone(att.checkOut);
      workHoursStr = formatDurationMinutes(att.workHoursMinutes);
      extraHoursStr = formatDurationMinutes(att.extraHoursMinutes);
      if (att.checkIn && !att.checkOut) {
        isMissingCheckout = true;
      }
    } else {
      statusDisplay = 'ABSENT';
    }

    return {
      date: dateStr,
      status: statusDisplay,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      workHours: workHoursStr,
      extraHours: extraHoursStr,
      rawWorkMinutes: att?.workHoursMinutes ?? 0,
      rawExtraMinutes: att?.extraHoursMinutes ?? 0,
      isMissingCheckout,
      isLate: att?.isLate ?? false,
      isCorrected: att?.isCorrected ?? false,
      attendanceId: att?.id ?? null,
    };
  });

  return {
    month: monthString,
    summary: analytics.summary,
    records,
  };
}

/**
 * Admin Daily Attendance API
 */
export async function getAdminDailyAttendance(params: {
  date: string; // YYYY-MM-DD
  search?: string;
  status?: string;
}) {
  const { date, search, status } = params;

  // Build employee filter
  const whereUser: any = { isActive: true };
  if (search) {
    whereUser.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { department: { contains: search } },
    ];
  }

  const employees = await prisma.user.findMany({
    where: whereUser,
    orderBy: { name: 'asc' },
  });

  const holiday = await prisma.holiday.findUnique({ where: { date } });
  const isWeekend = isWeekendDay(date);

  const attendances = await prisma.attendance.findMany({
    where: { businessDate: date },
  });
  const attendanceMap = new Map(attendances.map((a) => [a.employeeId, a]));

  const targetDateObj = new Date(`${date}T00:00:00.000Z`);
  const [leaves, leaveReqs] = await Promise.all([
    prisma.leave.findMany({
      where: {
        status: 'APPROVED',
        startDate: { lte: date },
        endDate: { gte: date },
      },
    }).catch(() => []),
    prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        fromDate: { lte: targetDateObj },
        toDate: { gte: targetDateObj },
      },
    }).catch(() => []),
  ]);
  
  const leaveMap = new Map();
  leaves.forEach((l) => leaveMap.set(l.employeeId, l));
  leaveReqs.forEach((lr) => leaveMap.set(lr.userId, lr));

  let records = employees.map((emp) => {
    const att = attendanceMap.get(emp.id);
    const activeLeave = leaveMap.get(emp.id);

    let statusDisplay: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY' | 'WEEKEND' = 'ABSENT';
    let checkInStr = '—';
    let checkOutStr = '—';
    let workHoursStr = '—';
    let extraHoursStr = '—';
    let isMissingCheckout = false;

    if (att) {
      statusDisplay = att.status as any;
      checkInStr = formatTimeInTimezone(att.checkIn);
      checkOutStr = formatTimeInTimezone(att.checkOut);
      workHoursStr = formatDurationMinutes(att.workHoursMinutes);
      extraHoursStr = formatDurationMinutes(att.extraHoursMinutes);
      if (att.checkIn && !att.checkOut) {
        isMissingCheckout = true;
      }
    } else if (activeLeave) {
      statusDisplay = 'LEAVE';
    } else if (holiday?.isNonWorkingDay) {
      statusDisplay = 'HOLIDAY';
    } else if (isWeekend) {
      statusDisplay = 'WEEKEND';
    } else {
      statusDisplay = 'ABSENT';
    }

    return {
      employeeId: emp.id,
      name: emp.name,
      email: emp.email,
      department: emp.department || 'General',
      avatarUrl: emp.avatarUrl,
      attendanceId: att?.id || null,
      date,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      workHours: workHoursStr,
      extraHours: extraHoursStr,
      rawCheckIn: att?.checkIn || null,
      rawCheckOut: att?.checkOut || null,
      status: statusDisplay,
      isMissingCheckout,
      isLate: att?.isLate ?? false,
      isCorrected: att?.isCorrected ?? false,
      correctedBy: att?.correctedBy,
      correctionReason: att?.correctionReason,
    };
  });

  // Apply status filter if provided
  if (status && status !== 'ALL') {
    records = records.filter((r) => r.status.toUpperCase() === status.toUpperCase());
  }

  // Summary counts
  const totalEmployees = employees.length;
  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const absentCount = records.filter((r) => r.status === 'ABSENT').length;
  const halfDayCount = records.filter((r) => r.status === 'HALF_DAY').length;
  const leaveCount = records.filter((r) => r.status === 'LEAVE').length;

  return {
    date,
    summary: {
      totalEmployees,
      present: presentCount,
      absent: absentCount,
      halfDay: halfDayCount,
      leave: leaveCount,
    },
    records,
  };
}

/**
 * Admin Correction for Missing Checkouts
 * Preserves original check-in timestamp and records audit log details.
 */
export async function correctAttendanceCheckout(params: {
  adminId: string;
  attendanceId: string;
  correctedCheckOut: Date;
  reason: string;
}) {
  const { adminId, attendanceId, correctedCheckOut, reason } = params;

  if (!reason || reason.trim().length === 0) {
    throw new AttendanceError('Correction reason is required.', 'REASON_REQUIRED', 400);
  }

  const existing = await prisma.attendance.findUnique({
    where: { id: attendanceId },
    include: { user: true },
  });

  if (!existing) {
    throw new AttendanceError('Attendance record not found.', 'ATTENDANCE_NOT_FOUND', 404);
  }

  if (!existing.checkIn) {
    throw new AttendanceError('Cannot correct attendance without a check-in time.', 'INVALID_TIMESTAMP', 400);
  }

  if (correctedCheckOut.getTime() <= existing.checkIn.getTime()) {
    throw new AttendanceError(
      'Corrected check-out must be after original check-in time.',
      'INVALID_TIMESTAMP',
      400
    );
  }

  const durationMs = correctedCheckOut.getTime() - existing.checkIn.getTime();
  const workHoursMinutes = Math.round(durationMs / (1000 * 60));
  const shiftDuration = existing.user?.shiftDurationMinutes || ATTENDANCE_CONFIG.STANDARD_SHIFT_MINUTES;
  const extraHoursMinutes = Math.max(0, workHoursMinutes - shiftDuration);

  const status: AttendanceStatus =
    workHoursMinutes < ATTENDANCE_CONFIG.HALF_DAY_THRESHOLD_MINUTES ? 'HALF_DAY' : 'PRESENT';

  const updated = await prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      checkOut: correctedCheckOut,
      workHoursMinutes,
      extraHoursMinutes,
      status,
      isCorrected: true,
      correctedBy: adminId,
      correctedAt: new Date(),
      correctionReason: reason,
    },
  });

  return updated;
}
