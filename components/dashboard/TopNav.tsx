'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Users, Clock, CalendarDays, LayoutDashboard } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import type { AuthUser } from '@/types'

interface TopNavProps {
  user: AuthUser
}

const mobileNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Employees', href: '/dashboard/employees', icon: Users },
  { label: 'Attendance', href: '/dashboard/attendance', icon: Clock },
  { label: 'Time Off', href: '/dashboard/time-off', icon: CalendarDays },
]

export function TopNav({ user }: TopNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { success, error: toastError } = useToast()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      success('Signed out successfully')
      router.push('/signin')
      router.refresh()
    } catch {
      toastError('Failed to sign out')
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5ECF2]">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile: brand */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="h-8 w-8 rounded-lg bg-[#0077FF] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-bold text-sm text-[#1A1D24]">{user.companyName}</span>
        </div>

        {/* Desktop: page context */}
        <div className="hidden lg:block" />

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Admin badge */}
          {user.role === 'ADMIN' && (
            <span className="hidden sm:inline-flex items-center text-xs font-medium bg-[#EAF3FF] text-[#0077FF] px-2.5 py-1 rounded-full">
              Admin
            </span>
          )}

          <Link
            href={`/dashboard/employees/${user.id}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar src={user.profilePhotoUrl} name={user.name} size="sm" />
            <span className="hidden sm:block text-sm font-medium text-[#1A1D24]">
              {user.name.split(' ')[0]}
            </span>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="text-[#8F9CAE] hover:text-red-500 px-2"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile nav tabs */}
      <nav className="flex lg:hidden border-t border-[#E5ECF2] overflow-x-auto">
        {mobileNavItems.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium transition-colors min-w-max',
                active ? 'text-[#0077FF] border-b-2 border-[#0077FF]' : 'text-[#8F9CAE]'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
