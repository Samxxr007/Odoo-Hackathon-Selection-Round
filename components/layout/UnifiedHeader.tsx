'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Users, 
  Clock, 
  CalendarDays, 
  DollarSign, 
  LogOut, 
  User as UserIcon, 
  Shield, 
  ChevronDown, 
  Sun,
  Moon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme/ThemeProvider'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'

interface UnifiedHeaderProps {
  initialUser?: {
    id: string
    name: string
    loginId: string
    role: string
    profilePhotoUrl?: string | null
    companyName?: string | null
  } | null
}

export function UnifiedHeader({ initialUser }: UnifiedHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, toggleTheme } = useTheme()
  const [user, setUser] = useState(initialUser || null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Live Attendance State
  const [isCheckedIn, setIsCheckedIn] = useState(true)
  const [checkInTime, setCheckInTime] = useState<string>('09:02 AM')
  const [elapsedTime, setElapsedTime] = useState<string>('05h 38m')
  const [currentTime, setCurrentTime] = useState<string>('')
  const [loadingToggle, setLoadingToggle] = useState(false)

  // Sync initialUser or fetch session
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser)
    } else {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setUser(data.data)
          }
        })
        .catch(() => {})
    }
  }, [initialUser])

  // Live Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch today's attendance status
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch('/api/attendance/me/today')
        if (res.ok) {
          const data = await res.json()
          if (data.record) {
            const hasCheckIn = !!data.record.checkIn
            const hasCheckOut = !!data.record.checkOut
            setIsCheckedIn(hasCheckIn && !hasCheckOut)

            if (hasCheckIn) {
              const d = new Date(data.record.checkIn)
              setCheckInTime(
                d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
              )
              const diffMinutes = Math.floor((Date.now() - d.getTime()) / (1000 * 60))
              const h = Math.floor(diffMinutes / 60)
              const m = diffMinutes % 60
              setElapsedTime(`${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`)
            }
          } else {
            setIsCheckedIn(false)
          }
        }
      } catch (err) {
        console.error('Failed to fetch header attendance', err)
      }
    }
    fetchAttendance()
  }, [])

  const handleToggleAttendance = async () => {
    try {
      setLoadingToggle(true)
      const res = await fetch('/api/attendance/toggle', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setIsCheckedIn(data.isCheckedIn)
        if (data.record?.checkIn) {
          const d = new Date(data.record.checkIn)
          setCheckInTime(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
        }
      }
    } catch (e) {
      console.error('Failed to toggle attendance', e)
    } finally {
      setLoadingToggle(false)
    }
  }

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/signin')
    router.refresh()
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR'

  const navItems = [
    { label: 'Employees', href: '/dashboard', icon: Users, exact: true },
    { label: 'Attendance', href: isAdmin ? '/admin/attendance' : '/attendance', icon: Clock },
    { label: 'Time Off', href: isAdmin ? '/leave/admin' : '/leave', icon: CalendarDays },
    { label: 'Payroll', href: isAdmin ? '/payroll/admin' : '/payroll', icon: DollarSign },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0077FF] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                OI
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white text-sm leading-tight tracking-tight">
                  {user?.companyName || 'Odoo India'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Human Resources
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href || pathname === '/dashboard/employees'
                  : pathname.startsWith(item.href.split('?')[0])
                
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right: Attendance Status + Theme Toggle + Notifications + User Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Attendance Status Pill */}
            <div className="hidden lg:flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  isCheckedIn ? 'bg-emerald-500' : 'bg-amber-500'
                )} />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {isCheckedIn ? `In since ${checkInTime}` : 'Not Checked In'}
                </span>
              </div>

              <button
                onClick={handleToggleAttendance}
                disabled={loadingToggle}
                className={cn(
                  'text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer',
                  isCheckedIn
                    ? 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-rose-600 dark:text-rose-400 hover:bg-rose-50'
                    : 'bg-[#0077FF] text-white hover:bg-[#0060CC]'
                )}
              >
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </button>
            </div>

            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Notification Center Popover */}
            <NotificationDropdown userRole={user?.role} />

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <img
                  src={user?.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {user?.name || 'Alexander Wright'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {user?.loginId || 'OIADWR20200001'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-scaleIn">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user?.name || 'Alexander Wright'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {user?.loginId} · {user?.role}
                    </p>
                  </div>

                  <div className="py-1 text-xs">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      My Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin/attendance"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Attendance Admin
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        href="/leave/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                      >
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        Time Off Admin
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
