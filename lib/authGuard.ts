import { cookies, headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export type UserRole = 'ADMIN' | 'HR' | 'EMPLOYEE'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
}

/**
 * Returns the current authenticated user from session or 401 NextResponse.
 */
export async function getAuthUser(): Promise<SessionUser | NextResponse> {
  try {
    const reqHeaders = await headers()
    const reqCookies = await cookies()

    // 1. Check primary JWT session cookie
    const sessionData = await getSession()
    if (sessionData && sessionData.session) {
      const user = await prisma.user.findUnique({
        where: { id: sessionData.session.userId },
      })
      if (user && user.isActive) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user.role || 'EMPLOYEE') as UserRole,
        }
      }
    }

    // 2. Check explicit header / test cookie fallback
    const userId =
      reqHeaders.get('x-user-id') ||
      reqHeaders.get('x-dev-user-id') ||
      reqCookies.get('dayflow_user_id')?.value

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })
      if (user && user.isActive) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user.role || 'EMPLOYEE') as UserRole,
        }
      }
    }

    return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 })
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
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
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 })
  }
  return user
}

/**
 * Returns true if the role has admin-level access.
 */
export function isAdminRole(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'HR'
}
