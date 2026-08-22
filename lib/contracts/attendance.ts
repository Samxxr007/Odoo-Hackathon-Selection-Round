/**
 * Attendance Contract — Stub Implementation
 *
 * This file provides the typed contract that Member 1 consumes.
 * Member 3 will replace this implementation with real attendance queries.
 *
 * DO NOT query the Attendance table directly from this module.
 * Instead, call these functions which Member 3 will implement fully.
 */

import type { EmployeeDailyStatus } from '@/types'
import { AttendanceStatusType } from '@prisma/client'
import { db } from '@/lib/db'

/**
 * Get an employee's attendance status for a specific date.
 * Member 3 owns this implementation — this is the stub version.
 */
export async function getEmployeeDailyStatus(
  userId: string,
  date: Date
): Promise<EmployeeDailyStatus> {
  const dateStr = date.toISOString().split('T')[0]

  try {
    const attendance = await db.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: new Date(dateStr),
        },
      },
    })

    if (!attendance) {
      return {
        userId,
        date: dateStr,
        status: AttendanceStatusType.UNKNOWN,
        checkIn: null,
        checkOut: null,
        isHalfDay: false,
      }
    }

    return {
      userId,
      date: dateStr,
      status: attendance.status,
      checkIn: attendance.checkIn?.toISOString() ?? null,
      checkOut: attendance.checkOut?.toISOString() ?? null,
      isHalfDay: attendance.status === AttendanceStatusType.HALF_DAY,
    }
  } catch {
    return {
      userId,
      date: dateStr,
      status: AttendanceStatusType.UNKNOWN,
      checkIn: null,
      checkOut: null,
      isHalfDay: false,
    }
  }
}

/**
 * Get attendance summary for an entire company on a specific date.
 * Returns counts of Present, Absent, On Leave, Unknown.
 */
export async function getCompanyAttendanceSummary(
  companyId: string,
  date: Date
): Promise<{
  present: number
  absent: number
  onLeave: number
  unknown: number
}> {
  const dateStr = date.toISOString().split('T')[0]

  try {
    const records = await db.attendance.findMany({
      where: {
        user: { companyId },
        date: new Date(dateStr),
      },
      select: { status: true },
    })

    return {
      present: records.filter((r) => r.status === AttendanceStatusType.PRESENT || r.status === AttendanceStatusType.HALF_DAY).length,
      absent: records.filter((r) => r.status === AttendanceStatusType.ABSENT).length,
      onLeave: records.filter((r) => r.status === AttendanceStatusType.ON_LEAVE).length,
      unknown: records.filter((r) => r.status === AttendanceStatusType.UNKNOWN).length,
    }
  } catch {
    return { present: 0, absent: 0, onLeave: 0, unknown: 0 }
  }
}
