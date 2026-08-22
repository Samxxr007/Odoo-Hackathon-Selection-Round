'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided.')
      return
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStatus('success')
          setMessage('Your email has been verified. You can now sign in.')
        } else {
          setStatus('error')
          setMessage(json.error ?? 'Verification failed.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Network error. Please try again.')
      })
  }, [token])

  return (
    <div className="bg-white rounded-2xl border border-[#E5ECF2] shadow-sm p-8 text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-[#0077FF] animate-spin" />
          <h1 className="text-xl font-bold text-[#1A1D24]">Verifying your email…</h1>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold text-[#1A1D24]">Email Verified!</h1>
          <p className="text-[#8F9CAE]">{message}</p>
          <Link
            href="/signin"
            className="inline-flex items-center justify-center rounded-lg font-medium bg-[#0077FF] hover:bg-[#0060CC] text-white h-10 px-4 text-sm shadow-sm transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4">
          <XCircle className="h-16 w-16 text-red-400" />
          <h1 className="text-2xl font-bold text-[#1A1D24]">Verification Failed</h1>
          <p className="text-[#8F9CAE]">{message}</p>
          <div className="flex gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg font-medium border border-[#E5ECF2] bg-white hover:bg-[#F4F7FB] text-[#1A1D24] h-10 px-4 text-sm transition-colors"
            >
              Sign Up Again
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center rounded-lg font-medium bg-[#0077FF] hover:bg-[#0060CC] text-white h-10 px-4 text-sm shadow-sm transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl border border-[#E5ECF2] shadow-sm p-8 text-center">
          <Loader2 className="h-12 w-12 text-[#0077FF] animate-spin mx-auto" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
