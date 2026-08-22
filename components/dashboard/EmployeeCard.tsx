'use client'

import Link from 'next/link'
import { StatusBadge, StatusIndicatorCorner } from './StatusBadge'
import type { EmployeeSummary, EmployeeDailyStatus } from '@/types'
import { AttendanceStatusType } from '@prisma/client'
import { MapPin, Briefcase, Mail, Phone, ExternalLink } from 'lucide-react'
import { cn, truncate } from '@/lib/utils'

interface EmployeeCardProps {
  employee: EmployeeSummary & { todayStatus?: EmployeeDailyStatus }
  currentUserId?: string
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
        'group relative flex flex-col justify-between bg-white rounded-2xl border border-[#E5ECF2] p-5',
        'hover:border-[#0077FF]/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1',
        'cursor-pointer overflow-hidden',
        className
      )}
    >
      {/* Top Bar: Left Status Badge, Right Corner Work-Status Icon */}
      <div className="flex items-center justify-between mb-4 w-full">
        <StatusBadge status={todayStatus} isHalfDay={isHalfDay} />

        <div className="flex items-center gap-2">
          {isSelf && (
            <span className="text-[11px] font-bold text-[#0077FF] bg-[#EAF3FF] px-2 py-0.5 rounded-full border border-blue-100">
              You
            </span>
          )}
          {/* Top-Right Corner Indicator: Green dot / Airplane / Yellow dot */}
          <StatusIndicatorCorner status={todayStatus} />
        </div>
      </div>

      {/* Middle: Profile Image, Name, Designation & Department */}
      <div className="flex flex-col items-center text-center space-y-2.5 my-1">
        <div className="relative group-hover:scale-105 transition-transform duration-300">
          <img
            src={employee.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt={employee.name}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#F4F7FB] shadow-md"
          />
        </div>

        <div>
          <h3 className="font-bold text-base text-[#1A1D24] group-hover:text-[#0077FF] transition-colors leading-tight">
            {employee.name}
          </h3>
          <p className="text-xs text-[#5A687D] font-medium flex items-center justify-center gap-1 mt-1">
            <Briefcase className="w-3.5 h-3.5 text-[#8F9CAE]" />
            {truncate(employee.designation || 'Staff Member', 28)}
          </p>
        </div>

        {/* Department Badge */}
        {employee.department && (
          <span className="inline-flex items-center text-[11px] font-semibold bg-[#F4F7FB] text-[#0077FF] border border-[#E5ECF2] px-2.5 py-0.5 rounded-lg">
            {employee.department}
          </span>
        )}

        {/* Contact details */}
        <div className="w-full pt-2 space-y-1 text-left text-xs text-[#5A687D]">
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="w-3.5 h-3.5 text-[#8F9CAE] shrink-0" />
            <span className="truncate">{employee.email}</span>
          </div>
          {employee.phone && (
            <div className="flex items-center gap-1.5 truncate">
              <Phone className="w-3.5 h-3.5 text-[#8F9CAE] shrink-0" />
              <span className="truncate">{employee.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Login ID + View Profile Link */}
      <div className="mt-4 pt-3 border-t border-[#E5ECF2] flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold text-[#8F9CAE] bg-[#F4F7FB] px-2 py-0.5 rounded-md">
          {employee.loginId}
        </span>
        <span className="text-xs font-semibold text-[#0077FF] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          View Profile <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </Link>
  )
}
