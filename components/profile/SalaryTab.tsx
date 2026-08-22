'use client';

import React, { useState, useEffect } from 'react';
import { 
  SalaryBreakdown, 
  SalaryConfig 
} from '@/lib/types';
import { 
  calculateSalaryBreakdown, 
  recomputeAmount, 
  recomputePercentage, 
  roundMoney 
} from '@/lib/salary';
import { 
  IndianRupee, 
  ShieldCheck, 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  RotateCcw, 
  Sparkles, 
  PieChart, 
  Clock, 
  CalendarDays, 
  Info 
} from 'lucide-react';

interface SalaryTabProps {
  initialConfig?: SalaryConfig;
  targetUserId: string;
  currentUserId: string;
  onSalaryUpdated?: (breakdown: SalaryBreakdown) => void;
}

export default function SalaryTab({
  initialConfig,
  targetUserId,
  currentUserId,
  onSalaryUpdated,
}: SalaryTabProps) {
  // Config state
  const [monthlyWage, setMonthlyWage] = useState<number>(initialConfig?.monthlyWage ?? 50000);
  const [yearlyWage, setYearlyWage] = useState<number>((initialConfig?.monthlyWage ?? 50000) * 12);
  const [workingDays, setWorkingDays] = useState<number>(initialConfig?.workingDaysPerWeek ?? 5);
  const [breakTime, setBreakTime] = useState<number>(initialConfig?.breakTimeMinutes ?? 60);
  const [standardAllowance, setStandardAllowance] = useState<number>(initialConfig?.standardAllowance ?? 0);

  // Percentage states (defaults)
  const [basicPct, setBasicPct] = useState<number>(initialConfig?.basicPercentage ?? 50);
  const [hraPct, setHraPct] = useState<number>(initialConfig?.hraPercentage ?? 50);
  const [bonusPct, setBonusPct] = useState<number>(initialConfig?.bonusPercentage ?? 8.33);
  const [ltaPct, setLtaPct] = useState<number>(initialConfig?.ltaPercentage ?? 8.33);

  // Live breakdown calculation
  const [breakdown, setBreakdown] = useState<SalaryBreakdown>(() => {
    return calculateSalaryBreakdown({
      monthlyWage: initialConfig?.monthlyWage ?? 50000,
      workingDaysPerWeek: initialConfig?.workingDaysPerWeek ?? 5,
      breakTimeMinutes: initialConfig?.breakTimeMinutes ?? 60,
      standardAllowance: initialConfig?.standardAllowance ?? 0,
      basicPercentage: initialConfig?.basicPercentage ?? 50,
      hraPercentage: initialConfig?.hraPercentage ?? 50,
      bonusPercentage: initialConfig?.bonusPercentage ?? 8.33,
      ltaPercentage: initialConfig?.ltaPercentage ?? 8.33,
    });
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Recompute breakdown whenever inputs change
  useEffect(() => {
    const computed = calculateSalaryBreakdown({
      monthlyWage,
      workingDaysPerWeek: workingDays,
      breakTimeMinutes: breakTime,
      standardAllowance,
      basicPercentage: basicPct,
      hraPercentage: hraPct,
      bonusPercentage: bonusPct,
      ltaPercentage: ltaPct,
    });
    setBreakdown(computed);
  }, [monthlyWage, workingDays, breakTime, standardAllowance, basicPct, hraPct, bonusPct, ltaPct]);

  // Handle Monthly Wage Change -> Recomputes Yearly Wage
  const handleMonthlyWageChange = (val: number) => {
    const sanitized = Math.max(0, val);
    setMonthlyWage(sanitized);
    setYearlyWage(roundMoney(sanitized * 12));
  };

  // Handle Yearly Wage Change -> Recomputes Monthly Wage
  const handleYearlyWageChange = (val: number) => {
    const sanitized = Math.max(0, val);
    setYearlyWage(sanitized);
    setMonthlyWage(roundMoney(sanitized / 12));
  };

  // 2-Way Component Amount Edit -> Recomputes Percentage
  const handleAmountEdit = (componentId: string, newAmount: number) => {
    const sanitizedAmount = Math.max(0, newAmount);
    if (componentId === 'basic') {
      const newPercentage = recomputePercentage(sanitizedAmount, monthlyWage);
      setBasicPct(newPercentage);
    } else if (componentId === 'hra') {
      const newPercentage = recomputePercentage(sanitizedAmount, breakdown.basicSalary);
      setHraPct(newPercentage);
    } else if (componentId === 'standard_allowance') {
      setStandardAllowance(sanitizedAmount);
    } else if (componentId === 'bonus') {
      const newPercentage = recomputePercentage(sanitizedAmount, breakdown.basicSalary);
      setBonusPct(newPercentage);
    } else if (componentId === 'lta') {
      const newPercentage = recomputePercentage(sanitizedAmount, breakdown.basicSalary);
      setLtaPct(newPercentage);
    }
  };

  // 2-Way Percentage Edit -> Recomputes Amount
  const handlePercentageEdit = (componentId: string, newPct: number) => {
    const sanitizedPct = Math.max(0, newPct);
    if (componentId === 'basic') {
      setBasicPct(sanitizedPct);
    } else if (componentId === 'hra') {
      setHraPct(sanitizedPct);
    } else if (componentId === 'bonus') {
      setBonusPct(sanitizedPct);
    } else if (componentId === 'lta') {
      setLtaPct(sanitizedPct);
    }
  };

  // Load worked example button: Wage = Rs 50,000, Basic = Rs 25,000, HRA = Rs 12,500
  const handleLoadWorkedExample = () => {
    setMonthlyWage(50000);
    setYearlyWage(600000);
    setWorkingDays(5);
    setBreakTime(60);
    setStandardAllowance(0);
    setBasicPct(50);
    setHraPct(50);
    setBonusPct(8.33);
    setLtaPct(8.33);
    setSaveSuccess('Loaded Official Worked Example: Rs 50,000 Wage');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // Reset to default
  const handleReset = () => {
    handleLoadWorkedExample();
  };

  // Save to Backend API
  const handleSaveSalary = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const response = await fetch('/api/profile/salary', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({
          userId: targetUserId,
          monthlyWage,
          yearlyWage,
          workingDaysPerWeek: workingDays,
          breakTimeMinutes: breakTime,
          standardAllowance,
          basicPercentage: basicPct,
          hraPercentage: hraPct,
          bonusPercentage: bonusPct,
          ltaPercentage: ltaPct,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save salary configuration');
      }

      setSaveSuccess('Salary structure saved and recomputed successfully!');
      if (onSalaryUpdated) onSalaryUpdated(data.data);
      setTimeout(() => setSaveSuccess(null), 3500);
    } catch (err: any) {
      setSaveError(err.message || 'Error occurred while saving salary');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (val: number) => {
    return '₹ ' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Admin/HR Security Banner */}
      <div className="bg-purple-900 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-purple-800 text-purple-200 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold">Salary & Compensation Engine (Admin / HR Confidential)</h3>
              <span className="px-2 py-0.5 rounded bg-purple-800 text-purple-200 text-[10px] font-bold uppercase tracking-wider">
                Restricted
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              Live two-way component sync, decimal-safe statutory PF & PT arithmetic, and auto-balancing fixed allowance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadWorkedExample}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-800 hover:bg-purple-700 text-purple-100 rounded-xl text-xs font-semibold shadow-sm transition-all"
            title="Load the standard worked example (Rs 50,000 wage)"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Validate Worked Example (₹50K)</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 bg-purple-800 hover:bg-purple-700 text-purple-200 rounded-xl text-xs font-medium transition-all"
            title="Reset Calculations"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Wage Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Wage */}
        <div className="bg-brand-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Monthly Wage</span>
            <IndianRupee className="w-3.5 h-3.5 text-brand-primary" />
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm font-bold text-brand-muted">₹</span>
            <input
              type="number"
              min="0"
              step="100"
              value={monthlyWage}
              onChange={(e) => handleMonthlyWageChange(Number(e.target.value))}
              className="w-full pl-8 pr-3 py-2 text-lg font-black text-brand-text border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-bg/40 font-mono"
            />
          </div>
          <p className="text-[11px] text-brand-muted mt-1.5">Base gross monthly wage figure</p>
        </div>

        {/* Yearly Wage (Monthly Wage * 12) */}
        <div className="bg-brand-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Yearly Wage (12x)</span>
            <Calculator className="w-3.5 h-3.5 text-brand-sky" />
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm font-bold text-brand-muted">₹</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={yearlyWage}
              onChange={(e) => handleYearlyWageChange(Number(e.target.value))}
              className="w-full pl-8 pr-3 py-2 text-lg font-black text-brand-text border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-bg/40 font-mono"
            />
          </div>
          <p className="text-[11px] text-brand-muted mt-1.5">Synced with Monthly Wage × 12</p>
        </div>

        {/* Working Days per week */}
        <div className="bg-brand-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Working Days / Week</span>
            <CalendarDays className="w-3.5 h-3.5 text-emerald-500" />
          </label>
          <select
            value={workingDays}
            onChange={(e) => setWorkingDays(Number(e.target.value))}
            className="w-full px-3 py-2 text-base font-bold text-brand-text border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-bg/40"
          >
            <option value={4}>4 Days / Week</option>
            <option value={5}>5 Days / Week (Standard)</option>
            <option value={6}>6 Days / Week</option>
          </select>
          <p className="text-[11px] text-brand-muted mt-1.5">Standard employment schedule</p>
        </div>

        {/* Break Time */}
        <div className="bg-brand-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Break Time (Mins)</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </label>
          <select
            value={breakTime}
            onChange={(e) => setBreakTime(Number(e.target.value))}
            className="w-full px-3 py-2 text-base font-bold text-brand-text border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary bg-brand-bg/40"
          >
            <option value={30}>30 Minutes</option>
            <option value={45}>45 Minutes</option>
            <option value={60}>60 Minutes (1 Hour)</option>
            <option value={90}>90 Minutes (1.5 Hours)</option>
          </select>
          <p className="text-[11px] text-brand-muted mt-1.5">Daily lunch and recess allowance</p>
        </div>
      </div>

      {/* Salary Breakdown Table & Live 2-Way Sync */}
      <div className="bg-brand-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brand-border flex items-center justify-between bg-gradient-to-r from-brand-bg to-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-tint text-brand-primary rounded-xl">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-text">Earnings & Allowance Components</h3>
              <p className="text-xs text-brand-muted">
                Formula breakdown with automatic balancing Fixed Allowance
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-brand-muted block font-medium">Total Monthly Earnings</span>
            <span className="text-lg font-black text-brand-primary font-mono">
              {formatCurrency(breakdown.totalEarnings)}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-brand-bg/80 text-brand-muted font-bold uppercase tracking-wider border-b border-brand-border">
                <th className="py-3.5 px-4">Component Name</th>
                <th className="py-3.5 px-4">Calculation Basis</th>
                <th className="py-3.5 px-4 text-center">Rate / Percentage</th>
                <th className="py-3.5 px-4 text-right">Monthly Amount (₹)</th>
                <th className="py-3.5 px-4 text-right">Yearly Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-brand-text">
              {/* 1. Basic Salary */}
              <tr className="hover:bg-brand-bg/30 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-sm">
                  <span>Basic Salary</span>
                  <p className="text-[11px] text-brand-muted font-normal">Primary tax-exempt base salary</p>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-brand-primary font-medium">
                    % of Monthly Wage
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={basicPct}
                      onChange={(e) => handlePercentageEdit('basic', Number(e.target.value))}
                      className="w-16 px-2 py-1 text-center font-bold border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                    />
                    <span className="text-brand-muted font-semibold">%</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center justify-end gap-1">
                    <span className="text-gray-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={breakdown.basicSalary}
                      onChange={(e) => handleAmountEdit('basic', Number(e.target.value))}
                      className="w-28 px-2 py-1 text-right font-bold border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white font-mono"
                    />
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right font-bold font-mono text-gray-700">
                  {formatCurrency(breakdown.basicSalary * 12)}
                </td>
              </tr>

              {/* 2. HRA */}
              <tr className="hover:bg-brand-bg/30 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-sm">
                  <span>House Rent Allowance (HRA)</span>
                  <p className="text-[11px] text-brand-muted font-normal">50% of Basic Salary (Metro Standard)</p>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                    % of Basic Salary
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={hraPct}
                      onChange={(e) => handlePercentageEdit('hra', Number(e.target.value))}
                      className="w-16 px-2 py-1 text-center font-bold border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                    />
                    <span className="text-brand-muted font-semibold">%</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center justify-end gap-1">
                    <span className="text-gray-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={breakdown.hra}
                      onChange={(e) => handleAmountEdit('hra', Number(e.target.value))}
                      className="w-28 px-2 py-1 text-right font-bold border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white font-mono"
                    />
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right font-bold font-mono text-gray-700">
                  {formatCurrency(breakdown.hra * 12)}
                </td>
              </tr>

              {/* 3. Performance Bonus */}
              <tr className="hover:bg-brand-bg/30 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-sm">
                  <span>Performance Bonus</span>
                  <p className="text-[11px] text-brand-muted font-normal">8.33% of Basic Salary (Statutory Annualized)</p>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                    % of Basic Salary
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={bonusPct}
                      onChange={(e) => handlePercentageEdit('bonus', Number(e.target.value))}
                      className="w-16 px-2 py-1 text-center font-bold border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                    />
                    <span className="text-brand-muted font-semibold">%</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center justify-end gap-1">
                    <span className="text-gray-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={breakdown.performanceBonus}
                      onChange={(e) => handleAmountEdit('bonus', Number(e.target.value))}
                      className="w-28 px-2 py-1 text-right font-bold border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white font-mono"
                    />
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right font-bold font-mono text-gray-700">
                  {formatCurrency(breakdown.performanceBonus * 12)}
                </td>
              </tr>

              {/* 4. Leave Travel Allowance */}
              <tr className="hover:bg-brand-bg/30 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-sm">
                  <span>Leave Travel Allowance (LTA)</span>
                  <p className="text-[11px] text-brand-muted font-normal">8.33% of Basic Salary</p>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                    % of Basic Salary
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={ltaPct}
                      onChange={(e) => handlePercentageEdit('lta', Number(e.target.value))}
                      className="w-16 px-2 py-1 text-center font-bold border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                    />
                    <span className="text-brand-muted font-semibold">%</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center justify-end gap-1">
                    <span className="text-gray-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={breakdown.leaveTravelAllowance}
                      onChange={(e) => handleAmountEdit('lta', Number(e.target.value))}
                      className="w-28 px-2 py-1 text-right font-bold border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white font-mono"
                    />
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right font-bold font-mono text-gray-700">
                  {formatCurrency(breakdown.leaveTravelAllowance * 12)}
                </td>
              </tr>

              {/* 5. Standard Allowance (Fixed) */}
              <tr className="hover:bg-brand-bg/30 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-sm">
                  <span>Standard Allowance</span>
                  <p className="text-[11px] text-brand-muted font-normal">Configurable fixed monthly allowance</p>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                    Fixed Amount
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center text-brand-muted font-mono">
                  —
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center justify-end gap-1">
                    <span className="text-gray-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={standardAllowance}
                      onChange={(e) => handleAmountEdit('standard_allowance', Number(e.target.value))}
                      className="w-28 px-2 py-1 text-right font-bold border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white font-mono"
                    />
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right font-bold font-mono text-gray-700">
                  {formatCurrency(standardAllowance * 12)}
                </td>
              </tr>

              {/* 6. Fixed Allowance (Auto-calculated balancing remainder) */}
              <tr className="bg-brand-tint/40 font-semibold border-t-2 border-brand-sky/30">
                <td className="py-3.5 px-4 text-sm text-brand-primary">
                  <div className="flex items-center gap-1.5">
                    <span>Fixed Allowance (Balancing)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-sky/20 text-brand-primary uppercase font-bold">
                      Auto
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-muted font-normal">
                    Wage − (Basic + HRA + Bonus + LTA + Standard Allowance)
                  </p>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-brand-sky/20 text-brand-primary font-bold">
                    Auto Balanced
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center text-brand-muted font-mono">
                  {roundMoney((breakdown.fixedAllowance / (monthlyWage || 1)) * 100)}%
                </td>
                <td className="py-3.5 px-4 text-right font-bold font-mono text-brand-primary text-sm">
                  {formatCurrency(breakdown.fixedAllowance)}
                </td>
                <td className="py-3.5 px-4 text-right font-bold font-mono text-brand-primary text-sm">
                  {formatCurrency(breakdown.fixedAllowance * 12)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Statutory Deductions & Take-Home Salary Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Statutory Deductions */}
        <div className="bg-brand-white rounded-2xl p-6 border border-brand-border shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-brand-border">
            <div className="p-2 bg-amber-50 text-brand-warning rounded-xl">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-text">Statutory Contributions & Deductions</h3>
              <p className="text-xs text-brand-muted">Provident Fund & Professional Tax computations</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-brand-bg rounded-xl border border-brand-border">
              <div>
                <span className="font-semibold text-brand-text block text-sm">Employee PF Contribution</span>
                <span className="text-brand-muted">12% of Basic Salary (Deducted from gross pay)</span>
              </div>
              <span className="font-bold text-brand-text font-mono text-sm">
                {formatCurrency(breakdown.employeePf)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-brand-bg rounded-xl border border-brand-border">
              <div>
                <span className="font-semibold text-brand-text block text-sm">Employer PF Contribution</span>
                <span className="text-brand-muted">12% of Basic Salary (Included in Total CTC)</span>
              </div>
              <span className="font-bold text-brand-text font-mono text-sm">
                {formatCurrency(breakdown.employerPf)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-brand-bg rounded-xl border border-brand-border">
              <div>
                <span className="font-semibold text-brand-text block text-sm">Professional Tax (PT)</span>
                <span className="text-brand-muted">Fixed statutory slab: ₹ 200 / month</span>
              </div>
              <span className="font-bold text-brand-text font-mono text-sm">
                {formatCurrency(breakdown.professionalTax)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
              <span className="font-bold text-sm">Total Monthly Deductions</span>
              <span className="font-black font-mono text-sm">
                {formatCurrency(breakdown.totalDeductions)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Net Take-Home & CTC Summary */}
        <div className="bg-gradient-to-br from-brand-tint/60 via-white to-brand-bg rounded-2xl p-6 border border-brand-sky/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-brand-border">
              <div className="p-2 bg-brand-primary text-white rounded-xl shadow-sm">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-text">Net Compensation Summary</h3>
                <p className="text-xs text-brand-muted">Net in-hand pay & total annualized CTC</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-brand-border shadow-sm">
                <span className="text-xs text-brand-muted font-semibold block uppercase tracking-wider mb-1">
                  Monthly Net Take-Home
                </span>
                <span className="text-2xl font-black text-emerald-600 font-mono block">
                  {formatCurrency(breakdown.netTakeHomeMonthly)}
                </span>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Gross Wage − (PF + Professional Tax)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-brand-border shadow-sm">
                <span className="text-xs text-brand-muted font-semibold block uppercase tracking-wider mb-1">
                  Annual Net In-Hand
                </span>
                <span className="text-2xl font-black text-emerald-600 font-mono block">
                  {formatCurrency(breakdown.netTakeHomeYearly)}
                </span>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Take-home annualized over 12 months
                </span>
              </div>

              <div className="p-4 rounded-xl bg-brand-tint border border-brand-sky/40 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-brand-primary font-bold block uppercase tracking-wider mb-0.5">
                      Total Annual Cost to Company (CTC)
                    </span>
                    <span className="text-2xl font-black text-brand-primary font-mono block">
                      {formatCurrency(breakdown.totalCtcYearly)}
                    </span>
                    <span className="text-[11px] text-brand-muted mt-0.5 block">
                      Yearly Wage (₹ {yearlyWage.toLocaleString('en-IN')}) + Annual Employer PF (₹ {(breakdown.employerPf * 12).toLocaleString('en-IN')})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save / Apply Button */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
            <button
              onClick={handleSaveSalary}
              disabled={isSaving || !breakdown.isValid}
              className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Structure...' : 'Save & Publish Salary'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
