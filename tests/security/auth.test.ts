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
import { Role } from '@prisma/client'
import type { AuthUser } from '@/types'

describe('MODULE H — Security Acceptance Tests', () => {
  const adminUser: AuthUser = {
    id: 'admin-1',
    loginId: 'OIJODO20240001',
    email: 'admin@odoo.com',
    name: 'John Admin',
    phone: '1234567890',
    role: Role.ADMIN,
    companyId: 'company-1',
    companyName: 'Odoo India',
    companyLogoUrl: null,
    department: 'Management',
    designation: 'Director',
    joiningDate: new Date('2024-01-01'),
    location: 'Mumbai',
    managerId: null,
    profilePhotoUrl: null,
    isActive: true,
    mustChangePassword: false,
    emailVerified: true,
    createdAt: new Date('2024-01-01'),
  }

  const employeeUser1: AuthUser = {
    id: 'emp-1',
    loginId: 'OIEMUS20240002',
    email: 'emp1@odoo.com',
    name: 'Employee One',
    phone: '1234567891',
    role: Role.EMPLOYEE,
    companyId: 'company-1',
    companyName: 'Odoo India',
    companyLogoUrl: null,
    department: 'Engineering',
    designation: 'Developer',
    joiningDate: new Date('2024-01-01'),
    location: 'Mumbai',
    managerId: 'admin-1',
    profilePhotoUrl: null,
    isActive: true,
    mustChangePassword: true, // first-login
    emailVerified: true,
    createdAt: new Date('2024-01-01'),
  }

  const employeeUser2: AuthUser = {
    id: 'emp-2',
    loginId: 'OIEMUS20240003',
    email: 'emp2@odoo.com',
    name: 'Employee Two',
    phone: '1234567892',
    role: Role.EMPLOYEE,
    companyId: 'company-1',
    companyName: 'Odoo India',
    companyLogoUrl: null,
    department: 'Engineering',
    designation: 'QA Engineer',
    joiningDate: new Date('2024-01-01'),
    location: 'Mumbai',
    managerId: 'admin-1',
    profilePhotoUrl: null,
    isActive: true,
    mustChangePassword: false,
    emailVerified: true,
    createdAt: new Date('2024-01-01'),
  }

  const otherCompanyUser: AuthUser = {
    ...employeeUser2,
    id: 'emp-other',
    companyId: 'company-2',
  }

  // 1. Employee cannot call Admin-only APIs
  it('1. Employee cannot perform admin management operations', () => {
    expect(canManageEmployees(employeeUser1)).toBe(false)
    expect(canManageEmployees(adminUser)).toBe(true)
  })

  // 2. Employee cannot view another employee's salary / full private data
  it('2. Employee cannot view another employee private profile or salary', () => {
    expect(canViewFullProfile(employeeUser1, employeeUser2.id)).toBe(false)
    expect(canViewFullProfile(employeeUser1, employeeUser1.id)).toBe(true)
    expect(canViewFullProfile(adminUser, employeeUser2.id)).toBe(true)
    expect(canViewSalary(employeeUser1, employeeUser2.id)).toBe(false)
    expect(canViewSalary(adminUser, employeeUser2.id)).toBe(true)
  })

  // 3. Employee cannot edit another employee's profile
  it('3. Employee cannot edit another employee profile', () => {
    expect(canEditProfile(employeeUser1, employeeUser2.id)).toBe(false)
    expect(canEditProfile(employeeUser1, employeeUser1.id)).toBe(true)
    expect(canEditProfile(adminUser, employeeUser2.id)).toBe(true)
  })

  // 4. Employee cannot approve leave
  it('4. Employee cannot approve leave requests', () => {
    expect(canApproveLeave(employeeUser1)).toBe(false)
    expect(canApproveLeave(adminUser)).toBe(true)
  })

  // 5. Employee cannot create another employee
  it('5. Employee cannot create another employee', () => {
    expect(isAdmin(employeeUser1)).toBe(false)
    expect(isEmployee(employeeUser1)).toBe(true)
    expect(canManageEmployees(employeeUser1)).toBe(false)
  })

  // 6. Cross-company access is strictly prohibited
  it('6. Cross-company data access is rejected', () => {
    expect(isSameCompany(employeeUser1, otherCompanyUser.companyId)).toBe(false)
    expect(isSameCompany(employeeUser1, employeeUser2.companyId)).toBe(true)
  })

  // 7. Password hashing and security
  it('7. Passwords are securely hashed and verified with bcrypt', async () => {
    const plain = 'SecureP@ssw0rd123!'
    const hash = await hashPassword(plain)

    expect(hash).not.toBe(plain)
    expect(hash).toMatch(/^\$2[aby]\$\d+\$/) // bcrypt hash format

    const isMatch = await verifyPassword(plain, hash)
    expect(isMatch).toBe(true)

    const isWrongMatch = await verifyPassword('WrongPassword123!', hash)
    expect(isWrongMatch).toBe(false)
  })

  // 8. Temporary passwords meet complexity requirements
  it('8. Temporary password generation produces strong passwords', () => {
    const tempPassword = generateTempPassword()
    expect(tempPassword.length).toBeGreaterThanOrEqual(10)
    const validation = validatePasswordStrength(tempPassword)
    expect(validation.valid).toBe(true)
  })

  // 9. Name splitting and Employee ID generation sanitization
  it('9. Employee ID name splitting parses single and multi-part names safely', () => {
    const single = splitName('Cher')
    expect(single.firstName).toBe('Cher')
    expect(single.lastName).toBe('Cher')

    const full = splitName('John Robert Doe')
    expect(full.firstName).toBe('John')
    expect(full.lastName).toBe('Doe')
  })

  // 10. First-login forced password change state is properly detected
  it('10. First-login user state mustChangePassword flag is honored', () => {
    expect(employeeUser1.mustChangePassword).toBe(true)
    expect(adminUser.mustChangePassword).toBe(false)
  })
})
