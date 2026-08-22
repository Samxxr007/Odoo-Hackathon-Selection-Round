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
    name: 'Alexander Wright',
    email: 'admin@odoo.com',
  })
  const [balances, setBalances] = useState<LeaveBalanceDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [meRes, balRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch(`/api/leave/balance?year=${new Date().getFullYear()}`),
        ])

        const meJson = await meRes.json()
        if (meJson.success && meJson.data) {
          setCurrentUser({
            name: meJson.data.name,
            email: meJson.data.email,
          })
        }

        if (balRes.ok) {
          setBalances(await balRes.json())
        }
      } catch (e) {
        console.error('Failed to fetch data for leave request', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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
            Fill in the details below to request days off. Duration is auto-computed excluding weekends and holidays.
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
