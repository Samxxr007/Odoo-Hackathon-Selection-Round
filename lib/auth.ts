import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';
import { Role } from './attendance/config';
import { AttendanceError } from './attendance/services';

export interface AuthSession {
  user: User;
  userId: string;
  role: Role;
}

/**
 * Server-side authentication and session extraction.
 * Reads session from cookie 'dayflow_user_id' or header 'x-user-id' / 'x-dev-user-id'.
 * If no session header or cookie exists, falls back to the default seeded Employee/Admin for demonstration.
 */
export async function getAuthSession(req: NextRequest): Promise<AuthSession | null> {
  // Check header or cookie
  const userIdHeader =
    req.headers.get('x-user-id') ||
    req.headers.get('x-dev-user-id') ||
    req.cookies.get('dayflow_user_id')?.value;

  let user: User | null = null;

  if (userIdHeader) {
    user = await prisma.user.findUnique({
      where: { id: userIdHeader },
    });
  }

  // Fallback to default active user if no explicit session header provided in dev
  if (!user) {
    const defaultUser = await prisma.user.findFirst({
      where: { role: 'EMPLOYEE' },
      orderBy: { createdAt: 'asc' },
    });
    user = defaultUser;
  }

  if (!user) return null;

  return {
    user,
    userId: user.id,
    role: user.role as Role,
  };
}

/**
 * Enforce Authentication
 */
export async function requireAuth(req: NextRequest): Promise<AuthSession> {
  const session = await getAuthSession(req);
  if (!session) {
    throw new AttendanceError('Authentication required.', 'UNAUTHORIZED', 401);
  }
  return session;
}

/**
 * Enforce Admin / HR Role Authorization
 */
export async function requireAdmin(req: NextRequest): Promise<AuthSession> {
  const session = await requireAuth(req);
  if (session.role !== 'ADMIN') {
    throw new AttendanceError(
      'Forbidden: Only Admin / HR users can access this resource.',
      'UNAUTHORIZED',
      403
    );
  }
  return session;
}

/**
 * Enforce Target Employee Ownership or Admin Permission
 */
export function verifyEmployeeOwnership(
  session: AuthSession,
  targetEmployeeId: string
) {
  if (session.role === 'ADMIN') return true;
  if (session.userId === targetEmployeeId) return true;

  throw new AttendanceError(
    'Forbidden: You do not have permission to access another employee\'s attendance data.',
    'UNAUTHORIZED',
    403
  );
}
