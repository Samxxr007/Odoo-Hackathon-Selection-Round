'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { UnifiedHeader } from '@/components/layout/UnifiedHeader'
import { EnhancedProfileView } from '@/components/profile/EnhancedProfileView'
import { useToast } from '@/components/ui/Toast'

export default function MyProfilePage() {
  const router = useRouter()
  const { error: toastError } = useToast()

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const meRes = await fetch('/api/auth/me')
        const meJson = await meRes.json()

        if (meJson.success && meJson.data) {
          setCurrentUser(meJson.data)
        } else {
          router.push('/signin')
        }
      } catch (err) {
        toastError('Failed to load profile details')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#0B0F17] flex flex-col transition-colors duration-300">
      <UnifiedHeader initialUser={currentUser} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fadeIn">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <Loader2 className="w-8 h-8 text-[#0077FF] animate-spin" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your profile...</p>
          </div>
        ) : currentUser ? (
          <EnhancedProfileView
            employee={currentUser}
            currentUser={currentUser}
            isSelf={true}
          />
        ) : null}
      </main>
    </div>
  )
}
