'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
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
  Save,
  CheckCircle2,
  Sparkles,
  Info,
  ExternalLink,
  Award,
  Layers
} from 'lucide-react'
import { StatusBadge, StatusIndicatorCorner } from '@/components/dashboard/StatusBadge'
import { AttendanceStatusType } from '@prisma/client'
import { useToast } from '@/components/ui/Toast'

type ProfileTab = 'resume' | 'private' | 'salary' | 'security'

export default function EmployeeProfileDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const employeeId = resolvedParams.id
  const router = useRouter()
  const { success, error: toastError } = useToast()

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ProfileTab>('resume')

  // Salary Engine State (matching exact wireframe formulas)
  const [monthlyWage, setMonthlyWage] = useState<number>(50000)
  const [workingDays, setWorkingDays] = useState<number>(5)
  const [breakTime, setBreakTime] = useState<number>(60)

  // Security password change state
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [savingPass, setSavingPass] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [meRes, empRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch(`/api/employees/${employeeId}`),
        ])

        const meJson = await meRes.json()
        const empJson = await empRes.json()

        if (meJson.success) setCurrentUser(meJson.data)
        if (empJson.success) {
          setEmployee(empJson.data)
          // Initialize wage based on department/role
          if (empJson.data.role === 'ADMIN') {
            setMonthlyWage(150000)
          } else if (empJson.data.department === 'Engineering') {
            setMonthlyWage(95000)
          } else {
            setMonthlyWage(50000)
          }
        }
      } catch {
        toastError('Failed to load profile details')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [employeeId, toastError])

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'HR'
  const isSelf = currentUser?.id === employeeId

  // ─────────────────────────────────────────────
  // Exact Wireframe Salary Calculations:
  // Basic = 50% of Wage
  // HRA = 50% of Basic (= 25% of Wage)
  // Standard Allowance = ₹4,167.00
  // Performance Bonus = 8.33% of Basic
  // LTA = 8.33% of Basic
  // Fixed Allowance = Wage - Total of all components
  // PF = 12% of Basic (Employee & Employer)
  // Professional Tax = ₹200.00
  // ─────────────────────────────────────────────
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
        success('Password updated successfully!')
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

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#0077FF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-[#8F9CAE]">Loading Employee Profile...</p>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5ECF2] p-12 text-center max-w-md mx-auto my-12">
        <h3 className="text-lg font-bold text-[#1A1D24]">Employee Not Found</h3>
        <p className="text-sm text-[#8F9CAE] mt-1 mb-4">The requested profile could not be loaded.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0077FF] text-white text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#5A687D] hover:text-[#0077FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Admin Full Control View
            </span>
          )}
          {isSelf && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EAF3FF] text-[#0077FF] border border-blue-200">
              My Personal Profile
            </span>
          )}
        </div>
      </div>

      {/* 2. Top Profile Header Card (Matching Wireframe Profile Box) */}
      <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with Status Badge */}
          <div className="relative">
            <img
              src={employee.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
              alt={employee.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-[#F4F7FB] shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#22C55E] border-3 border-white shadow-sm flex items-center justify-center text-[10px] text-white font-bold" title="Active">
              ✓
            </span>
          </div>

          {/* Core Info Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D24] tracking-tight">
                  {employee.name}
                </h1>
                <p className="text-sm font-bold text-[#0077FF] mt-0.5">
                  {employee.designation || 'Staff Member'}
                </p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#F4F7FB] text-[#1A1D24] border border-[#E5ECF2]">
                  {employee.loginId}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {employee.role}
                </span>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs text-[#5A687D]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#8F9CAE]" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#8F9CAE]" />
                <span>{employee.phone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#8F9CAE]" />
                <span className="truncate">{employee.department || 'Engineering'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#8F9CAE]" />
                <span>Odoo India Technology</span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#8F9CAE]" />
                <span>Manager: {employee.manager?.name || 'Alexander Wright'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8F9CAE]" />
                <span>{employee.location || 'Gandhinagar, Gujarat'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Wireframe Profile Tabs */}
      <div className="bg-white rounded-2xl border border-[#E5ECF2] p-1.5 shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('resume')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'resume'
              ? 'bg-[#0077FF] text-white shadow-sm'
              : 'text-[#5A687D] hover:bg-[#F4F7FB] hover:text-[#1A1D24]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resume</span>
        </button>

        <button
          onClick={() => setActiveTab('private')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'private'
              ? 'bg-[#0077FF] text-white shadow-sm'
              : 'text-[#5A687D] hover:bg-[#F4F7FB] hover:text-[#1A1D24]'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Private Info</span>
        </button>

        {/* Salary Info Tab — Only Visible to Admin/HR */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('salary')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'salary'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Salary Info (Admin Only)</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'security'
              ? 'bg-[#0077FF] text-white shadow-sm'
              : 'text-[#5A687D] hover:bg-[#F4F7FB] hover:text-[#1A1D24]'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security</span>
        </button>
      </div>

      {/* 4. Tab Content Panels */}

      {/* ─── TAB 1: RESUME ─── */}
      {activeTab === 'resume' && (
        <div className="space-y-6 animate-fadeIn">
          {/* About Section */}
          <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-[#1A1D24] uppercase tracking-wider text-[12px]">
              About
            </h3>
            <p className="text-sm text-[#5A687D] leading-relaxed">
              Dedicated and outcome-oriented technology professional with deep domain experience in enterprise web architectures, clean code systems, and collaborative agile environments. Proven track record in shipping robust full-stack software solutions, optimizing database performance, and driving cross-functional team productivity.
            </p>
          </div>

          {/* What I Love About My Job */}
          <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-[#1A1D24] uppercase tracking-wider text-[12px]">
              What I love about my job
            </h3>
            <p className="text-sm text-[#5A687D] leading-relaxed">
              Mentoring talented engineers, building resilient software foundations from scratch, solving complex distributed systems problems, and creating high-impact human resource tools that delight users every single day.
            </p>
          </div>

          {/* My Interests & Hobbies */}
          <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-[#1A1D24] uppercase tracking-wider text-[12px]">
              My interests and hobbies
            </h3>
            <p className="text-sm text-[#5A687D] leading-relaxed">
              Cloud Architecture, Open Source Contribution, UI/UX Design Systems, Mechanical Keyboards, Mountain Trekking, and Strategic Chess.
            </p>
          </div>

          {/* Skills & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1A1D24] uppercase tracking-wider">Skills</h3>
                <button className="text-xs font-bold text-[#0077FF] hover:underline flex items-center gap-1 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add Skills
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { name: 'TypeScript', level: 'Expert' },
                  { name: 'React / Next.js', level: 'Expert' },
                  { name: 'PostgreSQL & Prisma', level: 'Expert' },
                  { name: 'Node.js Microservices', level: 'Advanced' },
                  { name: 'Tailwind CSS', level: 'Expert' },
                  { name: 'REST APIs & JWT Security', level: 'Advanced' },
                  { name: 'Docker & Kubernetes', level: 'Intermediate' },
                  { name: 'Git & CI/CD Pipelines', level: 'Advanced' },
                ].map((s) => (
                  <span
                    key={s.name}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F4F7FB] text-[#1A1D24] border border-[#E5ECF2]"
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] font-bold text-[#0077FF] bg-[#EAF3FF] px-1.5 py-0.5 rounded-md">
                      {s.level}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1A1D24] uppercase tracking-wider">Certification</h3>
                <button className="text-xs font-bold text-[#0077FF] hover:underline flex items-center gap-1 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add Skills
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  {
                    title: 'AWS Certified Solutions Architect — Associate',
                    org: 'Amazon Web Services',
                    date: '2023 - 2026',
                    id: 'AWS-SAA-884920',
                  },
                  {
                    title: 'Meta Front-End Developer Professional Certificate',
                    org: 'Meta / Coursera',
                    date: 'Issued 2022',
                    id: 'META-FE-771923',
                  },
                  {
                    title: 'Certified Kubernetes Administrator (CKA)',
                    org: 'Cloud Native Computing Foundation',
                    date: '2024 - 2027',
                    id: 'CKA-992184-IN',
                  },
                ].map((c) => (
                  <div key={c.title} className="p-3 rounded-2xl bg-[#F4F7FB] border border-[#E5ECF2] flex items-start gap-3">
                    <Award className="w-5 h-5 text-[#0077FF] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1A1D24]">{c.title}</p>
                      <p className="text-[11px] text-[#5A687D]">{c.org} • {c.date}</p>
                      <p className="text-[10px] font-mono text-[#8F9CAE] mt-0.5">Credential ID: {c.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: PRIVATE INFO (Personal Info & Bank Details) ─── */}
      {activeTab === 'private' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* Personal Information */}
          <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#1A1D24] uppercase tracking-wider border-b border-[#E5ECF2] pb-3">
              Personal Information
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                <span className="text-[#8F9CAE]">Date of Birth</span>
                <span className="font-bold text-[#1A1D24]">15, November 1994</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                <span className="text-[#8F9CAE]">Residing Address</span>
                <span className="font-bold text-[#1A1D24] text-right max-w-xs">
                  404, Tech Park Residency, SG Highway, Ahmedabad - 380054
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                <span className="text-[#8F9CAE]">Nationality</span>
                <span className="font-bold text-[#1A1D24]">Indian</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                <span className="text-[#8F9CAE]">Personal Email</span>
                <span className="font-bold text-[#1A1D24]">{employee.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                <span className="text-[#8F9CAE]">Gender</span>
                <span className="font-bold text-[#1A1D24]">Male</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                <span className="text-[#8F9CAE]">Marital Status</span>
                <span className="font-bold text-[#1A1D24]">Single</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#8F9CAE]">Date of Joining</span>
                <span className="font-bold text-[#1A1D24]">
                  {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-IN') : '01/06/2022'}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#1A1D24] uppercase tracking-wider border-b border-[#E5ECF2] pb-3">
              Bank Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                <span className="text-[#8F9CAE]">Account Number</span>
                <span className="font-mono font-bold text-[#1A1D24]">918020038472910</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                <span className="text-[#8F9CAE]">Bank Name</span>
                <span className="font-bold text-[#1A1D24]">HDFC Bank Ltd</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                <span className="text-[#8F9CAE]">IFSC Code</span>
                <span className="font-mono font-bold text-[#0077FF]">HDFC0001042</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                <span className="text-[#8F9CAE]">PAN No</span>
                <span className="font-mono font-bold text-[#1A1D24]">ABCDE1234F</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                <span className="text-[#8F9CAE]">UAN No</span>
                <span className="font-mono font-bold text-[#1A1D24]">100928374651</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#8F9CAE]">Emp Code</span>
                <span className="font-mono font-bold text-[#0077FF]">{employee.loginId}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SALARY INFO (EXACT WIREFRAME FORMULAS & CALCULATION ENGINE) ─── */}
      {activeTab === 'salary' && isAdmin && (
        <div className="space-y-6 animate-fadeIn">
          {/* Important Requirement Note Banner */}
          <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 shadow-xs flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs text-purple-900">
              <p className="font-bold text-sm text-purple-950">Important Salary Configuration Rules</p>
              <p className="leading-relaxed">
                The Salary Information tab allows users to define and manage all salary-related details for an employee, including wage types, working schedules, and salary components. Salary components are <strong>automatically calculated in real-time</strong> based on the defined monthly wage.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] font-medium text-purple-800">
                <div>• Basic Salary: <strong>50% of Wage</strong></div>
                <div>• House Rent Allowance: <strong>50% of Basic (25% of Wage)</strong></div>
                <div>• Standard Allowance: <strong>Fixed Amount (₹4,167)</strong></div>
                <div>• Performance Bonus: <strong>8.33% of Basic</strong></div>
                <div>• Leave Travel Allowance: <strong>8.33% of Basic</strong></div>
                <div>• Fixed Allowance: <strong>Wage - Total Components</strong></div>
              </div>
            </div>
          </div>

          {/* Wage Type & Schedule Inputs */}
          <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-xs font-bold text-[#8F9CAE] uppercase tracking-wider block mb-1.5">
                Monthly Wage (₹ / Month)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-[#8F9CAE]">₹</span>
                <input
                  type="number"
                  value={monthlyWage}
                  onChange={(e) => setMonthlyWage(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2 text-base font-black text-[#1A1D24] bg-[#F4F7FB] rounded-xl border border-[#E5ECF2] focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#8F9CAE] uppercase tracking-wider block mb-1.5">
                Yearly Wage (Auto-Calculated)
              </label>
              <div className="p-2 bg-[#F4F7FB] rounded-xl border border-[#E5ECF2] text-base font-black text-purple-700">
                ₹{yearlyWage.toLocaleString('en-IN')}.00 / Yearly
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#8F9CAE] uppercase tracking-wider block mb-1.5">
                Working Days / Week
              </label>
              <input
                type="number"
                value={workingDays}
                onChange={(e) => setWorkingDays(Number(e.target.value))}
                className="w-full px-4 py-2 text-sm font-bold text-[#1A1D24] bg-[#F4F7FB] rounded-xl border border-[#E5ECF2] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#8F9CAE] uppercase tracking-wider block mb-1.5">
                Break Time (mins/day)
              </label>
              <input
                type="number"
                value={breakTime}
                onChange={(e) => setBreakTime(Number(e.target.value))}
                className="w-full px-4 py-2 text-sm font-bold text-[#1A1D24] bg-[#F4F7FB] rounded-xl border border-[#E5ECF2] outline-none"
              />
            </div>
          </div>

          {/* Salary Components Breakdown (Exact Wireframe Grid) */}
          <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5ECF2] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#1A1D24]">Salary Components</h3>
                <p className="text-xs text-[#8F9CAE] mt-0.5">Component breakdown automatically computed from ₹{monthlyWage.toLocaleString('en-IN')} wage.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                100% Balanced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Basic Salary */}
              <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E5ECF2] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1D24]">Basic Salary</span>
                  <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">50.00 %</span>
                </div>
                <p className="text-xl font-black text-[#1A1D24]">₹{basicSalary.toFixed(2)} / month</p>
                <p className="text-[11px] text-[#8F9CAE]">Define Basic Salary from company cost computed on monthly wage.</p>
              </div>

              {/* HRA */}
              <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E5ECF2] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1D24]">House Rent Allowance (HRA)</span>
                  <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">50.00 %</span>
                </div>
                <p className="text-xl font-black text-[#1A1D24]">₹{hra.toFixed(2)} / month</p>
                <p className="text-[11px] text-[#8F9CAE]">HRA provided to employee at 50% of the basic salary.</p>
              </div>

              {/* Standard Allowance */}
              <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E5ECF2] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1D24]">Standard Allowance</span>
                  <span className="text-xs font-mono font-bold text-[#0077FF] bg-blue-50 px-2 py-0.5 rounded-md">Fixed</span>
                </div>
                <p className="text-xl font-black text-[#1A1D24]">₹{standardAllowance.toFixed(2)} / month</p>
                <p className="text-[11px] text-[#8F9CAE]">A standard predetermined fixed amount provided to employees.</p>
              </div>

              {/* Performance Bonus */}
              <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E5ECF2] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1D24]">Performance Bonus</span>
                  <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">8.33 %</span>
                </div>
                <p className="text-xl font-black text-[#1A1D24]">₹{performanceBonus.toFixed(2)} / month</p>
                <p className="text-[11px] text-[#8F9CAE]">Variable amount calculated as 8.33% of the basic salary.</p>
              </div>

              {/* Leave Travel Allowance (LTA) */}
              <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E5ECF2] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1D24]">Leave Travel Allowance (LTA)</span>
                  <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">8.33 %</span>
                </div>
                <p className="text-xl font-black text-[#1A1D24]">₹{lta.toFixed(2)} / month</p>
                <p className="text-[11px] text-[#8F9CAE]">LTA paid to cover travel expenses, 8.33% of basic salary.</p>
              </div>

              {/* Fixed Allowance */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Fixed Allowance</span>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Balancing</span>
                </div>
                <p className="text-xl font-black text-emerald-800">₹{fixedAllowance.toFixed(2)} / month</p>
                <p className="text-[11px] text-emerald-700">Determined automatically after calculating all salary components.</p>
              </div>
            </div>
          </div>

          {/* Provident Fund & Tax Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PF Contributions */}
            <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-[#1A1D24]">Provident Fund (PF) Contribution</h3>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E5ECF2]">
                  <p className="text-xs font-semibold text-[#8F9CAE]">Employee (12%)</p>
                  <p className="text-lg font-black text-[#1A1D24] mt-1">₹{employeePf.toFixed(2)}</p>
                  <p className="text-[10px] text-[#8F9CAE] mt-1">12% of basic salary</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E5ECF2]">
                  <p className="text-xs font-semibold text-[#8F9CAE]">Employer (12%)</p>
                  <p className="text-lg font-black text-[#1A1D24] mt-1">₹{employerPf.toFixed(2)}</p>
                  <p className="text-[10px] text-[#8F9CAE] mt-1">12% of basic salary</p>
                </div>
              </div>
            </div>

            {/* Tax Deductions & Net Take Home */}
            <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-[#1A1D24]">Tax Deductions & Net Payout</h3>
              <div className="space-y-3 pt-1 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                  <span className="text-[#8F9CAE]">Professional Tax (PT)</span>
                  <span className="font-mono font-bold text-red-600">₹{professionalTax.toFixed(2)} / month</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                  <span className="text-[#8F9CAE]">Total Monthly Deductions</span>
                  <span className="font-mono font-bold text-red-600">₹{totalDeductions.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 bg-emerald-50 px-3 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-900 text-sm">Estimated Net Take-Home</span>
                  <span className="font-mono font-black text-emerald-700 text-base">₹{netTakeHome.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: SECURITY (Password Change) ─── */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs max-w-xl mx-auto animate-fadeIn space-y-6">
          <div className="border-b border-[#E5ECF2] pb-4">
            <h3 className="text-lg font-extrabold text-[#1A1D24]">Change Password</h3>
            <p className="text-xs text-[#8F9CAE] mt-0.5">Keep your account secure with a strong password.</p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#8F9CAE] uppercase tracking-wider block mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 text-sm bg-[#F4F7FB] rounded-xl border border-[#E5ECF2] outline-none focus:ring-2 focus:ring-[#0077FF]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#8F9CAE] uppercase tracking-wider block mb-1.5">
                New Password (Min 8 chars, uppercase, number, symbol)
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Enter new strong password"
                className="w-full px-4 py-2.5 text-sm bg-[#F4F7FB] rounded-xl border border-[#E5ECF2] outline-none focus:ring-2 focus:ring-[#0077FF]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#8F9CAE] uppercase tracking-wider block mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2.5 text-sm bg-[#F4F7FB] rounded-xl border border-[#E5ECF2] outline-none focus:ring-2 focus:ring-[#0077FF]"
              />
            </div>

            <button
              type="submit"
              disabled={savingPass}
              className="w-full py-3 rounded-xl bg-[#0077FF] hover:bg-[#0060CC] text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {savingPass ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
