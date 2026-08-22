'use client'

import React from 'react'
import { Table, Tag, Button, Space, Popconfirm, Tooltip, Typography } from 'antd'
import {
  FilePdfOutlined,
  FileImageOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { LeaveRequestDTO } from '@/types/leave'
import { LEAVE_STATUS_COLORS, LEAVE_STATUS_LABELS, LEAVE_TYPE_LABELS } from '@/types/leave'

const { Text } = Typography

interface LeaveRequestTableProps {
  data: LeaveRequestDTO[]
  loading?: boolean
  onCancel?: (id: string) => Promise<void>
}

export default function LeaveRequestTable({ data, loading, onCancel }: LeaveRequestTableProps) {
  const getAttachmentIcon = (path?: string) => {
    if (!path) return null
    if (path.endsWith('.pdf')) return <FilePdfOutlined className="text-red-500 text-base" />
    if (path.match(/\.(jpg|jpeg|png)$/i)) return <FileImageOutlined className="text-blue-500 text-base" />
    return <PaperClipOutlined className="text-gray-500 text-base" />
  }

  const columns: ColumnsType<LeaveRequestDTO> = [
    {
      title: 'Time Off Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
      render: (type) => (
        <span className="font-medium text-gray-800">
          {LEAVE_TYPE_LABELS[type as keyof typeof LEAVE_TYPE_LABELS] || type}
        </span>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => (
        <div className="text-xs">
          <div>
            {record.fromDate.split('T')[0]} <span className="text-gray-400">→</span> {record.toDate.split('T')[0]}
          </div>
          <Text type="secondary" className="text-[11px]">
            Applied: {record.requestedAt.split('T')[0]}
          </Text>
        </div>
      ),
    },
    {
      title: 'Days',
      dataIndex: 'days',
      key: 'days',
      align: 'center',
      render: (days) => <Tag color="blue">{days} {days === 1 ? 'day' : 'days'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div>
          <Tag color={LEAVE_STATUS_COLORS[status as keyof typeof LEAVE_STATUS_COLORS]}>
            {LEAVE_STATUS_LABELS[status as keyof typeof LEAVE_STATUS_LABELS] || status}
          </Tag>
          {status === 'REJECTED' && record.rejectionReason && (
            <Tooltip title={`Rejection Reason: ${record.rejectionReason}`}>
              <InfoCircleOutlined className="text-red-500 ml-1 cursor-pointer" />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true,
      render: (remarks) => remarks || <span className="text-gray-300">—</span>,
    },
    {
      title: 'Attachment',
      key: 'attachment',
      align: 'center',
      render: (_, record) =>
        record.attachmentPath ? (
          <Tooltip title={record.attachmentName || 'Download attachment'}>
            <a
              href={record.attachmentPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline text-xs"
            >
              {getAttachmentIcon(record.attachmentPath)}
              <span className="max-w-[80px] truncate">{record.attachmentName || 'View'}</span>
            </a>
          </Tooltip>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      title: 'Decision',
      key: 'decision',
      render: (_, record) => {
        if (record.status === 'PENDING') {
          return <span className="text-amber-600 text-xs italic">Awaiting review</span>
        }
        return (
          <div className="text-xs text-gray-500">
            {record.decidedByName && <div>By: {record.decidedByName}</div>}
            {record.decidedAt && <div>On: {record.decidedAt.split('T')[0]}</div>}
          </div>
        )
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.status !== 'REJECTED' && onCancel && (
            <Popconfirm
              title="Cancel Leave Request"
              description="Are you sure you want to cancel this leave? Balance will be restored."
              onConfirm={() => onCancel(record.id)}
              okText="Yes, Cancel"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Cancel
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    />
  )
}
