'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button, Space, Tag } from 'antd'
import {
  CalendarOutlined,
  DollarOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import NotificationBell from '@/components/notifications/NotificationBell'

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const user = session?.user
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR'

  const navItems = [
    { href: '/leave', label: 'Time Off', icon: <CalendarOutlined /> },
    { href: '/payroll', label: 'My Payslip', icon: <DollarOutlined /> },
    ...(isAdmin
      ? [
          { href: '/leave/admin', label: 'Leave Approvals', icon: <CheckSquareOutlined /> },
          { href: '/payroll/admin', label: 'Payroll Admin', icon: <TeamOutlined /> },
        ]
      : []),
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Brand */}
          <div className="flex items-center gap-8">
            <Link href="/leave" className="flex items-center gap-2 text-decoration-none">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm">
                O
              </div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">
                HR Portal
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right side: Notifications & User profile */}
          <div className="flex items-center gap-4">
            <NotificationBell />

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900 leading-tight">
                    {user.name}
                  </div>
                  <Tag
                    color={isAdmin ? 'purple' : 'blue'}
                    className="text-[10px] uppercase font-bold mt-0.5"
                  >
                    {user.role}
                  </Tag>
                </div>
                <Button
                  type="text"
                  icon={<LogoutOutlined />}
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  title="Sign Out"
                />
              </div>
            ) : (
              <Link href="/login">
                <Button type="primary" size="small">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
