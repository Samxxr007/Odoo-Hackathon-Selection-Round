'use client'

import React, { useState } from 'react'
import {
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Tooltip,
  Popconfirm,
  Typography,
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  PaperClipOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { LeaveRequestDTO, LeaveStatus } from '@/types/leave'
import { LEAVE_STATUS_COLORS, LEAVE_STATUS_LABELS, LEAVE_TYPE_LABELS } from '@/types/leave'
import RejectReasonModal from './RejectReasonModal'

const { Text } = Typography

interface AdminLeaveTableProps {
  data: LeaveRequestDTO[]
  loading?: boolean
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
}

export default function AdminLeaveTable({
  data,
  loading,
  onApprove,
  onReject,
}: AdminLeaveTableProps) {
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.userEmail.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.remarks && item.remarks.toLowerCase().includes(searchText.toLowerCase()))

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleOpenReject = (id: string) => {
    setSelectedRequestId(id)
    setRejectModalOpen(true)
  }

  const handleConfirmReject = async (reason: string) => {
    if (!selectedRequestId) return
    try {
      setActionLoading(true)
      await onReject(selectedRequestId, reason)
      setRejectModalOpen(false)
      setSelectedRequestId(null)
    } finally {
      setActionLoading(false)
    }
  }

  const getAttachmentIcon = (path?: string) => {
    if (!path) return null
    if (path.endsWith('.pdf')) return <FilePdfOutlined className="text-red-500 text-base" />
    if (path.match(/\.(jpg|jpeg|png)$/i)) return <FileImageOutlined className="text-blue-500 text-base" />
    return <PaperClipOutlined className="text-gray-500 text-base" />
  }

  const columns: ColumnsType<LeaveRequestDTO> = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-900">{record.userName}</div>
          <Text type="secondary" className="text-xs">{record.userEmail}</Text>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
      render: (type) => (
        <span className="font-medium text-gray-800">
          {LEAVE_TYPE_LABELS[type as keyof typeof LEAVE_TYPE_LABELS] || type}
        </span>
      ),
    },
    {
      title: 'Date Range',
      key: 'dates',
      render: (_, record) => (
        <div className="text-xs">
          <div>{record.fromDate.split('T')[0]} → {record.toDate.split('T')[0]}</div>
          <Text type="secondary" className="text-[11px]">
            Requested: {record.requestedAt.split('T')[0]}
          </Text>
        </div>
      ),
    },
    {
      title: 'Days',
      dataIndex: 'days',
      key: 'days',
      align: 'center',
      render: (days) => <Tag color="blue">{days}d</Tag>,
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
            <Tooltip title={`Rejection: ${record.rejectionReason}`}>
              <InfoCircleOutlined className="text-red-500 ml-1 cursor-pointer" />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Reason / Remarks',
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
          <Tooltip title={record.attachmentName || 'View Attachment'}>
            <a
              href={record.attachmentPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline text-xs"
            >
              {getAttachmentIcon(record.attachmentPath)}
              <span className="max-w-[80px] truncate">{record.attachmentName || 'File'}</span>
            </a>
          </Tooltip>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      title: 'Decision Details',
      key: 'decision',
      render: (_, record) => {
        if (record.status === 'PENDING') {
          return <span className="text-amber-600 text-xs italic">To Approve</span>
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
      render: (_, record) => {
        if (record.status !== 'PENDING') return null
        return (
          <Space size="small">
            <Popconfirm
              title="Approve Leave Request"
              description={`Approve ${record.userName}'s ${record.days}-day leave request?`}
              onConfirm={() => onApprove(record.id)}
              okText="Yes, Approve"
              cancelText="No"
            >
              <Button
                size="small"
                type="primary"
                className="bg-emerald-600 hover:bg-emerald-500"
                icon={<CheckOutlined />}
              >
                Approve
              </Button>
            </Popconfirm>

            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleOpenReject(record.id)}
            >
              Reject
            </Button>
          </Space>
        )
      },
    },
  ]

  const pendingCount = data.filter((d) => d.status === 'PENDING').length

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search employee, email, reason..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-40"
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'PENDING', label: `Pending (${pendingCount})` },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/leave/admin/export?type=requests"
            download
            className="ant-btn ant-btn-default inline-flex items-center gap-1.5 text-sm"
          >
            <DownloadOutlined /> Export Requests (CSV)
          </a>
          <a
            href="/api/leave/admin/export?type=balances"
            download
            className="ant-btn ant-btn-default inline-flex items-center gap-1.5 text-sm"
          >
            <DownloadOutlined /> Export Balances (CSV)
          </a>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      />

      <RejectReasonModal
        open={rejectModalOpen}
        loading={actionLoading}
        onCancel={() => {
          setRejectModalOpen(false)
          setSelectedRequestId(null)
        }}
        onConfirm={handleConfirmReject}
      />
    </div>
  )
}
