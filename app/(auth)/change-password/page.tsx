'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must include uppercase')
      .regex(/[a-z]/, 'Must include lowercase')
      .regex(/[0-9]/, 'Must include a digit')
      .regex(/[^A-Za-z0-9]/, 'Must include a special character'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function ChangePasswordPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const newPwd = watch('newPassword', '')
  const strengthChecks = [
    { test: newPwd.length >= 8, label: '8+ chars' },
    { test: /[A-Z]/.test(newPwd), label: 'Uppercase' },
    { test: /[a-z]/.test(newPwd), label: 'Lowercase' },
    { test: /[0-9]/.test(newPwd), label: 'Number' },
    { test: /[^A-Za-z0-9]/.test(newPwd), label: 'Special' },
  ]

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!json.success) {
        if (json.fieldErrors) {
          Object.entries(json.fieldErrors).forEach(([field, msgs]) => {
            setError(field as keyof FormData, { message: (msgs as string[])[0] })
          })
        } else {
          toastError(json.error)
        }
        return
      }

      success('Password changed! Redirecting…')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      toastError('Network error. Please try again.')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5ECF2] shadow-sm p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#EAF3FF] flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-[#0077FF]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1A1D24]">Change Password</h1>
          <p className="text-sm text-[#8F9CAE]">You must set a new password to continue</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Current / Temporary Password"
          type={showCurrent ? 'text' : 'password'}
          error={errors.currentPassword?.message}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button type="button" onClick={() => setShowCurrent((p) => !p)}>
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          required
          autoComplete="current-password"
          {...register('currentPassword')}
        />

        <div>
          <Input
            label="New Password"
            type={showNew ? 'text' : 'password'}
            error={errors.newPassword?.message}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowNew((p) => !p)}>
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            required
            autoComplete="new-password"
            {...register('newPassword')}
          />
          {newPwd && (
            <div className="mt-2 flex flex-wrap gap-2">
              {strengthChecks.map((c) => (
                <span
                  key={c.label}
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    c.test ? 'bg-green-50 text-green-700' : 'bg-[#F4F7FB] text-[#8F9CAE]'
                  }`}
                >
                  {c.test ? '✓' : '○'} {c.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <Input
          label="Confirm New Password"
          type={showConfirm ? 'text' : 'password'}
          error={errors.confirmPassword?.message}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button type="button" onClick={() => setShowConfirm((p) => !p)}>
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          required
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full mt-2" size="lg" isLoading={isSubmitting}>
          Set New Password
        </Button>
      </form>
    </div>
  )
}
