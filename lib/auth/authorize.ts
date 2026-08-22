import { NextResponse } from 'next/server'
import type { AuthUser } from '@/types'

export const Role = {
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
  HR: 'HR',
} as const

export type RoleType = 'ADMIN' | 'EMPLOYEE' | 'HR'

// ─────────────────────────────────────────────
// Role checks
// ─────────────────────────────────────────────

export function isAdmin(user: AuthUser): boolean {
  return user.role === 'ADMIN' || user.role === 'HR'
}

export function isEmployee(user: AuthUser): boolean {
  return user.role === 'EMPLOYEE'
}

/**
 * Require a specific role. Returns a 403 response if not authorized.
 * Use in API route handlers.
 */
export function requireRole(
  user: AuthUser,
  allowedRoles: string[]
): NextResponse | null {
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Insufficient permissions' },
      { status: 403 }
    )
  }
  return null
}

/**
 * Check if the actor can manage (create/edit/delete) an employee.
 * Only Admin/HR can manage employees.
 */
export function canManageEmployees(actor: AuthUser): boolean {
  return actor.role === 'ADMIN' || actor.role === 'HR'
}

/**
 * Check if actor can view the full profile of a target user.
 * - Admins/HR can view all profiles
 * - Employees can only view their own full profile
 */
export function canViewFullProfile(actor: AuthUser, targetUserId: string): boolean {
  if (actor.role === 'ADMIN' || actor.role === 'HR') return true
  return actor.id === targetUserId
}

/**
 * Check if actor can edit a target user's profile.
 * - Admins/HR can edit any profile
 * - Employees can only edit their own profile (limited fields)
 */
export function canEditProfile(actor: AuthUser, targetUserId: string): boolean {
  if (actor.role === 'ADMIN' || actor.role === 'HR') return true
  return actor.id === targetUserId
}

/**
 * Check if actor can view salary/sensitive financial data.
 * Admin/HR can access salary APIs.
 */
export function canViewSalary(actor: AuthUser, targetUserId: string): boolean {
  if (actor.role === 'ADMIN' || actor.role === 'HR') return true
  return actor.id === targetUserId
}

/**
 * Check if actor can approve or reject leave requests.
 * Admin/HR can approve leave.
 */
export function canApproveLeave(actor: AuthUser): boolean {
  return actor.role === 'ADMIN' || actor.role === 'HR'
}

/**
 * Check if actor can modify attendance records.
 * Admin/HR can modify another employee's attendance.
 */
export function canModifyAttendance(actor: AuthUser, targetUserId: string): boolean {
  if (actor.role === 'ADMIN' || actor.role === 'HR') return true
  // Employees can only modify their own check-in/check-out
  return actor.id === targetUserId
}

/**
 * Check if actor's company matches the target company or target user.
 * Prevents cross-company data access.
 */
export function isSameCompany(actor: AuthUser, target: string | { companyId: string }): boolean {
  const targetCompanyId = typeof target === 'string' ? target : target.companyId
  return actor.companyId === targetCompanyId
}

/**
 * Build a forbidden response
 */
export function forbidden(message = 'Forbidden'): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status: 403 })
}

/**
 * Build an unauthorized response
 */
export function unauthorized(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status: 401 })
}
