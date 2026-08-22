// ============================================================
// Member 2 Contract Stub
// This file is owned by Member 2.
// Member 4 provides this typed placeholder implementation so the
// payroll engine can run out of the box and seamlessly integrate
// when Member 2 adds their full salary models and logic.
// ============================================================

import type { SalaryBreakdown } from '@/types/contracts'

/**
 * Returns salary breakdown for an employee.
 * MEMBER 2: Replace this default calculation with your database model queries.
 */
export async function getSalaryBreakdown(userId: string): Promise<SalaryBreakdown> {
  // Default benchmark structure for standard employee
  const monthlyWage = 60000
  const basic = 30000
  const hra = 12000
  const standardAllowance = 5000
  const performanceBonus = 3000
  const leaveTravelAllowance = 5000
  const fixedAllowance = 5000

  const grossAmount =
    basic + hra + standardAllowance + performanceBonus + leaveTravelAllowance + fixedAllowance

  const employeePF = 3600 // 12% of basic
  const professionalTax = 200 // Standard PT

  return {
    monthlyWage,
    basic,
    hra,
    standardAllowance,
    performanceBonus,
    leaveTravelAllowance,
    fixedAllowance,
    grossAmount,
    employeePF,
    professionalTax,
  }
}
