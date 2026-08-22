'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Typography, Breadcrumb, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import NewLeaveRequestForm from '@/components/leave/NewLeaveRequestForm'
import type { LeaveBalanceDTO } from '@/types/leave'

const { Title, Text } = Typography

export default function NewLeavePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string }>({
    name: 'Current User',
    email: 'user@company.com',
  })
  const [balances, setBalances] = useState<LeaveBalanceDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Fetch authenticated session details
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.user) {
          setCurrentUser({
            name: json.user.name || 'Current User',
            email: json.user.email || 'user@company.com',
          })
        }
      })
      .catch((e) => console.error('Error fetching session user:', e))

    // 2. Fetch leave allocation balances
    fetch(`/api/leave/balance?year=${new Date().getFullYear()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBalances(data)
        }
      })
      .catch((e) => console.error('Failed to fetch balances:', e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { title: <Link href="/leave">Time Off</Link> },
          { title: 'New Request' },
        ]}
      />

      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/leave')}
        />
        <div>
          <Title level={3} className="!mb-0">
            Submit New Time Off Request
          </Title>
          <Text type="secondary">
            Fill in the details below to request days off.
          </Text>
        </div>
      </div>

      <NewLeaveRequestForm
        currentUser={currentUser}
        balances={balances}
        onSuccess={() => router.push('/leave')}
      />
    </div>
  )
}
