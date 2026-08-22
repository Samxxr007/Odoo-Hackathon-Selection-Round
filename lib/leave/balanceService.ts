import { prisma } from '@/lib/prisma'
import type { LeaveType } from '@/types/leave'
import type { LeaveBalanceDTO } from '@/types/leave'

/** Default allocations per leave type per year (in days). */
export const DEFAULT_ALLOCATIONS: Record<Exclude<LeaveType, 'UNPAID_LEAVE'>, number> = {
  PAID_TIME_OFF: 18,
  SICK_LEAVE: 12,
}

/**
 * Ensures a LeaveAllocation row exists for the given user/type/year.
 * Creates one with default values if missing.
 */
export async function ensureAllocation(
  userId: string,
  leaveType: LeaveType,
  year: number
): Promise<void> {
  if (leaveType === 'UNPAID_LEAVE') return // no allocation needed

  const existing = await prisma.leaveAllocation.findUnique({
    where: { userId_leaveType_year: { userId, leaveType, year } },
  })

  if (!existing) {
    await prisma.leaveAllocation.create({
      data: {
        userId,
        leaveType,
        year,
        totalDays: DEFAULT_ALLOCATIONS[leaveType as keyof typeof DEFAULT_ALLOCATIONS] ?? 0,
      },
    })
  }
}

/**
 * Returns the balance for a specific leave type in a given year.
 * Available = Allocated - Approved/Consumed (PENDING not counted as consumed).
 */
export async function getLeaveBalance(
  userId: string,
  leaveType: LeaveType,
  year: number
): Promise<LeaveBalanceDTO> {
  if (leaveType === 'UNPAID_LEAVE') {
    return {
      leaveType,
      allocated: 0,
      consumed: 0,
      pending: 0,
      available: Infinity,
      year,
    }
  }

  await ensureAllocation(userId, leaveType, year)

  const allocation = await prisma.leaveAllocation.findUnique({
    where: { userId_leaveType_year: { userId, leaveType, year } },
  })

  const consumed = await prisma.leaveRequest.aggregate({
    where: {
      userId,
      leaveType,
      status: 'APPROVED',
      fromDate: { gte: new Date(`${year}-01-01`) },
      toDate: { lte: new Date(`${year}-12-31`) },
    },
    _sum: { days: true },
  })

  const pending = await prisma.leaveRequest.aggregate({
    where: {
      userId,
      leaveType,
      status: 'PENDING',
      fromDate: { gte: new Date(`${year}-01-01`) },
      toDate: { lte: new Date(`${year}-12-31`) },
    },
    _sum: { days: true },
  })

  const allocated = allocation?.totalDays ?? 0
  const consumedDays = consumed._sum.days ?? 0
  const pendingDays = pending._sum.days ?? 0
  const available = Math.max(0, allocated - consumedDays)

  return {
    leaveType,
    allocated,
    consumed: consumedDays,
    pending: pendingDays,
    available,
    year,
  }
}

/**
 * Returns balances for all leave types for a given user and year.
 */
export async function getAllLeaveBalances(
  userId: string,
  year: number
): Promise<LeaveBalanceDTO[]> {
  const types: LeaveType[] = ['PAID_TIME_OFF', 'SICK_LEAVE', 'UNPAID_LEAVE']
  return Promise.all(types.map((lt) => getLeaveBalance(userId, lt, year)))
}

/**
 * Validates that the user has sufficient balance for the requested days.
 * Throws an error if balance is insufficient.
 */
export async function validateBalance(
  userId: string,
  leaveType: LeaveType,
  year: number,
  requestedDays: number
): Promise<void> {
  if (leaveType === 'UNPAID_LEAVE') return // always allowed

  const balance = await getLeaveBalance(userId, leaveType, year)
  if (balance.available < requestedDays) {
    throw new Error(
      `Insufficient leave balance. Available: ${balance.available} days, Requested: ${requestedDays} days.`
    )
  }
}
