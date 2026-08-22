import { cn } from '@/lib/utils'
import type { EmployeeDailyStatus } from '@/types'
import { AttendanceStatusType } from '@prisma/client'
import { Plane, Clock, CircleHelp } from 'lucide-react'

interface StatusBadgeProps {
  status: AttendanceStatusType
  isHalfDay?: boolean
  size?: 'sm' | 'md'
}

const statusConfig: Record<
  AttendanceStatusType,
  { label: string; bg: string; text: string; dot: string }
> = {
  PRESENT: {
    label: 'Present',
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  ABSENT: {
    label: 'Absent',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  HALF_DAY: {
    label: 'Half Day',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    dot: 'bg-sky-400',
  },
  ON_LEAVE: {
    label: 'On Leave',
    bg: 'bg-[#EAF3FF]',
    text: 'text-[#0077FF]',
    dot: 'bg-[#00B7FE]',
  },
  UNKNOWN: {
    label: 'Not Marked',
    bg: 'bg-[#F4F7FB]',
    text: 'text-[#8F9CAE]',
    dot: 'bg-[#8F9CAE]',
  },
}

export function StatusBadge({ status, isHalfDay, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[isHalfDay ? AttendanceStatusType.HALF_DAY : status]

  const isLeave = status === AttendanceStatusType.ON_LEAVE
  const isHalf = isHalfDay || status === AttendanceStatusType.HALF_DAY

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bg,
        config.text,
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {isLeave ? (
        <Plane className="h-3 w-3" />
      ) : isHalf ? (
        <Clock className="h-3 w-3" />
      ) : status === AttendanceStatusType.UNKNOWN ? (
        <CircleHelp className="h-3 w-3" />
      ) : (
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      )}
      {config.label}
    </span>
  )
}

export function StatusDot({ status }: { status: AttendanceStatusType }) {
  const config = statusConfig[status]
  return (
    <span
      title={config.label}
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white',
        config.dot
      )}
    />
  )
}
