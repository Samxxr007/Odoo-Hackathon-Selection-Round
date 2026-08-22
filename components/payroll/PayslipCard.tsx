'use client'

import React from 'react'
import { Card, Row, Col, Typography, Divider, Table, Tag, Alert, Button } from 'antd'
import { PrinterOutlined, DollarOutlined, CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons'
import type { PayslipData } from '@/lib/payroll/payrollService'

const { Title, Text } = Typography

interface PayslipCardProps {
  data: PayslipData
  loading?: boolean
}

export default function PayslipCard({ data, loading }: PayslipCardProps) {
  const earnings = [
    { label: 'Basic Salary', amount: data.basic },
    { label: 'House Rent Allowance (HRA)', amount: data.hra },
    { label: 'Standard Allowance', amount: data.standardAllowance },
    { label: 'Performance Bonus', amount: data.performanceBonus },
    { label: 'Leave Travel Allowance (LTA)', amount: data.leaveTravelAllowance },
    { label: 'Fixed / Special Allowance', amount: data.fixedAllowance },
  ].filter((item) => item.amount > 0 || item.label.includes('Basic'))

  const deductions = [
    { label: 'Provident Fund (Employee PF)', amount: data.employeePF },
    { label: 'Professional Tax (PT)', amount: data.professionalTax },
  ].filter((item) => item.amount > 0)

  // Attendance adjustment
  const hasLeaveAdjustment = data.attendanceAdjustment !== 0

  return (
    <Card
      loading={loading}
      className="max-w-4xl mx-auto shadow-md border-gray-200 rounded-2xl p-4 bg-white"
    >
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start border-b pb-4 gap-4">
        <div>
          <Title level={3} className="!mb-1 text-gray-800">
            EMPLOYEE PAYSLIP
          </Title>
          <Text type="secondary" className="text-sm font-medium">
            Pay Period: <span className="text-blue-600 font-semibold">{data.payPeriod}</span>
          </Text>
        </div>
        <Button
          icon={<PrinterOutlined />}
          onClick={() => window.print()}
          className="print:hidden"
        >
          Print Payslip
        </Button>
      </div>

      {/* Employee & Attendance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs sm:text-sm">
        <div>
          <div className="text-gray-500">Employee Name</div>
          <div className="font-bold text-gray-800 text-base">{data.userName}</div>
          <div className="text-gray-500 mt-1">Email: {data.userEmail}</div>
        </div>

        <div>
          <div className="text-gray-500 font-medium">Attendance & Days Summary</div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="p-2 bg-white rounded border border-gray-200 text-center">
              <div className="text-[11px] text-gray-500">Working Days</div>
              <div className="font-bold text-blue-600">{data.totalWorkingDays}</div>
            </div>
            <div className="p-2 bg-white rounded border border-gray-200 text-center">
              <div className="text-[11px] text-gray-500">Payable Days</div>
              <div className="font-bold text-emerald-600">{data.payableDays}</div>
            </div>
            <div className="p-2 bg-white rounded border border-gray-200 text-center">
              <div className="text-[11px] text-gray-500">Unpaid / Absent</div>
              <div className="font-bold text-red-500">
                {data.unpaidLeaveDays + data.absentDays}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation of Leave / Working Days Adjustment */}
      {hasLeaveAdjustment && (
        <Alert
          type="warning"
          showIcon
          icon={<InfoCircleOutlined />}
          message="Attendance / Leave Adjustment Applied"
          description={
            <div>
              {data.adjustmentNote}
              <br />
              Deduction of <strong>₹{Math.abs(data.attendanceAdjustment).toFixed(2)}</strong> for{' '}
              {data.unpaidLeaveDays} unpaid leave day(s) / {data.absentDays} absent day(s).
            </div>
          }
          className="mb-6 text-xs"
        />
      )}

      {/* Earnings vs Deductions Table */}
      <Row gutter={[24, 24]}>
        {/* Earnings */}
        <Col xs={24} md={12}>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-blue-50/70 px-4 py-2.5 font-bold text-blue-900 border-b border-gray-200 flex justify-between">
              <span>Earnings</span>
              <span>Amount (₹)</span>
            </div>
            <div className="divide-y divide-gray-100 text-sm">
              {earnings.map((e, idx) => (
                <div key={idx} className="px-4 py-2 flex justify-between">
                  <span className="text-gray-600">{e.label}</span>
                  <span className="font-medium text-gray-800">{e.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="px-4 py-2.5 bg-gray-50 flex justify-between font-bold text-gray-900">
                <span>Gross Earnings</span>
                <span>₹{data.grossAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Col>

        {/* Deductions */}
        <Col xs={24} md={12}>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-red-50/70 px-4 py-2.5 font-bold text-red-900 border-b border-gray-200 flex justify-between">
              <span>Deductions</span>
              <span>Amount (₹)</span>
            </div>
            <div className="divide-y divide-gray-100 text-sm">
              {deductions.map((d, idx) => (
                <div key={idx} className="px-4 py-2 flex justify-between">
                  <span className="text-gray-600">{d.label}</span>
                  <span className="font-medium text-gray-800">{d.amount.toFixed(2)}</span>
                </div>
              ))}
              {hasLeaveAdjustment && (
                <div className="px-4 py-2 flex justify-between text-amber-700 bg-amber-50/50">
                  <span>Attendance / LOP Deduction</span>
                  <span className="font-medium">
                    {Math.abs(data.attendanceAdjustment).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="px-4 py-2.5 bg-gray-50 flex justify-between font-bold text-gray-900">
                <span>Total Deductions</span>
                <span>
                  ₹
                  {(
                    data.employeePF +
                    data.professionalTax +
                    Math.abs(data.attendanceAdjustment)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Divider className="my-6" />

      {/* Net Pay Callout */}
      <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl text-white flex flex-wrap justify-between items-center gap-4 shadow-sm">
        <div>
          <div className="text-emerald-100 uppercase text-xs tracking-wider font-semibold">
            Final Take Home Pay
          </div>
          <Title level={2} className="!text-white !mb-0 mt-1">
            ₹{data.netPay.toFixed(2)}
          </Title>
        </div>
        <div className="text-right text-xs text-emerald-100">
          <div>Paid Time Off: {data.paidLeaveDays} days (No salary deduction)</div>
          <div>Monthly CTC Wage: ₹{data.monthlyWage.toFixed(2)}</div>
        </div>
      </div>
    </Card>
  )
}
