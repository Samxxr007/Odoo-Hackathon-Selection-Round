// ============================================================
// Cross-Module Typed Contracts
// Member 4 defines these interfaces. Members 2 and 3 implement
// the function bodies in their own service files.
// ============================================================

import type { LeaveType } from './leave'

// ─── Member 2 Contract ────────────────────────────────────────

/**
 * Salary structure for a given employee.
 * Member 2 implements: lib/payroll/salaryService.ts → getSalaryBreakdown(userId)
 */
export interface SalaryBreakdown {
  /** Total monthly CTC / wage */
  monthlyWage: number
  /** Basic salary component */
  basic: number
  /** House Rent Allowance */
  hra: number
  /** Standard / conveyance allowance */
  standardAllowance: number
  /** Performance bonus (monthly portion) */
  performanceBonus: number
  /** Leave Travel Allowance */
  leaveTravelAllowance: number
  /** Fixed allowance / special allowance */
  fixedAllowance: number
  /** Sum of all gross components */
  grossAmount: number
  /** Employee share of Provident Fund deduction */
  employeePF: number
  /** Professional Tax deduction */
  professionalTax: number
}

/**
 * Fetches the salary breakdown for a given employee.
 * @param userId - The employee's user ID (cuid)
 * @returns SalaryBreakdown or throws if no salary structure found
 *
 * MEMBER 2: Implement this function in lib/payroll/salaryService.ts
 * and export it. Member 4 imports it at runtime.
 */
export type GetSalaryBreakdownFn = (userId: string) => Promise<SalaryBreakdown>

// ─── Member 3 Contract ────────────────────────────────────────

/**
 * Payable days calculation result for a given employee and month.
 * Member 3 implements: lib/attendance/attendanceService.ts → getPayableDays(userId, month, year)
 */
export interface PayableDaysResult {
  /** Total working days in the month (excl. weekends + public holidays) */
  totalWorkingDays: number
  /** Days the employee was marked present */
  presentDays: number
  /** Days on approved PAID leave (do not reduce payable days) */
  paidLeaveDays: number
  /** Days on approved UNPAID leave (reduce payable days) */
  unpaidLeaveDays: number
  /** Working days with no attendance record and no approved leave */
  absentDays: number
  /** Final payable days = totalWorkingDays - unpaidLeaveDays - absentDays */
  payableDays: number
  /** Human-readable explanation of the adjustment */
  adjustmentNote: string
}

/**
 * Calculates payable days for an employee in a given month.
 * @param userId - The employee's user ID (cuid)
 * @param month - 1-indexed month (1 = January, 12 = December)
 * @param year - Full 4-digit year
 * @returns PayableDaysResult or throws if data unavailable
 *
 * MEMBER 3: Implement this function in lib/attendance/attendanceService.ts
 * and export it. Member 4 imports it at runtime.
 */
export type GetPayableDaysFn = (
  userId: string,
  month: number,
  year: number
) => Promise<PayableDaysResult>

// ─── Member 4 Contract (exposed to Member 3) ──────────────────

/**
 * Result of checking whether a user is on approved leave on a given date.
 * Used by Member 3 to determine attendance status.
 */
export interface ApprovedLeaveResult {
  /** True if the employee has an APPROVED leave request covering this date */
  isOnLeave: boolean
  /** The leave type, if on leave */
  leaveType?: LeaveType
  /** The leave request ID, if on leave */
  leaveRequestId?: string
}

/**
 * Checks if a user is on approved leave on a specific date.
 *
 * USAGE (Member 3):
 *   import { getApprovedLeaveForDate } from '@/lib/leave/leaveService'
 *   const result = await getApprovedLeaveForDate(userId, date)
 *   if (result.isOnLeave) { ... }
 *
 * Do NOT query LeaveRequest directly — use this function.
 */
export type GetApprovedLeaveForDateFn = (
  userId: string,
  date: Date
) => Promise<ApprovedLeaveResult>
