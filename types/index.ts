// ─────────────────────────────────────────────────────────────────────────────
// Shared type contracts for all modules
// DO NOT delete or modify another member's types.
// You may ADD types to this file.
// ─────────────────────────────────────────────────────────────────────────────

import { Role, AttendanceStatusType } from '@prisma/client'

export { Role, AttendanceStatusType }

// ─────────────────────────────────────────────
// Auth & Session
// ─────────────────────────────────────────────

/**
 * Safe user object — never contains passwordHash
 */
export interface AuthUser {
  id: string
  loginId: string
  email: string
  name: string
  phone: string | null
  role: Role
  companyId: string
  companyName: string
  companyLogoUrl: string | null
  department: string | null
  designation: string | null
  joiningDate: Date | null
  location: string | null
  managerId: string | null
  profilePhotoUrl: string | null
  isActive: boolean
  mustChangePassword: boolean
  emailVerified: boolean
  createdAt: Date
}

export interface SessionPayload {
  sessionId: string
  userId: string
  role: Role
  companyId: string
  iat: number
  exp: number
}

// ─────────────────────────────────────────────
// Employee
// ─────────────────────────────────────────────

/**
 * Public employee summary visible to all authenticated users
 */
export interface EmployeeSummary {
  id: string
  name: string
  loginId: string
  email: string
  phone: string | null
  role: Role
  companyId: string
  department: string | null
  designation: string | null
  joiningDate: Date | null
  location: string | null
  managerId: string | null
  managerName: string | null
  profilePhotoUrl: string | null
  isActive: boolean
  todayStatus?: EmployeeDailyStatus
}

/**
 * Full profile — only visible to the employee themselves or Admin
 */
export interface EmployeeFullProfile extends EmployeeSummary {
  emailVerified: boolean
  mustChangePassword: boolean
  createdAt: Date
  updatedAt: Date
}

// ─────────────────────────────────────────────
// Attendance Status Contract (owned by Member 3)
// ─────────────────────────────────────────────

export interface EmployeeDailyStatus {
  userId: string
  date: string // ISO date string YYYY-MM-DD
  status: AttendanceStatusType
  checkIn: string | null   // ISO datetime
  checkOut: string | null  // ISO datetime
  isHalfDay: boolean
}

// ─────────────────────────────────────────────
// Leave Contract (owned by Member 4)
// ─────────────────────────────────────────────

export interface PendingLeaveCount {
  companyId: string
  count: number
}

export interface LeaveBalanceSummary {
  userId: string
  annual: number
  sick: number
  unpaid: number
  used: number
  remaining: number
}

// ─────────────────────────────────────────────
// Dashboard Summary
// ─────────────────────────────────────────────

export interface AdminDashboardSummary {
  totalEmployees: number
  presentToday: number
  onLeaveToday: number
  absentToday: number
  pendingLeaveRequests: number
}

export interface EmployeeDashboardSummary {
  todayStatus: EmployeeDailyStatus
  leaveBalance: LeaveBalanceSummary
  pendingLeaveRequests: number
  latestNotification: NotificationSummary | null
}

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

export interface NotificationSummary {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: Date
}

// ─────────────────────────────────────────────
// API Responses
// ─────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
  code?: string
  fieldErrors?: Record<string, string[]>
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─────────────────────────────────────────────
// Employee Creation
// ─────────────────────────────────────────────

export interface CreateEmployeeInput {
  name: string
  email: string
  phone?: string
  department: string
  designation: string
  joiningDate: string // ISO date
  location?: string
  managerId?: string
  profilePhotoUrl?: string
}

export interface CreateEmployeeResult {
  employee: EmployeeSummary
  loginId: string
  tempPassword: string // only returned once in creation response
}
