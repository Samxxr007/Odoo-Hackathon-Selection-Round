import { SalaryBreakdown, SalaryConfig, SalaryComponentItem } from './types';
import { getEmployeeSalaryConfigFromDb } from './db';

/**
 * Safely round a monetary amount to 2 decimal places using decimal-safe rounding.
 */
export function roundMoney(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate full salary breakdown based on monthly wage and configuration.
 */
export function calculateSalaryBreakdown(
  config: Partial<SalaryConfig> & { monthlyWage: number }
): SalaryBreakdown {
  const errors: string[] = [];

  // Sanitize monthly wage
  let monthlyWage = roundMoney(config.monthlyWage);
  if (monthlyWage < 0 || isNaN(monthlyWage) || !isFinite(monthlyWage)) {
    errors.push('Monthly wage must be a non-negative finite number');
    monthlyWage = 0;
  }

  const workingDaysPerWeek = Math.max(1, Math.min(7, config.workingDaysPerWeek ?? 5));
  const breakTimeMinutes = Math.max(0, config.breakTimeMinutes ?? 60);
  const yearlyWage = roundMoney(monthlyWage * 12);

  // Percentages & allowances (with sensible defaults)
  const basicPercentage = config.basicPercentage !== undefined ? config.basicPercentage : 50; // 50% of Wage
  const hraPercentage = config.hraPercentage !== undefined ? config.hraPercentage : 50; // 50% of Basic
  const bonusPercentage = config.bonusPercentage !== undefined ? config.bonusPercentage : 8.33; // 8.33% of Basic
  const ltaPercentage = config.ltaPercentage !== undefined ? config.ltaPercentage : 8.33; // 8.33% of Basic
  const standardAllowance = roundMoney(Math.max(0, config.standardAllowance ?? 0));

  // 1. Basic Salary = 50% of Wage
  const basicSalary = roundMoney((monthlyWage * basicPercentage) / 100);

  // 2. HRA = 50% of Basic Salary
  const hra = roundMoney((basicSalary * hraPercentage) / 100);

  // 3. Performance Bonus = 8.33% of Basic Salary
  const performanceBonus = roundMoney((basicSalary * bonusPercentage) / 100);

  // 4. Leave Travel Allowance = 8.33% of Basic Salary
  const leaveTravelAllowance = roundMoney((basicSalary * ltaPercentage) / 100);

  // 5. Fixed Allowance = Wage - sum(other components)
  const sumKnownComponents = roundMoney(
    basicSalary + hra + standardAllowance + performanceBonus + leaveTravelAllowance
  );

  let fixedAllowance = roundMoney(monthlyWage - sumKnownComponents);

  if (fixedAllowance < 0) {
    errors.push(`Total components (Rs ${sumKnownComponents.toLocaleString('en-IN')}) exceed monthly wage (Rs ${monthlyWage.toLocaleString('en-IN')}). Fixed allowance cannot be negative.`);
    fixedAllowance = 0;
  }

  const totalEarnings = roundMoney(
    basicSalary + hra + standardAllowance + performanceBonus + leaveTravelAllowance + fixedAllowance
  );

  // 6. PF (Provident Fund)
  // Employee contribution = 12% of Basic
  const employeePf = roundMoney((basicSalary * 12) / 100);
  // Employer contribution = 12% of Basic
  const employerPf = roundMoney((basicSalary * 12) / 100);

  // 7. Professional Tax = Rs 200/month (standard if wage > 0)
  const professionalTax = monthlyWage > 0 ? 200 : 0;

  // Deductions & Net Pay
  const totalDeductions = roundMoney(employeePf + professionalTax);
  const netTakeHomeMonthly = roundMoney(Math.max(0, totalEarnings - totalDeductions));
  const netTakeHomeYearly = roundMoney(netTakeHomeMonthly * 12);

  // Total CTC (Cost to Company) = Monthly Wage + Employer PF contribution
  const totalCtcMonthly = roundMoney(totalEarnings + employerPf);
  const totalCtcYearly = roundMoney(totalCtcMonthly * 12);

  const components: SalaryComponentItem[] = [
    {
      id: 'basic',
      name: 'Basic Salary',
      percentageBasis: 'WAGE',
      percentageValue: basicPercentage,
      monthlyAmount: basicSalary,
      yearlyAmount: roundMoney(basicSalary * 12),
      isCalculated: false,
      isEditablePercentage: true,
      isEditableAmount: true,
      description: `${basicPercentage}% of Monthly Wage`,
    },
    {
      id: 'hra',
      name: 'House Rent Allowance (HRA)',
      percentageBasis: 'BASIC',
      percentageValue: hraPercentage,
      monthlyAmount: hra,
      yearlyAmount: roundMoney(hra * 12),
      isCalculated: false,
      isEditablePercentage: true,
      isEditableAmount: true,
      description: `${hraPercentage}% of Basic Salary`,
    },
    {
      id: 'standard_allowance',
      name: 'Standard Allowance',
      percentageBasis: 'FIXED',
      monthlyAmount: standardAllowance,
      yearlyAmount: roundMoney(standardAllowance * 12),
      isCalculated: false,
      isEditablePercentage: false,
      isEditableAmount: true,
      description: 'Fixed monthly allowance',
    },
    {
      id: 'bonus',
      name: 'Performance Bonus',
      percentageBasis: 'BASIC',
      percentageValue: bonusPercentage,
      monthlyAmount: performanceBonus,
      yearlyAmount: roundMoney(performanceBonus * 12),
      isCalculated: false,
      isEditablePercentage: true,
      isEditableAmount: true,
      description: `${bonusPercentage}% of Basic Salary`,
    },
    {
      id: 'lta',
      name: 'Leave Travel Allowance (LTA)',
      percentageBasis: 'BASIC',
      percentageValue: ltaPercentage,
      monthlyAmount: leaveTravelAllowance,
      yearlyAmount: roundMoney(leaveTravelAllowance * 12),
      isCalculated: false,
      isEditablePercentage: true,
      isEditableAmount: true,
      description: `${ltaPercentage}% of Basic Salary`,
    },
    {
      id: 'fixed_allowance',
      name: 'Fixed Allowance (Balancing)',
      percentageBasis: 'FIXED',
      monthlyAmount: fixedAllowance,
      yearlyAmount: roundMoney(fixedAllowance * 12),
      isCalculated: true,
      isEditablePercentage: false,
      isEditableAmount: false,
      description: 'Auto-calculated balancing component (Wage - sum of all other components)',
    },
  ];

  return {
    monthlyWage,
    yearlyWage,
    workingDaysPerWeek,
    breakTimeMinutes,
    basicSalary,
    hra,
    standardAllowance,
    performanceBonus,
    leaveTravelAllowance,
    fixedAllowance,
    totalEarnings,
    employeePf,
    employerPf,
    professionalTax,
    totalDeductions,
    netTakeHomeMonthly,
    netTakeHomeYearly,
    totalCtcMonthly,
    totalCtcYearly,
    components,
    isValid: errors.length === 0,
    validationErrors: errors,
  };
}

/**
 * Recomputes percentage given a new component amount and basis amount.
 */
export function recomputePercentage(newAmount: number, baseAmount: number): number {
  if (baseAmount <= 0 || newAmount < 0 || isNaN(newAmount) || !isFinite(newAmount)) return 0;
  return roundMoney((newAmount / baseAmount) * 100);
}

/**
 * Recomputes amount given a new percentage and basis amount.
 */
export function recomputeAmount(newPercentage: number, baseAmount: number): number {
  if (baseAmount <= 0 || newPercentage < 0 || isNaN(newPercentage) || !isFinite(newPercentage)) return 0;
  return roundMoney((baseAmount * newPercentage) / 100);
}

/**
 * Agreed Typed Contract for Member 4 & other modules.
 * Returns the calculated salary breakdown for a given employee ID.
 */
export function getSalaryBreakdown(userId: string): SalaryBreakdown | null {
  const config = getEmployeeSalaryConfigFromDb(userId);
  if (!config) return null;
  const breakdown = calculateSalaryBreakdown(config);
  breakdown.userId = userId;
  return breakdown;
}
