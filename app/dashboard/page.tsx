import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { EmployeeDirectoryView } from '@/components/dashboard/EmployeeDirectoryView'
import { AttendanceStatusType } from '@prisma/client'
import type { EmployeeDailyStatus } from '@/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let user
  try {
    user = await requireAuth()
  } catch {
    redirect('/signin')
  }

  // 1. Fetch all active employees from the database
  const employees = await db.user.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      loginId: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      companyId: true,
      department: true,
      designation: true,
      joiningDate: true,
      location: true,
      managerId: true,
      profilePhotoUrl: true,
      avatarUrl: true,
      isActive: true,
      mustChangePassword: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      manager: { select: { id: true, name: true } },
    },
  })

  // 2. Fetch today's attendance records
  const todayStr = '2026-08-22'
  const todayDate = new Date('2026-08-22T00:00:00.000Z')

  const todayAttendances = await db.attendance.findMany({
    where: {
      OR: [
        { date: todayDate },
        { businessDate: todayStr },
      ],
    },
  })

  const attendanceMap = new Map(todayAttendances.map((a) => [a.userId, a]))

  // 3. Fetch active leaves for today
  const activeLeaves = await db.leaveRequest.findMany({
    where: {
      status: 'APPROVED',
      OR: [
        { startDate: { lte: todayDate }, endDate: { gte: todayDate } },
        { fromDate: { lte: todayDate }, toDate: { gte: todayDate } },
      ],
    },
  })
  const leaveUserIds = new Set(activeLeaves.map((l) => l.userId))

  // 4. Map employees with their live status
  let presentCount = 0
  let onLeaveCount = 0
  let absentCount = 0

  const employeesWithStatus = employees.map((emp) => {
    const att = attendanceMap.get(emp.id)
    const isOnLeave = leaveUserIds.has(emp.id)

    let status: AttendanceStatusType = AttendanceStatusType.ABSENT
    let isHalfDay = false
    let checkInTime = null
    let checkOutTime = null

    if (isOnLeave) {
      status = AttendanceStatusType.ON_LEAVE
      onLeaveCount++
    } else if (att) {
      if (att.status === AttendanceStatusType.HALF_DAY) {
        status = AttendanceStatusType.HALF_DAY
        isHalfDay = true
        presentCount++
      } else {
        status = AttendanceStatusType.PRESENT
        presentCount++
      }
      checkInTime = att.checkIn ? att.checkIn.toISOString() : null
      checkOutTime = att.checkOut ? att.checkOut.toISOString() : null
    } else {
      status = AttendanceStatusType.ABSENT
      absentCount++
    }

    const todayStatus: EmployeeDailyStatus = {
      userId: emp.id,
      date: todayStr,
      status,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      isHalfDay,
    }

    return {
      id: emp.id,
      loginId: emp.loginId,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
      companyId: emp.companyId,
      department: emp.department,
      designation: emp.designation,
      joiningDate: emp.joiningDate,
      location: emp.location,
      managerId: emp.managerId,
      managerName: emp.manager?.name ?? null,
      profilePhotoUrl: emp.profilePhotoUrl || emp.avatarUrl,
      isActive: emp.isActive,
      todayStatus,
    }
  })

  const stats = {
    total: employees.length,
    present: presentCount,
    onLeave: onLeaveCount,
    absent: absentCount,
  }

  return (
    <EmployeeDirectoryView
      currentUser={user}
      initialEmployees={employeesWithStatus}
      stats={stats}
    />
  )
}
