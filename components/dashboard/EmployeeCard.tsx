'use client'

import Link from 'next/link'
import { StatusBadge, StatusIndicatorCorner } from './StatusBadge'
import type { EmployeeSummary, EmployeeDailyStatus } from '@/types'
import { AttendanceStatusType } from '@prisma/client'
import { MapPin, Briefcase, Mail, Phone, ExternalLink, Sparkles } from 'lucide-react'
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
        'group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6',
        'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md',
        'border border-slate-200/80 dark:border-slate-800 shadow-xs',
        'hover:border-[#0077FF]/50 dark:hover:border-[#38BDF8]/50 hover:shadow-2xl hover:-translate-y-1.5',
        'transition-all duration-300 cursor-pointer overflow-hidden',
        className
      )}
    >
      {/* Ambient background glow on hover */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#0077FF]/10 dark:bg-[#38BDF8]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

      {/* Top Bar: Left Status Badge, Right Corner Work-Status Icon */}
      <div className="flex items-center justify-between mb-4 w-full relative z-10">
        <StatusBadge status={todayStatus} isHalfDay={isHalfDay} />

        <div className="flex items-center gap-2">
          {isSelf && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0077FF] dark:text-[#38BDF8] bg-[#0077FF]/10 dark:bg-[#38BDF8]/15 px-2 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-800/50">
              You
            </span>
          )}
          {/* Top-Right Corner Indicator: Green dot / Airplane / Yellow dot */}
          <StatusIndicatorCorner status={todayStatus} />
        </div>
      </div>

      {/* Middle: Profile Image, Name, Designation & Department */}
      <div className="flex flex-col items-center text-center space-y-3 my-1 relative z-10">
        <div className="relative group-hover:scale-105 transition-transform duration-300">
          <div className="absolute -inset-1 bg-gradient-to-tr from-[#0077FF] to-[#00B7FE] rounded-2xl blur-xs opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
          <img
            src={employee.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt={employee.name}
            className="relative w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-md"
          />
        </div>

        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#0077FF] dark:group-hover:text-[#38BDF8] transition-colors leading-tight">
            {employee.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1 mt-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            {truncate(employee.designation || 'Staff Member', 28)}
          </p>
        </div>

        {/* Department Badge */}
        {employee.department && (
          <span className="inline-flex items-center text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 px-3 py-1 rounded-xl">
            {employee.department}
          </span>
        )}

        {/* Contact details */}
        <div className="w-full pt-2 space-y-1.5 text-left text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate">{employee.email}</span>
          </div>
          {employee.phone && (
            <div className="flex items-center gap-2 truncate">
              <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate">{employee.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Login ID + View Profile Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between relative z-10">
        <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
          {employee.loginId}
        </span>
        <span className="text-xs font-semibold text-[#0077FF] dark:text-[#38BDF8] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          View Profile <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </Link>
  )
}
