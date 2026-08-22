import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth/session'
import { canViewFullProfile, canEditProfile, isSameCompany } from '@/lib/auth/authorize'
import type { EmployeeSummary, EmployeeFullProfile } from '@/types'

// ─────────────────────────────────────────────
// GET /api/employees/[id]
// ─────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth()
    const { id } = await params

    const employee = await db.user.findUnique({
      where: { id },
      include: {
        company: { select: { name: true, logoUrl: true } },
        manager: { select: { id: true, name: true, designation: true, profilePhotoUrl: true } },
      },
    })

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 })
    }

    // Cross-company check
    if (!isSameCompany(authUser, employee.companyId)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const isFullAccess = canViewFullProfile(authUser, id)

    if (isFullAccess) {
      const full: EmployeeFullProfile = {
        id: employee.id,
        name: employee.name,
        loginId: employee.loginId,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        companyId: employee.companyId,
        department: employee.department,
        designation: employee.designation,
        joiningDate: employee.joiningDate,
        location: employee.location,
        managerId: employee.managerId,
        managerName: employee.manager?.name ?? null,
        profilePhotoUrl: employee.profilePhotoUrl,
        isActive: employee.isActive,
        emailVerified: employee.emailVerified,
        mustChangePassword: employee.mustChangePassword,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      }
      return NextResponse.json({ success: true, data: full })
    }

    // Public summary only
    const summary: EmployeeSummary = {
      id: employee.id,
      name: employee.name,
      loginId: employee.loginId,
      email: employee.email,
      phone: null, // hide phone for other employees
      role: employee.role,
      companyId: employee.companyId,
      department: employee.department,
      designation: employee.designation,
      joiningDate: employee.joiningDate,
      location: employee.location,
      managerId: employee.managerId,
      managerName: employee.manager?.name ?? null,
      profilePhotoUrl: employee.profilePhotoUrl,
      isActive: employee.isActive,
    }

    return NextResponse.json({ success: true, data: summary })
  } catch (error) {
    if (error instanceof Response) return error as unknown as NextResponse
    console.error('[GET /employees/[id]] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch employee' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────
// PATCH /api/employees/[id]
// ─────────────────────────────────────────────

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
  // Admin-only fields
  department: z.string().optional(),
  designation: z.string().optional(),
  managerId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  joiningDate: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth()
    const { id } = await params

    const employee = await db.user.findUnique({ where: { id } })

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 })
    }

    // Cross-company check
    if (!isSameCompany(authUser, employee.companyId)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Authorization
    if (!canEditProfile(authUser, id)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You cannot edit this profile' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const result = updateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          fieldErrors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const data = result.data
    const isAdmin = authUser.role === 'ADMIN'

    // Build update payload — employees can only update certain fields
    const updateData: Record<string, unknown> = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.location !== undefined) updateData.location = data.location
    if (data.profilePhotoUrl !== undefined) updateData.profilePhotoUrl = data.profilePhotoUrl

    // Admin-only fields
    if (isAdmin) {
      if (data.department !== undefined) updateData.department = data.department
      if (data.designation !== undefined) updateData.designation = data.designation
      if (data.managerId !== undefined) updateData.managerId = data.managerId
      if (data.isActive !== undefined) updateData.isActive = data.isActive
      if (data.joiningDate !== undefined) updateData.joiningDate = new Date(data.joiningDate)
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      include: { manager: { select: { name: true } } },
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        department: updated.department,
        designation: updated.designation,
        location: updated.location,
        profilePhotoUrl: updated.profilePhotoUrl,
        isActive: updated.isActive,
        managerId: updated.managerId,
        managerName: updated.manager?.name ?? null,
      },
    })
  } catch (error) {
    if (error instanceof Response) return error as unknown as NextResponse
    console.error('[PATCH /employees/[id]] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
  }
}
