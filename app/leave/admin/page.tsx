'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Typography, message, Tag, Button } from 'antd'
import { CheckSquareOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import AdminLeaveTable from '@/components/leave/AdminLeaveTable'
import type { LeaveRequestDTO } from '@/types/leave'

const { Title, Text } = Typography

export default function AdminLeaveApprovalPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<LeaveRequestDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const checkRoleAndFetch = async () => {
    try {
      setLoading(true)
      const meRes = await fetch('/api/auth/me')
      const meJson = await meRes.json()

      if (!meJson.success || !meJson.data) {
        router.push('/signin')
        return
      }

      if (meJson.data.role !== 'ADMIN' && meJson.data.role !== 'HR') {
        message.warning('Access restricted to Admin & HR. Redirecting to employee view.')
        router.replace('/leave')
        return
      }

      setIsAdmin(true)

      const res = await fetch('/api/leave/admin')
      if (res.ok) {
        setRequests(await res.json())
      } else {
        const err = await res.json()
        message.error(err.error || 'Failed to load requests')
      }
    } catch (e) {
      console.error('Failed to load leave requests', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkRoleAndFetch()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/leave/admin/${id}/approve`, {
        method: 'POST',
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to approve request')
      }
      message.success('Leave request approved successfully!')
      checkRoleAndFetch()
    } catch (e: any) {
      message.error(e.message)
    }
  }

  const handleReject = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/leave/admin/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to reject request')
      }
      message.success('Leave request rejected with comment.')
      checkRoleAndFetch()
    } catch (e: any) {
      message.error(e.message)
    }
  }

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Title level={2} className="!mb-0">
              Leave Approvals & Management
            </Title>
            {pendingCount > 0 && (
              <Tag color="gold" className="text-sm font-semibold px-2.5 py-0.5 rounded-full">
                {pendingCount} Pending Review
              </Tag>
            )}
          </div>
          <Text type="secondary">
            Review, approve, or refuse organization-wide employee time off requests.
          </Text>
        </div>

        <Link href="/leave">
          <Button icon={<ArrowLeftOutlined />}>
            Switch to Employee View
          </Button>
        </Link>
      </div>

      <AdminLeaveTable
        data={requests}
        loading={loading}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
