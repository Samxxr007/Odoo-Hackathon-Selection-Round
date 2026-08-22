import { prisma } from '@/lib/prisma'
import { getWorkingDaysInMonth, getApprovedLeaveSplit, calcPayableDays } from './workingDaysService'
import type { SalaryBreakdown, PayableDaysResult } from '@/types/contracts'

import { getSalaryBreakdown } from '@/lib/salary/salaryService'
import { getPayableDays } from '@/lib/attendance/attendanceService'

// ─── Payroll Validation ───────────────────────────────────────────────────────

export interface PayrollValidationResult {
  valid: boolean
  errors: string[]
}

export async function validatePayroll(
  userId: string,
  month: number,
  year: number
): Promise<PayrollValidationResult> {
  const errors: string[] = []

  // Check user exists
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    errors.push('Employee not found.')
    return { valid: false, errors }
  }

  // Check salary structure
  const salary = await getSalaryBreakdown(userId)
  if (!salary || salary.grossAmount < 0) {
    errors.push('Invalid or missing salary structure.')
  }
  if (salary.grossAmount === 0) {
    errors.push('Salary structure has zero gross amount.')
  }

  // Check month/year bounds
  if (month < 1 || month > 12) {
    errors.push('Invalid month. Must be 1–12.')
  }
  if (year < 2000 || year > 2100) {
    errors.push('Invalid year.')
  }

  // Check payable days
  const payableDaysResult = await getPayableDays(userId, month, year)
  if (payableDaysResult.payableDays < 0) {
    errors.push('Payable days cannot be negative.')
  }

  // Zero payable days case
  if (payableDaysResult.payableDays === 0) {
    errors.push('Employee has zero payable days for this period.')
  }

  // Prevent negative net salary
  const perDayRate = salary.grossAmount / payableDaysResult.totalWorkingDays
  const grossForPeriod = perDayRate * payableDaysResult.payableDays
  const deductions = salary.employeePF + salary.professionalTax
  const netPay = grossForPeriod - deductions

  if (netPay < 0) {
    errors.push('Computed net salary is negative. Please verify deductions and payable days.')
  }

  return { valid: errors.length === 0, errors }
}

// ─── Payslip Generation ───────────────────────────────────────────────────────

export interface PayslipData {
  userId: string
  userName: string
  userEmail: string
  payPeriod: string
  month: number
  year: number
  // Earnings
  monthlyWage: number
  basic: number
  hra: number
  standardAllowance: number
  performanceBonus: number
  leaveTravelAllowance: number
  fixedAllowance: number
  grossAmount: number
  // Deductions
  employeePF: number
  professionalTax: number
  // Attendance
  totalWorkingDays: number
  payableDays: number
  paidLeaveDays: number
  unpaidLeaveDays: number
  absentDays: number
  attendanceAdjustment: number
  adjustmentNote: string
  // Final
  netPay: number
}

export async function generatePayslip(
  userId: string,
  month: number,
  year: number
): Promise<PayslipData> {
  // Validate first
  const validation = await validatePayroll(userId, month, year)
  if (!validation.valid) {
    throw new Error(`Payroll validation failed: ${validation.errors.join('; ')}`)
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, email: true },
  })

  const [salary, payableDaysResult] = await Promise.all([
    getSalaryBreakdown(userId),
    getPayableDays(userId, month, year),
  ])

  const { totalWorkingDays, payableDays } = payableDaysResult

  // Per-day rate based on total working days
  const perDayRate = totalWorkingDays > 0 ? salary.grossAmount / totalWorkingDays : 0
  const unpaidDeduction = payableDaysResult.unpaidLeaveDays * perDayRate
  const absentDeduction = payableDaysResult.absentDays * perDayRate
  const attendanceAdjustment = -(unpaidDeduction + absentDeduction)

  const effectiveGross = salary.grossAmount + attendanceAdjustment
  const totalDeductions = salary.employeePF + salary.professionalTax
  const netPay = Math.max(0, effectiveGross - totalDeductions)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  return {
    userId,
    userName: user.name,
    userEmail: user.email,
    payPeriod: `${monthNames[month - 1]} ${year}`,
    month,
    year,
    monthlyWage: salary.monthlyWage,
    basic: salary.basic,
    hra: salary.hra,
    standardAllowance: salary.standardAllowance,
    performanceBonus: salary.performanceBonus,
    leaveTravelAllowance: salary.leaveTravelAllowance,
    fixedAllowance: salary.fixedAllowance,
    grossAmount: salary.grossAmount,
    employeePF: salary.employeePF,
    professionalTax: salary.professionalTax,
    totalWorkingDays,
    payableDays,
    paidLeaveDays: payableDaysResult.paidLeaveDays,
    unpaidLeaveDays: payableDaysResult.unpaidLeaveDays,
    absentDays: payableDaysResult.absentDays,
    attendanceAdjustment,
    adjustmentNote: payableDaysResult.adjustmentNote,
    netPay,
  }
}

export interface AdminPayrollRow extends PayslipData {
  leaveDeduction: number
}

export async function getAdminPayroll(
  month: number,
  year: number
): Promise<{ rows: AdminPayrollRow[]; errors: { userId: string; name: string; errors: string[] }[] }> {
  const employees = await prisma.user.findMany({
    where: { isActive: true, role: 'EMPLOYEE' },
    select: { id: true, name: true, email: true },
  })

  const rows: AdminPayrollRow[] = []
  const errors: { userId: string; name: string; errors: string[] }[] = []

  await Promise.all(
    employees.map(async (emp) => {
      try {
        const validation = await validatePayroll(emp.id, month, year)
        if (!validation.valid) {
          errors.push({ userId: emp.id, name: emp.name, errors: validation.errors })
          return
        }
        const payslip = await generatePayslip(emp.id, month, year)
        rows.push({
          ...payslip,
          leaveDeduction: Math.abs(payslip.attendanceAdjustment),
        })
      } catch (err: any) {
        errors.push({ userId: emp.id, name: emp.name, errors: [err.message] })
      }
    })
  )

  return { rows, errors }
}
