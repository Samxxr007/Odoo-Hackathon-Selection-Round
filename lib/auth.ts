import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserSession, UserRole, EmployeeProfile } from '@/lib/types';
import { getDbUserById, DbUserRecord } from '@/lib/db';

// ─────────────────────────────────────────────
// Shared Types
// ─────────────────────────────────────────────

export type Role = 'EMPLOYEE' | 'ADMIN' | 'HR';

export class AttendanceError extends Error {
  code: string;
  status: number;
  constructor(message: string, code = 'ERROR', status = 400) {
    super(message);
    this.name = 'AttendanceError';
    this.code = code;
    this.status = status;
  }
}

export interface AuthSession {
  user: User;
  userId: string;
  role: Role;
}

// ─────────────────────────────────────────────
// Member 4 — NextAuth Options
// ─────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          return {
            id: 'demo-user',
            name: credentials.email.split('@')[0],
            email: credentials.email,
            role: 'EMPLOYEE' as Role,
          };
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user.role || 'EMPLOYEE') as Role,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'secret-key-1234567890',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
      }
      return session;
    },
  },
};

// ─────────────────────────────────────────────
// Member 4 — Server-side Session Extraction
// ─────────────────────────────────────────────

export async function getAuthSession(req: NextRequest): Promise<AuthSession | null> {
  const userIdHeader =
    req.headers.get('x-user-id') ||
    req.headers.get('x-dev-user-id') ||
    req.cookies.get('dayflow_user_id')?.value;

  let user: User | null = null;

  if (userIdHeader) {
    user = await prisma.user.findUnique({ where: { id: userIdHeader } });
  }

  if (!user) {
    user = await prisma.user.findFirst({
      where: { role: 'EMPLOYEE' },
      orderBy: { createdAt: 'asc' },
    });
  }

  if (!user) return null;

  return { user, userId: user.id, role: user.role as Role };
}

export async function requireAuth(req: NextRequest): Promise<AuthSession> {
  const session = await getAuthSession(req);
  if (!session) throw new AttendanceError('Authentication required.', 'UNAUTHORIZED', 401);
  return session;
}

export async function requireAdmin(req: NextRequest): Promise<AuthSession> {
  const session = await requireAuth(req);
  if (session.role !== 'ADMIN') {
    throw new AttendanceError('Forbidden: Admin only.', 'UNAUTHORIZED', 403);
  }
  return session;
}

export function verifyEmployeeOwnership(session: AuthSession, targetEmployeeId: string) {
  if (session.role === 'ADMIN') return true;
  if (session.userId === targetEmployeeId) return true;
  throw new AttendanceError('Forbidden: Access denied.', 'UNAUTHORIZED', 403);
}

// ─────────────────────────────────────────────
// Member 2 — Password & Profile Security
// ─────────────────────────────────────────────

export function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  return { isValid: true };
}

export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `sha256_${Math.abs(hash).toString(16)}_${str.length}`;
}

export function hashPassword(password: string): string {
  return simpleHash(password);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return simpleHash(plain) === hash;
}

export function getCurrentSession(req?: Request): UserSession {
  let userId = 'EMP-003'; // Default to John Doe (Employee)
  let role: UserRole = 'EMPLOYEE';

  if (req) {
    const url = new URL(req.url);
    const queryUserId = url.searchParams.get('authUserId');
    const queryRole = url.searchParams.get('authRole') as UserRole;

    const headerUserId = req.headers.get('x-user-id');
    const headerRole = req.headers.get('x-user-role') as UserRole;

    const cookieHeader = req.headers.get('cookie') || '';
    const cookieMatchUser = cookieHeader.match(/odoo_user_id=([^;]+)/) || cookieHeader.match(/dayflow_user_id=([^;]+)/);
    const cookieMatchRole = cookieHeader.match(/odoo_user_role=([^;]+)/);

    if (queryUserId) {
      userId = queryUserId;
    } else if (headerUserId) {
      userId = headerUserId;
    } else if (cookieMatchUser) {
      userId = cookieMatchUser[1];
    }

    if (queryRole && ['ADMIN', 'HR', 'EMPLOYEE'].includes(queryRole)) {
      role = queryRole;
    } else if (headerRole && ['ADMIN', 'HR', 'EMPLOYEE'].includes(headerRole)) {
      role = headerRole;
    } else if (cookieMatchRole && ['ADMIN', 'HR', 'EMPLOYEE'].includes(cookieMatchRole[1])) {
      role = cookieMatchRole[1] as UserRole;
    }
  }

  const dbUser = getDbUserById(userId);
  if (dbUser) {
    return {
      id: dbUser.id,
      loginId: dbUser.loginId,
      name: dbUser.profile.name,
      email: dbUser.profile.email,
      role: role || dbUser.role,
      avatar: dbUser.profile.avatar,
      mustChangePassword: dbUser.mustChangePassword,
    };
  }

  return {
    id: userId,
    loginId: userId,
    name: 'Current User',
    email: 'user@company.com',
    role: role || 'EMPLOYEE',
    mustChangePassword: false,
  };
}

export function canViewPrivateInfo(currentUser: UserSession, targetUserId: string): boolean {
  if (currentUser.role === 'ADMIN' || currentUser.role === 'HR') return true;
  return currentUser.id === targetUserId;
}

export function canEditPersonalProfile(currentUser: UserSession, targetUserId: string): boolean {
  if (currentUser.role === 'ADMIN' || currentUser.role === 'HR') return true;
  return currentUser.id === targetUserId;
}

export function canEditOrgFields(currentUser: UserSession): boolean {
  return currentUser.role === 'ADMIN' || currentUser.role === 'HR';
}

export function canViewOrEditSalary(currentUser: UserSession): boolean {
  return currentUser.role === 'ADMIN' || currentUser.role === 'HR';
}

export function sanitizeProfileForViewer(
  dbUser: DbUserRecord,
  currentUser: UserSession
): EmployeeProfile {
  const isOwner = currentUser.id === dbUser.id;
  const isPrivileged = currentUser.role === 'ADMIN' || currentUser.role === 'HR';
  const isAuthorizedForPrivate = isOwner || isPrivileged;

  const permissions = {
    isOwner,
    canEditPersonal: isOwner || isPrivileged,
    canEditOrg: isPrivileged,
    canEditPrivate: isAuthorizedForPrivate,
    canViewPrivate: isAuthorizedForPrivate,
    canViewSalary: isPrivileged,
    canEditSalary: isPrivileged,
    canUploadAvatar: isOwner || isPrivileged,
    canManageDocs: isOwner || isPrivileged,
    canChangePassword: isOwner || isPrivileged,
  };

  const profile: EmployeeProfile = {
    ...JSON.parse(JSON.stringify(dbUser.profile)),
    permissions,
  };

  if (isAuthorizedForPrivate) {
    profile.privateInfo = JSON.parse(JSON.stringify(dbUser.privateInfo));
    profile.bankDetails = JSON.parse(JSON.stringify(dbUser.bankDetails));
  } else {
    profile.privateInfo = undefined;
    profile.bankDetails = undefined;
  }

  if (isPrivileged) {
    profile.salaryConfig = JSON.parse(JSON.stringify(dbUser.salaryConfig));
  } else {
    profile.salaryConfig = undefined;
  }

  return profile;
}
