'use client'

import React, { useState, useEffect } from 'react'
import { Badge, Button, Dropdown, List, Typography, Space, Empty, Spin } from 'antd'
import { BellOutlined, CheckOutlined } from '@ant-design/icons'
import type { NotificationDTO } from '@/types/notifications'

const { Text } = Typography

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications?limit=10')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (e) {
      console.error('Failed to load notifications', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' })
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (e) {
      console.error('Failed to mark all as read', e)
    }
  }

  const markSingleRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch (e) {
      console.error('Failed to mark as read', e)
    }
  }

  const menuContent = (
    <div className="w-80 bg-white p-3 shadow-lg rounded-lg border border-gray-100 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-2 pb-2 border-b">
        <Text strong>Notifications</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>
      {loading && notifications.length === 0 ? (
        <div className="py-6 text-center">
          <Spin size="small" />
        </div>
      ) : notifications.length === 0 ? (
        <Empty description="No notifications" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          size="small"
          dataSource={notifications}
          renderItem={(item) => {
            const isUnread = !item.readAt
            return (
              <List.Item
                className={`cursor-pointer transition-colors p-2 rounded ${
                  isUnread ? 'bg-blue-50/60 font-medium' : 'hover:bg-gray-50'
                }`}
                onClick={() => isUnread && markSingleRead(item.id)}
              >
                <div className="flex flex-col w-full text-xs">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-800">{item.message}</span>
                    {isUnread && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 ml-2 mt-1"></span>
                    )}
                  </div>
                  <span className="text-gray-400 mt-1 text-[10px]">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              </List.Item>
            )
          }}
        />
      )}
    </div>
  )

  return (
    <Dropdown
      dropdownRender={() => menuContent}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Badge count={unreadCount} overflowCount={99} size="small">
        <Button
          type="text"
          shape="circle"
          icon={<BellOutlined className="text-lg text-gray-700" />}
        />
      </Badge>
    </Dropdown>
  )
}
