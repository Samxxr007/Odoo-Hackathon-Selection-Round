// ============================================================
// Notification types
// ============================================================

export type NotificationType =
  | 'LEAVE_SUBMITTED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'LEAVE_PENDING_ADMIN'
  | 'PASSWORD_RESET'

export interface NotificationDTO {
  id: string
  type: NotificationType
  recipientId: string
  message: string
  metadata?: Record<string, unknown>
  createdAt: string
  readAt?: string | null
}
