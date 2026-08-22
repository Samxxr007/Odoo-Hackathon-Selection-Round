import { cn } from '@/lib/utils'
import { AttendanceStatusType } from '@prisma/client'
import { Plane, Clock, CircleHelp } from 'lucide-react'

interface StatusBadgeProps {
  status: AttendanceStatusType
  isHalfDay?: boolean
  size?: 'sm' | 'md'
}

const statusConfig: Record<
  AttendanceStatusType,
  { label: string; bg: string; text: string; dot: string; icon: string }
> = {
  PRESENT: {
    label: 'Present',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]',
    icon: '🟢',
  },
  ABSENT: {
    label: 'Absent',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-400',
    icon: '🟡',
  },
  HALF_DAY: {
    label: 'Half Day',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-400',
    icon: '🌓',
  },
  ON_LEAVE: {
    label: 'On Leave',
    bg: 'bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60',
    text: 'text-sky-700 dark:text-sky-400',
    dot: 'bg-sky-500',
    icon: '✈️',
  },
  UNKNOWN: {
    label: 'Absent',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-400',
    icon: '🟡',
  },
}

export function StatusBadge({ status, isHalfDay, size = 'sm' }: StatusBadgeProps) {
  const effectiveStatus = isHalfDay ? AttendanceStatusType.HALF_DAY : status
  const config = statusConfig[effectiveStatus] || statusConfig.UNKNOWN

  const isLeave = effectiveStatus === AttendanceStatusType.ON_LEAVE
  const isHalf = isHalfDay || effectiveStatus === AttendanceStatusType.HALF_DAY

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold shadow-2xs transition-colors duration-200',
        config.bg,
        config.text,
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {isLeave ? (
        <Plane className="h-3 w-3 text-sky-500 animate-pulse" />
      ) : isHalf ? (
        <Clock className="h-3 w-3 text-blue-500" />
      ) : effectiveStatus === AttendanceStatusType.PRESENT ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      ) : (
        <span className={cn('h-2 w-2 rounded-full', config.dot)} />
      )}
      {config.label}
    </span>
  )
}

export function StatusIndicatorCorner({ status }: { status: AttendanceStatusType }) {
  if (status === AttendanceStatusType.ON_LEAVE) {
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/60 border border-sky-300 dark:border-sky-700 text-sky-600 dark:text-sky-300 shadow-xs" title="On Leave">
        <Plane className="w-3.5 h-3.5 transform -rotate-45" />
      </div>
    )
  }

  if (status === AttendanceStatusType.PRESENT) {
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800" title="Present in office">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-sm"></span>
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800" title="Absent">
      <span className="h-3 w-3 rounded-full bg-amber-400 shadow-sm" />
    </div>
  )
}

export function StatusDot({ status }: { status: AttendanceStatusType }) {
  const config = statusConfig[status] || statusConfig.UNKNOWN
  return (
    <span
      title={config.label}
      className={cn(
        'inline-block h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-900',
        config.dot
      )}
    />
  )
}
