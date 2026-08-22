'use client'

import React, { useState, useEffect } from 'react'
import { Typography, message, Tag } from 'antd'
import { CheckSquareOutlined } from '@ant-design/icons'
import AdminLeaveTable from '@/components/leave/AdminLeaveTable'
import type { LeaveRequestDTO } from '@/types/leave'

const { Title, Text } = Typography

export default function AdminLeaveApprovalPage() {
  const [requests, setRequests] = useState<LeaveRequestDTO[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    try {
      setLoading(true)
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
    fetchRequests()
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
      fetchRequests()
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
      fetchRequests()
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
