'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Copy, Eye, EyeOff, Sparkles, UserPlus } from 'lucide-react'
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

      setCreated({
        employee: json.employee,
        loginId: json.loginId,
        tempPassword: json.tempPassword,
      })
      onCreated(json.employee)
      success('Employee created successfully!')
    } catch {
      toastError('Network error. Please try again.')
    }
  }

  const handleClose = () => {
    setCreated(null)
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={created ? 'Employee Created!' : 'Add New Employee'}
      description={created ? 'Save these credentials — the temporary password will not be shown again.' : 'Fill in the employee information to generate account & credentials.'}
      size="lg"
    >
      {created ? (
        // ─── One-time credentials display ───
        <div className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-300">{created.employee.name}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">{created.employee.department} · {created.employee.designation}</p>
            </div>
          </div>

          {/* Login ID */}
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Auto-Generated Login ID</p>
            <div className="flex items-center justify-between gap-2">
              <code className="font-mono font-black text-[#0077FF] dark:text-[#38BDF8] text-lg">{created.loginId}</code>
              <button
                type="button"
                onClick={() => copyToClipboard(created.loginId, 'loginId')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copied === 'loginId' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Temp Password */}
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
              Temporary Password <span className="text-amber-500 font-semibold">(one-time visible)</span>
            </p>
            <div className="flex items-center justify-between gap-2">
              <code className="font-mono font-black text-slate-900 dark:text-white text-lg tracking-wider">
                {showPassword ? created.tempPassword : '••••••••••••'}
              </code>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(created.tempPassword, 'password')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied === 'password' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            The employee will be required to change this temporary password on their first login.
          </p>

          <Button className="w-full h-11 rounded-2xl bg-[#0077FF] text-white font-bold" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        // ─── Create employee form ───
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Rahul Verma"
              error={errors.name?.message}
              required
              {...register('name')}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="rahul.verma@odoo.com"
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
              placeholder="Senior Software Engineer"
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
              placeholder="Ahmedabad, Gujarat"
              error={errors.location?.message}
              {...register('location')}
            />

            {/* Manager select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200">
                Reporting Manager
              </label>
              <select
                className="h-11 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-white focus:border-[#0077FF] dark:focus:border-[#38BDF8] focus:ring-3 focus:ring-[#0077FF]/15 outline-none transition-colors"
                {...register('managerId')}
              >
                <option value="">No manager (Executive / Top Level)</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              className="flex-1 h-11 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={handleClose}
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[#0077FF] to-[#00B7FE] text-white font-bold glow-primary"
              isLoading={isSubmitting}
            >
              Generate Account
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
