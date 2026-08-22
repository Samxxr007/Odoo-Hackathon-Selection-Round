'use client'

import React, { useState } from 'react'
import {
  Table,
  Input,
  Select,
  Tag,
  Typography,
  Card,
  Tooltip,
  Alert,
  Modal,
  Button,
} from 'antd'
import { SearchOutlined, DownloadOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { AdminPayrollRow } from '@/lib/payroll/payrollService'
import PayslipCard from './PayslipCard'

const { Text } = Typography

interface AdminPayrollTableProps {
  rows: AdminPayrollRow[]
  errors?: { userId: string; name: string; errors: string[] }[]
  loading?: boolean
  month: number
  year: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
}

export default function AdminPayrollTable({
  rows,
  errors = [],
  loading,
  month,
  year,
  onMonthChange,
  onYearChange,
}: AdminPayrollTableProps) {
  const [searchText, setSearchText] = useState('')
  const [selectedPayslip, setSelectedPayslip] = useState<AdminPayrollRow | null>(null)

  const filteredRows = rows.filter((r) => {
    return (
      r.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(searchText.toLowerCase())
    )
  })

  const columns: ColumnsType<AdminPayrollRow> = [
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
      title: 'Gross Salary',
      dataIndex: 'grossAmount',
      key: 'grossAmount',
      align: 'right',
      render: (val) => <span className="font-medium">₹{val.toFixed(2)}</span>,
    },
    {
      title: 'Payable Days',
      key: 'payableDays',
      align: 'center',
      render: (_, record) => (
        <Tooltip title={`Total working: ${record.totalWorkingDays}d | Paid leave: ${record.paidLeaveDays}d | Unpaid: ${record.unpaidLeaveDays}d | Absent: ${record.absentDays}d`}>
          <Tag color="blue">
            {record.payableDays} / {record.totalWorkingDays}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Leave Deduction',
      dataIndex: 'leaveDeduction',
      key: 'leaveDeduction',
      align: 'right',
      render: (val) =>
        val > 0 ? (
          <span className="text-amber-600 font-medium">-₹{val.toFixed(2)}</span>
        ) : (
          <span className="text-gray-300">₹0.00</span>
        ),
    },
    {
      title: 'PF',
      dataIndex: 'employeePF',
      key: 'employeePF',
      align: 'right',
      render: (val) => <span>-₹{val.toFixed(2)}</span>,
    },
    {
      title: 'Prof. Tax',
      dataIndex: 'professionalTax',
      key: 'professionalTax',
      align: 'right',
      render: (val) => <span>-₹{val.toFixed(2)}</span>,
    },
    {
      title: 'Net Pay',
      dataIndex: 'netPay',
      key: 'netPay',
      align: 'right',
      render: (val) => (
        <span className="font-bold text-emerald-600 text-sm">
          ₹{val.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setSelectedPayslip(record)}
        >
          View
        </Button>
      ),
    },
  ]

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ]

  return (
    <div className="space-y-4">
      {/* Errors alert if any */}
      {errors.length > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message="Payroll Validation Warnings"
          description={
            <div className="space-y-1 mt-1 text-xs">
              {errors.map((e, idx) => (
                <div key={idx}>
                  <strong>{e.name}:</strong> {e.errors.join('; ')}
                </div>
              ))}
            </div>
          }
          closable
        />
      )}

      {/* Filter and export controls */}
      <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search employee by name/email..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
            allowClear
          />

          <div className="flex items-center gap-2">
            <Select
              value={month}
              onChange={onMonthChange}
              options={months}
              className="w-32"
            />
            <Select
              value={year}
              onChange={onYearChange}
              options={[
                { value: 2024, label: '2024' },
                { value: 2025, label: '2025' },
                { value: 2026, label: '2026' },
                { value: 2027, label: '2027' },
              ]}
              className="w-24"
            />
          </div>
        </div>

        <div>
          <a
            href={`/api/payroll/admin/export?month=${month}&year=${year}`}
            download
            className="ant-btn ant-btn-default inline-flex items-center gap-1.5 text-sm"
          >
            <DownloadOutlined /> Export Payroll (CSV)
          </a>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredRows}
        rowKey="userId"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        summary={(data) => {
          const totalGross = data.reduce((acc, r) => acc + r.grossAmount, 0)
          const totalLeaveDeduction = data.reduce((acc, r) => acc + r.leaveDeduction, 0)
          const totalPF = data.reduce((acc, r) => acc + r.employeePF, 0)
          const totalPT = data.reduce((acc, r) => acc + r.professionalTax, 0)
          const totalNet = data.reduce((acc, r) => acc + r.netPay, 0)

          return (
            <Table.Summary.Row className="bg-gray-50 font-bold">
              <Table.Summary.Cell index={0}>Total ({data.length} employees)</Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">₹{totalGross.toFixed(2)}</Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="center">—</Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">
                {totalLeaveDeduction > 0 ? `-₹${totalLeaveDeduction.toFixed(2)}` : '₹0.00'}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">-₹{totalPF.toFixed(2)}</Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">-₹{totalPT.toFixed(2)}</Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right" className="text-emerald-600">
                ₹{totalNet.toFixed(2)}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} />
            </Table.Summary.Row>
          )
        }}
      />

      {/* Detailed Modal */}
      <Modal
        open={!!selectedPayslip}
        onCancel={() => setSelectedPayslip(null)}
        footer={null}
        width={900}
      >
        {selectedPayslip && <PayslipCard data={selectedPayslip} />}
      </Modal>
    </div>
  )
}
