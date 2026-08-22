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
  CheckCircle2, 
  AlertCircle, 
  Plane,
  Bell,
  Sparkles,
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
    email: string
    loginId?: string
    role: string
    companyName?: string
    profilePhotoUrl?: string | null
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
  const [unreadNotifications, setUnreadNotifications] = useState(2)

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

  const handleToggleAttendance = async () => {
    setLoadingToggle(true)
    try {
      if (isCheckedIn) {
        setIsCheckedIn(false)
      } else {
        setIsCheckedIn(true)
        const now = new Date()
        setCheckInTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
      }
    } finally {
      setLoadingToggle(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch {}
    router.push('/signin')
    router.refresh()
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR'

  const navItems = [
    { label: 'Employees', href: '/dashboard', icon: Users, exact: true },
    { label: 'Attendance', href: isAdmin ? '/admin/attendance' : '/attendance', icon: Clock },
    { label: 'Time OFF', href: isAdmin ? '/leave/admin' : '/leave', icon: CalendarDays },
    { label: 'Payroll', href: isAdmin ? '/payroll/admin' : '/payroll', icon: DollarSign },
  ]

  return (
    <header className="sticky top-0 z-50 glass-header transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0077FF] via-[#0099FF] to-[#00E5FF] flex items-center justify-center text-white font-black text-xl shadow-lg glow-primary group-hover:scale-105 transition-all duration-300">
                OI
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[#1A1D24] dark:text-white text-base leading-tight tracking-tight">
                  {user?.companyName || 'Odoo India'}
                </span>
                <span className="text-[10px] font-bold text-[#0077FF] dark:text-[#38BDF8] tracking-widest uppercase flex items-center gap-1">
                  HRMS Enterprise <Sparkles className="w-2.5 h-2.5" />
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5 ml-2">
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
                      'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                      isActive
                        ? 'bg-[#0077FF]/10 text-[#0077FF] dark:bg-[#38BDF8]/15 dark:text-[#38BDF8] shadow-xs'
                        : 'text-[#5A687D] dark:text-slate-400 hover:text-[#1A1D24] dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right: Live Systray Check In/Out + Theme Toggle + Notifications + Profile Avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Live Attendance Systray Widget */}
            <div className="hidden lg:flex items-center gap-3 bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 px-3.5 py-1.5 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  {isCheckedIn ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E]"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EAB308]"></span>
                  )}
                </span>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-[#1A1D24] dark:text-slate-200 leading-none">
                    {isCheckedIn ? 'Present in Office' : 'Not Checked In'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {isCheckedIn ? `Since ${checkInTime} (${elapsedTime})` : currentTime || '00:00:00'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleToggleAttendance}
                disabled={loadingToggle}
                className={cn(
                  'text-xs font-bold px-3 py-1.5 rounded-xl transition-all duration-200 shadow-xs cursor-pointer active:scale-95',
                  isCheckedIn
                    ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300'
                    : 'bg-gradient-to-r from-[#0077FF] to-[#00B7FE] text-white hover:opacity-90 glow-primary'
                )}
              >
                {isCheckedIn ? 'Check Out ->' : 'Check IN ->'}
              </button>
            </div>

            {/* Theme Toggle (Sun / Moon) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer shadow-xs active:scale-95"
              title={resolvedTheme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
              aria-label="Toggle Theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 rotate-0 hover:-rotate-12" />
              )}
            </button>

            {/* Notification Center Popover */}
            <NotificationDropdown userRole={user?.role} />

            {/* User Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={user?.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={user?.name || 'User'}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#0077FF]/30"
                  />
                  <span
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900',
                      isCheckedIn ? 'bg-[#22C55E]' : 'bg-[#EAB308]'
                    )}
                  />
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#1A1D24] dark:text-slate-100 leading-tight">
                    {user?.name || 'Alexander Wright'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {user?.loginId || 'OIADWR20200001'}
                  </span>
                </div>

                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-scaleIn">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {user?.name || 'Alexander Wright'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0077FF]/10 text-[#0077FF] dark:bg-[#38BDF8]/20 dark:text-[#38BDF8] uppercase">
                        {user?.role || 'ADMIN'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {user?.loginId || 'OIADWR20200001'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#0077FF] dark:text-[#38BDF8]" />
                      My Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin/attendance"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Admin Attendance Portal
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        href="/leave/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Time Off Approvals
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <nav className="flex md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-1 overflow-x-auto justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 text-[11px] font-semibold transition-colors',
                isActive ? 'text-[#0077FF] dark:text-[#38BDF8]' : 'text-slate-400'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
