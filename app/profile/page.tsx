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
      <div className="min-h-screen bg-[#F4F7FB] flex flex-col">
        <UnifiedHeader initialUser={currentUser} />
        <div className="py-24 text-center space-y-3 flex-1">
          <div className="w-10 h-10 border-4 border-[#0077FF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#8F9CAE]">Loading My Profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col">
      <UnifiedHeader initialUser={currentUser} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#5A687D] hover:text-[#0077FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EAF3FF] text-[#0077FF] border border-blue-200">
            My Profile
          </span>
        </div>

        {/* Top Profile Header Card */}
        <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <img
                src={currentUser?.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                alt={currentUser?.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-[#F4F7FB] shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#22C55E] border-3 border-white shadow-sm flex items-center justify-center text-[10px] text-white font-bold" title="Active">
                ✓
              </span>
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D24] tracking-tight">
                    {currentUser?.name}
                  </h1>
                  <p className="text-sm font-bold text-[#0077FF] mt-0.5">
                    {currentUser?.designation || 'Staff Member'}
                  </p>
                </div>

                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#F4F7FB] text-[#1A1D24] border border-[#E5ECF2]">
                    {currentUser?.loginId}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {currentUser?.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs text-[#5A687D]">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#8F9CAE]" />
                  <span className="truncate">{currentUser?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#8F9CAE]" />
                  <span>{currentUser?.phone || '+91 98250 11223'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#8F9CAE]" />
                  <span className="truncate">{currentUser?.department || 'Executive Leadership'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#8F9CAE]" />
                  <span>Odoo India Technology</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#8F9CAE]" />
                  <span>Manager: Alexander Wright</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#8F9CAE]" />
                  <span>{currentUser?.location || 'Gandhinagar, Gujarat'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
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

        {/* Tab Panels */}
        {activeTab === 'resume' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#1A1D24] uppercase tracking-wider">About</h3>
              <p className="text-sm text-[#5A687D] leading-relaxed">
                Dedicated technology leader focused on high-scale architecture, team mentorship, and operational excellence across modern enterprise cloud environments.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#1A1D24] uppercase tracking-wider">What I love about my job</h3>
              <p className="text-sm text-[#5A687D] leading-relaxed">
                Empowering colleagues to achieve their full potential, eliminating technical debt, and building intuitive HR systems.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#1A1D24] uppercase tracking-wider">My interests and hobbies</h3>
              <p className="text-sm text-[#5A687D] leading-relaxed">
                Distributed systems, mechanical keyboards, hiking, and open source development.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'private' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1A1D24] uppercase tracking-wider border-b border-[#E5ECF2] pb-3">Personal Information</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                  <span className="text-[#8F9CAE]">Date of Birth</span>
                  <span className="font-bold text-[#1A1D24]">15, November 1994</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                  <span className="text-[#8F9CAE]">Residing Address</span>
                  <span className="font-bold text-[#1A1D24]">404, Tech Park Residency, SG Highway, Ahmedabad</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#F4F7FB]">
                  <span className="text-[#8F9CAE]">Nationality</span>
                  <span className="font-bold text-[#1A1D24]">Indian</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#8F9CAE]">Gender</span>
                  <span className="font-bold text-[#1A1D24]">Male</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1A1D24] uppercase tracking-wider border-b border-[#E5ECF2] pb-3">Bank Details</h3>
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
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#8F9CAE]">PAN No</span>
                  <span className="font-mono font-bold text-[#1A1D24]">ABCDE1234F</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'salary' && isAdmin && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-xs font-bold text-[#8F9CAE] uppercase tracking-wider block mb-1.5">Monthly Wage</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-[#8F9CAE]">₹</span>
                  <input
                    type="number"
                    value={monthlyWage}
                    onChange={(e) => setMonthlyWage(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2 text-base font-black text-[#1A1D24] bg-[#F4F7FB] rounded-xl border border-[#E5ECF2] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#8F9CAE] uppercase tracking-wider block mb-1.5">Yearly Wage</label>
                <div className="p-2 bg-[#F4F7FB] rounded-xl border border-[#E5ECF2] text-base font-black text-purple-700">
                  ₹{yearlyWage.toLocaleString('en-IN')}.00 / Yr
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="text-lg font-extrabold text-[#1A1D24]">Salary Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E5ECF2]">
                  <p className="text-xs font-bold text-[#1A1D24]">Basic Salary (50%)</p>
                  <p className="text-xl font-black text-[#1A1D24] mt-1">₹{basicSalary.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E5ECF2]">
                  <p className="text-xs font-bold text-[#1A1D24]">HRA (50% of Basic)</p>
                  <p className="text-xl font-black text-[#1A1D24] mt-1">₹{hra.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-900">Fixed Allowance</p>
                  <p className="text-xl font-black text-emerald-800 mt-1">₹{fixedAllowance.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl border border-[#E5ECF2] p-6 sm:p-8 shadow-xs max-w-xl mx-auto animate-fadeIn space-y-6">
            <h3 className="text-lg font-extrabold text-[#1A1D24]">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#8F9CAE] uppercase tracking-wider block mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#F4F7FB] rounded-xl border border-[#E5ECF2] outline-none focus:ring-2 focus:ring-[#0077FF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#8F9CAE] uppercase tracking-wider block mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#F4F7FB] rounded-xl border border-[#E5ECF2] outline-none focus:ring-2 focus:ring-[#0077FF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#8F9CAE] uppercase tracking-wider block mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-[#F4F7FB] rounded-xl border border-[#E5ECF2] outline-none focus:ring-2 focus:ring-[#0077FF]"
                />
              </div>
              <button
                type="submit"
                disabled={savingPass}
                className="w-full py-3 rounded-xl bg-[#0077FF] hover:bg-[#0060CC] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
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
