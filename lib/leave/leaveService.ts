import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

import { prisma } from '@/lib/prisma'
import { validateBalance } from '@/lib/leave/balanceService'
import { sendNotification } from '@/lib/notifications/notificationService'
import type { LeaveType, LeaveStatus, LeaveRequestDTO } from '@/types/leave'
import type { ApprovedLeaveResult } from '@/types/contracts'

// ─── Working Day Calculation ──────────────────────────────────────────────────

/**
 * Counts the number of working days (Mon–Fri, excl. public holidays)
 * between fromDate and toDate inclusive.
 */
export async function calculateWorkingDays(
  fromDate: Date,
  toDate: Date
): Promise<number> {
  const year = fromDate.getFullYear()

  const holidays = await prisma.publicHoliday.findMany({
    where: { year },
    select: { date: true },
  })

  const holidaySet = new Set(
    holidays.map((h) => dayjs(h.date).format('YYYY-MM-DD'))
  )

  let count = 0
  let current = dayjs(fromDate)
  const end = dayjs(toDate)

  while (current.isSameOrBefore(end, 'day')) {
    const dayOfWeek = current.day() // 0 = Sunday, 6 = Saturday
    const dateStr = current.format('YYYY-MM-DD')
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaySet.has(dateStr)) {
      count++
    }
    current = current.add(1, 'day')
  }

  return count
}

// ─── Validation ───────────────────────────────────────────────────────────────

async function validateLeaveRequest(
  userId: string,
  leaveType: LeaveType,
  fromDate: Date,
  toDate: Date,
  days: number
): Promise<void> {
  // 1. Date order
  if (dayjs(fromDate).isAfter(dayjs(toDate))) {
    throw new Error('From date cannot be after To date.')
  }

  // 2. Zero-day check
  if (days <= 0) {
    throw new Error('Leave request must include at least one working day.')
  }

  // 3. Overlap check — reject if any PENDING or APPROVED request overlaps
  const overlap = await prisma.leaveRequest.findFirst({
    where: {
      userId,
      status: { in: ['PENDING', 'APPROVED'] },
      fromDate: { lte: toDate },
      toDate: { gte: fromDate },
    },
  })

  if (overlap) {
    throw new Error(
      `You already have a ${overlap.status.toLowerCase()} leave request that overlaps these dates.`
    )
  }

  // 4. Balance check
  const year = fromDate.getFullYear()
  await validateBalance(userId, leaveType, year, days)
}

// ─── Create Leave Request ─────────────────────────────────────────────────────

export async function createLeaveRequest(
  userId: string,
  leaveType: LeaveType,
  fromDate: Date,
  toDate: Date,
  remarks?: string,
  attachmentPath?: string,
  attachmentName?: string
): Promise<LeaveRequestDTO> {
  const days = await calculateWorkingDays(fromDate, toDate)

  await validateLeaveRequest(userId, leaveType, fromDate, toDate, days)

  const request = await prisma.leaveRequest.create({
    data: {
      userId,
      leaveType,
      fromDate,
      toDate,
      days,
      remarks,
      attachmentPath,
      attachmentName,
      status: 'PENDING',
    },
    include: {
      user: { select: { name: true, email: true } },
    },
  })

  // Notify the employee
  await sendNotification(
    'LEAVE_SUBMITTED',
    userId,
    `Your ${leaveType.replace(/_/g, ' ')} request for ${days} day(s) has been submitted and is pending approval.`
  )

  // Notify all admins/HR
  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'HR'] } },
    select: { id: true },
  })

  await Promise.all(
    admins.map((admin) =>
      sendNotification(
        'LEAVE_PENDING_ADMIN',
        admin.id,
        `New leave request from ${request.user.name} — ${leaveType.replace(/_/g, ' ')} (${days} day(s)). Pending approval.`,
        { leaveRequestId: request.id }
      )
    )
  )

  return mapToDTO(request)
}

// ─── Approve Leave ────────────────────────────────────────────────────────────

export async function approveLeave(
  leaveId: string,
  adminId: string
): Promise<LeaveRequestDTO> {
  const existing = await prisma.leaveRequest.findUniqueOrThrow({
    where: { id: leaveId },
    include: { user: { select: { name: true, email: true } } },
  })

  if (existing.status !== 'PENDING') {
    throw new Error(`Cannot approve a leave request with status: ${existing.status}`)
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: 'APPROVED',
      decidedById: adminId,
      decidedAt: new Date(),
    },
    include: { user: { select: { name: true, email: true } } },
  })

  await sendNotification(
    'LEAVE_APPROVED',
    existing.userId,
    `Your ${existing.leaveType.replace(/_/g, ' ')} request (${existing.days} day(s)) has been approved.`,
    { leaveRequestId: leaveId }
  )

  return mapToDTO(updated)
}

// ─── Reject Leave ─────────────────────────────────────────────────────────────

export async function rejectLeave(
  leaveId: string,
  adminId: string,
  rejectionReason: string
): Promise<LeaveRequestDTO> {
  if (!rejectionReason?.trim()) {
    throw new Error('A rejection reason is required.')
  }

  const existing = await prisma.leaveRequest.findUniqueOrThrow({
    where: { id: leaveId },
    include: { user: { select: { name: true, email: true } } },
  })

  if (existing.status !== 'PENDING') {
    throw new Error(`Cannot reject a leave request with status: ${existing.status}`)
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: 'REJECTED',
      decidedById: adminId,
      decidedAt: new Date(),
      rejectionReason: rejectionReason.trim(),
    },
    include: { user: { select: { name: true, email: true } } },
  })

  await sendNotification(
    'LEAVE_REJECTED',
    existing.userId,
    `Your ${existing.leaveType.replace(/_/g, ' ')} request has been rejected. Reason: ${rejectionReason}`,
    { leaveRequestId: leaveId }
  )

  return mapToDTO(updated)
}

// ─── Cancel Leave ─────────────────────────────────────────────────────────────

export async function cancelLeave(
  leaveId: string,
  userId: string
): Promise<void> {
  const existing = await prisma.leaveRequest.findUniqueOrThrow({
    where: { id: leaveId },
  })

  if (existing.userId !== userId) {
    throw new Error('You can only cancel your own leave requests.')
  }

  if (!['PENDING', 'APPROVED'].includes(existing.status)) {
    throw new Error(`Cannot cancel a leave request with status: ${existing.status}`)
  }

  await prisma.leaveRequest.delete({ where: { id: leaveId } })
  // Balance is automatically restored since it's computed (not stored)
}

// ─── Module F Contract ────────────────────────────────────────────────────────

/**
 * Returns whether a user has an approved leave on a given date.
 * Member 3 uses this to determine attendance status.
 * DO NOT allow Member 3 to query LeaveRequest directly.
 */
export async function getApprovedLeaveForDate(
  userId: string,
  date: Date
): Promise<ApprovedLeaveResult> {
  const targetDate = dayjs(date)

  const leave = await prisma.leaveRequest.findFirst({
    where: {
      userId,
      status: 'APPROVED',
      fromDate: { lte: targetDate.endOf('day').toDate() },
      toDate: { gte: targetDate.startOf('day').toDate() },
    },
  })

  if (!leave) return { isOnLeave: false }

  return {
    isOnLeave: true,
    leaveType: leave.leaveType as LeaveType,
    leaveRequestId: leave.id,
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getLeaveRequestById(
  leaveId: string,
  userId: string,
  role: string
): Promise<LeaveRequestDTO> {
  const req = await prisma.leaveRequest.findUniqueOrThrow({
    where: { id: leaveId },
    include: {
      user: { select: { name: true, email: true } },
      decidedBy: { select: { name: true } },
    },
  })

  // Employees can only see their own
  if (role === 'EMPLOYEE' && req.userId !== userId) {
    throw new Error('Forbidden')
  }

  return mapToDTO(req)
}

export async function getUserLeaveRequests(
  userId: string,
  status?: LeaveStatus
): Promise<LeaveRequestDTO[]> {
  const requests = await prisma.leaveRequest.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      decidedBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return requests.map(mapToDTO)
}

export async function getAllLeaveRequests(
  status?: LeaveStatus,
  userId?: string
): Promise<LeaveRequestDTO[]> {
  const requests = await prisma.leaveRequest.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(userId ? { userId } : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      decidedBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return requests.map(mapToDTO)
}

// ─── DTO Mapper ───────────────────────────────────────────────────────────────

function safeISOString(val: any): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') return new Date(val).toISOString();
  try {
    return new Date(val).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function mapToDTO(req: any): LeaveRequestDTO {
  const from = req.fromDate || req.startDate;
  const to = req.toDate || req.endDate;
  const requested = req.requestedAt || req.createdAt;

  return {
    id: req.id,
    userId: req.userId || req.employeeId,
    userName: req.user?.name ?? '',
    userEmail: req.user?.email ?? '',
    leaveType: req.leaveType as LeaveType,
    fromDate: safeISOString(from),
    toDate: safeISOString(to),
    days: req.days ?? 1,
    status: req.status as LeaveStatus,
    remarks: req.remarks ?? undefined,
    attachmentPath: req.attachmentPath ?? undefined,
    attachmentName: req.attachmentName ?? undefined,
    requestedAt: safeISOString(requested),
    decidedById: req.decidedById ?? undefined,
    decidedByName: req.decidedBy?.name ?? undefined,
    decidedAt: req.decidedAt ? safeISOString(req.decidedAt) : undefined,
    rejectionReason: req.rejectionReason ?? undefined,
  }
}
