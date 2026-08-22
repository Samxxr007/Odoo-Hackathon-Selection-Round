'use client'

import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge, StatusDot } from './StatusBadge'
import type { EmployeeSummary, EmployeeDailyStatus } from '@/types'
import { AttendanceStatusType } from '@prisma/client'
import { MapPin, Briefcase } from 'lucide-react'
import { cn, truncate } from '@/lib/utils'

interface EmployeeCardProps {
  employee: EmployeeSummary & { todayStatus?: EmployeeDailyStatus }
  currentUserId: string
  className?: string
}

export function EmployeeCard({ employee, currentUserId, className }: EmployeeCardProps) {
  const isSelf = employee.id === currentUserId
  const todayStatus = employee.todayStatus?.status ?? AttendanceStatusType.UNKNOWN
  const isHalfDay = employee.todayStatus?.isHalfDay ?? false

  return (
    <Link
      href={`/dashboard/employees/${employee.id}`}
      className={cn(
        'block bg-white rounded-xl border border-[#E5ECF2] p-5',
        'hover:border-[#0077FF]/30 hover:shadow-md transition-all duration-200',
        'group cursor-pointer',
        className
      )}
    >
      {/* Status indicator + active dot */}
      <div className="flex items-center justify-between mb-4">
        <StatusBadge status={todayStatus} isHalfDay={isHalfDay} />
        <div className="flex items-center gap-2">
          {isSelf && (
            <span className="text-xs text-[#0077FF] font-medium bg-[#EAF3FF] px-2 py-0.5 rounded-full">
              You
            </span>
          )}
          <div className="relative">
            <StatusDot status={employee.isActive ? todayStatus : AttendanceStatusType.UNKNOWN} />
          </div>
        </div>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <Avatar
            src={employee.profilePhotoUrl}
            name={employee.name}
            size="xl"
          />
          {!employee.isActive && (
            <div className="absolute inset-0 rounded-full bg-white/60 flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#8F9CAE]">Inactive</span>
            </div>
          )}
        </div>

        <div>
          <h3
            className={cn(
              'font-semibold text-[#1A1D24] group-hover:text-[#0077FF] transition-colors',
              !employee.isActive && 'opacity-60'
            )}
          >
            {employee.name}
          </h3>
          {employee.designation && (
            <p className="text-xs text-[#8F9CAE] flex items-center justify-center gap-1 mt-0.5">
              <Briefcase className="h-3 w-3" />
              {truncate(employee.designation, 30)}
            </p>
          )}
        </div>

        {/* Department pill */}
        {employee.department && (
          <Badge variant="default" className="max-w-full">
            {truncate(employee.department, 24)}
          </Badge>
        )}

        {/* Location */}
        {employee.location && (
          <p className="text-xs text-[#8F9CAE] flex items-center gap-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {employee.location}
          </p>
        )}
      </div>

      {/* Login ID */}
      <div className="mt-3 pt-3 border-t border-[#E5ECF2]">
        <p className="text-[10px] font-mono text-center text-[#8F9CAE]">{employee.loginId}</p>
      </div>
    </Link>
  )
}
