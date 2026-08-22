'use client'

import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Upload,
  Alert,
  Card,
  Typography,
  Space,
  Tag,
  message,
} from 'antd'
import { UploadOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import dayjs from 'dayjs'
import type { LeaveType, LeaveBalanceDTO } from '@/types/leave'

const { Title, Text } = Typography
const { TextArea } = Input

interface NewLeaveRequestFormProps {
  currentUser: { name: string; email: string }
  balances: LeaveBalanceDTO[]
  onSuccess?: () => void
}

export default function NewLeaveRequestForm({
  currentUser,
  balances,
  onSuccess,
}: NewLeaveRequestFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [calculatedDays, setCalculatedDays] = useState<number>(0)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const selectedType = Form.useWatch('leaveType', form) as LeaveType | undefined
  const dateRange = Form.useWatch('dateRange', form) as [dayjs.Dayjs, dayjs.Dayjs] | undefined

  // Auto calculate business days when dates change
  useEffect(() => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      const start = dateRange[0]
      const end = dateRange[1]

      if (start.isAfter(end)) {
        setCalculatedDays(0)
        return
      }

      let count = 0
      let cur = start.clone()
      while (cur.isBefore(end) || cur.isSame(end, 'day')) {
        const dow = cur.day()
        if (dow !== 0 && dow !== 6) {
          count++
        }
        cur = cur.add(1, 'day')
      }
      setCalculatedDays(count)
    } else {
      setCalculatedDays(0)
    }
  }, [dateRange])

  const currentBalance = balances.find((b) => b.leaveType === selectedType)

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      setErrorMsg(null)

      const [fromDate, toDate] = values.dateRange

      if (fromDate.isAfter(toDate)) {
        setErrorMsg('From date cannot be after To date.')
        return
      }

      if (calculatedDays <= 0) {
        setErrorMsg('Selected date range contains no working days.')
        return
      }

      if (selectedType !== 'UNPAID_LEAVE' && currentBalance) {
        if (calculatedDays > currentBalance.available) {
          setErrorMsg(
            `Insufficient balance! You have ${currentBalance.available} days available, but requested ${calculatedDays} days.`
          )
          return
        }
      }

      const formData = new FormData()
      formData.append('leaveType', values.leaveType)
      formData.append('fromDate', fromDate.format('YYYY-MM-DD'))
      formData.append('toDate', toDate.format('YYYY-MM-DD'))
      if (values.remarks) {
        formData.append('remarks', values.remarks)
      }

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('attachment', fileList[0].originFileObj)
      }

      const res = await fetch('/api/leave', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit leave request')
      }

      message.success('Time off request submitted successfully! Status: Pending approval.')
      form.resetFields()
      setFileList([])
      setCalculatedDays(0)
      onSuccess?.()
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-sm border border-gray-100 rounded-xl">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <Title level={4} className="!mb-1">
          Apply for Time Off
        </Title>
        <Text type="secondary">
          Submit a new leave request for review and approval.
        </Text>
      </div>

      {errorMsg && (
        <Alert
          type="error"
          showIcon
          message="Validation Error"
          description={errorMsg}
          className="mb-6"
          closable
          onClose={() => setErrorMsg(null)}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          leaveType: 'PAID_TIME_OFF',
        }}
      >
        {/* Read-only Employee Field */}
        <Form.Item label="Employee">
          <Input
            value={`${currentUser.name} (${currentUser.email})`}
            disabled
            className="bg-gray-50 text-gray-700 font-medium"
          />
        </Form.Item>

        <Form.Item
          name="leaveType"
          label="Time Off Type"
          rules={[{ required: true, message: 'Please select a leave type' }]}
        >
          <Select
            options={[
              { value: 'PAID_TIME_OFF', label: 'Paid Time Off' },
              { value: 'SICK_LEAVE', label: 'Sick Leave' },
              { value: 'UNPAID_LEAVE', label: 'Unpaid Leave' },
            ]}
          />
        </Form.Item>

        {/* Balance helper indicator */}
        {selectedType && currentBalance && (
          <div className="mb-4 -mt-2 text-xs flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-gray-600">Available Balance:</span>
            <span className="font-semibold text-blue-600">
              {currentBalance.available === Infinity ? 'Unlimited' : `${currentBalance.available} Days`}
            </span>
          </div>
        )}

        <Form.Item
          name="dateRange"
          label="Date Range"
          rules={[{ required: true, message: 'Please select leave duration' }]}
          extra="Working days (Mon–Fri) are automatically calculated."
        >
          <DatePicker.RangePicker
            className="w-full"
            format="YYYY-MM-DD"
            disabledDate={(current) => current && current.year() < 2024}
          />
        </Form.Item>

        {/* Calculated Days badge */}
        {calculatedDays > 0 && (
          <div className="mb-4 -mt-2 p-3 bg-blue-50/70 border border-blue-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-blue-500" />
              <span className="text-xs font-medium text-blue-900">Calculated Working Days:</span>
            </div>
            <Tag color="blue" className="font-bold text-sm px-3 py-0.5">
              {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}
            </Tag>
          </div>
        )}

        <Form.Item name="remarks" label="Remarks / Reason">
          <TextArea
            rows={3}
            placeholder="Provide context or reason for your time off request..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="Attachment (Optional)"
          extra="Supported formats: PDF, JPG, PNG. Max file size: 5 MB."
        >
          <Upload
            fileList={fileList}
            beforeUpload={(file) => {
              const isValidType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
              if (!isValidType) {
                message.error('You can only upload PDF, JPG, or PNG files!')
                return Upload.LIST_IGNORE
              }
              const isLt5M = file.size / 1024 / 1024 < 5
              if (!isLt5M) {
                message.error('File must be smaller than 5MB!')
                return Upload.LIST_IGNORE
              }
              setFileList([file])
              return false
            }}
            onRemove={() => setFileList([])}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Select Attachment</Button>
          </Upload>
        </Form.Item>

        <Form.Item className="mb-0 pt-2">
          <Space className="w-full justify-end">
            <Button onClick={() => form.resetFields()}>Reset</Button>
            <Button type="primary" htmlType="submit" loading={loading} icon={<CheckCircleOutlined />}>
              Submit Request
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}
