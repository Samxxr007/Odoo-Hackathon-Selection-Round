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

  const joinDateFormatted = employee?.joiningDate
    ? new Date(employee.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Jan 15, 2020'

  const employeeName = employee?.name || 'Alexander Wright'
  const employeeLoginId = employee?.loginId || 'OIADWR20200001'
  const employeeRole = employee?.role || 'ADMIN'
  const employeeDesignation = employee?.designation || 'Chief Technology Officer (CTO)'
  const employeeDepartment = employee?.department || 'Executive Leadership'
  const employeeLocation = employee?.location || 'Gandhinagar, Gujarat'
  const employeeEmail = employee?.email || 'admin@odoo.com'
  const employeePhone = employee?.phone || '+91 98250 11223'
  const employeePhoto = employee?.profilePhotoUrl || employee?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8F9CAE] hover:text-[#0077FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Employees Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(window.location.href, 'Profile Link')}
            className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E5ECF2] text-xs font-semibold text-[#1A1D24] hover:bg-[#F4F7FB] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {copiedField === 'Profile Link' ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5 text-[#8F9CAE]" />}
            <span>Copy Link</span>
          </button>
        </div>
      </div>

      {/* 2. Employee Profile Header Card */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] shadow-xs overflow-hidden">
        {/* Top Decorative Bar */}
        <div className="h-20 w-full bg-gradient-to-r from-[#EAF3FF] via-[#F4F7FB] to-[#EAF3FF] border-b border-[#E5ECF2] px-6 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0077FF]" />
            <span className="text-xs font-bold text-[#1A1D24]">Employee Profile</span>
          </div>
          <span className="text-xs font-bold text-[#1A1D24] bg-[#FFFFFF] px-3 py-1 rounded-lg border border-[#E5ECF2] shadow-2xs">
            {employee?.companyName || 'Odoo India Technology Pvt. Ltd.'}
          </span>
        </div>

        {/* Profile Identity & Details */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#E5ECF2]">
            {/* Avatar & High-Contrast Name Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative shrink-0">
                <img
                  src={employeePhoto}
                  alt={employeeName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-[#EAF3FF] bg-[#F4F7FB] shadow-sm border border-[#E5ECF2]"
                />
                <span
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#22C55E] border-2 border-white"
                  title="Active"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D24] tracking-tight leading-tight">
                    {employeeName}
                  </h1>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#F4F7FB] text-[#1A1D24] border border-[#E5ECF2]">
                    {employeeLoginId}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EAF3FF] text-[#0077FF] border border-[#E5ECF2]">
                    {employeeRole}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#0077FF]">
                  {employeeDesignation}
                </p>
                <p className="text-xs text-[#8F9CAE] font-semibold">
                  {employeeDepartment} · {employeeLocation}
                </p>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-start sm:justify-end">
              <a
                href={`mailto:${employeeEmail}`}
                className="px-4 py-2 rounded-xl bg-[#F4F7FB] hover:bg-[#EAF3FF] border border-[#E5ECF2] text-[#1A1D24] font-bold text-xs transition-colors flex items-center gap-2 shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5 text-[#0077FF]" />
                <span>{employeeEmail}</span>
              </a>
              {employeePhone && (
                <a
                  href={`tel:${employeePhone}`}
                  className="px-4 py-2 rounded-xl bg-[#F4F7FB] hover:bg-[#EAF3FF] border border-[#E5ECF2] text-[#1A1D24] font-bold text-xs transition-colors flex items-center gap-2 shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-[#0077FF]" />
                  <span>{employeePhone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-[#E5ECF2]">
              <span className="text-[#8F9CAE] font-bold block">Joining Date</span>
              <span className="font-bold text-[#1A1D24] mt-0.5 block">{joinDateFormatted}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-[#E5ECF2]">
              <span className="text-[#8F9CAE] font-bold block">Working Hours</span>
              <span className="font-bold text-[#1A1D24] mt-0.5 block">09:00 AM – 06:00 PM</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-[#E5ECF2]">
              <span className="text-[#8F9CAE] font-bold block">Leave Balance</span>
              <span className="font-bold text-[#1A1D24] mt-0.5 block">24 Days Paid · 7 Days Sick</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-[#E5ECF2]">
              <span className="text-[#8F9CAE] font-bold block">Employment Type</span>
              <span className="font-bold text-[#22C55E] mt-0.5 block">Full-time Regular</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tab Bar Navigation */}
      <div className="flex border-b border-[#E5ECF2] space-x-6">
        <button
          onClick={() => setActiveTab('resume')}
          className={cn(
            'pb-3 text-sm font-bold transition-colors relative cursor-pointer',
            activeTab === 'resume'
              ? 'text-[#0077FF] border-b-2 border-[#0077FF]'
              : 'text-[#8F9CAE] hover:text-[#1A1D24]'
          )}
        >
          Resume & Experience
        </button>
        <button
          onClick={() => setActiveTab('private')}
          className={cn(
            'pb-3 text-sm font-bold transition-colors relative cursor-pointer',
            activeTab === 'private'
              ? 'text-[#0077FF] border-b-2 border-[#0077FF]'
              : 'text-[#8F9CAE] hover:text-[#1A1D24]'
          )}
        >
          Private Information
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('salary')}
            className={cn(
              'pb-3 text-sm font-bold transition-colors relative cursor-pointer flex items-center gap-1.5',
              activeTab === 'salary'
                ? 'text-[#0077FF] border-b-2 border-[#0077FF]'
                : 'text-[#8F9CAE] hover:text-[#1A1D24]'
            )}
          >
            <span>Salary & Compensation</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EAF3FF] text-[#0077FF] font-bold uppercase">
              Admin
            </span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('security')}
          className={cn(
            'pb-3 text-sm font-bold transition-colors relative cursor-pointer',
            activeTab === 'security'
              ? 'text-[#0077FF] border-b-2 border-[#0077FF]'
              : 'text-[#8F9CAE] hover:text-[#1A1D24]'
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
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8F9CAE] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#0077FF]" />
              Work Experience
            </h3>

            <div className="space-y-4 pt-1">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5ECF2]">
                <div>
                  <h4 className="text-sm font-bold text-[#1A1D24]">
                    {employeeDesignation}
                  </h4>
                  <p className="text-xs font-semibold text-[#8F9CAE] mt-0.5">
                    Odoo India Technology Pvt. Ltd. · Full-time
                  </p>
                  <p className="text-xs text-[#1A1D24] mt-2 leading-relaxed">
                    Responsible for core features across Employee Directory, Attendance Tracking, Leave Management, and Payroll calculation modules. Designed RESTful API endpoints and integrated PostgreSQL schema migrations.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#8F9CAE] whitespace-nowrap">
                  {joinDateFormatted} – Present
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#1A1D24]">Software Developer</h4>
                  <p className="text-xs font-semibold text-[#8F9CAE] mt-0.5">
                    Tata Consultancy Services · Full-time
                  </p>
                  <p className="text-xs text-[#1A1D24] mt-2 leading-relaxed">
                    Built frontend dashboards and backend reporting services for enterprise HR applications using React and Node.js.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#8F9CAE] whitespace-nowrap">
                  Jul 2020 – May 2022
                </span>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8F9CAE] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#0077FF]" />
              Education
            </h3>

            <div className="space-y-3 pt-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#1A1D24]">
                    Bachelor of Technology in Computer Science & Engineering
                  </h4>
                  <p className="text-xs font-semibold text-[#8F9CAE] mt-0.5">
                    Gujarat Technological University · First Class with Distinction
                  </p>
                </div>
                <span className="text-xs font-bold text-[#8F9CAE] whitespace-nowrap">
                  2016 – 2020
                </span>
              </div>
            </div>
          </div>

          {/* Skills & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8F9CAE]">
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
                    className="px-3 py-1.5 rounded-lg bg-[#EAF3FF] text-[#0077FF] text-xs font-bold border border-[#E5ECF2]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8F9CAE] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#F9911E]" />
                Certifications
              </h3>

              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-[#E5ECF2]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1A1D24]">
                      AWS Certified Developer – Associate
                    </span>
                    <span className="text-[10px] font-bold text-[#22C55E] bg-emerald-50 px-1.5 py-0.5 rounded">Verified</span>
                  </div>
                  <span className="text-[11px] text-[#8F9CAE] block mt-0.5 font-medium">
                    Amazon Web Services · Issued 2023 · Credential ID: AWS-849201
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-[#E5ECF2]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1A1D24]">
                      Meta Professional Frontend Developer
                    </span>
                    <span className="text-[10px] font-bold text-[#22C55E] bg-emerald-50 px-1.5 py-0.5 rounded">Verified</span>
                  </div>
                  <span className="text-[11px] text-[#8F9CAE] block mt-0.5 font-medium">
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
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8F9CAE] flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#0077FF]" />
              Personal Details
            </h3>

            <div className="divide-y divide-[#E5ECF2] text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#8F9CAE] font-medium">Date of Birth</span>
                <span className="font-bold text-[#1A1D24]">November 15, 1994</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#8F9CAE] font-medium">Gender</span>
                <span className="font-bold text-[#1A1D24]">Male</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#8F9CAE] font-medium">Marital Status</span>
                <span className="font-bold text-[#1A1D24]">Single</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#8F9CAE] font-medium">Nationality</span>
                <span className="font-bold text-[#1A1D24]">Indian</span>
              </div>
              <div className="py-2.5 flex items-start justify-between">
                <span className="text-[#8F9CAE] font-medium">Permanent Address</span>
                <span className="font-bold text-[#1A1D24] text-right max-w-xs">
                  404, Tech Park Residency, SG Highway, Ahmedabad, Gujarat 380054
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#8F9CAE] font-medium">Emergency Contact</span>
                <span className="font-bold text-[#1A1D24]">Ramesh Patel (+91 98250 11223)</span>
              </div>
            </div>
          </div>

          {/* Banking & Statutory Details */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8F9CAE] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0077FF]" />
                Bank & Statutory Details
              </h3>
              <button
                onClick={() => setShowBankDetails(!showBankDetails)}
                className="text-xs font-bold text-[#0077FF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showBankDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showBankDetails ? 'Mask' : 'Show'}</span>
              </button>
            </div>

            <div className="divide-y divide-[#E5ECF2] text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#8F9CAE] font-medium">Bank Name</span>
                <span className="font-bold text-[#1A1D24]">HDFC Bank (Ahmedabad Branch)</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#8F9CAE] font-medium">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#1A1D24]">
                    {showBankDetails ? '918020038472910' : '••••••••••••2910'}
                  </span>
                  <button
                    onClick={() => copyToClipboard('918020038472910', 'Account Number')}
                    className="text-[#8F9CAE] hover:text-[#1A1D24]"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#8F9CAE] font-medium">IFSC Code</span>
                <span className="font-mono font-bold text-[#0077FF]">HDFC0001042</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#8F9CAE] font-medium">PAN Number</span>
                <span className="font-mono font-bold text-[#1A1D24]">
                  {showBankDetails ? 'ABCDE1234F' : 'ABCDE••••F'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#8F9CAE] font-medium">UAN (EPFO)</span>
                <span className="font-mono font-bold text-[#1A1D24]">100928374651</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#8F9CAE] font-medium">Employee Code</span>
                <span className="font-mono font-bold text-[#1A1D24]">{employeeLoginId}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SALARY & COMPENSATION (ADMIN ONLY) ─── */}
      {activeTab === 'salary' && isAdmin && (
        <div className="space-y-6">
          {/* Wage Config Bar */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#1A1D24]">Monthly Wage Configuration</h3>
                <p className="text-xs text-[#8F9CAE] mt-0.5">Calculates all CTC earnings and statutory deductions dynamically</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8F9CAE] font-semibold">Presets:</span>
                {[50000, 95000, 150000, 250000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setMonthlyWage(amt)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                      monthlyWage === amt
                        ? 'bg-[#0077FF] text-white shadow-2xs'
                        : 'bg-[#F4F7FB] text-[#1A1D24] hover:bg-[#EAF3FF] border border-[#E5ECF2]'
                    )}
                  >
                    ₹{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-[#8F9CAE] block mb-1">
                  Monthly Gross Wage (₹ / Month)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#8F9CAE] font-semibold">₹</span>
                  <input
                    type="number"
                    value={monthlyWage}
                    onChange={(e) => setMonthlyWage(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 text-sm font-bold bg-[#F4F7FB] text-[#1A1D24] rounded-xl border border-[#E5ECF2] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8F9CAE] block mb-1">
                  Annual CTC (₹ / Year)
                </label>
                <div className="py-2 px-3 bg-[#F4F7FB] text-[#1A1D24] rounded-xl border border-[#E5ECF2] text-sm font-bold">
                  ₹{yearlyWage.toLocaleString('en-IN')}.00
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8F9CAE] block mb-1">
                  Net Monthly Payout (Bank Deposit)
                </label>
                <div className="py-2 px-3 bg-[#EAF3FF] text-[#0077FF] rounded-xl border border-[#E5ECF2] text-sm font-bold">
                  ₹{netTakeHome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Salary Breakdown Table */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5ECF2]">
              <h3 className="text-sm font-bold text-[#1A1D24]">Earnings & Allowances Breakdown</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F7FB] text-[#8F9CAE] uppercase font-bold border-b border-[#E5ECF2]">
                  <tr>
                    <th className="py-3 px-4">Component</th>
                    <th className="py-3 px-4">Formula / Rate</th>
                    <th className="py-3 px-4 text-right">Monthly (₹)</th>
                    <th className="py-3 px-4 text-right">Annual (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5ECF2]">
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1D24]">Basic Salary</td>
                    <td className="py-3 px-4 text-[#8F9CAE]">50% of Gross Wage</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1A1D24]">₹{basicSalary.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#8F9CAE]">₹{(basicSalary * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1D24]">House Rent Allowance (HRA)</td>
                    <td className="py-3 px-4 text-[#8F9CAE]">50% of Basic (25% of Gross)</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1A1D24]">₹{hra.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#8F9CAE]">₹{(hra * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1D24]">Standard Allowance</td>
                    <td className="py-3 px-4 text-[#8F9CAE]">Fixed ₹4,167 / month</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1A1D24]">₹{standardAllowance.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#8F9CAE]">₹{(standardAllowance * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1D24]">Performance Bonus</td>
                    <td className="py-3 px-4 text-[#8F9CAE]">8.33% of Basic</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1A1D24]">₹{performanceBonus.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#8F9CAE]">₹{(performanceBonus * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#1A1D24]">Leave Travel Allowance (LTA)</td>
                    <td className="py-3 px-4 text-[#8F9CAE]">8.33% of Basic</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1A1D24]">₹{lta.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#8F9CAE]">₹{(lta * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#0077FF]">Fixed Special Allowance</td>
                    <td className="py-3 px-4 text-[#8F9CAE]">Balancing Remainder</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#0077FF]">₹{fixedAllowance.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-[#8F9CAE]">₹{(fixedAllowance * 12).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Deductions Table */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E5ECF2]">
              <h3 className="text-sm font-bold text-[#1A1D24]">Statutory Deductions & Net Payout</h3>
            </div>

            <div className="p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#E5ECF2]">
                <span className="text-[#8F9CAE] font-medium">Employee Provident Fund (12% of Basic)</span>
                <span className="font-mono font-bold text-[#1A1D24]">₹{employeePf.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E5ECF2]">
                <span className="text-[#8F9CAE] font-medium">Professional Tax (Gujarat State PT)</span>
                <span className="font-mono font-bold text-[#1A1D24]">₹{professionalTax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E5ECF2]">
                <span className="font-bold text-rose-600">Total Deductions</span>
                <span className="font-mono font-bold text-rose-600">-₹{totalDeductions.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 text-sm">
                <span className="font-black text-[#1A1D24]">Net Monthly Payable</span>
                <span className="font-mono font-black text-[#0077FF] text-base">
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
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8F9CAE] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0077FF]" />
              Change Password
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-[#8F9CAE] block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-sm bg-[#F4F7FB] text-[#1A1D24] rounded-xl border border-[#E5ECF2] outline-none focus:ring-2 focus:ring-[#0077FF]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8F9CAE] block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 text-sm bg-[#F4F7FB] text-[#1A1D24] rounded-xl border border-[#E5ECF2] outline-none focus:ring-2 focus:ring-[#0077FF]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8F9CAE] block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 text-sm bg-[#F4F7FB] text-[#1A1D24] rounded-xl border border-[#E5ECF2] outline-none focus:ring-2 focus:ring-[#0077FF]/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPass}
                  className="w-full py-2.5 rounded-xl bg-[#0077FF] hover:bg-[#0066DD] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingPass ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Active Sessions */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF2] p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8F9CAE] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0077FF]" />
              Active Sessions
            </h3>

            <div className="space-y-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-[#F4F7FB] border border-[#E5ECF2] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-[#8F9CAE]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1A1D24]">Windows · Chrome</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#EAF3FF] text-[#0077FF]">
                        Current
                      </span>
                    </div>
                    <span className="text-[#8F9CAE] block mt-0.5">Ahmedabad, India · IP 192.168.1.1</span>
                  </div>
                </div>
                <span className="font-bold text-[#22C55E]">Active</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F7FB] border border-[#E5ECF2] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-[#8F9CAE]" />
                  <div>
                    <span className="font-bold text-[#1A1D24] block">iOS Mobile · Safari</span>
                    <span className="text-[#8F9CAE] block mt-0.5">Gandhinagar, India · 2 hours ago</span>
                  </div>
                </div>
                <button
                  onClick={() => success('Session revoked')}
                  className="font-bold text-rose-600 hover:underline cursor-pointer"
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
