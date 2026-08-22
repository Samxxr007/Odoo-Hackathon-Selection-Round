import dayjs from 'dayjs'
import { prisma } from '@/lib/prisma'
import type { CalendarEventDTO, LeaveStatus } from '@/types/leave'

/**
 * Returns all calendar data for a given user and year:
 * - Public holidays
 * - The user's own leave requests (all statuses)
 * - If admin: all users' approved leaves
 */
export async function getCalendarData(
  userId: string,
  year: number,
  isAdmin = false
): Promise<CalendarEventDTO[]> {
  const yearStart = new Date(`${year}-01-01T00:00:00.000Z`)
  const yearEnd = new Date(`${year}-12-31T23:59:59.999Z`)

  // Fetch public holidays
  const holidays = await prisma.publicHoliday.findMany({
    where: { year },
    orderBy: { date: 'asc' },
  })

  // Fetch leave requests
  const leaveWhere = isAdmin
    ? { fromDate: { lte: yearEnd }, toDate: { gte: yearStart }, status: 'APPROVED' as LeaveStatus }
    : { userId, fromDate: { lte: yearEnd }, toDate: { gte: yearStart } }

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: leaveWhere,
    include: { user: { select: { name: true } } },
    orderBy: { fromDate: 'asc' },
  })

  const events: CalendarEventDTO[] = []

  // Map holidays
  for (const holiday of holidays) {
    events.push({
      id: holiday.id,
      date: dayjs(holiday.date).format('YYYY-MM-DD'),
      title: holiday.name,
      type: 'HOLIDAY',
    })
  }

  // Map leave requests
  for (const req of leaveRequests) {
    events.push({
      id: req.id,
      date: dayjs(req.fromDate).format('YYYY-MM-DD'),
      endDate: dayjs(req.toDate).format('YYYY-MM-DD'),
      title: isAdmin
        ? `${req.user.name} — ${req.leaveType.replace(/_/g, ' ')}`
        : req.leaveType.replace(/_/g, ' '),
      type: req.leaveType as any,
      status: req.status as LeaveStatus,
      userId: req.userId,
      days: req.days ?? undefined,
    })
  }

  return events
}
