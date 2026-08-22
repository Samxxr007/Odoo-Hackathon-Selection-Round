/**
 * Leave Contract — Stub Implementation
 *
 * Member 4 owns this implementation.
 * Member 1 consumes these functions through this contract file.
 *
 * DO NOT query the LeaveRequest table directly from other pages.
 */

import type { LeaveBalanceSummary } from '@/types'
import { db } from '@/lib/db'

/**
 * Get the count of pending leave requests for a company.
 * Member 4 will replace this with their real implementation.
 */
export async function getPendingLeaveCount(companyId: string): Promise<number> {
  try {
    return await db.leaveRequest.count({
      where: {
        companyId,
        status: 'PENDING',
      },
    })
  } catch {
    return 0
  }
}

/**
 * Get the count of pending leave requests for a specific user.
 */
export async function getUserPendingLeaveCount(userId: string): Promise<number> {
  try {
    return await db.leaveRequest.count({
      where: {
        userId,
        status: 'PENDING',
      },
    })
  } catch {
    return 0
  }
}

/**
 * Get the leave balance for a user.
 * Stub — returns default values. Member 4 will implement real balance tracking.
 */
export async function getLeaveBalance(userId: string): Promise<LeaveBalanceSummary> {
  try {
    // Count approved leaves used this year
    const year = new Date().getFullYear()
    const startOfYear = new Date(year, 0, 1)

    const approvedLeaves = await db.leaveRequest.findMany({
      where: {
        userId,
        status: 'APPROVED',
        startDate: { gte: startOfYear },
      },
    })

    const daysUsed = approvedLeaves.reduce((acc, leave) => {
      const start = leave.startDate ? new Date(leave.startDate) : (leave.fromDate ? new Date(leave.fromDate) : new Date())
      const end = leave.endDate ? new Date(leave.endDate) : (leave.toDate ? new Date(leave.toDate) : new Date())
      const days = leave.days || Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      return acc + days
    }, 0)

    const annualEntitlement = 20

    return {
      userId,
      annual: annualEntitlement,
      sick: 10,
      unpaid: 0,
      used: daysUsed,
      remaining: Math.max(0, annualEntitlement - daysUsed),
    }
  } catch {
    return {
      userId,
      annual: 20,
      sick: 10,
      unpaid: 0,
      used: 0,
      remaining: 20,
    }
  }
}

/**
 * Get employees who are on approved leave today (for dashboard summary).
 */
export async function getOnLeaveTodayCount(companyId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  try {
    return await db.leaveRequest.count({
      where: {
        companyId,
        status: 'APPROVED',
        startDate: { lte: today },
        endDate: { gte: today },
      },
    })
  } catch {
    return 0
  }
}
