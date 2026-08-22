// ============================================================
// Shared Leave Types
// ============================================================

export type LeaveType = 'PAID_TIME_OFF' | 'SICK_LEAVE' | 'UNPAID_LEAVE'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  PAID_TIME_OFF: 'Paid Time Off',
  SICK_LEAVE: 'Sick Leave',
  UNPAID_LEAVE: 'Unpaid Leave',
}

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

export const LEAVE_STATUS_COLORS: Record<LeaveStatus, string> = {
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
}

export interface LeaveRequestDTO {
  id: string
  userId: string
  userName: string
  userEmail: string
  leaveType: LeaveType
  fromDate: string // ISO date string
  toDate: string   // ISO date string
  days: number
  status: LeaveStatus
  remarks?: string
  attachmentPath?: string
  attachmentName?: string
  requestedAt: string
  decidedById?: string
  decidedByName?: string
  decidedAt?: string
  rejectionReason?: string
}

export interface LeaveBalanceDTO {
  leaveType: LeaveType
  allocated: number
  consumed: number
  pending: number
  available: number
  year: number
}

export interface CalendarEventDTO {
  id: string
  date: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  title: string
  type: 'HOLIDAY' | LeaveType
  status?: LeaveStatus
  userId?: string
  days?: number
}

export interface NewLeaveRequestInput {
  leaveType: LeaveType
  fromDate: string
  toDate: string
  remarks?: string
}
