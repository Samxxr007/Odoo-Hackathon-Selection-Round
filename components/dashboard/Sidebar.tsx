'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Clock, CalendarDays, LayoutDashboard, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import type { AuthUser } from '@/types'

interface SidebarProps {
  user: AuthUser
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Employees', href: '/dashboard/employees', icon: Users },
  { label: 'Attendance', href: '/dashboard/attendance', icon: Clock },
  { label: 'Time Off', href: '/dashboard/time-off', icon: CalendarDays },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[#F4F7FB] border-r border-[#E5ECF2]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-[#E5ECF2]">
        <div className="h-8 w-8 rounded-lg bg-[#0077FF] flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-[#1A1D24] truncate">{user.companyName}</p>
          <p className="text-[10px] text-[#8F9CAE]">HRMS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-[#EAF3FF] text-[#0077FF]'
                  : 'text-[#8F9CAE] hover:bg-white hover:text-[#1A1D24]'
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-[#0077FF]' : '')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User profile footer */}
      <div className="px-3 pb-4">
        <Link
          href={`/dashboard/employees/${user.id}`}
          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white transition-colors group"
        >
          <Avatar src={user.profilePhotoUrl} name={user.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1A1D24] truncate group-hover:text-[#0077FF]">
              {user.name}
            </p>
            <p className="text-[10px] text-[#8F9CAE] truncate capitalize">
              {user.role.toLowerCase()}
              {user.department ? ` · ${user.department}` : ''}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
