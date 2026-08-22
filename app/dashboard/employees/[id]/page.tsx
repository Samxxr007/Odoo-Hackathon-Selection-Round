'use client'

import { useEffect, useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  User,
  Shield,
  Camera,
  CheckCircle,
  Clock,
  Plane,
  CircleHelp,
  Edit2,
  Save,
  X,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import type { EmployeeFullProfile, EmployeeSummary } from '@/types'
import { AttendanceStatusType } from '@prisma/client'

const profileEditSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  isActive: z.boolean().optional(),
})

type ProfileEditData = z.infer<typeof profileEditSchema>

export default function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const employeeId = resolvedParams.id
  const router = useRouter()
  const { success, error: toastError } = useToast()

  const [profile, setProfile] = useState<(EmployeeFullProfile | EmployeeSummary) | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isSelf = currentUser?.id === employeeId
  const isAdmin = currentUser?.role === 'ADMIN'
  const canEdit = isSelf || isAdmin

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ProfileEditData>({
    resolver: zodResolver(profileEditSchema),
  })

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [meRes, empRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch(`/api/employees/${employeeId}`),
        ])

        const [meJson, empJson] = await Promise.all([meRes.json(), empRes.json()])

        if (meJson.success) {
          setCurrentUser(meJson.data)
        }

        if (empJson.success) {
          setProfile(empJson.data)
          reset({
            name: empJson.data.name,
            phone: empJson.data.phone || '',
            location: empJson.data.location || '',
            department: empJson.data.department || '',
            designation: empJson.data.designation || '',
            isActive: empJson.data.isActive,
          })
        } else {
          toastError(empJson.error || 'Failed to load employee profile')
        }
      } catch {
        toastError('Network error while loading profile')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [employeeId, reset, toastError])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingPhoto(true)
      const formData = new FormData()
      formData.append('photo', file)

      const res = await fetch(`/api/employees/${employeeId}/photo`, {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (json.success) {
        success('Profile photo updated')
        setProfile((prev) => (prev ? { ...prev, profilePhotoUrl: json.data.profilePhotoUrl } : prev))
      } else {
        toastError(json.error || 'Failed to upload photo')
      }
    } catch {
      toastError('Photo upload failed')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const onSaveProfile = async (data: ProfileEditData) => {
    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()
      if (json.success) {
        success('Profile updated successfully')
        setProfile((prev) => (prev ? { ...prev, ...json.data } : prev))
        setIsEditing(false)
      } else {
        toastError(json.error || 'Failed to update profile')
      }
    } catch {
      toastError('Network error while updating profile')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <div className="bg-white rounded-2xl border border-[#E5ECF2] p-8 flex flex-col items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-[#8F9CAE]">Employee not found or access denied.</p>
        <Link
          href="/dashboard/employees"
          className="inline-flex items-center justify-center rounded-lg font-medium border border-[#E5ECF2] bg-white hover:bg-[#F4F7FB] text-[#1A1D24] h-10 px-4 text-sm transition-colors"
        >
          Back to Employees
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/employees"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#8F9CAE] hover:text-[#1A1D24] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </Link>

        {canEdit && !isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-[#E5ECF2] p-6 lg:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar & Photo Upload */}
          <div className="relative group">
            <Avatar
              src={profile.profilePhotoUrl}
              name={profile.name}
              size="xl"
              className="h-24 w-24 text-2xl"
            />
            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  title="Change photo"
                >
                  <Camera className="h-6 w-6" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center sm:justify-start">
              <h1 className="text-2xl font-bold text-[#1A1D24]">{profile.name}</h1>
              <div className="flex items-center gap-2 justify-center">
                <Badge variant={profile.role === 'ADMIN' ? 'default' : 'muted'}>
                  {profile.role}
                </Badge>
                {!profile.isActive && (
                  <Badge variant="danger">Inactive</Badge>
                )}
                {isSelf && (
                  <span className="text-xs bg-[#EAF3FF] text-[#0077FF] px-2.5 py-0.5 rounded-full font-medium">
                    You
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm font-medium text-[#8F9CAE]">
              {profile.designation || 'No Designation'} {profile.department ? `· ${profile.department}` : ''}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-[#8F9CAE] justify-center sm:justify-start">
              <span className="font-mono bg-[#F4F7FB] px-2.5 py-1 rounded-md border border-[#E5ECF2]">
                ID: {profile.loginId}
              </span>
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </span>
              )}
              {profile.joiningDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {formatDate(profile.joiningDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form or View-Only Details */}
      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile Details</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                error={errors.name?.message}
                required
                {...register('name')}
              />
              <Input
                label="Phone Number"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input
                label="Location"
                error={errors.location?.message}
                {...register('location')}
              />

              {isAdmin ? (
                <>
                  <Input
                    label="Department (Admin Only)"
                    error={errors.department?.message}
                    {...register('department')}
                  />
                  <Input
                    label="Designation (Admin Only)"
                    error={errors.designation?.message}
                    {...register('designation')}
                  />
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="isActive"
                      className="h-4 w-4 rounded border-[#E5ECF2] text-[#0077FF] focus:ring-[#0077FF]"
                      {...register('isActive')}
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-[#1A1D24]">
                      Account Active
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-[#1A1D24] block mb-1.5">Department</label>
                    <p className="text-sm text-[#8F9CAE] bg-[#F4F7FB] p-2.5 rounded-lg border border-[#E5ECF2]">
                      {profile.department || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1A1D24] block mb-1.5">Designation</label>
                    <p className="text-sm text-[#8F9CAE] bg-[#F4F7FB] p-2.5 rounded-lg border border-[#E5ECF2]">
                      {profile.designation || 'Not specified'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#E5ECF2]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact & Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-[#E5ECF2]">
                <span className="text-[#8F9CAE] flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </span>
                <span className="font-medium text-[#1A1D24]">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E5ECF2]">
                <span className="text-[#8F9CAE] flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone
                </span>
                <span className="font-medium text-[#1A1D24]">
                  {profile.phone || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E5ECF2]">
                <span className="text-[#8F9CAE] flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </span>
                <span className="font-medium text-[#1A1D24]">
                  {profile.location || '—'}
                </span>
              </div>
            </div>
          </Card>

          {/* Organization & Employment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-[#E5ECF2]">
                <span className="text-[#8F9CAE] flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Department
                </span>
                <span className="font-medium text-[#1A1D24]">
                  {profile.department || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E5ECF2]">
                <span className="text-[#8F9CAE] flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Designation
                </span>
                <span className="font-medium text-[#1A1D24]">
                  {profile.designation || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E5ECF2]">
                <span className="text-[#8F9CAE] flex items-center gap-2">
                  <User className="h-4 w-4" /> Reporting Manager
                </span>
                <span className="font-medium text-[#1A1D24]">
                  {profile.managerName || 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#E5ECF2]">
                <span className="text-[#8F9CAE] flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Joining Date
                </span>
                <span className="font-medium text-[#1A1D24]">
                  {formatDate(profile.joiningDate)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
