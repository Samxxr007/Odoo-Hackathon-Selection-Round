'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Bell, 
  CheckCheck, 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NotificationDTO, NotificationType } from '@/types/notifications'

interface NotificationDropdownProps {
  userRole?: string
}

export function NotificationDropdown({ userRole }: NotificationDropdownProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications?limit=15')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount ?? (data.notifications || []).filter((n: any) => !n.readAt).length)
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e)
    } finally {
      setLoading(false)
    }
  }

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 20000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' })
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (e) {
      console.error('Failed to mark all as read', e)
    }
  }

  const handleItemClick = async (notif: NotificationDTO) => {
    if (!notif.readAt) {
      try {
        await fetch(`/api/notifications/${notif.id}/read`, { method: 'PATCH' })
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, readAt: new Date().toISOString() } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (e) {
        console.error('Failed to mark notification as read', e)
      }
    }

    setIsOpen(false)

    // Route dynamically based on type and role
    if (notif.type === 'LEAVE_PENDING_ADMIN') {
      router.push('/leave/admin')
    } else if (notif.type === 'LEAVE_APPROVED' || notif.type === 'LEAVE_REJECTED' || notif.type === 'LEAVE_SUBMITTED') {
      router.push('/leave')
    } else if (notif.type === 'PASSWORD_RESET') {
      router.push('/profile')
    } else {
      router.push('/dashboard')
    }
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'LEAVE_PENDING_ADMIN':
        return <Clock className="w-4 h-4 text-amber-500" />
      case 'LEAVE_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case 'LEAVE_REJECTED':
        return <XCircle className="w-4 h-4 text-rose-500" />
      case 'LEAVE_SUBMITTED':
        return <CalendarDays className="w-4 h-4 text-[#0077FF] dark:text-[#38BDF8]" />
      case 'PASSWORD_RESET':
        return <ShieldAlert className="w-4 h-4 text-purple-500" />
      default:
        return <Sparkles className="w-4 h-4 text-[#0077FF]" />
    }
  }

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime()
      const mins = Math.floor(diffMs / (1000 * 60))
      if (mins < 1) return 'Just now'
      if (mins < 60) return `${mins}m ago`
      const hours = Math.floor(mins / 60)
      if (hours < 24) return `${hours}h ago`
      const days = Math.floor(hours / 24)
      return `${days}d ago`
    } catch {
      return ''
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) fetchNotifications()
        }}
        className="relative p-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer shadow-xs active:scale-95"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-scaleIn overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0077FF]/10 dark:bg-[#38BDF8]/20 text-[#0077FF] dark:text-[#38BDF8]">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold text-[#0077FF] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const isUnread = !n.readAt
                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={cn(
                      'p-4 flex items-start gap-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer text-left relative',
                      isUnread ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    )}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5 shadow-2xs">
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <p className={cn(
                        'text-xs leading-snug',
                        isUnread
                          ? 'font-bold text-slate-900 dark:text-white'
                          : 'font-normal text-slate-600 dark:text-slate-400'
                      )}>
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1 inline-block">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>

                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#0077FF] dark:bg-[#38BDF8] shadow-xs shrink-0 mt-1.5" />
                    )}
                  </div>
                )
              })
            ) : (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No notifications yet</p>
                <p className="text-[11px] mt-0.5">You are completely up to date!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 px-5 pb-1 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href={userRole === 'ADMIN' || userRole === 'HR' ? '/leave/admin' : '/leave'}
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#0077FF] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1 py-1"
            >
              <span>View All in Time Off Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
