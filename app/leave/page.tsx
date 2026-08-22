'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Tabs, Button, Typography, message } from 'antd'
import { PlusOutlined, CalendarOutlined, AppstoreOutlined } from '@ant-design/icons'
import LeaveBalanceCard from '@/components/leave/LeaveBalanceCard'
import LeaveCalendar from '@/components/leave/LeaveCalendar'
import LeaveRequestTable from '@/components/leave/LeaveRequestTable'
import AllocationTab from '@/components/leave/AllocationTab'
import type { LeaveBalanceDTO, LeaveRequestDTO, CalendarEventDTO } from '@/types/leave'

const { Title, Text } = Typography

export default function LeavePage() {
  const [activeTab, setActiveTab] = useState('time-off')
  const [year, setYear] = useState(new Date().getFullYear())
  const [balances, setBalances] = useState<LeaveBalanceDTO[]>([])
  const [requests, setRequests] = useState<LeaveRequestDTO[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventDTO[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [balRes, reqRes, calRes] = await Promise.all([
        fetch(`/api/leave/balance?year=${year}`),
        fetch('/api/leave'),
        fetch(`/api/leave/calendar?year=${year}`),
      ])

      if (balRes.ok) setBalances(await balRes.json())
      if (reqRes.ok) setRequests(await reqRes.json())
      if (calRes.ok) setCalendarEvents(await calRes.json())
    } catch (e) {
      console.error('Failed to load leave data', e)
      message.error('Failed to load time off data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [year])

  const handleCancelLeave = async (id: string) => {
    try {
      const res = await fetch(`/api/leave/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to cancel leave')
      }
      message.success('Leave request cancelled. Balance restored.')
      fetchData()
    } catch (e: any) {
      message.error(e.message)
    }
  }

  const tabItems = [
    {
      key: 'time-off',
      label: (
        <span className="flex items-center gap-2">
          <CalendarOutlined /> Time Off
        </span>
      ),
      children: (
        <div className="space-y-6 mt-2">
          {/* Balances */}
          <LeaveBalanceCard balances={balances} loading={loading} />

          {/* Calendar Year View */}
          <LeaveCalendar
            events={calendarEvents}
            year={year}
            onYearChange={setYear}
          />

          {/* Request History */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Title level={4} className="!mb-0">
                  My Time Off Requests
                </Title>
                <Text type="secondary" className="text-xs">
                  Review history and status of all your submitted leave applications.
                </Text>
              </div>
            </div>

            <LeaveRequestTable
              data={requests}
              loading={loading}
              onCancel={handleCancelLeave}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'allocation',
      label: (
        <span className="flex items-center gap-2">
          <AppstoreOutlined /> Allocation
        </span>
      ),
      children: (
        <div className="mt-2">
          <AllocationTab balances={balances} loading={loading} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <Title level={2} className="!mb-1">
            Time Off & Leave
          </Title>
          <Text type="secondary">
            Manage your annual leave allowances, submit time off requests, and view the holiday calendar.
          </Text>
        </div>

        <Link href="/leave/new">
          <Button type="primary" size="large" icon={<PlusOutlined />}>
            New Time Off Request
          </Button>
        </Link>
      </div>

      {/* Main Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />
    </div>
  )
}
