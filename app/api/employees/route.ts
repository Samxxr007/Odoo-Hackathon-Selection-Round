import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth/session'
import { canManageEmployees } from '@/lib/auth/authorize'
import { hashPassword, generateTempPassword } from '@/lib/auth/password'
import { generateLoginId, splitName } from '@/lib/auth/employee-id'
import { Role } from '@prisma/client'
import type { EmployeeSummary } from '@/types'

// ─────────────────────────────────────────────
// GET /api/employees — List employees
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '20', 10))
    const skip = (page - 1) * limit

    const where = {
      companyId: authUser.companyId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { loginId: { contains: search, mode: 'insensitive' as const } },
              { department: { contains: search, mode: 'insensitive' as const } },
              { designation: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [employees, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          loginId: true,
          email: true,
          phone: true,
          role: true,
          companyId: true,
          department: true,
          designation: true,
          joiningDate: true,
          location: true,
          managerId: true,
          profilePhotoUrl: true,
          isActive: true,
          manager: { select: { name: true } },
        },
      }),
      db.user.count({ where }),
    ])

    const data: EmployeeSummary[] = employees.map((e) => ({
      id: e.id,
      name: e.name,
      loginId: e.loginId,
      email: e.email,
      phone: e.phone,
      role: e.role,
      companyId: e.companyId,
      department: e.department,
      designation: e.designation,
      joiningDate: e.joiningDate,
      location: e.location,
      managerId: e.managerId,
      managerName: e.manager?.name ?? null,
      profilePhotoUrl: e.profilePhotoUrl,
      isActive: e.isActive,
    }))

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    if (error instanceof Response) return error as unknown as NextResponse
    console.error('[GET /employees] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch employees' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────
// POST /api/employees — Create employee (Admin only)
// ─────────────────────────────────────────────

const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  joiningDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid joining date'),
  location: z.string().optional(),
  managerId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth()

    // Authorization: Admin only
    if (!canManageEmployees(authUser)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only administrators can create employees' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const result = createEmployeeSchema.safeParse(body)

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

    const { name, email, phone, department, designation, joiningDate, location, managerId } =
      result.data

    // Check duplicate email (global — emails must be unique across all companies)
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists', code: 'DUPLICATE_EMAIL' },
        { status: 409 }
      )
    }

    // Validate managerId belongs to same company
    if (managerId) {
      const manager = await db.user.findFirst({
        where: { id: managerId, companyId: authUser.companyId },
      })
      if (!manager) {
        return NextResponse.json(
          { success: false, error: 'Manager not found in your company' },
          { status: 400 }
        )
      }
    }

    const joiningDateObj = new Date(joiningDate)
    const { firstName, lastName } = splitName(name)

    // Fetch company for ID generation
    const company = await db.company.findUnique({ where: { id: authUser.companyId } })
    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 })
    }

    // Generate login ID (transaction-safe)
    const { loginId, serial, year } = await generateLoginId(
      authUser.companyId,
      company.name,
      firstName,
      lastName,
      joiningDateObj
    )

    // Generate temporary password
    const tempPassword = generateTempPassword()
    const passwordHash = await hashPassword(tempPassword)

    // Create employee
    const employee = await db.user.create({
      data: {
        loginId,
        email,
        passwordHash,
        name,
        phone: phone || null,
        role: Role.EMPLOYEE, // NEVER set from user input
        companyId: authUser.companyId,
        department,
        designation,
        joiningDate: joiningDateObj,
        joiningYear: year,
        yearlySerial: serial,
        location: location || null,
        managerId: managerId || null,
        mustChangePassword: true, // Force password change on first login
        emailVerified: true, // Admin-created accounts don't need email verification
        isActive: true,
      },
      include: {
        manager: { select: { name: true } },
      },
    })

    const employeeSummary: EmployeeSummary = {
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
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Employee created successfully',
        data: {
          employee: employeeSummary,
          loginId,
          tempPassword, // Returned ONCE — not stored in plain text anywhere
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Response) return error as unknown as NextResponse
    console.error('[POST /employees] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create employee. Please try again.' },
      { status: 500 }
    )
  }
}
