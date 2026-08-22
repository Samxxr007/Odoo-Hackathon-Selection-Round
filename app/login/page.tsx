'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, Form, Input, Button, Typography, Alert, Divider, Tag } from 'antd'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      setErrorMsg(null)

      const res = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (res?.error) {
        setErrorMsg('Invalid email or password.')
      } else {
        router.push('/leave')
        router.refresh()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during sign in.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (email: string) => {
    signIn('credentials', {
      email,
      password: 'password123',
      callbackUrl: '/leave',
    })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full shadow-lg rounded-2xl border-gray-100 p-4 sm:p-6 bg-white">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-3 shadow-md">
            O
          </div>
          <Title level={3} className="!mb-1">
            HRMS Portal Sign In
          </Title>
          <Text type="secondary" className="text-xs">
            Member 4 — Time Off, Leave Approvals, Notifications & Payroll
          </Text>
        </div>

        {errorMsg && (
          <Alert
            type="error"
            message={errorMsg}
            showIcon
            closable
            className="mb-4 text-xs"
            onClose={() => setErrorMsg(null)}
          />
        )}

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="user@example.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="••••••••"
              size="large"
            />
          </Form.Item>

          <Form.Item className="mb-2">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className="bg-blue-600 font-semibold"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider className="my-4 text-xs text-gray-400">DEMO QUICK ACCESS</Divider>

        <div className="space-y-2">
          <div
            onClick={() => handleQuickLogin('admin@odoo-hackathon.com')}
            className="flex items-center justify-between p-2.5 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-50 cursor-pointer transition-colors"
          >
            <div>
              <div className="font-semibold text-xs text-purple-900">Admin / HR View</div>
              <div className="text-[11px] text-gray-500">admin@odoo-hackathon.com</div>
            </div>
            <Tag color="purple">ADMIN</Tag>
          </div>

          <div
            onClick={() => handleQuickLogin('employee@odoo-hackathon.com')}
            className="flex items-center justify-between p-2.5 rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <div>
              <div className="font-semibold text-xs text-blue-900">Employee View</div>
              <div className="text-[11px] text-gray-500">employee@odoo-hackathon.com</div>
            </div>
            <Tag color="blue">EMPLOYEE</Tag>
          </div>
        </div>
      </Card>
    </div>
  )
}
