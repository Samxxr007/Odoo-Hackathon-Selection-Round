'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

const signinSchema = z.object({
  loginId: z.string().min(1, 'Login ID or email is required'),
  password: z.string().min(1, 'Password is required'),
})

type SigninFormData = z.infer<typeof signinSchema>

export default function SigninPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  })

  const onSubmit = async (data: SigninFormData) => {
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      let json: any
      try {
        const text = await res.text()
        json = JSON.parse(text)
      } catch {
        toastError('Unable to process authentication response.')
        return
      }

      if (!json.success) {
        if (json.fieldErrors) {
          Object.entries(json.fieldErrors).forEach(([field, msgs]) => {
            setError(field as keyof SigninFormData, {
              message: (msgs as string[])[0],
            })
          })
        } else {
          setError('password', { message: json.error || 'Authentication failed' })
        }
        return
      }

      success('Welcome back!')
      window.location.href = json.redirectTo ?? '/dashboard'
    } catch {
      toastError('Network error. Please check your connection.')
    }
  }

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-8 sm:p-10 space-y-8 transition-colors duration-300">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0077FF] dark:text-[#38BDF8] bg-[#0077FF]/10 dark:bg-[#38BDF8]/15 px-2.5 py-0.5 rounded-full">
            Secure Portal
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Sign In</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Enter your auto-generated <strong>Login ID</strong> or <strong>work email</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Login ID or Work Email"
          placeholder="e.g. OIADWR20200001 or admin@odoo.com"
          error={errors.loginId?.message}
          leftIcon={<User className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
          autoComplete="username"
          {...register('loginId')}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.password?.message}
            leftIcon={<Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            autoComplete="current-password"
            {...register('password')}
          />
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#0077FF] via-[#0088FF] to-[#00B7FE] hover:opacity-95 text-white font-bold text-sm shadow-lg glow-primary transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>SIGN IN</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* Demo Credentials Quick-Fill Pill */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1.5">
        <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#0077FF] dark:text-[#38BDF8]" />
          Demo Test Accounts:
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">Admin:</span> admin@odoo.com<br />
            <span className="font-mono text-slate-400">Admin@123456</span>
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">Employee:</span> john.doe@odoo.com<br />
            <span className="font-mono text-slate-400">Emp@123456</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Don&apos;t have an Account?{' '}
          <Link
            href="/signup"
            className="text-[#0077FF] dark:text-[#38BDF8] font-bold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
