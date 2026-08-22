'use client'

import React from 'react'
import { Modal, Form, Input } from 'antd'

interface RejectReasonModalProps {
  open: boolean
  loading?: boolean
  onCancel: () => void
  onConfirm: (reason: string) => Promise<void>
}

export default function RejectReasonModal({
  open,
  loading,
  onCancel,
  onConfirm,
}: RejectReasonModalProps) {
  const [form] = Form.useForm()

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      await onConfirm(values.reason)
      form.resetFields()
    } catch (e) {
      // Form validation failed
    }
  }

  return (
    <Modal
      title="Reject Leave Request"
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      confirmLoading={loading}
      okText="Confirm Rejection"
      okButtonProps={{ danger: true }}
      cancelText="Cancel"
    >
      <div className="py-2">
        <p className="text-sm text-gray-500 mb-4">
          Please provide a reason for rejecting this leave request. The employee will receive a notification with this comment.
        </p>
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="Rejection Reason"
            rules={[
              { required: true, message: 'Please enter a rejection reason' },
              { min: 3, message: 'Reason must be at least 3 characters' },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="e.g. Critical project deadline, overlapping team absence, etc."
              maxLength={300}
              showCount
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}
