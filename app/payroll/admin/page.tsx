'use client'

import React, { useState, useEffect } from 'react'
import { Typography, message } from 'antd'
import AdminPayrollTable from '@/components/payroll/AdminPayrollTable'
import PayrollSummary from '@/components/payroll/PayrollSummary'
import type { AdminPayrollRow } from '@/lib/payroll/payrollService'

const { Title, Text } = Typography

export default function AdminPayrollPage() {
  const currentDate = new Date()
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())
  const [rows, setRows] = useState<AdminPayrollRow[]>([])
  const [errors, setErrors] = useState<{ userId: string; name: string; errors: string[] }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPayroll = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/payroll/admin?month=${month}&year=${year}`)
      const data = await res.json()

      if (res.ok) {
        setRows(data.rows || [])
        setErrors(data.errors || [])
      } else {
        message.error(data.error || 'Failed to load payroll records')
      }
    } catch (e) {
      console.error('Failed to load admin payroll', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayroll()
  }, [month, year])

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="!mb-1">
          Payroll Overview & Processing
        </Title>
        <Text type="secondary">
          Monthly salary register with payable-day attendance integration, statutory deductions, and gross-to-net calculations.
        </Text>
      </div>

      {/* Metrics Summary */}
      <PayrollSummary rows={rows} month={month} year={year} />

      {/* Main Table */}
      <AdminPayrollTable
        rows={rows}
        errors={errors}
        loading={loading}
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
      />
    </div>
  )
}
