// ============================================================
// Member 3 Contract Stub
// This file is owned by Member 3.
// Member 4 provides this typed placeholder implementation so the
// payroll engine can run out of the box and seamlessly integrate
// when Member 3 adds their full biometric/attendance models and logic.
//
// NOTE: Member 3 uses getApprovedLeaveForDate from '@/lib/leave/leaveService'
// to check approved leave for each date rather than querying LeaveRequest directly.
// ============================================================

import type { PayableDaysResult } from '@/types/contracts'
import { getWorkingDaysInMonth, getApprovedLeaveSplit, calcPayableDays } from '@/lib/payroll/workingDaysService'

/**
 * Returns payable days for an employee in a given month/year.
 * MEMBER 3: Replace or extend this with your attendance punch log analysis.
 */
export async function getPayableDays(
  userId: string,
  month: number,
  year: number
): Promise<PayableDaysResult> {
  const totalWorkingDays = await getWorkingDaysInMonth(month, year)
  const { paidDays, unpaidDays } = await getApprovedLeaveSplit(userId, month, year)
  const absentDays = 0 // Member 3 calculates missing punches / unapproved absences

  const payableDays = calcPayableDays(totalWorkingDays, unpaidDays, absentDays)

  return {
    totalWorkingDays,
    presentDays: payableDays - paidDays,
    paidLeaveDays: paidDays,
    unpaidLeaveDays: unpaidDays,
    absentDays,
    payableDays,
    adjustmentNote: `${totalWorkingDays} working days. Paid leave: ${paidDays}d (included). Unpaid leave: ${unpaidDays}d (deducted). Absent: ${absentDays}d.`,
  }
}
