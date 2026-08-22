'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  User as UserIcon,
  Shield,
  DollarSign,
  FileText,
  Lock,
  Plus,
  Edit2,
  CheckCircle2,
  ExternalLink,
  Award,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Check,
  CreditCard,
  Laptop,
  Smartphone,
  GraduationCap
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

type ProfileTab = 'resume' | 'private' | 'salary' | 'security'

interface EnhancedProfileViewProps {
  employee: any
  currentUser: any
  isSelf: boolean
}

export function EnhancedProfileView({
  employee,
  currentUser,
  isSelf,
}: EnhancedProfileViewProps) {
  const { success, error: toastError } = useToast()
  const [activeTab, setActiveTab] = useState<ProfileTab>('resume')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showBankDetails, setShowBankDetails] = useState(false)

  // Salary Engine
  const initialWage = employee?.wage || (employee?.role === 'ADMIN' ? 250000 : employee?.department === 'Engineering' ? 95000 : 55000)
  const [monthlyWage, setMonthlyWage] = useState<number>(initialWage)
  const [workingDays, setWorkingDays] = useState<number>(5)
  const [breakMinutes, setBreakMinutes] = useState<number>(60)

  // Password state
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [savingPass, setSavingPass] = useState(false)

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'HR'

  // Indian Payroll Formulas (Standard Odoo & Statutory Rules)
  const basicSalary = monthlyWage * 0.50
  const hra = basicSalary * 0.50
  const standardAllowance = Math.min(4167, monthlyWage * 0.0833)
  const performanceBonus = basicSalary * 0.0833
  const lta = basicSalary * 0.0833
  const totalCalculated = basicSalary + hra + standardAllowance + performanceBonus + lta
  const fixedAllowance = Math.max(0, monthlyWage - totalCalculated)
  const yearlyWage = monthlyWage * 12

  // Deductions
  const employeePf = basicSalary * 0.12
  const employerPf = basicSalary * 0.12
  const professionalTax = 200
  const totalDeductions = employeePf + professionalTax
  const netTakeHome = monthlyWage - totalDeductions

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    success(`${label} copied to clipboard`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) {
      toastError('New passwords do not match')
      return
    }
    if (newPass.length < 8) {
      toastError('Password must be at least 8 characters long')
      return
    }
    setSavingPass(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass,
          confirmPassword: confirmPass,
        }),
      })
      const json = await res.json()
      if (json.success) {
        success('Password updated successfully')
        setCurrentPass('')
        setNewPass('')
        setConfirmPass('')
      } else {
        toastError(json.error || 'Failed to update password')
      }
    } catch {
      toastError('An error occurred. Please try again.')
    } finally {
      setSavingPass(false)
    }
  }

  const joinDateFormatted = employee.joiningDate
    ? new Date(employee.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'June 1, 2022'

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0077FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Employees Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(window.location.href, 'Profile Link')}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {copiedField === 'Profile Link' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>Copy Link</span>
          </button>
        </div>
      </div>

      {/* 2. Employee Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Soft Corporate Header Strip */}
        <div className="h-24 w-full bg-gradient-to-r from-slate-100 via-slate-50 to-blue-50/40 border-b border-slate-200 relative px-6 flex items-center justify-end">
          <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-2xs">
            {employee.companyName || 'Odoo India Technology Pvt. Ltd.'}
          </span>
        </div>

        {/* Profile Identity & Details */}
        <div className="px-6 sm:px-8 pb-6 pt-0">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 -mt-10 mb-6">
            {/* Avatar & Clear Info Layout */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={employee.profilePhotoUrl || employee.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                  alt={employee.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white bg-slate-100 shadow-md"
                />
                <span
                  className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"
                  title="Present in office"
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {employee.name}
                  </h1>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {employee.loginId}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#0077FF] border border-blue-100">
                    {employee.role || 'EMPLOYEE'}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#0077FF]">
                  {employee.designation || 'Software Engineer'}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {employee.department} · {employee.location || 'Gandhinagar, Gujarat'}
                </p>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-start sm:justify-end">
              <a
                href={`mailto:${employee.email}`}
                className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{employee.email}</span>
              </a>
              {employee.phone && (
                <a
                  href={`tel:${employee.phone}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{employee.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium block">Joining Date</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{joinDateFormatted}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium block">Working Hours</span>
              <span className="font-bold text-slate-900 mt-0.5 block">09:00 AM – 06:00 PM</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium block">Leave Balance</span>
              <span className="font-bold text-slate-900 mt-0.5 block">24 Days Paid · 7 Days Sick</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-medium block">Employment Type</span>
              <span className="font-bold text-emerald-600 mt-0.5 block">Full-time Regular</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tab Bar Navigation */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('resume')}
          className={cn(
            'pb-3 text-sm font-semibold transition-colors relative cursor-pointer',
            activeTab === 'resume'
              ? 'text-[#0077FF] border-b-2 border-[#0077FF]'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          Resume & Experience
        </button>
        <button
          onClick={() => setActiveTab('private')}
          className={cn(
            'pb-3 text-sm font-semibold transition-colors relative cursor-pointer',
            activeTab === 'private'
              ? 'text-[#0077FF] border-b-2 border-[#0077FF]'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          Private Information
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('salary')}
            className={cn(
              'pb-3 text-sm font-semibold transition-colors relative cursor-pointer flex items-center gap-1.5',
              activeTab === 'salary'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <span>Salary & Compensation</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-bold uppercase">
              Admin
            </span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('security')}
          className={cn(
            'pb-3 text-sm font-semibold transition-colors relative cursor-pointer',
            activeTab === 'security'
              ? 'text-[#0077FF] border-b-2 border-[#0077FF]'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          Account Security
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* ─── TAB 1: RESUME & WORK EXPERIENCE ─── */}
      {activeTab === 'resume' && (
        <div className="space-y-6">
          {/* Work Experience */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#0077FF]" />
              Work Experience
            </h3>

            <div className="space-y-4 pt-1">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {employee.designation || 'Software Engineer'}
                  </h4>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">
                    Odoo India Technology Pvt. Ltd. · Full-time
                  </p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Responsible for core features across Employee Directory, Attendance Tracking, Leave Management, and Payroll calculation modules. Designed RESTful API endpoints and integrated PostgreSQL schema migrations.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  {joinDateFormatted} – Present
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Software Developer</h4>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">
                    Tata Consultancy Services · Full-time
                  </p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Built frontend dashboards and backend reporting services for enterprise HR applications using React and Node.js.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Jul 2020 – May 2022
                </span>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#0077FF]" />
              Education
            </h3>

            <div className="space-y-3 pt-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Bachelor of Technology in Computer Science & Engineering
                  </h4>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">
                    Gujarat Technological University · First Class with Distinction
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  2016 – 2020
                </span>
              </div>
            </div>
          </div>

          {/* Skills & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Skills & Technologies
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  'TypeScript',
                  'JavaScript',
                  'React.js',
                  'Next.js',
                  'Node.js',
                  'PostgreSQL',
                  'Prisma ORM',
                  'Tailwind CSS',
                  'Docker',
                  'REST APIs',
                  'Git & GitHub',
                  'Linux Systems'
                ].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Certifications
              </h3>

              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      AWS Certified Developer – Associate
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Verified</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Amazon Web Services · Issued 2023 · Credential ID: AWS-849201
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Meta Professional Frontend Developer
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Verified</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Meta · Issued 2022 · Credential ID: META-994812
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: PRIVATE INFORMATION ─── */}
      {activeTab === 'private' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#0077FF]" />
              Personal Details
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Date of Birth</span>
                <span className="font-semibold text-slate-900">November 15, 1994</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Gender</span>
                <span className="font-semibold text-slate-900">Male</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Marital Status</span>
                <span className="font-semibold text-slate-900">Single</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Nationality</span>
                <span className="font-semibold text-slate-900">Indian</span>
              </div>
              <div className="py-2.5 flex items-start justify-between">
                <span className="text-slate-500 font-medium">Permanent Address</span>
                <span className="font-semibold text-slate-900 text-right max-w-xs">
                  404, Tech Park Residency, SG Highway, Ahmedabad, Gujarat 380054
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Emergency Contact</span>
                <span className="font-semibold text-slate-900">Ramesh Patel (+91 98250 11223)</span>
              </div>
            </div>
          </div>

          {/* Banking & Statutory Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Bank & Statutory Details
              </h3>
              <button
                onClick={() => setShowBankDetails(!showBankDetails)}
                className="text-xs font-semibold text-[#0077FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showBankDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showBankDetails ? 'Mask' : 'Show'}</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Bank Name</span>
                <span className="font-semibold text-slate-900">HDFC Bank (Ahmedabad Branch)</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">
                    {showBankDetails ? '918020038472910' : '••••••••••••2910'}
                  </span>
                  <button
                    onClick={() => copyToClipboard('918020038472910', 'Account Number')}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">IFSC Code</span>
                <span className="font-mono font-bold text-[#0077FF]">HDFC0001042</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">PAN Number</span>
                <span className="font-mono font-bold text-slate-900">
                  {showBankDetails ? 'ABCDE1234F' : 'ABCDE••••F'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">UAN (EPFO)</span>
                <span className="font-mono font-bold text-slate-900">100928374651</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Employee Code</span>
                <span className="font-mono font-bold text-slate-900">{employee.loginId}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SALARY & COMPENSATION (ADMIN ONLY) ─── */}
      {activeTab === 'salary' && isAdmin && (
        <div className="space-y-6">
          {/* Wage Config Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Monthly Wage Configuration</h3>
                <p className="text-xs text-slate-500 mt-0.5">Calculates all CTC earnings and statutory deductions dynamically</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Presets:</span>
                {[50000, 95000, 150000, 250000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setMonthlyWage(amt)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer',
                      monthlyWage === amt
                        ? 'bg-[#0077FF] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    )}
                  >
                    ₹{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Monthly Gross Wage (₹ / Month)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">₹</span>
                  <input
                    type="number"
                    value={monthlyWage}
                    onChange={(e) => setMonthlyWage(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 text-sm font-bold bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Annual CTC (₹ / Year)
                </label>
                <div className="py-2 px-3 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 text-sm font-bold">
                  ₹{yearlyWage.toLocaleString('en-IN')}.00
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Net Monthly Payout (Bank Deposit)
                </label>
                <div className="py-2 px-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-sm font-bold">
                  ₹{netTakeHome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Salary Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Earnings & Allowances Breakdown</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Component</th>
                    <th className="py-3 px-4">Formula / Rate</th>
                    <th className="py-3 px-4 text-right">Monthly (₹)</th>
                    <th className="py-3 px-4 text-right">Annual (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900">Basic Salary</td>
                    <td className="py-3 px-4 text-slate-500">50% of Gross Wage</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">₹{basicSalary.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">₹{(basicSalary * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900">House Rent Allowance (HRA)</td>
                    <td className="py-3 px-4 text-slate-500">50% of Basic (25% of Gross)</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">₹{hra.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">₹{(hra * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900">Standard Allowance</td>
                    <td className="py-3 px-4 text-slate-500">Fixed ₹4,167 / month</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">₹{standardAllowance.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">₹{(standardAllowance * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900">Performance Bonus</td>
                    <td className="py-3 px-4 text-slate-500">8.33% of Basic</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">₹{performanceBonus.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">₹{(performanceBonus * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900">Leave Travel Allowance (LTA)</td>
                    <td className="py-3 px-4 text-slate-500">8.33% of Basic</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">₹{lta.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">₹{(lta * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-emerald-700">Fixed Special Allowance</td>
                    <td className="py-3 px-4 text-slate-500">Balancing Remainder</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">₹{fixedAllowance.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600">₹{(fixedAllowance * 12).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Deductions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Statutory Deductions & Net Payout</h3>
            </div>

            <div className="p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Employee Provident Fund (12% of Basic)</span>
                <span className="font-mono font-semibold text-slate-900">₹{employeePf.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Professional Tax (Gujarat State PT)</span>
                <span className="font-mono font-semibold text-slate-900">₹{professionalTax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="font-semibold text-rose-600">Total Deductions</span>
                <span className="font-mono font-bold text-rose-600">-₹{totalDeductions.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 text-sm">
                <span className="font-bold text-slate-900">Net Monthly Payable</span>
                <span className="font-mono font-black text-emerald-600 text-base">
                  ₹{netTakeHome.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: ACCOUNT SECURITY ─── */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Password Reset */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0077FF]" />
              Change Password
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-sm bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#0077FF]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 text-sm bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#0077FF]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 text-sm bg-slate-50 text-slate-900 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#0077FF]/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPass}
                  className="w-full py-2.5 rounded-xl bg-[#0077FF] hover:bg-[#0060CC] text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingPass ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Active Sessions
            </h3>

            <div className="space-y-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Windows · Chrome</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">
                        Current
                      </span>
                    </div>
                    <span className="text-slate-400 block mt-0.5">Ahmedabad, India · IP 192.168.1.1</span>
                  </div>
                </div>
                <span className="font-semibold text-emerald-600">Active</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="font-bold text-slate-900 block">iOS Mobile · Safari</span>
                    <span className="text-slate-400 block mt-0.5">Gandhinagar, India · 2 hours ago</span>
                  </div>
                </div>
                <button
                  onClick={() => success('Session revoked')}
                  className="font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Revoke
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
