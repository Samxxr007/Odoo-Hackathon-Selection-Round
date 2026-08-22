import { Users, UserCheck, Plane, UserX, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { AdminDashboardSummary, EmployeeDashboardSummary } from '@/types'
import { StatusBadge } from './StatusBadge'

// ─────────────────────────────────────────────
// Admin summary cards
// ─────────────────────────────────────────────

interface AdminSummaryCardsProps {
  summary: AdminDashboardSummary
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  color: string
  bg: string
}

function StatCard({ label, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
        <Icon className={cn('h-6 w-6', color)} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1A1D24]">{value.toLocaleString()}</p>
        <p className="text-sm text-[#8F9CAE]">{label}</p>
      </div>
    </Card>
  )
}

export function AdminSummaryCards({ summary }: AdminSummaryCardsProps) {
  const cards: StatCardProps[] = [
    {
      label: 'Total Employees',
      value: summary.totalEmployees,
      icon: Users,
      color: 'text-[#0077FF]',
      bg: 'bg-[#EAF3FF]',
    },
    {
      label: 'Present Today',
      value: summary.presentToday,
      icon: UserCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'On Leave Today',
      value: summary.onLeaveToday,
      icon: Plane,
      color: 'text-[#00B7FE]',
      bg: 'bg-sky-50',
    },
    {
      label: 'Absent Today',
      value: summary.absentToday,
      icon: UserX,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Pending Leave Requests',
      value: summary.pendingLeaveRequests,
      icon: Clock,
      color: 'text-[#F9911E]',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Employee summary cards
// ─────────────────────────────────────────────

interface EmployeeSummaryCardsProps {
  summary: EmployeeDashboardSummary
}

export function EmployeeSummaryCards({ summary }: EmployeeSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Today status */}
      <Card>
        <p className="text-xs text-[#8F9CAE] font-medium uppercase tracking-wide mb-2">Today</p>
        <StatusBadge
          status={summary.todayStatus.status}
          isHalfDay={summary.todayStatus.isHalfDay}
          size="md"
        />
        {summary.todayStatus.checkIn && (
          <p className="text-xs text-[#8F9CAE] mt-2">
            In: {new Date(summary.todayStatus.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </Card>

      {/* Leave balance */}
      <Card>
        <p className="text-xs text-[#8F9CAE] font-medium uppercase tracking-wide mb-2">Leave Balance</p>
        <div className="flex items-end gap-1">
          <p className="text-2xl font-bold text-[#1A1D24]">{summary.leaveBalance.remaining}</p>
          <p className="text-sm text-[#8F9CAE] mb-0.5">/ {summary.leaveBalance.annual}</p>
        </div>
        <p className="text-xs text-[#8F9CAE] mt-1">days remaining</p>
      </Card>

      {/* Pending requests */}
      <Card>
        <p className="text-xs text-[#8F9CAE] font-medium uppercase tracking-wide mb-2">Pending Requests</p>
        <p className="text-2xl font-bold text-[#1A1D24]">{summary.pendingLeaveRequests}</p>
        <p className="text-xs text-[#8F9CAE] mt-1">leave requests</p>
      </Card>

      {/* Latest notification */}
      <Card>
        <p className="text-xs text-[#8F9CAE] font-medium uppercase tracking-wide mb-2">Notification</p>
        {summary.latestNotification ? (
          <div>
            <p className="text-sm font-medium text-[#1A1D24] line-clamp-2">
              {summary.latestNotification.title}
            </p>
            <p className="text-xs text-[#8F9CAE] mt-1 line-clamp-1">
              {summary.latestNotification.message}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[#8F9CAE]">No new notifications</p>
        )}
      </Card>
    </div>
  )
}
