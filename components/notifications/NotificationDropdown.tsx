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

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 20000)
    return () => clearInterval(interval)
  }, [])

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
        return <Clock className="w-4 h-4 text-[#F9911E]" />
      case 'LEAVE_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
      case 'LEAVE_REJECTED':
        return <XCircle className="w-4 h-4 text-rose-500" />
      case 'LEAVE_SUBMITTED':
        return <CalendarDays className="w-4 h-4 text-[#0077FF]" />
      case 'PASSWORD_RESET':
        return <ShieldAlert className="w-4 h-4 text-[#0084FF]" />
      default:
        return <Bell className="w-4 h-4 text-[#0077FF]" />
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
      {/* Bell Button with Warning/Alert Orange Badge */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) fetchNotifications()
        }}
        className="relative p-2 text-[#8F9CAE] hover:text-[#1A1D24] bg-[#F4F7FB] hover:bg-white rounded-xl border border-[#E5ECF2] transition-colors cursor-pointer shadow-2xs"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F9911E] text-white font-bold text-[9px] rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#E5ECF2] py-2.5 z-50 animate-scaleIn overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-[#E5ECF2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs text-[#1A1D24]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#0077FF]">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold text-[#0077FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-[#E5ECF2]">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const isUnread = !n.readAt
                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={cn(
                      'p-3.5 flex items-start gap-3 hover:bg-[#F4F7FB] transition-colors cursor-pointer text-left relative',
                      isUnread ? 'bg-[#EAF3FF]/40' : ''
                    )}
                  >
                    <div className="p-1.5 rounded-lg bg-[#F4F7FB] border border-[#E5ECF2] shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0 pr-1">
                      <p className={cn(
                        'text-xs leading-snug',
                        isUnread
                          ? 'font-bold text-[#1A1D24]'
                          : 'font-normal text-[#8F9CAE]'
                      )}>
                        {n.message}
                      </p>
                      <span className="text-[10px] text-[#8F9CAE] font-medium mt-0.5 inline-block">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>

                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#0077FF] shrink-0 mt-1.5" />
                    )}
                  </div>
                )
              })
            ) : (
              <div className="py-10 text-center text-[#8F9CAE] text-xs">
                <Bell className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-[#8F9CAE]" />
                <p className="font-semibold text-[#1A1D24]">No notifications</p>
                <p className="text-[11px] text-[#8F9CAE] mt-0.5">You are completely up to date</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 px-4 pb-1 border-t border-[#E5ECF2] text-center">
            <Link
              href={userRole === 'ADMIN' || userRole === 'HR' ? '/leave/admin' : '/leave'}
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#0077FF] hover:underline inline-flex items-center gap-1 py-1"
            >
              <span>View All in Time Off</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
