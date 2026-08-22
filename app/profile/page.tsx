'use client'

import React, { useState, useEffect } from 'react'
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
import { UnifiedHeader } from '@/components/layout/UnifiedHeader'
import { useToast } from '@/components/ui/Toast'

type ProfileTab = 'resume' | 'private' | 'salary' | 'security'

export default function MyProfilePage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()

  const [currentUser, setCurrentUser] = useState<any>(null)
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
        const meRes = await fetch('/api/auth/me')
        const meJson = await meRes.json()

        if (meJson.success && meJson.data) {
          setCurrentUser(meJson.data)
          if (meJson.data.role === 'ADMIN') {
            setMonthlyWage(250000)
          } else if (meJson.data.department === 'Engineering') {
            setMonthlyWage(95000)
          } else {
            setMonthlyWage(50000)
          }
        } else {
          router.push('/signin')
        }
      } catch {
        toastError('Failed to load profile details')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router, toastError])

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
      <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#0B0F17] flex flex-col">
        <UnifiedHeader initialUser={currentUser} />
        <div className="py-24 text-center space-y-4 flex-1">
          <div className="w-12 h-12 border-4 border-[#0077FF] border-t-transparent rounded-full animate-spin mx-auto glow-primary" />
          <p className="text-sm font-bold text-slate-400">Loading My Profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#0B0F17] flex flex-col transition-colors duration-300">
      <UnifiedHeader initialUser={currentUser} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-16 animate-fadeIn">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-[#0077FF] dark:hover:text-[#38BDF8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#0077FF]/10 text-[#0077FF] dark:bg-[#38BDF8]/15 dark:text-[#38BDF8] border border-blue-200 dark:border-blue-800/50">
            My Personal Account
          </span>
        </div>

        {/* Top Profile Header Card */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#0077FF] to-[#00E5FF] rounded-3xl blur-xs opacity-75 group-hover:opacity-100 transition-opacity" />
              <img
                src={currentUser?.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                alt={currentUser?.name}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#22C55E] border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center text-[10px] text-white font-bold" title="Active">
                ✓
              </span>
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currentUser?.name}
                  </h1>
                  <p className="text-sm font-bold text-[#0077FF] dark:text-[#38BDF8] mt-0.5">
                    {currentUser?.designation || 'Staff Member'}
                  </p>
                </div>

                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    {currentUser?.loginId}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {currentUser?.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{currentUser?.phone || '+91 98250 11223'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser?.department || 'Executive Leadership'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Odoo India Technology</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Manager: Alexander Wright</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{currentUser?.location || 'Gandhinagar, Gujarat'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
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

        {/* Tab Panels */}
        {activeTab === 'resume' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">About</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Dedicated technology leader focused on high-scale architecture, team mentorship, and operational excellence across modern enterprise cloud environments.
              </p>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">What I love about my job</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Empowering colleagues to achieve their full potential, eliminating technical debt, and building intuitive HR systems.
              </p>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">My interests and hobbies</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Distributed systems, mechanical keyboards, hiking, and open source development.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'private' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3">Personal Information</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">Date of Birth</span>
                  <span className="font-bold text-slate-900 dark:text-white">15, November 1994</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">Residing Address</span>
                  <span className="font-bold text-slate-900 dark:text-white">404, Tech Park Residency, SG Highway, Ahmedabad</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">Nationality</span>
                  <span className="font-bold text-slate-900 dark:text-white">Indian</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Gender</span>
                  <span className="font-bold text-slate-900 dark:text-white">Male</span>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3">Bank Details</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">Account Number</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">918020038472910</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">Bank Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">HDFC Bank Ltd</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">IFSC Code</span>
                  <span className="font-mono font-bold text-[#0077FF] dark:text-[#38BDF8]">HDFC0001042</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">PAN No</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">ABCDE1234F</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'salary' && isAdmin && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Monthly Wage</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={monthlyWage}
                    onChange={(e) => setMonthlyWage(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2.5 text-base font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Yearly Wage</label>
                <div className="py-2.5 px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-base font-black text-purple-700 dark:text-purple-400">
                  ₹{yearlyWage.toLocaleString('en-IN')}.00 / Yr
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Salary Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Basic Salary (50%)</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">₹{basicSalary.toFixed(2)}</p>
                </div>
                <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">HRA (50% of Basic)</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">₹{hra.toFixed(2)}</p>
                </div>
                <div className="p-4.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Fixed Allowance</p>
                  <p className="text-xl font-black text-emerald-800 dark:text-emerald-300 mt-1">₹{fixedAllowance.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs max-w-xl mx-auto animate-fadeIn space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0077FF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0077FF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0077FF]"
                />
              </div>
              <button
                type="submit"
                disabled={savingPass}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0077FF] to-[#00B7FE] hover:opacity-95 text-white font-bold text-sm shadow-md glow-primary transition-all cursor-pointer"
              >
                {savingPass ? 'Updating...' : 'Save New Password'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
