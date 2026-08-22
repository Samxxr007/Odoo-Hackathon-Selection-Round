import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth/session'
import { getCompanyAttendanceSummary } from '@/lib/contracts/attendance'
import { getPendingLeaveCount, getLeaveBalance, getUserPendingLeaveCount, getOnLeaveTodayCount } from '@/lib/contracts/leave'
import { getEmployeeDailyStatus } from '@/lib/contracts/attendance'
import type { AdminDashboardSummary, EmployeeDashboardSummary } from '@/types'
import { Role } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth()
    const today = new Date()

    if (authUser.role === Role.ADMIN) {
      // Admin summary
      const [totalEmployees, attendanceSummary, pendingLeaveRequests, onLeaveToday] = await Promise.all([
        db.user.count({
          where: { companyId: authUser.companyId, isActive: true },
        }),
        getCompanyAttendanceSummary(authUser.companyId, today),
        getPendingLeaveCount(authUser.companyId),
        getOnLeaveTodayCount(authUser.companyId),
      ])

      const summary: AdminDashboardSummary = {
        totalEmployees,
        presentToday: attendanceSummary.present,
        onLeaveToday,
        absentToday: attendanceSummary.absent + attendanceSummary.unknown,
        pendingLeaveRequests,
      }

      return NextResponse.json({ success: true, data: summary, role: 'ADMIN' })
    } else {
      // Employee summary
      const [todayStatus, leaveBalance, pendingLeaveRequests] = await Promise.all([
        getEmployeeDailyStatus(authUser.id, today),
        getLeaveBalance(authUser.id),
        getUserPendingLeaveCount(authUser.id),
      ])

      const summary: EmployeeDashboardSummary = {
        todayStatus,
        leaveBalance,
        pendingLeaveRequests,
        latestNotification: null, // Notification system TBD
      }

      return NextResponse.json({ success: true, data: summary, role: 'EMPLOYEE' })
    }
  } catch (error) {
    if (error instanceof Response) return error as unknown as NextResponse
    console.error('[GET /dashboard/summary] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard summary' }, { status: 500 })
  }
}
