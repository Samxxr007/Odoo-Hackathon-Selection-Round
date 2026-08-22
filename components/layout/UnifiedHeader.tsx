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
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5ECF2] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0077FF] to-[#00B7FE] flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                OI
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[#1A1D24] text-base leading-tight tracking-tight">
                  {user?.companyName || 'Odoo India'}
                </span>
                <span className="text-[11px] font-semibold text-[#0077FF] tracking-wider uppercase">
                  HRMS Enterprise
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
                      'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all',
                      isActive
                        ? 'bg-[#EAF3FF] text-[#0077FF] shadow-xs'
                        : 'text-[#5A687D] hover:text-[#1A1D24] hover:bg-[#F4F7FB]'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right: Live Systray Check In/Out + Notifications + Profile Avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Attendance Systray Widget */}
            <div className="hidden lg:flex items-center gap-3 bg-[#F4F7FB] border border-[#E5ECF2] px-3.5 py-1.5 rounded-2xl">
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
                  <span className="text-[11px] font-bold text-[#1A1D24] leading-none">
                    {isCheckedIn ? 'Present in Office' : 'Not Checked In'}
                  </span>
                  <span className="text-[10px] text-[#8F9CAE] font-medium mt-0.5">
                    {isCheckedIn ? `Since ${checkInTime} (${elapsedTime})` : currentTime || '00:00:00'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleToggleAttendance}
                disabled={loadingToggle}
                className={cn(
                  'text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer',
                  isCheckedIn
                    ? 'bg-white border border-[#E5ECF2] text-red-600 hover:bg-red-50 hover:border-red-200'
                    : 'bg-[#0077FF] text-white hover:bg-[#0060CC]'
                )}
              >
                {isCheckedIn ? 'Check Out ->' : 'Check IN ->'}
              </button>
            </div>

            {/* Notification Bell */}
            <Link
              href="/leave/admin"
              className="relative p-2 text-[#5A687D] hover:text-[#1A1D24] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            {/* User Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl hover:bg-[#F4F7FB] border border-transparent hover:border-[#E5ECF2] transition-all cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={user?.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={user?.name || 'User'}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#EAF3FF]"
                  />
                  <span
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                      isCheckedIn ? 'bg-[#22C55E]' : 'bg-[#EAB308]'
                    )}
                  />
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#1A1D24] leading-tight flex items-center gap-1">
                    {user?.name || 'Alexander Wright'}
                  </span>
                  <span className="text-[10px] text-[#8F9CAE] font-medium">
                    {user?.loginId || 'OIADWR20200001'}
                  </span>
                </div>

                <ChevronDown className="w-4 h-4 text-[#8F9CAE] hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E5ECF2] py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-[#E5ECF2]">
                    <p className="text-xs font-semibold text-[#8F9CAE]">Signed in as</p>
                    <p className="text-sm font-bold text-[#1A1D24] truncate mt-0.5">
                      {user?.name || 'Alexander Wright'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EAF3FF] text-[#0077FF] uppercase">
                        {user?.role || 'ADMIN'}
                      </span>
                      <span className="text-[10px] text-[#8F9CAE] font-mono">
                        {user?.loginId || 'OIADWR20200001'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#1A1D24] hover:bg-[#F4F7FB] transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#0077FF]" />
                      My Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin/attendance"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#1A1D24] hover:bg-[#F4F7FB] transition-colors"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        Admin Attendance Portal
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        href="/leave/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#1A1D24] hover:bg-[#F4F7FB] transition-colors"
                      >
                        <CalendarDays className="w-4 h-4 text-emerald-600" />
                        Time Off Approvals
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-[#E5ECF2]">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
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
      <nav className="flex md:hidden border-t border-[#E5ECF2] bg-white px-2 py-1 overflow-x-auto justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 text-[11px] font-semibold transition-colors',
                isActive ? 'text-[#0077FF]' : 'text-[#8F9CAE]'
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
