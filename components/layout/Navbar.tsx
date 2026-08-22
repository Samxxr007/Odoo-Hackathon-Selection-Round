'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Clock,
  Umbrella,
  User,
  DollarSign,
  LogOut,
  UserCheck,
  ShieldCheck,
} from 'lucide-react'
import NotificationBell from '@/components/notifications/NotificationBell'

export interface NavbarProps {
  currentUserName?: string
}

export default function Navbar({ currentUserName }: NavbarProps = {}) {
  const pathname = usePathname()
  
  let sessionData: any = null
  try {
    const nextAuthSession = useSession()
    sessionData = nextAuthSession?.data
  } catch {
    // Safe fallback when rendered outside SessionProvider
  }

  const [meUser, setMeUser] = useState<any>(null)

  // Fetch session profile fallback
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.user) {
          setMeUser(json.user)
        }
      })
      .catch(() => {})
  }, [])

  const rawName = currentUserName || sessionData?.user?.name || meUser?.name || ''
  const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim()
  const role = sessionData?.user?.role || meUser?.role || 'EMPLOYEE'
  const isAdmin = role === 'ADMIN' || role === 'HR'

  const employeeNavItems = [
    { href: '/employee-dashboard', label: 'Employee Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/attendance', label: 'My Attendance', icon: <Clock className="w-4 h-4" /> },
    { href: '/leave', label: 'Leave Requests', icon: <Umbrella className="w-4 h-4" /> },
    { href: '/profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
    { href: '/payroll', label: 'Payroll', icon: <DollarSign className="w-4 h-4" /> },
  ]

  const adminNavItems = [
    { href: '/dashboard', label: 'Admin Dashboard', icon: <ShieldCheck className="w-4 h-4 text-purple-600" /> },
  ]

  return (
    <header className="bg-white border-b border-[#E5ECF2] sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-8">
            <Link href="/employee-dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0077FF] via-[#0084FF] to-[#00B7FE] flex items-center justify-center text-white font-black text-lg shadow-sm">
                D
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-[#1A1D24] leading-none">
                  DAYFLOW
                </span>
                <span className="text-[10px] font-bold text-[#00B7FE] tracking-wider uppercase">
                  HRMS Portal
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {employeeNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#EAF3FF] text-[#0077FF]'
                        : 'text-[#8F9CAE] hover:text-[#1A1D24] hover:bg-[#F4F7FB]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              {isAdmin && (
                <div className="pl-2 border-l border-[#E5ECF2] flex items-center gap-1">
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        pathname.startsWith('/dashboard')
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </nav>
          </div>

          {/* Right side: Notifications & User Profile */}
          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F4F7FB] border border-[#E5ECF2]">
                <UserCheck className="w-4 h-4 text-[#0077FF]" />
                <span className="text-xs font-bold text-[#1A1D24]">
                  {cleanName || 'Employee'}
                </span>
              </div>

              <button
                onClick={() => {
                  fetch('/api/auth/signout', { method: 'POST' }).finally(() => {
                    try {
                      signOut({ callbackUrl: '/signin' })
                    } catch {
                      window.location.href = '/signin'
                    }
                  })
                }}
                className="p-2 rounded-xl text-[#8F9CAE] hover:text-red-600 hover:bg-red-50 border border-[#E5ECF2] transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
