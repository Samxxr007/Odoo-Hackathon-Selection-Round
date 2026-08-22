import { describe, it, expect } from 'vitest';
import { 
  calculateSalaryBreakdown, 
  recomputeAmount, 
  recomputePercentage, 
  roundMoney, 
  getSalaryBreakdown 
} from '@/lib/salary';

describe('Module F: Salary Calculation Engine & Contract Tests', () => {
  it('should accurately calculate the official worked example with Wage = Rs 50,000', () => {
    const breakdown = calculateSalaryBreakdown({
      monthlyWage: 50000,
      workingDaysPerWeek: 5,
      breakTimeMinutes: 60,
      standardAllowance: 0,
      basicPercentage: 50,
      hraPercentage: 50,
      bonusPercentage: 8.33,
      ltaPercentage: 8.33,
    });

    // 1. Basic Salary = 50% of Wage = Rs 25,000
    expect(breakdown.basicSalary).toBe(25000);

    // 2. HRA = 50% of Basic Salary = Rs 12,500
    expect(breakdown.hra).toBe(12500);

    // 3. Performance Bonus = 8.33% of Basic Salary = Rs 2,082.50
    expect(breakdown.performanceBonus).toBe(2082.5);

    // 4. Leave Travel Allowance = 8.33% of Basic Salary = Rs 2,082.50
    expect(breakdown.leaveTravelAllowance).toBe(2082.5);

    // 5. Fixed Allowance = 50,000 - (25,000 + 12,500 + 2,082.5 + 2,082.5) = Rs 8,335.00
    expect(breakdown.fixedAllowance).toBe(8335);

    // Total Earnings should match monthly wage
    expect(breakdown.totalEarnings).toBe(50000);

    // Yearly Wage = Monthly Wage * 12 = Rs 600,000
    expect(breakdown.yearlyWage).toBe(600000);

    // 6. PF contributions (12% of Basic)
    expect(breakdown.employeePf).toBe(3000); // 12% of 25,000
    expect(breakdown.employerPf).toBe(3000); // 12% of 25,000

    // 7. Professional Tax = Rs 200 / month
    expect(breakdown.professionalTax).toBe(200);

    // Total Deductions = Employee PF (3,000) + PT (200) = Rs 3,200
    expect(breakdown.totalDeductions).toBe(3200);

    // Net Take-Home Monthly = 50,000 - 3,200 = Rs 46,800
    expect(breakdown.netTakeHomeMonthly).toBe(46800);
    expect(breakdown.netTakeHomeYearly).toBe(561600); // 46,800 * 12

    // Total CTC Monthly = 50,000 + 3,000 = Rs 53,000
    expect(breakdown.totalCtcMonthly).toBe(53000);
    expect(breakdown.totalCtcYearly).toBe(636000); // 53,000 * 12

    expect(breakdown.isValid).toBe(true);
  });

  it('should handle decimal-safe rounding and custom standard allowance', () => {
    const breakdown = calculateSalaryBreakdown({
      monthlyWage: 75000,
      standardAllowance: 5000,
      basicPercentage: 50,
      hraPercentage: 50,
      bonusPercentage: 8.33,
      ltaPercentage: 8.33,
    });

    expect(breakdown.basicSalary).toBe(37500);
    expect(breakdown.hra).toBe(18750);
    expect(breakdown.standardAllowance).toBe(5000);
    expect(breakdown.performanceBonus).toBe(3123.75); // 37500 * 0.0833
    expect(breakdown.leaveTravelAllowance).toBe(3123.75);

    expect(breakdown.fixedAllowance).toBe(7502.5);
    expect(breakdown.totalEarnings).toBe(75000);
    expect(breakdown.employeePf).toBe(4500); // 12% of 37500
    expect(breakdown.netTakeHomeMonthly).toBe(75000 - (4500 + 200));
  });

  it('should invalidate configuration if total components exceed wage', () => {
    const breakdown = calculateSalaryBreakdown({
      monthlyWage: 10000,
      standardAllowance: 8000,
      basicPercentage: 50,
      hraPercentage: 50,
    });

    expect(breakdown.isValid).toBe(false);
    expect(breakdown.validationErrors?.length).toBeGreaterThan(0);
    expect(breakdown.fixedAllowance).toBe(0);
  });

  it('should sanitize negative, NaN and infinite inputs safely', () => {
    const breakdown = calculateSalaryBreakdown({
      monthlyWage: -50000 as any,
    });

    expect(breakdown.monthlyWage).toBe(0);
    expect(breakdown.basicSalary).toBe(0);
    expect(breakdown.fixedAllowance).toBe(0);
    expect(breakdown.isValid).toBe(false);
  });

  it('should support 2-way percentage and amount recomputations', () => {
    const baseWage = 100000;
    const basicAmount = 60000;
    const computedPercentage = recomputePercentage(basicAmount, baseWage);
    expect(computedPercentage).toBe(60);

    const recomputedAmount = recomputeAmount(60, baseWage);
    expect(recomputedAmount).toBe(60000);
  });

  it('should export getSalaryBreakdown(userId) fulfilling shared typed contract', () => {
    const breakdown = getSalaryBreakdown('EMP-003');
    expect(breakdown).not.toBeNull();
    expect(breakdown?.userId).toBe('EMP-003');
    expect(breakdown?.monthlyWage).toBe(50000);
    expect(breakdown?.basicSalary).toBe(25000);
    expect(breakdown?.hra).toBe(12500);
    expect(breakdown?.employeePf).toBe(3000);
    expect(breakdown?.professionalTax).toBe(200);

    const nonExistent = getSalaryBreakdown('UNKNOWN-USER-999');
    expect(nonExistent).toBeNull();
  });
});
