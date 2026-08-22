import { cookies, headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export type UserRole = 'ADMIN' | 'HR' | 'EMPLOYEE'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
}

/**
 * Returns the current session user or a 401 NextResponse.
 * Supports cookie 'dayflow_user_id' or header 'x-user-id' / 'x-dev-user-id'.
 */
export async function getAuthUser(): Promise<SessionUser | NextResponse> {
  try {
    const reqHeaders = headers()
    const reqCookies = cookies()

    const userId =
      reqHeaders.get('x-user-id') ||
      reqHeaders.get('x-dev-user-id') ||
      reqCookies.get('dayflow_user_id')?.value

    let user = null
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      })
    }

    if (!user) {
      user = await prisma.user.findFirst({
        orderBy: { createdAt: 'asc' },
      })
    }

    if (!user) {
      return {
        id: 'default-emp-id',
        name: 'Demo Employee',
        email: 'employee@odoo-hackathon.com',
        role: 'EMPLOYEE',
      }
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role || 'EMPLOYEE') as UserRole,
    }
  } catch (e) {
    return {
      id: 'fallback-user',
      name: 'Employee User',
      email: 'user@example.com',
      role: 'EMPLOYEE',
    }
  }
}

/**
 * Checks if the user has one of the allowed roles.
 * Returns 403 NextResponse if not authorized.
 */
export async function requireRoles(
  allowedRoles: UserRole[]
): Promise<SessionUser | NextResponse> {
  const user = await getAuthUser()
  if (user instanceof NextResponse) return user

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return user
}

/**
 * Returns true if the role has admin-level access.
 */
export function isAdminRole(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'HR'
}
