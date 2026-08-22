'use client'

import React from 'react'
import { Card, Row, Col, Typography } from 'antd'
import { DollarOutlined, UserOutlined, ClockCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import type { AdminPayrollRow } from '@/lib/payroll/payrollService'

const { Title, Text } = Typography

interface PayrollSummaryProps {
  rows: AdminPayrollRow[]
  month: number
  year: number
}

export default function PayrollSummary({ rows }: PayrollSummaryProps) {
  const totalGross = rows.reduce((acc, r) => acc + r.grossAmount, 0)
  const totalNet = rows.reduce((acc, r) => acc + r.netPay, 0)
  const totalDeductions = rows.reduce(
    (acc, r) => acc + r.leaveDeduction + r.employeePF + r.professionalTax,
    0
  )
  const totalEmployees = rows.length

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card className="shadow-sm border-gray-100 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <Text type="secondary" className="uppercase text-xs font-semibold">
                Total Employees
              </Text>
              <Title level={3} className="!mb-0 text-gray-800">
                {totalEmployees}
              </Title>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <UserOutlined style={{ fontSize: '18px' }} />
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card className="shadow-sm border-gray-100 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <Text type="secondary" className="uppercase text-xs font-semibold">
                Total Gross
              </Text>
              <Title level={3} className="!mb-0 text-blue-600">
                ₹{totalGross.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Title>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <DollarOutlined style={{ fontSize: '18px' }} />
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card className="shadow-sm border-gray-100 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <Text type="secondary" className="uppercase text-xs font-semibold">
                Total Deductions
              </Text>
              <Title level={3} className="!mb-0 text-amber-600">
                ₹{totalDeductions.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Title>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <ClockCircleOutlined style={{ fontSize: '18px' }} />
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card className="shadow-sm border-gray-100 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <Text type="secondary" className="uppercase text-xs font-semibold">
                Total Net Payout
              </Text>
              <Title level={3} className="!mb-0 text-emerald-600">
                ₹{totalNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Title>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <SafetyCertificateOutlined style={{ fontSize: '18px' }} />
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  )
}
