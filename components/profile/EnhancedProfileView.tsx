'use client'

import React, { useState, useMemo } from 'react'
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
  Sliders,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Download,
  Share2,
  Check,
  Globe,
  Zap,
  TrendingUp,
  CreditCard,
  QrCode,
  Laptop,
  Smartphone,
  LogOut,
  HelpCircle
} from 'lucide-react'
import { StatusBadge, StatusIndicatorCorner } from '@/components/dashboard/StatusBadge'
import { AttendanceStatusType } from '@prisma/client'
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

  // Salary Engine State
  const initialWage = employee?.wage || (employee?.role === 'ADMIN' ? 250000 : employee?.department === 'Engineering' ? 95000 : 50000)
  const [monthlyWage, setMonthlyWage] = useState<number>(initialWage)
  const [workingDays, setWorkingDays] = useState<number>(5)
  const [breakTime, setBreakTime] = useState<number>(60)

  // Security password state
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [savingPass, setSavingPass] = useState(false)

  // Add Skill state
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [skills, setSkills] = useState([
    { name: 'TypeScript', level: 'Expert', pct: 95, cat: 'Engineering' },
    { name: 'React / Next.js', level: 'Expert', pct: 92, cat: 'Frontend' },
    { name: 'PostgreSQL & Prisma', level: 'Expert', pct: 90, cat: 'Backend & DB' },
    { name: 'Node.js & Microservices', level: 'Advanced', pct: 85, cat: 'Backend & DB' },
    { name: 'Tailwind CSS & UI Systems', level: 'Expert', pct: 94, cat: 'Frontend' },
    { name: 'REST & GraphQL APIs', level: 'Advanced', pct: 88, cat: 'Engineering' },
    { name: 'Docker & Kubernetes', level: 'Intermediate', pct: 70, cat: 'DevOps & Cloud' },
    { name: 'CI/CD & DevOps Automation', level: 'Advanced', pct: 82, cat: 'DevOps & Cloud' },
  ])
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState<'Expert' | 'Advanced' | 'Intermediate'>('Advanced')

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'HR'

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    success(`${label} copied to clipboard!`)
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

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkillName.trim()) return
    const pct = newSkillLevel === 'Expert' ? 95 : newSkillLevel === 'Advanced' ? 82 : 68
    setSkills((prev) => [...prev, { name: newSkillName.trim(), level: newSkillLevel, pct, cat: 'Custom' }])
    setNewSkillName('')
    setShowSkillModal(false)
    success(`Skill "${newSkillName}" added to profile!`)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* 1. Top Breadcrumbs & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-[#0077FF] dark:hover:text-[#38BDF8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee Directory</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => copyToClipboard(window.location.href, 'Profile Link')}
            className="px-3.5 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedField === 'Profile Link' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>Share Profile</span>
          </button>

          {isAdmin && (
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
              Admin Full Control View
            </span>
          )}

          {isSelf && (
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#0077FF]/10 text-[#0077FF] dark:bg-[#38BDF8]/15 dark:text-[#38BDF8] border border-blue-200 dark:border-blue-800/60">
              My Profile
            </span>
          )}
        </div>
      </div>

      {/* 2. Hero Profile Banner & Master Info */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Atmospheric Gradient Banner */}
        <div className="h-40 sm:h-48 w-full bg-gradient-to-r from-[#0055FF] via-[#0088FF] to-[#00D4FF] relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-black/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-white text-xs font-bold border border-white/20">
              {employee.companyName || 'Odoo India Technology'}
            </span>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
            {/* Avatar & Online Status */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#0077FF] to-[#00E5FF] rounded-3xl blur-xs opacity-75 group-hover:opacity-100 transition-opacity" />
                <img
                  src={employee.profilePhotoUrl || employee.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt={employee.name}
                  className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-2xl"
                />
                <span
                  className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-[10px] text-white font-bold"
                  title="Present in Office"
                >
                  ✓
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {employee.name}
                  </h1>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                    {employee.loginId}
                  </span>
                </div>

                <p className="text-sm sm:text-base font-bold text-[#0077FF] dark:text-[#38BDF8]">
                  {employee.designation || 'Principal Full Stack Engineer'}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {employee.department || 'Engineering'}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {employee.location || 'Gandhinagar, Gujarat'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Contact Buttons */}
            <div className="flex items-center gap-2.5">
              <a
                href={`mailto:${employee.email}`}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-[#0077FF] dark:text-[#38BDF8]" />
                <span>Email</span>
              </a>

              {employee.phone && (
                <a
                  href={`tel:${employee.phone}`}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>Call</span>
                </a>
              )}
            </div>
          </div>

          {/* 4 Hero KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>Tenure at Odoo</span>
                <Clock className="w-3.5 h-3.5 text-[#0077FF] dark:text-[#38BDF8]" />
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white">
                {employee.joiningDate ? '4 Years, 2 Months' : '3+ Years'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Joined {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '2022'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>Shift Schedule</span>
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white">09:00 AM - 06:00 PM</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Standard 8h Shift (1h Break)</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>Attendance Score</span>
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">98.6% On-Time</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">22 Shifts Logged in August</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>Leave Balance</span>
                <Zap className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white">24 Days PTO</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">7 Days Sick Leave Remaining</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Wireframe Tab Bar Navigation */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-1.5 shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('resume')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer shrink-0',
            activeTab === 'resume'
              ? 'bg-[#0077FF] text-white shadow-md glow-primary'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <FileText className="w-4 h-4" />
          <span>Resume & Skills</span>
        </button>

        <button
          onClick={() => setActiveTab('private')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer shrink-0',
            activeTab === 'private'
              ? 'bg-[#0077FF] text-white shadow-md glow-primary'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <UserIcon className="w-4 h-4" />
          <span>Private & Bank Info</span>
        </button>

        {/* Admin-Only Salary Engine Tab */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('salary')}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer shrink-0',
              activeTab === 'salary'
                ? 'bg-purple-600 text-white shadow-md glow-purple'
                : 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800'
            )}
          >
            <DollarSign className="w-4 h-4" />
            <span>Salary Architecture (Admin Only)</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('security')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer shrink-0',
            activeTab === 'security'
              ? 'bg-[#0077FF] text-white shadow-md glow-primary'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Sessions</span>
        </button>
      </div>

      {/* 4. Tab Panels */}

      {/* ─── TAB 1: RESUME & SKILLS ─── */}
      {activeTab === 'resume' && (
        <div className="space-y-6 animate-fadeIn">
          {/* About Paragraph */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0077FF] dark:bg-[#38BDF8]" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                About Me
              </h3>
            </div>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
              High-impact enterprise software engineer with over 6+ years of specialized experience in cloud-native Next.js applications, PostgreSQL optimizations, and automated HR workforce management platforms. Passionate about engineering clean architecture, microservices, and leading high-velocity engineering sprints.
            </p>
          </div>

          {/* What I Love About My Job */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                What I love about my job
              </h3>
            </div>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
              Architecting mission-critical platforms that scale effortlessly, eliminating legacy technical friction, mentoring junior engineers, and designing beautiful user-centric software that makes daily workplace collaboration a joy.
            </p>
          </div>

          {/* My Interests & Hobbies */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                My interests and hobbies
              </h3>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {[
                'Distributed Systems',
                'Open Source Frameworks',
                'Custom Mechanical Keyboards',
                'Mountain Trekking & Cycling',
                'Chess Strategy',
                'UI/UX Typography',
                'Cloud SRE Architecture'
              ].map((interest) => (
                <span
                  key={interest}
                  className="px-3.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 shadow-2xs"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Skills Matrix & Certifications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills with Interactive Progress Meters */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Technical Skills</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Verified core competencies and proficiency</p>
                </div>
                <button
                  onClick={() => setShowSkillModal(true)}
                  className="text-xs font-bold text-[#0077FF] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Skill
                </button>
              </div>

              <div className="space-y-4">
                {skills.map((s) => (
                  <div key={s.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 dark:text-slate-200">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-normal">{s.level}</span>
                        <span className="text-xs font-mono font-bold text-[#0077FF] dark:text-[#38BDF8]">{s.pct}%</span>
                      </div>
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0077FF] to-[#00B7FE] transition-all duration-500"
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications & Badges */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Certifications & Credentials</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Officially verified industry badges</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl">
                  3 Active
                </span>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    title: 'AWS Certified Solutions Architect — Associate',
                    org: 'Amazon Web Services (AWS)',
                    date: 'Valid: 2023 - 2026',
                    id: 'AWS-SAA-992104',
                    badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
                  },
                  {
                    title: 'Meta Front-End Developer Professional Certificate',
                    org: 'Meta Platforms Inc.',
                    date: 'Issued 2022 · Permanent',
                    id: 'META-FED-884102',
                    badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
                  },
                  {
                    title: 'Certified Kubernetes Administrator (CKA)',
                    org: 'Linux Foundation / CNCF',
                    date: 'Valid: 2024 - 2027',
                    id: 'CKA-9921-OD-IN',
                    badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
                  },
                ].map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={cn('p-2.5 rounded-2xl shrink-0 shadow-2xs', c.badge)}>
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {c.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {c.org} • {c.date}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                          Credential ID: {c.id}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md shrink-0">
                      Verified ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: PRIVATE & BANK INFO ─── */}
      {activeTab === 'private' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Personal Information Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#0077FF] dark:text-[#38BDF8]" />
                Personal Identification
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                Confidential
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Date of Birth</span>
                <span className="font-bold text-slate-900 dark:text-white">15, November 1994 (Age 31)</span>
              </div>
              <div className="flex items-start justify-between py-2 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Residing Address</span>
                <span className="font-bold text-slate-900 dark:text-white text-right max-w-xs">
                  404, Tech Park Residency, SG Highway, Ahmedabad - 380054
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Nationality</span>
                <span className="font-bold text-slate-900 dark:text-white">Indian</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Personal Email</span>
                <span className="font-bold text-slate-900 dark:text-white">{employee.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Gender</span>
                <span className="font-bold text-slate-900 dark:text-white">Male</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Marital Status</span>
                <span className="font-bold text-slate-900 dark:text-white">Single</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Date of Joining</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-IN') : '01/06/2022'}
                </span>
              </div>
            </div>
          </div>

          {/* Banking & Statutory Identity Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Banking & Payroll Records
              </h3>
              <button
                onClick={() => setShowBankDetails(!showBankDetails)}
                className="text-xs font-bold text-[#0077FF] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showBankDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showBankDetails ? 'Mask Details' : 'Show Details'}</span>
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Account Number */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-slate-900 dark:text-white">
                    {showBankDetails ? '918020038472910' : '••••••••••••2910'}
                  </span>
                  <button
                    onClick={() => copyToClipboard('918020038472910', 'Account Number')}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bank Name */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Bank Name</span>
                <span className="font-bold text-slate-900 dark:text-white">HDFC Bank Ltd (Ahmedabad Main)</span>
              </div>

              {/* IFSC Code */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500 font-medium">IFSC Code</span>
                <span className="font-mono font-black text-[#0077FF] dark:text-[#38BDF8]">HDFC0001042</span>
              </div>

              {/* PAN */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500 font-medium">PAN Card No</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {showBankDetails ? 'ABCDE1234F' : 'ABCDE••••F'}
                </span>
              </div>

              {/* UAN */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400 dark:text-slate-500 font-medium">UAN No (EPFO)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">100928374651</span>
              </div>

              {/* Emp Code */}
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Employee Code</span>
                <span className="font-mono font-black text-[#0077FF] dark:text-[#38BDF8]">{employee.loginId}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SALARY INFO (ADMIN/HR ONLY) ─── */}
      {activeTab === 'salary' && isAdmin && (
        <div className="space-y-6 animate-fadeIn">
          {/* Important Wireframe Formula Banner */}
          <div className="bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-3xl p-6 shadow-xs flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 shrink-0">
              <Calculator className="w-6 h-6" />
            </div>
            <div className="space-y-2 text-xs text-purple-900 dark:text-purple-300">
              <h4 className="font-extrabold text-sm text-purple-950 dark:text-purple-100">
                Indian Enterprise Salary Breakdown Engine
              </h4>
              <p className="leading-relaxed">
                All components below automatically recalculate in real-time based on the defined monthly wage.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-semibold text-[11px]">
                <div>• Basic: <strong>50% of Wage</strong></div>
                <div>• HRA: <strong>50% of Basic (25% of Wage)</strong></div>
                <div>• Standard Allowance: <strong>₹4,167 Fixed</strong></div>
                <div>• Bonus: <strong>8.33% of Basic</strong></div>
                <div>• LTA: <strong>8.33% of Basic</strong></div>
                <div>• Fixed: <strong>Balancing Remainder</strong></div>
              </div>
            </div>
          </div>

          {/* Interactive Wage Controller Slider */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Wage & Working Schedule</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Adjust monthly gross compensation to simulate full payout breakdown</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Presets:</span>
                {[50000, 95000, 150000, 250000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setMonthlyWage(amt)}
                    className={cn(
                      'px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
                      monthlyWage === amt
                        ? 'bg-purple-600 text-white shadow-md glow-purple'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    )}
                  >
                    ₹{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Monthly Wage (₹ / Mo)
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
                  Annual Wage (CTC)
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
          </div>

          {/* Salary Components Breakdown Cards */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Earnings Breakdown</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Component breakdown automatically computed from ₹{monthlyWage.toLocaleString('en-IN')} wage</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full">
                100% Balanced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Basic Salary</span>
                  <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">50.00 %</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white">₹{basicSalary.toFixed(2)} / mo</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">50% of defined monthly wage rate.</p>
              </div>

              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">House Rent Allowance (HRA)</span>
                  <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">50.00 % of Basic</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white">₹{hra.toFixed(2)} / mo</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">50% of Basic Salary (25% of total gross wage).</p>
              </div>

              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Standard Allowance</span>
                  <span className="text-xs font-mono font-bold text-[#0077FF] dark:text-[#38BDF8] bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">Fixed ₹4,167</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white">₹{standardAllowance.toFixed(2)} / mo</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Fixed statutory component provided to employees.</p>
              </div>

              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Performance Bonus</span>
                  <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">8.33 %</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white">₹{performanceBonus.toFixed(2)} / mo</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Calculated as 8.33% of Basic Salary.</p>
              </div>

              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Leave Travel Allowance (LTA)</span>
                  <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">8.33 %</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white">₹{lta.toFixed(2)} / mo</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Calculated as 8.33% of Basic Salary.</p>
              </div>

              <div className="p-4.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Fixed Allowance</span>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">Balancing</span>
                </div>
                <p className="text-xl font-black text-emerald-800 dark:text-emerald-300">₹{fixedAllowance.toFixed(2)} / mo</p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">Balancing remainder after computing all components.</p>
              </div>
            </div>
          </div>

          {/* Deductions & Net Payout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Provident Fund (PF) Contribution</h3>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-400">Employee Share (12%)</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-1">₹{employeePf.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">12% of basic salary</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-400">Employer Share (12%)</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-1">₹{employerPf.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">12% matching contribution</p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Tax Deductions & Net Payout</h3>
              <div className="space-y-3 pt-1 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">Professional Tax (PT)</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">₹{professionalTax.toFixed(2)} / mo</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">Total Deductions (PF + PT)</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">₹{totalDeductions.toFixed(2)} / mo</span>
                </div>
                <div className="flex items-center justify-between py-3.5 bg-emerald-50/80 dark:bg-emerald-950/60 px-5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <div>
                    <span className="font-extrabold text-emerald-950 dark:text-emerald-200 text-sm block">Net Monthly Take-Home</span>
                    <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400">Direct Bank Deposit Payout</span>
                  </div>
                  <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-2xl">₹{netTakeHome.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: SECURITY & SESSIONS ─── */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Password Change Form */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Change Account Password</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Keep your account secure with a strong password</p>
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
                  placeholder="Enter new password"
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
                  placeholder="Repeat new password"
                  className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0077FF]"
                />
              </div>

              <button
                type="submit"
                disabled={savingPass}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0077FF] to-[#00B7FE] hover:opacity-95 text-white font-bold text-sm shadow-md glow-primary transition-all cursor-pointer disabled:opacity-50"
              >
                {savingPass ? 'Updating...' : 'Save New Password'}
              </button>
            </form>
          </div>

          {/* Active Device Sessions List */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Active Device Sessions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage signed-in devices and browser access</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Windows 11 · Chrome 128.0</p>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500 text-white">Current</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ahmedabad, Gujarat · IP 192.168.1.42</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Active Now</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">iPhone 15 Pro · Safari Mobile</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Gandhinagar, Gujarat · 2 hours ago</p>
                  </div>
                </div>
                <button
                  onClick={() => success('Session revoked successfully')}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Revoke
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scaleIn">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Skill</h3>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js App Router"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Proficiency Level</label>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as any)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 outline-none"
                >
                  <option value="Expert">Expert (90-100%)</option>
                  <option value="Advanced">Advanced (75-89%)</option>
                  <option value="Intermediate">Intermediate (60-74%)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-[#0077FF] text-white font-bold text-sm shadow-md glow-primary"
                >
                  Add to Resume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
