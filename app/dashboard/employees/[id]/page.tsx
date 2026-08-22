'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { EnhancedProfileView } from '@/components/profile/EnhancedProfileView'
import { useToast } from '@/components/ui/Toast'

export default function EmployeeProfileDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const employeeId = resolvedParams.id
  const router = useRouter()
  const { error: toastError } = useToast()

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
        } else {
          toastError(empJson.error || 'Failed to load employee details')
        }
      } catch (err) {
        toastError('Failed to connect to server')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [employeeId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-[#0077FF] animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading comprehensive employee profile...</p>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employee Profile Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">The requested employee ID does not exist or has been removed.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0077FF] text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    )
  }

  const isSelf = currentUser?.id === employee.id

  return (
    <EnhancedProfileView
      employee={employee}
      currentUser={currentUser}
      isSelf={isSelf}
    />
  )
}
