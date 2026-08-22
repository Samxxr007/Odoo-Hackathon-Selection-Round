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
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
  const [user, setUser] = useState(initialUser || null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Live Attendance State
  const [isCheckedIn, setIsCheckedIn] = useState(true)
  const [checkInTime, setCheckInTime] = useState<string>('09:02 AM')
  const [elapsedTime, setElapsedTime] = useState<string>('05h 38m')
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
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E5ECF2] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0077FF] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                OI
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#1A1D24] text-sm leading-tight tracking-tight">
                  {user?.companyName || 'Odoo India'}
                </span>
                <span className="text-[10px] font-semibold text-[#8F9CAE] uppercase tracking-wider">
                  Human Resources
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
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
                      'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150',
                      isActive
                        ? 'bg-[#EAF3FF] text-[#0077FF] shadow-2xs'
                        : 'text-[#8F9CAE] hover:text-[#1A1D24] hover:bg-[#F4F7FB]'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right: Attendance Pill + Notifications + User Avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Attendance Status Pill */}
            <div className="hidden lg:flex items-center gap-2.5 bg-[#F4F7FB] border border-[#E5ECF2] px-3.5 py-1.5 rounded-xl">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  isCheckedIn ? 'bg-[#22C55E]' : 'bg-[#F9911E]'
                )} />
                <span className="text-xs font-semibold text-[#1A1D24]">
                  {isCheckedIn ? `In since ${checkInTime}` : 'Not Checked In'}
                </span>
              </div>

              <button
                onClick={handleToggleAttendance}
                disabled={loadingToggle}
                className={cn(
                  'text-[11px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer',
                  isCheckedIn
                    ? 'bg-white border border-[#E5ECF2] text-rose-600 hover:bg-rose-50 shadow-2xs'
                    : 'bg-[#0077FF] text-white hover:bg-[#0066DD]'
                )}
              >
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </button>
            </div>

            {/* Notification Center Popover */}
            <NotificationDropdown userRole={user?.role} />

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-[#F4F7FB] border border-transparent hover:border-[#E5ECF2] transition-all cursor-pointer"
              >
                <img
                  src={user?.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-lg object-cover bg-[#F4F7FB] border border-[#E5ECF2]"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#1A1D24] leading-tight">
                    {user?.name || 'Alexander Wright'}
                  </span>
                  <span className="text-[10px] text-[#8F9CAE] font-mono">
                    {user?.loginId || 'OIADWR20200001'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#8F9CAE] hidden sm:block" />
              </button>

              {/* Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#E5ECF2] py-1.5 z-50 animate-scaleIn">
                  <div className="px-4 py-2.5 border-b border-[#E5ECF2]">
                    <p className="text-xs font-bold text-[#1A1D24] truncate">
                      {user?.name || 'Alexander Wright'}
                    </p>
                    <p className="text-[10px] text-[#8F9CAE] font-mono mt-0.5">
                      {user?.loginId} · {user?.role}
                    </p>
                  </div>

                  <div className="py-1 text-xs">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-[#1A1D24] hover:bg-[#F4F7FB] font-medium"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#8F9CAE]" />
                      My Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin/attendance"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-[#1A1D24] hover:bg-[#F4F7FB] font-medium"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#8F9CAE]" />
                        Attendance Admin
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        href="/leave/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-[#1A1D24] hover:bg-[#F4F7FB] font-medium"
                      >
                        <CalendarDays className="w-3.5 h-3.5 text-[#8F9CAE]" />
                        Time Off Admin
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-[#E5ECF2]">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
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
