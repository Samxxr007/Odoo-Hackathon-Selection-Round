'use client'

import React from 'react'
import { Calendar, Badge, Tooltip, Tag, Select } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

import type { CalendarEventDTO } from '@/types/leave'

interface LeaveCalendarProps {
  events: CalendarEventDTO[]
  year: number
  onYearChange?: (year: number) => void
}

export default function LeaveCalendar({ events, year, onYearChange }: LeaveCalendarProps) {
  const getBadgeStatus = (type: string, status?: string): { status: 'success' | 'processing' | 'error' | 'warning' | 'default'; text: string; color?: string } => {
    if (type === 'HOLIDAY') {
      return { status: 'processing', text: 'Public Holiday', color: '#722ed1' }
    }
    if (status === 'APPROVED') {
      return { status: 'success', text: 'Approved', color: '#52c41a' }
    }
    if (status === 'PENDING') {
      return { status: 'warning', text: 'Pending', color: '#faad14' }
    }
    if (status === 'REJECTED') {
      return { status: 'error', text: 'Rejected', color: '#ff4d4f' }
    }
    return { status: 'default', text: type }
  }

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD')
    const current = value.startOf('day')

    // Find all events covering this day
    const dayEvents = events.filter((e) => {
      if (e.endDate) {
        const start = dayjs(e.date).startOf('day')
        const end = dayjs(e.endDate).startOf('day')
        return current.isSameOrAfter(start) && current.isSameOrBefore(end)
      }
      return e.date === dateStr
    })

    if (dayEvents.length === 0) return null

    return (
      <ul className="list-none p-0 m-0 space-y-1">
        {dayEvents.map((item) => {
          const badge = getBadgeStatus(item.type, item.status)
          return (
            <li key={item.id} className="truncate">
              <Tooltip title={`${item.title} (${badge.text})`}>
                <Badge
                  color={badge.color}
                  text={<span className="text-[11px] font-medium">{item.title}</span>}
                />
              </Tooltip>
            </li>
          )
        })}
      </ul>
    )
  }

  const monthCellRender = (value: Dayjs) => {
    const month = value.month()
    const monthEvents = events.filter((e) => {
      const eMonth = dayjs(e.date).month()
      return eMonth === month
    })

    if (monthEvents.length === 0) return null

    const approvedCount = monthEvents.filter((e) => e.status === 'APPROVED').length
    const pendingCount = monthEvents.filter((e) => e.status === 'PENDING').length
    const holidaysCount = monthEvents.filter((e) => e.type === 'HOLIDAY').length

    return (
      <div className="text-xs space-y-1 mt-1">
        {approvedCount > 0 && <Tag color="green">{approvedCount} Approved</Tag>}
        {pendingCount > 0 && <Tag color="gold">{pendingCount} Pending</Tag>}
        {holidaysCount > 0 && <Tag color="purple">{holidaysCount} Holiday(s)</Tag>}
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-700">Calendar Year:</span>
          <Select
            value={year}
            onChange={(val) => onYearChange?.(val)}
            options={[
              { value: 2024, label: '2024' },
              { value: 2025, label: '2025' },
              { value: 2026, label: '2026' },
              { value: 2027, label: '2027' },
            ]}
            className="w-28"
          />
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
            Public Holiday
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
            Approved / Validated
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            Pending / To Approve
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            Rejected / Refused
          </span>
        </div>
      </div>

      <Calendar
        value={dayjs(`${year}-01-01`)}
        cellRender={(current, info) => {
          if (info.type === 'date') return dateCellRender(current)
          if (info.type === 'month') return monthCellRender(current)
          return info.originNode
        }}
      />
    </div>
  )
}
