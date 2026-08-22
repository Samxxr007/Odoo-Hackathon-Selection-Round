'use client'

import React from 'react'
import { Card, Row, Col, Typography, Progress, Tooltip } from 'antd'
import { CalendarOutlined, MedicineBoxOutlined, StopOutlined, InfoCircleOutlined } from '@ant-design/icons'
import type { LeaveBalanceDTO } from '@/types/leave'

const { Title, Text } = Typography

interface LeaveBalanceCardProps {
  balances: LeaveBalanceDTO[]
  loading?: boolean
}

export default function LeaveBalanceCard({ balances, loading }: LeaveBalanceCardProps) {
  const pto = balances.find((b) => b.leaveType === 'PAID_TIME_OFF') || {
    allocated: 18,
    consumed: 0,
    pending: 0,
    available: 18,
  }

  const sick = balances.find((b) => b.leaveType === 'SICK_LEAVE') || {
    allocated: 12,
    consumed: 0,
    pending: 0,
    available: 12,
  }

  const unpaid = balances.find((b) => b.leaveType === 'UNPAID_LEAVE') || {
    allocated: 0,
    consumed: 0,
    pending: 0,
    available: Infinity,
  }

  const ptoPercent = pto.allocated > 0 ? Math.round((pto.consumed / pto.allocated) * 100) : 0
  const sickPercent = sick.allocated > 0 ? Math.round((sick.consumed / sick.allocated) * 100) : 0

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card loading={loading} className="shadow-sm border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
          <div className="flex justify-between items-start">
            <div>
              <Text type="secondary" className="uppercase font-semibold tracking-wider text-xs">
                Paid Time Off
              </Text>
              <div className="flex items-baseline gap-2 mt-1">
                <Title level={2} className="!mb-0 text-blue-600">
                  {pto.available}
                </Title>
                <Text type="secondary">/ {pto.allocated} days available</Text>
              </div>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <CalendarOutlined style={{ fontSize: '20px' }} />
            </div>
          </div>
          <div className="mt-4">
            <Progress percent={ptoPercent} strokeColor="#1677ff" size="small" showInfo={false} />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{pto.consumed} days used</span>
              {pto.pending > 0 && (
                <Tooltip title="Pending approval (not yet consumed)">
                  <span className="text-amber-600 font-medium">{pto.pending} days pending</span>
                </Tooltip>
              )}
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card loading={loading} className="shadow-sm border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="flex justify-between items-start">
            <div>
              <Text type="secondary" className="uppercase font-semibold tracking-wider text-xs">
                Sick Leave
              </Text>
              <div className="flex items-baseline gap-2 mt-1">
                <Title level={2} className="!mb-0 text-emerald-600">
                  {sick.available}
                </Title>
                <Text type="secondary">/ {sick.allocated} days available</Text>
              </div>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <MedicineBoxOutlined style={{ fontSize: '20px' }} />
            </div>
          </div>
          <div className="mt-4">
            <Progress percent={sickPercent} strokeColor="#52c41a" size="small" showInfo={false} />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{sick.consumed} days used</span>
              {sick.pending > 0 && (
                <Tooltip title="Pending approval (not yet consumed)">
                  <span className="text-amber-600 font-medium">{sick.pending} days pending</span>
                </Tooltip>
              )}
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card loading={loading} className="shadow-sm border-purple-100 bg-gradient-to-br from-purple-50/50 to-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1">
                <Text type="secondary" className="uppercase font-semibold tracking-wider text-xs">
                  Unpaid Leave
                </Text>
                <Tooltip title="Unpaid leave reduces payable days in monthly payroll calculation">
                  <InfoCircleOutlined className="text-gray-400 text-xs" />
                </Tooltip>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <Title level={2} className="!mb-0 text-purple-600">
                  {unpaid.consumed}
                </Title>
                <Text type="secondary">days taken this year</Text>
              </div>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <StopOutlined style={{ fontSize: '20px' }} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-purple-50 flex justify-between text-xs text-gray-500">
            <span>Unlimited allocation</span>
            {unpaid.pending > 0 ? (
              <span className="text-amber-600 font-medium">{unpaid.pending} days pending</span>
            ) : (
              <span className="text-purple-600">Salary adjusted</span>
            )}
          </div>
        </Card>
      </Col>
    </Row>
  )
}
