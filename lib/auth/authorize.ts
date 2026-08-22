import { NextResponse } from 'next/server'
import type { AuthUser } from '@/types'
import { Role } from '@prisma/client'

// ─────────────────────────────────────────────
// Role checks
// ─────────────────────────────────────────────

export function isAdmin(user: AuthUser): boolean {
  return user.role === Role.ADMIN
}

export function isEmployee(user: AuthUser): boolean {
  return user.role === Role.EMPLOYEE
}

/**
 * Require a specific role. Returns a 403 response if not authorized.
 * Use in API route handlers.
 */
export function requireRole(
  user: AuthUser,
  allowedRoles: Role[]
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
 * Only Admin can manage employees.
 */
export function canManageEmployees(actor: AuthUser): boolean {
  return actor.role === Role.ADMIN
}

/**
 * Check if actor can view the full profile of a target user.
 * - Admins can view all profiles
 * - Employees can only view their own full profile
 */
export function canViewFullProfile(actor: AuthUser, targetUserId: string): boolean {
  if (actor.role === Role.ADMIN) return true
  return actor.id === targetUserId
}

/**
 * Check if actor can edit a target user's profile.
 * - Admins can edit any profile
 * - Employees can only edit their own profile (limited fields)
 */
export function canEditProfile(actor: AuthUser, targetUserId: string): boolean {
  if (actor.role === Role.ADMIN) return true
  return actor.id === targetUserId
}

/**
 * Check if actor can view salary/sensitive financial data.
 * Only Admin can access salary APIs.
 */
export function canViewSalary(actor: AuthUser, targetUserId: string): boolean {
  return actor.role === Role.ADMIN
}

/**
 * Check if actor can approve or reject leave requests.
 * Only Admin can approve leave.
 */
export function canApproveLeave(actor: AuthUser): boolean {
  return actor.role === Role.ADMIN
}

/**
 * Check if actor can modify attendance records.
 * Only Admin can modify another employee's attendance.
 */
export function canModifyAttendance(actor: AuthUser, targetUserId: string): boolean {
  if (actor.role === Role.ADMIN) return true
  // Employees can only modify their own check-in/check-out
  return actor.id === targetUserId
}

/**
 * Check if actor's company matches the target company.
 * Prevents cross-company data access.
 */
export function isSameCompany(actor: AuthUser, targetCompanyId: string): boolean {
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
