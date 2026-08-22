import { describe, it, expect } from 'vitest';
import { 
  validatePasswordStrength, 
  hashPassword, 
  verifyPassword, 
  canViewPrivateInfo, 
  canEditOrgFields, 
  canViewOrEditSalary, 
  sanitizeProfileForViewer 
} from '@/lib/auth';
import { getDbUserById } from '@/lib/db';
import { UserSession } from '@/lib/types';

describe('Module D, F, G & I: Sensitive Data Authorization & Security Tests', () => {
  const employeeSession: UserSession = {
    id: 'EMP-003',
    loginId: 'EMP-003',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'EMPLOYEE',
  };

  const otherEmployeeSession: UserSession = {
    id: 'EMP-004',
    loginId: 'EMP-004',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'EMPLOYEE',
  };

  const hrSession: UserSession = {
    id: 'EMP-002',
    loginId: 'EMP-002',
    name: 'Priya Sharma',
    email: 'hr@company.com',
    role: 'HR',
  };

  const adminSession: UserSession = {
    id: 'EMP-001',
    loginId: 'EMP-001',
    name: 'Alexander Wright',
    email: 'admin@company.com',
    role: 'ADMIN',
  };

  it('should strip privateInfo and bankDetails when another employee views profile', () => {
    const targetUserRecord = getDbUserById('EMP-003')!;
    
    const sanitized = sanitizeProfileForViewer(targetUserRecord, otherEmployeeSession);

    expect(sanitized.name).toBe('John Doe');
    expect(sanitized.designation).toBe('Senior Full Stack Engineer');

    expect(sanitized.privateInfo).toBeUndefined();
    expect(sanitized.bankDetails).toBeUndefined();
    expect(sanitized.salaryConfig).toBeUndefined();
    expect((sanitized as any).passwordHash).toBeUndefined();

    expect(sanitized.permissions?.isOwner).toBe(false);
    expect(sanitized.permissions?.canViewPrivate).toBe(false);
    expect(sanitized.permissions?.canViewSalary).toBe(false);
  });

  it('should include privateInfo and bankDetails for owner', () => {
    const targetUserRecord = getDbUserById('EMP-003')!;

    const sanitized = sanitizeProfileForViewer(targetUserRecord, employeeSession);

    expect(sanitized.privateInfo).toBeDefined();
    expect(sanitized.privateInfo?.residingAddress).toContain('Tech Park Residency');
    expect(sanitized.bankDetails).toBeDefined();
    expect(sanitized.bankDetails?.accountNumber).toBe('334001928475829');

    expect(sanitized.salaryConfig).toBeUndefined();
    expect(sanitized.permissions?.isOwner).toBe(true);
    expect(sanitized.permissions?.canViewSalary).toBe(false);
    expect(sanitized.permissions?.canEditOrg).toBe(false);
  });

  it('should allow HR and Admin full access including SalaryConfig', () => {
    const targetUserRecord = getDbUserById('EMP-003')!;

    const hrSanitized = sanitizeProfileForViewer(targetUserRecord, hrSession);
    expect(hrSanitized.privateInfo).toBeDefined();
    expect(hrSanitized.bankDetails).toBeDefined();
    expect(hrSanitized.salaryConfig).toBeDefined();
    expect(hrSanitized.salaryConfig?.monthlyWage).toBe(50000);
    expect(hrSanitized.permissions?.canViewSalary).toBe(true);
    expect(hrSanitized.permissions?.canEditOrg).toBe(true);

    const adminSanitized = sanitizeProfileForViewer(targetUserRecord, adminSession);
    expect(adminSanitized.salaryConfig).toBeDefined();
    expect(adminSanitized.permissions?.canViewSalary).toBe(true);
  });

  it('should enforce salary permission checks strictly', () => {
    expect(canViewOrEditSalary(employeeSession)).toBe(false);
    expect(canViewOrEditSalary(otherEmployeeSession)).toBe(false);
    expect(canViewOrEditSalary(hrSession)).toBe(true);
    expect(canViewOrEditSalary(adminSession)).toBe(true);
  });

  it('should enforce organization-managed field permissions strictly', () => {
    expect(canEditOrgFields(employeeSession)).toBe(false);
    expect(canEditOrgFields(otherEmployeeSession)).toBe(false);
    expect(canEditOrgFields(hrSession)).toBe(true);
    expect(canEditOrgFields(adminSession)).toBe(true);
  });

  it('should validate password complexity and hashing', () => {
    expect(validatePasswordStrength('short').isValid).toBe(false);
    expect(validatePasswordStrength('nouppercase1!').isValid).toBe(false);
    expect(validatePasswordStrength('NOLOWERCASE1!').isValid).toBe(false);
    expect(validatePasswordStrength('NoSpecial123').isValid).toBe(false);
    expect(validatePasswordStrength('NoNumbers!@#').isValid).toBe(false);

    expect(validatePasswordStrength('SecurePass123!').isValid).toBe(true);

    const hash = hashPassword('SecurePass123!');
    expect(hash).not.toBe('SecurePass123!');
    expect(verifyPassword('SecurePass123!', hash)).toBe(true);
    expect(verifyPassword('WrongPass!', hash)).toBe(false);
  });
});
