'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Copy, Eye, EyeOff } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import type { EmployeeSummary } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  location: z.string().optional(),
  managerId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface CreatedEmployee {
  employee: EmployeeSummary
  loginId: string
  tempPassword: string
}

interface NewEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (employee: EmployeeSummary) => void
  managers: Array<{ id: string; name: string }>
}

export function NewEmployeeModal({ isOpen, onClose, onCreated, managers }: NewEmployeeModalProps) {
  const { success, error: toastError } = useToast()
  const [created, setCreated] = useState<CreatedEmployee | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState<'loginId' | 'password' | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      joiningDate: new Date().toISOString().split('T')[0],
    },
  })

  const copyToClipboard = async (text: string, field: 'loginId' | 'password') => {
    await navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleClose = () => {
    setCreated(null)
    reset()
    onClose()
  }

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!json.success) {
        if (json.fieldErrors) {
          Object.entries(json.fieldErrors).forEach(([field, msgs]) => {
            if (field in data) {
              setError(field as keyof FormData, { message: (msgs as string[])[0] })
            }
          })
        } else {
          toastError(json.error ?? 'Failed to create employee')
        }
        return
      }

      setCreated(json.data)
      success('Employee created!')
      onCreated(json.data.employee)
    } catch {
      toastError('Network error. Please try again.')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={created ? 'Employee Created!' : 'New Employee'}
      description={created ? 'Save these credentials — the password will not be shown again.' : 'Fill in the employee details below.'}
      size="lg"
    >
      {created ? (
        // ─── One-time credentials display ───
        <div className="p-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">{created.employee.name}</p>
              <p className="text-sm text-green-700">{created.employee.department} · {created.employee.designation}</p>
            </div>
          </div>

          {/* Login ID */}
          <div className="bg-[#F4F7FB] rounded-xl p-4">
            <p className="text-xs text-[#8F9CAE] font-medium uppercase tracking-wide mb-2">Login ID</p>
            <div className="flex items-center justify-between gap-2">
              <code className="font-mono font-bold text-[#0077FF] text-lg">{created.loginId}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(created.loginId, 'loginId')}
                className="text-[#8F9CAE]"
              >
                {copied === 'loginId' ? (
                  <span className="text-green-600 text-xs">Copied!</span>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Temp Password */}
          <div className="bg-[#F4F7FB] rounded-xl p-4">
            <p className="text-xs text-[#8F9CAE] font-medium uppercase tracking-wide mb-2">
              Temporary Password <span className="text-[#F9911E]">(shown once)</span>
            </p>
            <div className="flex items-center justify-between gap-2">
              <code className="font-mono font-bold text-[#1A1D24] text-lg tracking-wider">
                {showPassword ? created.tempPassword : '••••••••••••'}
              </code>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-[#8F9CAE]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(created.tempPassword, 'password')}
                  className="text-[#8F9CAE]"
                >
                  {copied === 'password' ? (
                    <span className="text-green-600 text-xs">Copied!</span>
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#8F9CAE]">
            The employee will be required to change this password on first login.
          </p>

          <Button className="w-full" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        // ─── Create employee form ───
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              error={errors.name?.message}
              required
              {...register('name')}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="john@company.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="+91 98765 43210"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Department"
              placeholder="Engineering"
              error={errors.department?.message}
              required
              {...register('department')}
            />
            <Input
              label="Designation"
              placeholder="Software Engineer"
              error={errors.designation?.message}
              required
              {...register('designation')}
            />
            <Input
              label="Joining Date"
              type="date"
              error={errors.joiningDate?.message}
              required
              {...register('joiningDate')}
            />
            <Input
              label="Location"
              placeholder="Mumbai"
              error={errors.location?.message}
              {...register('location')}
            />

            {/* Manager select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#1A1D24]">Manager</label>
              <select
                className="h-10 rounded-lg border border-[#E5ECF2] bg-white px-3 text-sm text-[#1A1D24]
                           focus:border-[#0077FF] focus:ring-2 focus:ring-[#0077FF]/20 outline-none"
                {...register('managerId')}
              >
                <option value="">No manager</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              Create Employee
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
