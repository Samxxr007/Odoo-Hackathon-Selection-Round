import { NextRequest } from 'next/server';
import { UserSession, UserRole, EmployeeProfile } from './types';
import { getDbUserById, simpleHash, DbUserRecord } from './db';

// -------------------------------------------------------------
// Member 2: Profile, Salary & Password Security Authorization
// -------------------------------------------------------------

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
