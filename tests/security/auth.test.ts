import { describe, it, expect, vi } from 'vitest'
import {
  isAdmin,
  isEmployee,
  canManageEmployees,
  canViewFullProfile,
  canEditProfile,
  canViewSalary,
  canApproveLeave,
  canModifyAttendance,
  isSameCompany,
} from '@/lib/auth/authorize'
import { hashPassword, verifyPassword, generateTempPassword, validatePasswordStrength } from '@/lib/auth/password'
import { splitName } from '@/lib/auth/employee-id'
import type { AuthUser } from '@/types'

const Role = {
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
  HR: 'HR',
} as const

describe('MODULE H — Security Acceptance Tests', () => {
  const adminUser: AuthUser = {
    id: 'admin-1',
    loginId: 'OIJODO20240001',
    email: 'admin@odoo.com',
    name: 'John Admin',
    phone: '1234567890',
    role: Role.ADMIN as any,
    companyId: 'company-1',
    companyName: 'Odoo India',
    companyLogoUrl: null,
    department: 'Management',
    designation: 'Director',
  }

  const hrUser: AuthUser = {
    id: 'hr-1',
    loginId: 'OIJODO20240002',
    email: 'hr@odoo.com',
    name: 'Jane HR',
    phone: '0987654321',
    role: Role.HR as any,
    companyId: 'company-1',
    companyName: 'Odoo India',
    companyLogoUrl: null,
    department: 'Human Resources',
    designation: 'HR Manager',
  }

  const employeeUser: AuthUser = {
    id: 'emp-1',
    loginId: 'OIJODO20240003',
    email: 'emp@odoo.com',
    name: 'Bob Employee',
    phone: '1122334455',
    role: Role.EMPLOYEE as any,
    companyId: 'company-1',
    companyName: 'Odoo India',
    companyLogoUrl: null,
    department: 'Engineering',
    designation: 'Developer',
  }

  const otherCompanyEmp: AuthUser = {
    ...employeeUser,
    id: 'emp-other',
    companyId: 'company-other',
  }

  describe('1. Role Authorization Checks', () => {
    it('isAdmin should identify ADMIN and HR correctly', () => {
      expect(isAdmin(adminUser)).toBe(true)
      expect(isAdmin(hrUser)).toBe(true)
      expect(isAdmin(employeeUser)).toBe(false)
    })

    it('isEmployee should identify regular employees', () => {
      expect(isEmployee(employeeUser)).toBe(true)
      expect(isEmployee(adminUser)).toBe(false)
      expect(isEmployee(hrUser)).toBe(false)
    })

    it('canManageEmployees permissions', () => {
      expect(canManageEmployees(adminUser)).toBe(true)
      expect(canManageEmployees(hrUser)).toBe(true)
      expect(canManageEmployees(employeeUser)).toBe(false)
    })

    it('canViewFullProfile permissions (own vs other profile)', () => {
      // Admin/HR can view anyone's profile in same company
      expect(canViewFullProfile(adminUser, employeeUser.id)).toBe(true)
      expect(canViewFullProfile(hrUser, employeeUser.id)).toBe(true)

      // Employee can view own profile
      expect(canViewFullProfile(employeeUser, employeeUser.id)).toBe(true)

      // Employee CANNOT view another employee's full private profile
      expect(canViewFullProfile(employeeUser, 'other-id')).toBe(false)
    })

    it('canEditProfile permissions', () => {
      // Admin/HR can edit any profile
      expect(canEditProfile(adminUser, employeeUser.id)).toBe(true)

      // Employee can edit own editable profile fields
      expect(canEditProfile(employeeUser, employeeUser.id)).toBe(true)

      // Employee CANNOT edit another employee's profile
      expect(canEditProfile(employeeUser, 'other-id')).toBe(false)
    })

    it('canViewSalary permissions (strict zero-leak rule)', () => {
      // Admin/HR can view salary
      expect(canViewSalary(adminUser, employeeUser.id)).toBe(true)
      expect(canViewSalary(hrUser, employeeUser.id)).toBe(true)

      // Employee CAN view own salary
      expect(canViewSalary(employeeUser, employeeUser.id)).toBe(true)

      // Employee CANNOT view other's salary under any condition
      expect(canViewSalary(employeeUser, 'other-id')).toBe(false)
    })

    it('canApproveLeave permissions', () => {
      expect(canApproveLeave(adminUser)).toBe(true)
      expect(canApproveLeave(hrUser)).toBe(true)
      expect(canApproveLeave(employeeUser)).toBe(false)
    })

    it('canModifyAttendance permissions', () => {
      expect(canModifyAttendance(adminUser)).toBe(true)
      expect(canModifyAttendance(hrUser)).toBe(true)
      expect(canModifyAttendance(employeeUser)).toBe(false)
    })

    it('isSameCompany checks multi-tenant boundaries', () => {
      expect(isSameCompany(adminUser, employeeUser)).toBe(true)
      expect(isSameCompany(employeeUser, otherCompanyEmp)).toBe(false)
    })
  })

  describe('2. Password Security & Hashing Engine', () => {
    it('should correctly hash and verify passwords with bcrypt', async () => {
      const plain = 'SecureP@ss123'
      const hashed = await hashPassword(plain)

      expect(hashed).not.toBe(plain)
      expect(hashed.length).toBeGreaterThan(20)

      const isMatch = await verifyPassword(plain, hashed)
      expect(isMatch).toBe(true)

      const isWrongMatch = await verifyPassword('WrongPassword', hashed)
      expect(isWrongMatch).toBe(false)
    })

    it('should generate valid temporary passwords', () => {
      const tempPass = generateTempPassword(12)
      expect(tempPass.length).toBe(12)

      const strength = validatePasswordStrength(tempPass)
      expect(strength.valid).toBe(true)
    })

    it('should enforce password strength validation rules', () => {
      // Weak passwords
      expect(validatePasswordStrength('short').valid).toBe(false)
      expect(validatePasswordStrength('alllowercase1').valid).toBe(false)
      expect(validatePasswordStrength('ALLUPPERCASE1').valid).toBe(false)
      expect(validatePasswordStrength('NoSpecialChar123').valid).toBe(false)

      // Strong password
      const strong = validatePasswordStrength('StrongP@ssw0rd!')
      expect(strong.valid).toBe(true)
      expect(strong.score).toBeGreaterThanOrEqual(4)
    })
  })

  describe('3. Employee Identity Helper (splitName)', () => {
    it('should split full names correctly into first and last name', () => {
      expect(splitName('John Admin')).toEqual({ firstName: 'John', lastName: 'Admin' })
      expect(splitName('SingleName')).toEqual({ firstName: 'SingleName', lastName: '' })
      expect(splitName('John Michael Smith')).toEqual({ firstName: 'John Michael', lastName: 'Smith' })
    })
  })
})
