'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button, Typography, Breadcrumb, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import NewLeaveRequestForm from '@/components/leave/NewLeaveRequestForm'
import type { LeaveBalanceDTO } from '@/types/leave'

const { Title, Text } = Typography

export default function NewLeavePage() {
  const router = useRouter()
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status || 'unauthenticated'
  const [balances, setBalances] = useState<LeaveBalanceDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const res = await fetch(`/api/leave/balance?year=${new Date().getFullYear()}`)
        if (res.ok) {
          setBalances(await res.json())
        }
      } catch (e) {
        console.error('Failed to fetch balances', e)
      } finally {
        setLoading(false)
      }
    }
    fetchBalances()
  }, [])

  if (status === 'loading' || loading) {
    return (
      <div className="py-20 text-center">
        <Spin size="large" />
      </div>
    )
  }

  const currentUser = {
    name: session?.user?.name || 'Current User',
    email: session?.user?.email || 'user@example.com',
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
