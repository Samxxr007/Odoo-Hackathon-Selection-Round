'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Building2, User, Mail, Phone, Lock, Upload, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

const signupSchema = z
  .object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters'),
    adminName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must include an uppercase letter')
      .regex(/[a-z]/, 'Must include a lowercase letter')
      .regex(/[0-9]/, 'Must include a digit')
      .regex(/[^A-Za-z0-9]/, 'Must include a special character'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

interface CreatedAccount {
  loginId: string
  devVerificationUrl?: string
}

export default function SignupPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [created, setCreated] = useState<CreatedAccount | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) })

  const password = watch('password', '')

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: SignupFormData) => {
    try {
      const formData = new FormData()
      formData.append('companyName', data.companyName)
      formData.append('adminName', data.adminName)
      formData.append('email', data.email)
      formData.append('phone', data.phone ?? '')
      formData.append('password', data.password)
      formData.append('confirmPassword', data.confirmPassword)
      if (logoFile) formData.append('logo', logoFile)

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      if (!json.success) {
        if (json.fieldErrors) {
          Object.entries(json.fieldErrors).forEach(([field, msgs]) => {
            if (field in data) {
              setError(field as keyof SignupFormData, { message: (msgs as string[])[0] })
            }
          })
        } else {
          toastError(json.error ?? 'Failed to create account')
        }
        return
      }

      setCreated({
        loginId: json.loginId,
        devVerificationUrl: json.devVerificationUrl,
      })
      success('Company account created!')
    } catch {
      toastError('Network error. Please check your connection.')
    }
  }

  // Success state
  if (created) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-8 sm:p-10 text-center space-y-6 animate-scaleIn">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-500">
          <CheckCircle className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Account Created!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your company HRMS is ready.</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 text-left border border-slate-200/80 dark:border-slate-700">
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-1">
            Your Auto-Generated Login ID
          </p>
          <p className="font-mono font-black text-[#0077FF] dark:text-[#38BDF8] text-xl tracking-tight">{created.loginId}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Save this ID — you can use it alongside your password to sign in.</p>
        </div>

        <Button className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#0077FF] to-[#00B7FE] text-white font-bold glow-primary" size="lg" onClick={() => router.push('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    )
  }

  const strengthChecks = [
    { test: password.length >= 8, label: '8+ chars' },
    { test: /[A-Z]/.test(password), label: 'Uppercase' },
    { test: /[0-9]/.test(password), label: 'Number' },
    { test: /[^A-Za-z0-9]/.test(password), label: 'Special symbol' },
  ]

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-8 sm:p-10 space-y-6 transition-colors duration-300">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0077FF] dark:text-[#38BDF8] bg-[#0077FF]/10 dark:bg-[#38BDF8]/15 px-2.5 py-0.5 rounded-full">
            Company Onboarding
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Register Company</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">Set up your HRMS in minutes</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Company Logo Upload */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
            Company Logo <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div
            className="flex items-center gap-3.5 p-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            onClick={() => logoInputRef.current?.click()}
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-12 w-12 rounded-xl object-contain border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 shadow-2xs">
                <Upload className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-[#0077FF] dark:text-[#38BDF8]">
                {logoFile ? logoFile.name : 'Upload Company Logo'}
              </p>
              <p className="text-[10px] text-slate-400">PNG, JPG, SVG up to 5MB</p>
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>

        <Input
          label="Company Name"
          placeholder="e.g. Odoo India Technology Pvt Ltd"
          error={errors.companyName?.message}
          leftIcon={<Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
          required
          {...register('companyName')}
        />

        <Input
          label="Your Name (Admin)"
          placeholder="e.g. Alexander Wright"
          error={errors.adminName?.message}
          leftIcon={<User className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
          required
          {...register('adminName')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="admin@company.com"
          error={errors.email?.message}
          leftIcon={<Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
          required
          autoComplete="email"
          {...register('email')}
        />

        <Input
          label="Phone"
          type="tel"
          placeholder="+91 98765 43210"
          error={errors.phone?.message}
          leftIcon={<Phone className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
          {...register('phone')}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create strong master password"
            error={errors.password?.message}
            leftIcon={<Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword((p) => !p)} aria-label="Toggle">
                {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
              </button>
            }
            required
            autoComplete="new-password"
            {...register('password')}
          />
          {password && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {strengthChecks.map((c) => (
                <span
                  key={c.label}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    c.test ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {c.test ? '✓' : '○'} {c.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repeat master password"
          error={errors.confirmPassword?.message}
          leftIcon={<Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
          rightIcon={
            <button type="button" onClick={() => setShowConfirm((p) => !p)} aria-label="Toggle">
              {showConfirm ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
            </button>
          }
          required
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#0077FF] via-[#0088FF] to-[#00B7FE] hover:opacity-95 text-white font-bold text-sm shadow-lg glow-primary transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-4"
          size="lg"
          isLoading={isSubmitting}
        >
          <span>Create Company Account</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link href="/signin" className="text-[#0077FF] dark:text-[#38BDF8] font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
