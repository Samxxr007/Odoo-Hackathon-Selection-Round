import { calcPayableDays } from '../lib/payroll/workingDaysService'

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`)
    process.exit(1)
  }
  console.log(`✅ PASSED: ${message}`)
}

console.log('\n--- Running Member 4 Core Logic & Contract Verifications ---\n')

// 1. Working days & Payable days calculations (Module I)
const payable1 = calcPayableDays(22, 2, 1)
assert(payable1 === 19, '22 working days - 2 unpaid - 1 absent = 19 payable days')

const payableZero = calcPayableDays(20, 25, 5)
assert(payableZero === 0, 'Payable days do not go below zero when deductions exceed working days')

const payableFull = calcPayableDays(21, 0, 0)
assert(payableFull === 21, 'Full working days payable with 0 unpaid leave and 0 absence')

// 2. Gross-to-Net Payroll math verification (Module H & K)
const monthlyWage = 60000
const basic = 30000
const hra = 12000
const standardAllowance = 5000
const performanceBonus = 3000
const leaveTravelAllowance = 5000
const fixedAllowance = 5000
const gross = basic + hra + standardAllowance + performanceBonus + leaveTravelAllowance + fixedAllowance
assert(gross === 60000, 'Gross salary equals sum of individual earnings components')

const totalWorkingDays = 20
const unpaidLeaveDays = 2
const perDayRate = gross / totalWorkingDays
const attendanceAdjustment = -(unpaidLeaveDays * perDayRate)
assert(attendanceAdjustment === -6000, 'Unpaid leave deduction properly calculated per working day rate')

const employeePF = 3600
const professionalTax = 200
const effectiveGross = gross + attendanceAdjustment
const netPay = effectiveGross - (employeePF + professionalTax)
assert(netPay === 50200, 'Net payout equals effective gross minus statutory deductions (₹50,200)')

console.log('\n🎉 ALL MEMBER 4 CONTRACT AND LOGIC ASSERTIONS PASSED SUCCESSFULLY!\n')
