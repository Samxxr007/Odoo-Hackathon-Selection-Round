'use client'

import React from 'react'
import { Table, Tag, Typography, Card, Progress } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { LeaveBalanceDTO } from '@/types/leave'
import { LEAVE_TYPE_LABELS } from '@/types/leave'

const { Title, Text } = Typography

interface AllocationTabProps {
  balances: LeaveBalanceDTO[]
  loading?: boolean
}

export default function AllocationTab({ balances, loading }: AllocationTabProps) {
  const columns: ColumnsType<LeaveBalanceDTO> = [
    {
      title: 'Time Off Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
      render: (type) => (
        <span className="font-semibold text-gray-900">
          {LEAVE_TYPE_LABELS[type as keyof typeof LEAVE_TYPE_LABELS] || type}
        </span>
      ),
    },
    {
      title: 'Allocated Days',
      dataIndex: 'allocated',
      key: 'allocated',
      render: (val, record) =>
        record.leaveType === 'UNPAID_LEAVE' ? (
          <span className="text-gray-400 italic">Unlimited</span>
        ) : (
          <span className="font-medium">{val} days</span>
        ),
    },
    {
      title: 'Consumed / Approved',
      dataIndex: 'consumed',
      key: 'consumed',
      render: (val) => <Tag color="green">{val} days</Tag>,
    },
    {
      title: 'Pending Approval',
      dataIndex: 'pending',
      key: 'pending',
      render: (val) => (val > 0 ? <Tag color="gold">{val} days</Tag> : <span className="text-gray-300">0 days</span>),
    },
    {
      title: 'Available Balance',
      dataIndex: 'available',
      key: 'available',
      render: (val, record) =>
        record.leaveType === 'UNPAID_LEAVE' ? (
          <Tag color="purple">Unlimited</Tag>
        ) : (
          <Tag color="blue" className="font-bold">
            {val} days
          </Tag>
        ),
    },
    {
      title: 'Utilization',
      key: 'utilization',
      render: (_, record) => {
        if (record.leaveType === 'UNPAID_LEAVE' || record.allocated === 0) {
          return <span className="text-gray-400 text-xs">N/A</span>
        }
        const percent = Math.min(100, Math.round((record.consumed / record.allocated) * 100))
        return (
          <div className="w-32">
            <Progress percent={percent} size="small" />
          </div>
        )
      },
    },
  ]

  return (
    <Card className="shadow-sm border-gray-100 rounded-xl">
      <div className="mb-4">
        <Title level={4} className="!mb-1">
          Time Off Allocations
        </Title>
        <Text type="secondary">
          Summary of your annual allocated days, consumed leave, and currently available balances.
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={balances}
        rowKey="leaveType"
        loading={loading}
        pagination={false}
      />
    </Card>
  )
}
