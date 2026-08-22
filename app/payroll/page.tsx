'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Typography, Select, Spin, Alert, Empty } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { ChevronRight } from 'lucide-react'
import PayslipCard from '@/components/payroll/PayslipCard'
import type { PayslipData } from '@/lib/payroll/payrollService'

const { Title, Text } = Typography

export default function EmployeePayrollPage() {
  const currentDate = new Date()
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())
  const [payslip, setPayslip] = useState<PayslipData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const fetchPayslip = async () => {
      try {
        setLoading(true)
        setErrorMsg(null)
        const res = await fetch(`/api/payroll/payslip?month=${month}&year=${year}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to generate payslip')
        }
        setPayslip(data)
      } catch (e: any) {
        setErrorMsg(e.message)
        setPayslip(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPayslip()
  }, [month, year])

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
    <div className="min-h-screen flex flex-col bg-[#F4F7FB]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8F9CAE]">
          <Link href="/employee-dashboard" className="hover:text-[#0077FF] transition-colors">
            Employee Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#8F9CAE]/60" />
          <span className="text-[#1A1D24] font-bold">Payroll & Payslips</span>
        </div>

        {/* Top Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-[#E5ECF2] shadow-xs">
          <div>
            <Title level={2} className="!mb-1">
              My Payslip
            </Title>
            <Text type="secondary">
              View your itemized monthly salary breakdown, attendance adjustments, and net payout.
            </Text>
          </div>

          {/* Month & Year Selectors */}
          <div className="flex items-center gap-2 bg-[#F4F7FB] p-2 rounded-xl border border-[#E5ECF2]">
            <CalendarOutlined className="text-gray-400 ml-2" />
            <Select
              value={month}
              onChange={setMonth}
              options={months}
              className="w-32"
            />
            <Select
              value={year}
              onChange={setYear}
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

        {loading ? (
          <div className="py-24 text-center">
            <Spin size="large" />
            <div className="mt-4 text-gray-500 text-sm font-semibold">Calculating salary and payable days...</div>
          </div>
        ) : errorMsg ? (
          <Alert
            type="error"
            showIcon
            message="Payroll Notice"
            description={errorMsg}
            className="max-w-2xl mx-auto my-8"
          />
        ) : payslip ? (
          <PayslipCard data={payslip} />
        ) : (
          <Empty description="No payslip available for this period" />
        )}
      </main>
    </div>
  )
}
