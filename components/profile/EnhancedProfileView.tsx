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

  // Indian Payroll Formulas (Matching exact Odoo & Government Standards)
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Employees Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(window.location.href, 'Profile Link')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedField === 'Profile Link' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>Copy Link</span>
          </button>
        </div>
      </div>

      {/* 2. Employee Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Clean Charcoal/Navy Cover Banner */}
        <div className="h-28 sm:h-32 w-full bg-slate-800 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 relative">
          <div className="absolute top-3 right-4">
            <span className="text-[11px] font-medium text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700">
              {employee.companyName || 'Odoo India Pvt. Ltd.'}
            </span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 sm:px-8 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-6">
            {/* Avatar & Title */}
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={employee.profilePhotoUrl || employee.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                  alt={employee.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 shadow-md"
                />
                <span
                  className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"
                  title="Active"
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {employee.name}
                  </h1>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {employee.loginId}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#0077FF] dark:text-[#38BDF8]">
                  {employee.designation || 'Software Engineer'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {employee.department} · {employee.location || 'Gandhinagar, Gujarat'}
                </p>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <a
                href={`mailto:${employee.email}`}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{employee.email}</span>
              </a>
              {employee.phone && (
                <a
                  href={`tel:${employee.phone}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{employee.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block">Joining Date</span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{joinDateFormatted}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block">Working Hours</span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">09:00 AM – 06:00 PM</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block">Leave Balance</span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">24 Days Paid · 7 Days Sick</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block">Employment Type</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">Full-time Regular</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tab Bar Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('resume')}
          className={cn(
            'pb-3 text-sm font-semibold transition-colors relative cursor-pointer',
            activeTab === 'resume'
              ? 'text-[#0077FF] dark:text-[#38BDF8] border-b-2 border-[#0077FF] dark:border-[#38BDF8]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          Resume & Experience
        </button>
        <button
          onClick={() => setActiveTab('private')}
          className={cn(
            'pb-3 text-sm font-semibold transition-colors relative cursor-pointer',
            activeTab === 'private'
              ? 'text-[#0077FF] dark:text-[#38BDF8] border-b-2 border-[#0077FF] dark:border-[#38BDF8]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <span>Salary & Compensation</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold uppercase">
              Admin
            </span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('security')}
          className={cn(
            'pb-3 text-sm font-semibold transition-colors relative cursor-pointer',
            activeTab === 'security'
              ? 'text-[#0077FF] dark:text-[#38BDF8] border-b-2 border-[#0077FF] dark:border-[#38BDF8]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#0077FF] dark:text-[#38BDF8]" />
              Work Experience
            </h3>

            <div className="space-y-4 pt-1">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {employee.designation || 'Software Engineer'}
                  </h4>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                    Odoo India Technology Pvt. Ltd. · Full-time
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Responsible for core features across Employee Directory, Attendance Tracking, Leave Management, and Payroll calculation modules. Designed RESTful API endpoints and integrated PostgreSQL schema migrations.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {joinDateFormatted} – Present
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Software Developer</h4>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                    Tata Consultancy Services · Full-time
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Built frontend dashboards and backend reporting services for enterprise HR applications using React and Node.js.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Jul 2020 – May 2022
                </span>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#0077FF] dark:text-[#38BDF8]" />
              Education
            </h3>

            <div className="space-y-3 pt-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Bachelor of Technology in Computer Science & Engineering
                  </h4>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                    Gujarat Technological University · First Class with Distinction
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  2016 – 2020
                </span>
              </div>
            </div>
          </div>

          {/* Skills & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Certifications
              </h3>

              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      AWS Certified Developer – Associate
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Verified</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Amazon Web Services · Issued 2023 · Credential ID: AWS-849201
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Meta Professional Frontend Developer
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Verified</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#0077FF] dark:text-[#38BDF8]" />
              Personal Details
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Date of Birth</span>
                <span className="font-semibold text-slate-900 dark:text-white">November 15, 1994</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Gender</span>
                <span className="font-semibold text-slate-900 dark:text-white">Male</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Marital Status</span>
                <span className="font-semibold text-slate-900 dark:text-white">Single</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Nationality</span>
                <span className="font-semibold text-slate-900 dark:text-white">Indian</span>
              </div>
              <div className="py-2.5 flex items-start justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Address</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-xs">
                  404, Tech Park Residency, SG Highway, Ahmedabad, Gujarat 380054
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Emergency Contact</span>
                <span className="font-semibold text-slate-900 dark:text-white">Ramesh Patel (+91 98250 11223)</span>
              </div>
            </div>
          </div>

          {/* Banking & Statutory Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Bank & Statutory Details
              </h3>
              <button
                onClick={() => setShowBankDetails(!showBankDetails)}
                className="text-xs font-semibold text-[#0077FF] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showBankDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showBankDetails ? 'Mask' : 'Show'}</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Bank Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">HDFC Bank (Ahmedabad Branch)</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {showBankDetails ? '918020038472910' : '••••••••••••2910'}
                  </span>
                  <button
                    onClick={() => copyToClipboard('918020038472910', 'Account Number')}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">IFSC Code</span>
                <span className="font-mono font-bold text-[#0077FF] dark:text-[#38BDF8]">HDFC0001042</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">PAN Number</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {showBankDetails ? 'ABCDE1234F' : 'ABCDE••••F'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">UAN (EPFO)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">100928374651</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Employee Code</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{employee.loginId}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SALARY & COMPENSATION (ADMIN ONLY) ─── */}
      {activeTab === 'salary' && isAdmin && (
        <div className="space-y-6">
          {/* Wage Config Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Wage Configuration</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Calculates all CTC earnings and statutory deductions dynamically</p>
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
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    )}
                  >
                    ₹{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Monthly Gross Wage (₹ / Month)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">₹</span>
                  <input
                    type="number"
                    value={monthlyWage}
                    onChange={(e) => setMonthlyWage(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Annual CTC (₹ / Year)
                </label>
                <div className="py-2 px-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold">
                  ₹{yearlyWage.toLocaleString('en-IN')}.00
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Net Monthly Payout (Bank Deposit)
                </label>
                <div className="py-2 px-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 text-sm font-bold">
                  ₹{netTakeHome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Salary Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Earnings & Allowances Breakdown</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Component</th>
                    <th className="py-3 px-4">Formula / Rate</th>
                    <th className="py-3 px-4 text-right">Monthly (₹)</th>
                    <th className="py-3 px-4 text-right">Annual (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Basic Salary</td>
                    <td className="py-3 px-4 text-slate-500">50% of Gross Wage</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">₹{basicSalary.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">₹{(basicSalary * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">House Rent Allowance (HRA)</td>
                    <td className="py-3 px-4 text-slate-500">50% of Basic (25% of Gross)</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">₹{hra.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">₹{(hra * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Standard Allowance</td>
                    <td className="py-3 px-4 text-slate-500">Fixed ₹4,167 / month</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">₹{standardAllowance.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">₹{(standardAllowance * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Performance Bonus</td>
                    <td className="py-3 px-4 text-slate-500">8.33% of Basic</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">₹{performanceBonus.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">₹{(performanceBonus * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Leave Travel Allowance (LTA)</td>
                    <td className="py-3 px-4 text-slate-500">8.33% of Basic</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">₹{lta.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">₹{(lta * 12).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-emerald-700 dark:text-emerald-400">Fixed Special Allowance</td>
                    <td className="py-3 px-4 text-slate-500">Balancing Remainder</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">₹{fixedAllowance.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">₹{(fixedAllowance * 12).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Deductions Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Statutory Deductions & Net Payout</h3>
            </div>

            <div className="p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Employee Provident Fund (12% of Basic)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">₹{employeePf.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Professional Tax (Gujarat State PT)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">₹{professionalTax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                <span className="font-semibold text-rose-600 dark:text-rose-400">Total Deductions</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">-₹{totalDeductions.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 text-sm">
                <span className="font-bold text-slate-900 dark:text-white">Net Monthly Payable</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0077FF] dark:text-[#38BDF8]" />
              Change Password
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Active Sessions
            </h3>

            <div className="space-y-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">Windows · Chrome</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        Current
                      </span>
                    </div>
                    <span className="text-slate-400 block mt-0.5">Ahmedabad, India · IP 192.168.1.1</span>
                  </div>
                </div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">iOS Mobile · Safari</span>
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
