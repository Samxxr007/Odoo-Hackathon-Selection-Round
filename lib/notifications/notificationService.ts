import { prisma } from '@/lib/prisma'
import type { NotificationType, NotificationDTO } from '@/types/notifications'

/**
 * Creates a new in-app notification.
 */
export async function sendNotification(
  type: NotificationType,
  recipientId: string,
  message: string,
  metadata?: any
): Promise<void> {
  await prisma.notification.create({
    data: {
      type,
      recipientId,
      message,
      metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null,
    },
  })
}

/**
 * Returns unread notification count for a user.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { recipientId: userId, readAt: null },
  })
}

/**
 * Returns recent notifications for a user (most recent first).
 */
export async function getNotifications(
  userId: string,
  limit = 20,
  includeRead = true
): Promise<NotificationDTO[]> {
  const notifications = await prisma.notification.findMany({
    where: {
      recipientId: userId,
      ...(includeRead ? {} : { readAt: null }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return notifications.map((n) => ({
    id: n.id,
    type: n.type as NotificationType,
    recipientId: n.recipientId,
    message: n.message,
    metadata: n.metadata ? (typeof n.metadata === 'string' ? (JSON.parse(n.metadata) as Record<string, unknown>) : (n.metadata as unknown as Record<string, unknown>)) : undefined,
    createdAt: n.createdAt.toISOString(),
    readAt: n.readAt?.toISOString() ?? null,
  }))
}

/**
 * Marks a notification as read for a given user.
 * Ensures users can only mark their own notifications.
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<void> {
  const notification = await prisma.notification.findUniqueOrThrow({
    where: { id: notificationId },
  })

  if (notification.recipientId !== userId) {
    throw new Error('Forbidden: cannot mark another user\'s notification as read.')
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  })
}

/**
 * Marks all unread notifications as read for a user.
 */
export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  })
}
