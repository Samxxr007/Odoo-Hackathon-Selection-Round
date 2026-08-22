'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
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

      const json = await res.json()

      if (!json.success) {
        if (json.fieldErrors) {
          Object.entries(json.fieldErrors).forEach(([field, msgs]) => {
            setError(field as keyof SigninFormData, {
              message: (msgs as string[])[0],
            })
          })
        } else {
          setError('password', { message: json.error })
        }
        return
      }

      success('Welcome back!')
      router.push(json.redirectTo ?? '/dashboard')
    } catch {
      toastError('Network error. Please check your connection.')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5ECF2] shadow-sm p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1D24]">Sign In</h1>
        <p className="text-[#8F9CAE] text-sm mt-1">
          Enter your Login ID or email to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Login ID or Email"
          placeholder="e.g. OIJODO20220001 or john@company.com"
          error={errors.loginId?.message}
          leftIcon={<User className="h-4 w-4" />}
          autoComplete="username"
          {...register('loginId')}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            error={errors.password?.message}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                suppressHydrationWarning
                className="focus:outline-none hover:text-[#1A1D24] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            autoComplete="current-password"
            {...register('password')}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isSubmitting}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#8F9CAE]">
          Need to register your company?{' '}
          <Link href="/signup" className="text-[#0077FF] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
