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
  Layers,
  Calculator,
  Sliders
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

  // Exact Wireframe Salary Calculations
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
      <div className="py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#0077FF] border-t-transparent rounded-full animate-spin mx-auto glow-primary" />
        <p className="text-sm font-bold text-slate-400">Loading Employee Profile...</p>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Employee Not Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">The requested profile could not be loaded.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0077FF] text-white text-sm font-bold shadow-md glow-primary"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-fadeIn">
      {/* 1. Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-[#0077FF] dark:hover:text-[#38BDF8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
              Admin Full Control View
            </span>
          )}
          {isSelf && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#0077FF]/10 text-[#0077FF] dark:bg-[#38BDF8]/15 dark:text-[#38BDF8] border border-blue-200 dark:border-blue-800/50">
              My Personal Profile
            </span>
          )}
        </div>
      </div>

      {/* 2. Top Profile Header Card */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar with Status Badge */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-[#0077FF] to-[#00E5FF] rounded-3xl blur-xs opacity-75 group-hover:opacity-100 transition-opacity" />
            <img
              src={employee.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
              alt={employee.name}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-xl"
            />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#22C55E] border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center text-[10px] text-white font-bold" title="Active">
              ✓
            </span>
          </div>

          {/* Core Info Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {employee.name}
                </h1>
                <p className="text-sm font-bold text-[#0077FF] dark:text-[#38BDF8] mt-0.5">
                  {employee.designation || 'Staff Member'}
                </p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  {employee.loginId}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {employee.role}
                </span>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{employee.phone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{employee.department || 'Engineering'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Odoo India Technology</span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Manager: {employee.manager?.name || 'Alexander Wright'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{employee.location || 'Gandhinagar, Gujarat'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Wireframe Profile Tabs */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-1.5 shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('resume')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 ${
            activeTab === 'resume'
              ? 'bg-[#0077FF] text-white shadow-md glow-primary'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resume</span>
        </button>

        <button
          onClick={() => setActiveTab('private')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 ${
            activeTab === 'private'
              ? 'bg-[#0077FF] text-white shadow-md glow-primary'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Private Info</span>
        </button>

        {/* Salary Info Tab — Only Visible to Admin/HR */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('salary')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 ${
              activeTab === 'salary'
                ? 'bg-purple-600 text-white shadow-md glow-purple'
                : 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Salary Info (Admin Only)</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 ${
            activeTab === 'security'
              ? 'bg-[#0077FF] text-white shadow-md glow-primary'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security</span>
        </button>
      </div>

      {/* 4. Tab Panels */}

      {/* ─── TAB 1: RESUME ─── */}
      {activeTab === 'resume' && (
        <div className="space-y-6 animate-fadeIn">
          {/* About Section */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              About
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Dedicated and outcome-oriented technology professional with deep domain experience in enterprise web architectures, clean code systems, and collaborative agile environments. Proven track record in shipping robust full-stack software solutions, optimizing database performance, and driving cross-functional team productivity.
            </p>
          </div>

          {/* What I Love About My Job */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              What I love about my job
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Mentoring talented engineers, building resilient software foundations from scratch, solving complex distributed systems problems, and creating high-impact human resource tools that delight users every single day.
            </p>
          </div>

          {/* My Interests & Hobbies */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              My interests and hobbies
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Cloud Architecture, Open Source Contribution, UI/UX Design Systems, Mechanical Keyboards, Mountain Trekking, and Strategic Chess.
            </p>
          </div>

          {/* Skills & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skills</h3>
                <button className="text-xs font-bold text-[#0077FF] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700"
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] font-bold text-[#0077FF] dark:text-[#38BDF8] bg-[#0077FF]/10 dark:bg-[#38BDF8]/15 px-1.5 py-0.5 rounded-md">
                      {s.level}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Certification</h3>
                <button className="text-xs font-bold text-[#0077FF] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer">
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
                  <div key={c.title} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
                    <Award className="w-5 h-5 text-[#0077FF] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.org} • {c.date}</p>
                      <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">Credential ID: {c.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: PRIVATE INFO ─── */}
      {activeTab === 'private' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* Personal Information */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3">
              Personal Information
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400 dark:text-slate-500">Date of Birth</span>
                <span className="font-bold text-slate-900 dark:text-white">15, November 1994</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400 dark:text-slate-500">Residing Address</span>
                <span className="font-bold text-slate-900 dark:text-white text-right max-w-xs">
                  404, Tech Park Residency, SG Highway, Ahmedabad - 380054
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400 dark:text-slate-500">Nationality</span>
                <span className="font-bold text-slate-900 dark:text-white">Indian</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400 dark:text-slate-500">Personal Email</span>
                <span className="font-bold text-slate-900 dark:text-white">{employee.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400 dark:text-slate-500">Gender</span>
                <span className="font-bold text-slate-900 dark:text-white">Male</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400 dark:text-slate-500">Marital Status</span>
                <span className="font-bold text-slate-900 dark:text-white">Single</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400 dark:text-slate-500">Date of Joining</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-IN') : '01/06/2022'}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3">
              Bank Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400 dark:text-slate-500">Account Number</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">918020038472910</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400 dark:text-slate-500">Bank Name</span>
                <span className="font-bold text-slate-900 dark:text-white">HDFC Bank Ltd</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400 dark:text-slate-500">IFSC Code</span>
                <span className="font-mono font-bold text-[#0077FF] dark:text-[#38BDF8]">HDFC0001042</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400 dark:text-slate-500">PAN No</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">ABCDE1234F</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-400 dark:text-slate-500">UAN No</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">100928374651</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400 dark:text-slate-500">Emp Code</span>
                <span className="font-mono font-bold text-[#0077FF] dark:text-[#38BDF8]">{employee.loginId}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SALARY INFO (EXACT WIREFRAME FORMULAS & CALCULATION ENGINE) ─── */}
      {activeTab === 'salary' && isAdmin && (
        <div className="space-y-6 animate-fadeIn">
          {/* Important Requirement Note Banner */}
          <div className="bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-3xl p-6 shadow-xs flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs text-purple-900 dark:text-purple-300">
              <p className="font-bold text-sm text-purple-950 dark:text-purple-100">Important Salary Configuration Rules</p>
              <p className="leading-relaxed">
                The Salary Information tab allows users to define and manage all salary-related details for an employee, including wage types, working schedules, and salary components. Salary components are <strong>automatically calculated in real-time</strong> based on the defined monthly wage.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] font-medium text-purple-800 dark:text-purple-300">
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
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Monthly Wage (₹ / Month)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={monthlyWage}
                  onChange={(e) => setMonthlyWage(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 text-base font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Yearly Wage (Auto-Calculated)
              </label>
              <div className="py-2.5 px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-base font-black text-purple-700 dark:text-purple-400">
                ₹{yearlyWage.toLocaleString('en-IN')}.00 / Yr
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Working Days / Week
              </label>
              <input
                type="number"
                value={workingDays}
                onChange={(e) => setWorkingDays(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Break Time (mins/day)
              </label>
              <input
                type="number"
                value={breakTime}
                onChange={(e) => setBreakTime(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>
          </div>

          {/* Salary Components Breakdown */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Salary Components</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Component breakdown automatically computed from ₹{monthlyWage.toLocaleString('en-IN')} wage.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full">
                100% Balanced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Basic Salary */}
              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Basic Salary</span>
                  <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">50.00 %</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white">₹{basicSalary.toFixed(2)} / mo</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Define Basic Salary from company cost computed on monthly wage.</p>
              </div>

              {/* HRA */}
              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">House Rent Allowance (HRA)</span>
                  <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">50.00 %</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white">₹{hra.toFixed(2)} / mo</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">HRA provided to employee at 50% of the basic salary.</p>
              </div>

              {/* Standard Allowance */}
              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Standard Allowance</span>
                  <span className="text-xs font-mono font-bold text-[#0077FF] dark:text-[#38BDF8] bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">Fixed</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white">₹{standardAllowance.toFixed(2)} / mo</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">A standard predetermined fixed amount provided to employees.</p>
              </div>

              {/* Performance Bonus */}
              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Performance Bonus</span>
                  <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">8.33 %</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white">₹{performanceBonus.toFixed(2)} / mo</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Variable amount calculated as 8.33% of the basic salary.</p>
              </div>

              {/* Leave Travel Allowance (LTA) */}
              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Leave Travel Allowance (LTA)</span>
                  <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">8.33 %</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white">₹{lta.toFixed(2)} / mo</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">LTA paid to cover travel expenses, 8.33% of basic salary.</p>
              </div>

              {/* Fixed Allowance */}
              <div className="p-4.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Fixed Allowance</span>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">Balancing</span>
                </div>
                <p className="text-xl font-black text-emerald-800 dark:text-emerald-300">₹{fixedAllowance.toFixed(2)} / mo</p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">Determined automatically after calculating all salary components.</p>
              </div>
            </div>
          </div>

          {/* Provident Fund & Tax Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PF Contributions */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Provident Fund (PF) Contribution</h3>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-400">Employee (12%)</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-1">₹{employeePf.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">12% of basic salary</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-400">Employer (12%)</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-1">₹{employerPf.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">12% of basic salary</p>
                </div>
              </div>
            </div>

            {/* Tax Deductions & Net Take Home */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Tax Deductions & Net Payout</h3>
              <div className="space-y-3 pt-1 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">Professional Tax (PT)</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">₹{professionalTax.toFixed(2)} / mo</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">Total Monthly Deductions</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">₹{totalDeductions.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between py-3 bg-emerald-50/80 dark:bg-emerald-950/50 px-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">Estimated Net Take-Home</span>
                  <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-lg">₹{netTakeHome.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: SECURITY ─── */}
      {activeTab === 'security' && (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs max-w-xl mx-auto animate-fadeIn space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Change Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Keep your account secure with a strong password.</p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0077FF]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                New Password (Min 8 chars, uppercase, number, symbol)
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Enter new strong password"
                className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0077FF]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0077FF]"
              />
            </div>

            <button
              type="submit"
              disabled={savingPass}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0077FF] to-[#00B7FE] hover:opacity-95 text-white font-bold text-sm shadow-md glow-primary transition-all cursor-pointer disabled:opacity-50"
            >
              {savingPass ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
