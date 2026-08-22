import dayjs from 'dayjs'
import { prisma } from '@/lib/prisma'

/**
 * Returns the number of working days in a given month/year
 * (Mon–Fri, excluding public holidays).
 */
export async function getWorkingDaysInMonth(
  month: number,
  year: number
): Promise<number> {
  const startOfMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
  const endOfMonth = startOfMonth.endOf('month')

  const holidays = await prisma.publicHoliday.findMany({
    where: {
      year,
      date: {
        gte: startOfMonth.toDate(),
        lte: endOfMonth.toDate(),
      },
    },
    select: { date: true },
  })

  const holidaySet = new Set(
    holidays.map((h) => dayjs(h.date).format('YYYY-MM-DD'))
  )

  let count = 0
  let current = startOfMonth

  while (current.isBefore(endOfMonth) || current.isSame(endOfMonth, 'day')) {
    const dayOfWeek = current.day()
    const dateStr = current.format('YYYY-MM-DD')
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaySet.has(dateStr)) {
      count++
    }
    current = current.add(1, 'day')
  }

  return count
}

/**
 * Calculates payable days for an employee in a given month.
 * Used internally by payrollService.
 *
 * Formula:
 *   payableDays = totalWorkingDays - unpaidLeaveDays - absentDays
 *
 * Paid leave does NOT reduce payable days.
 * Unpaid leave REDUCES payable days.
 */
export function calcPayableDays(
  totalWorkingDays: number,
  unpaidLeaveDays: number,
  absentDays: number
): number {
  const payable = totalWorkingDays - unpaidLeaveDays - absentDays
  return Math.max(0, payable)
}

/**
 * Returns all approved leave days for a user in a given month,
 * split by paid and unpaid.
 */
export async function getApprovedLeaveSplit(
  userId: string,
  month: number,
  year: number
): Promise<{ paidDays: number; unpaidDays: number }> {
  const startOfMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).toDate()
  const endOfMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
    .endOf('month')
    .toDate()

  const approvedLeaves = await prisma.leaveRequest.findMany({
    where: {
      userId,
      status: 'APPROVED',
      fromDate: { lte: endOfMonth },
      toDate: { gte: startOfMonth },
    },
  })

  let paidDays = 0
  let unpaidDays = 0

  for (const leave of approvedLeaves) {
    // Clip the leave to within the month
    const leaveStart = dayjs(Math.max(leave.fromDate.getTime(), startOfMonth.getTime()))
    const leaveEnd = dayjs(Math.min(leave.toDate.getTime(), endOfMonth.getTime()))

    // Count working days within this clipped range
    const holidays = await prisma.publicHoliday.findMany({
      where: { year, date: { gte: leaveStart.toDate(), lte: leaveEnd.toDate() } },
      select: { date: true },
    })
    const holidaySet = new Set(holidays.map((h) => dayjs(h.date).format('YYYY-MM-DD')))

    let days = 0
    let cur = leaveStart
    while (cur.isBefore(leaveEnd) || cur.isSame(leaveEnd, 'day')) {
      const dow = cur.day()
      if (dow !== 0 && dow !== 6 && !holidaySet.has(cur.format('YYYY-MM-DD'))) {
        days++
      }
      cur = cur.add(1, 'day')
    }

    if (leave.leaveType === 'UNPAID_LEAVE') {
      unpaidDays += days
    } else {
      paidDays += days
    }
  }

  return { paidDays, unpaidDays }
}
