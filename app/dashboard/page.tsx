import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/session'
import { getCompanyAttendanceSummary } from '@/lib/contracts/attendance'
import { getPendingLeaveCount, getLeaveBalance, getUserPendingLeaveCount, getOnLeaveTodayCount } from '@/lib/contracts/leave'
import { getEmployeeDailyStatus } from '@/lib/contracts/attendance'
import { db } from '@/lib/db'
import { Role } from '@prisma/client'
import { AdminSummaryCards, EmployeeSummaryCards } from '@/components/dashboard/SummaryCards'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { Suspense } from 'react'
import type { AdminDashboardSummary, EmployeeDashboardSummary } from '@/types'

async function AdminSummary({ companyId }: { companyId: string }) {
  const today = new Date()
  const [totalEmployees, attendanceSummary, pendingLeaveRequests, onLeaveToday] = await Promise.all([
    db.user.count({ where: { companyId, isActive: true } }),
    getCompanyAttendanceSummary(companyId, today),
    getPendingLeaveCount(companyId),
    getOnLeaveTodayCount(companyId),
  ])

  const summary: AdminDashboardSummary = {
    totalEmployees,
    presentToday: attendanceSummary.present,
    onLeaveToday,
    absentToday: attendanceSummary.absent + attendanceSummary.unknown,
    pendingLeaveRequests,
  }

  return <AdminSummaryCards summary={summary} />
}

async function EmployeeSummary({ userId }: { userId: string }) {
  const today = new Date()
  const [todayStatus, leaveBalance, pendingLeaveRequests] = await Promise.all([
    getEmployeeDailyStatus(userId, today),
    getLeaveBalance(userId),
    getUserPendingLeaveCount(userId),
  ])

  const summary: EmployeeDashboardSummary = {
    todayStatus,
    leaveBalance,
    pendingLeaveRequests,
    latestNotification: null,
  }

  return <EmployeeSummaryCards summary={summary} />
}

function RecentEmployeesSection({ companyId, currentUserId }: { companyId: string; currentUserId: string }) {
  return null // Rendered in the employees page — linked from here
}

export default async function DashboardPage() {
  let user
  try {
    user = await requireAuth()
  } catch {
    redirect('/signin')
  }

  const isAdmin = user.role === Role.ADMIN

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1D24]">
          Good {getGreeting()},{' '}
          <span className="text-[#0077FF]">{user.name.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-[#8F9CAE] text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Summary cards */}
      <Suspense
        fallback={
          <div className={`grid gap-4 ${isAdmin ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-4'}`}>
            {Array.from({ length: isAdmin ? 5 : 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        }
      >
        {isAdmin ? (
          <AdminSummary companyId={user.companyId} />
        ) : (
          <EmployeeSummary userId={user.id} />
        )}
      </Suspense>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'View All Employees',
            href: '/dashboard/employees',
            desc: 'Browse your team directory',
            color: 'bg-[#EAF3FF]',
            text: 'text-[#0077FF]',
          },
          {
            label: 'Attendance',
            href: '/dashboard/attendance',
            desc: 'Track check-ins and check-outs',
            color: 'bg-sky-50',
            text: 'text-sky-700',
          },
          {
            label: 'Time Off',
            href: '/dashboard/time-off',
            desc: 'Manage leave requests',
            color: 'bg-orange-50',
            text: 'text-[#F9911E]',
          },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl border border-[#E5ECF2] p-5 hover:shadow-md transition-shadow group"
          >
            <p className={`font-semibold group-hover:underline ${item.text}`}>{item.label}</p>
            <p className="text-sm text-[#8F9CAE] mt-1">{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
