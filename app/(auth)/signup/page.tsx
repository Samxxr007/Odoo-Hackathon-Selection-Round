'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Building2, User, Mail, Phone, Lock, Upload, CheckCircle } from 'lucide-react'
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
      <div className="bg-white rounded-2xl border border-[#E5ECF2] shadow-sm p-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1D24]">Account Created!</h1>
          <p className="text-[#8F9CAE]">Your company HRMS is ready.</p>

          <div className="w-full bg-[#F4F7FB] rounded-xl p-4 text-left">
            <p className="text-xs text-[#8F9CAE] uppercase tracking-wide font-medium mb-2">
              Your Login ID
            </p>
            <p className="font-mono font-bold text-[#0077FF] text-lg">{created.loginId}</p>
            <p className="text-xs text-[#8F9CAE] mt-1">Save this — you&apos;ll need it to sign in</p>
          </div>

          {created.devVerificationUrl && (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
              <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ Dev Mode — Verification URL</p>
              <a
                href={created.devVerificationUrl}
                className="text-xs text-amber-700 break-all underline"
              >
                {created.devVerificationUrl}
              </a>
            </div>
          )}

          <Button className="w-full" size="lg" onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const strengthChecks = [
    { test: password.length >= 8, label: '8+ characters' },
    { test: /[A-Z]/.test(password), label: 'Uppercase letter' },
    { test: /[0-9]/.test(password), label: 'Number' },
    { test: /[^A-Za-z0-9]/.test(password), label: 'Special character' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-[#E5ECF2] shadow-sm p-8 max-h-screen overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1D24]">Register Your Company</h1>
        <p className="text-[#8F9CAE] text-sm mt-1">Set up your HRMS in minutes</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Company Logo */}
        <div>
          <label className="text-sm font-medium text-[#1A1D24] block mb-1.5">
            Company Logo <span className="text-[#8F9CAE] font-normal">(optional)</span>
          </label>
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => logoInputRef.current?.click()}
          >
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-12 w-12 rounded-xl object-contain border border-[#E5ECF2]"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl border-2 border-dashed border-[#E5ECF2] flex items-center justify-center bg-[#F4F7FB]">
                <Upload className="h-5 w-5 text-[#8F9CAE]" />
              </div>
            )}
            <div>
              <p className="text-sm text-[#0077FF] font-medium">
                {logoFile ? logoFile.name : 'Upload logo'}
              </p>
              <p className="text-xs text-[#8F9CAE]">PNG, JPG up to 5MB</p>
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
          placeholder="Acme Corp"
          error={errors.companyName?.message}
          leftIcon={<Building2 className="h-4 w-4" />}
          required
          {...register('companyName')}
        />

        <Input
          label="Your Name (Admin)"
          placeholder="John Doe"
          error={errors.adminName?.message}
          leftIcon={<User className="h-4 w-4" />}
          required
          {...register('adminName')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="john@company.com"
          error={errors.email?.message}
          leftIcon={<Mail className="h-4 w-4" />}
          required
          autoComplete="email"
          {...register('email')}
        />

        <Input
          label="Phone"
          type="tel"
          placeholder="+91 98765 43210"
          error={errors.phone?.message}
          leftIcon={<Phone className="h-4 w-4" />}
          {...register('phone')}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            error={errors.password?.message}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword((p) => !p)} aria-label="Toggle">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            required
            autoComplete="new-password"
            {...register('password')}
          />
          {/* Password strength */}
          {password && (
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
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button type="button" onClick={() => setShowConfirm((p) => !p)} aria-label="Toggle">
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          required
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full mt-2" size="lg" isLoading={isSubmitting}>
          Create Company Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#8F9CAE]">
        Already have an account?{' '}
        <Link href="/signin" className="text-[#0077FF] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
