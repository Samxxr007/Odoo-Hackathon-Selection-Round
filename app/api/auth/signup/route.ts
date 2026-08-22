import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'
import { generateVerificationToken, getTokenExpiry, sendVerificationEmail } from '@/lib/auth/verification'
import { createSession } from '@/lib/auth/session'
import { Role } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const signupSchema = z
  .object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
    adminName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(7, 'Invalid phone number').max(20).optional().or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data (for logo upload)
    const formData = await req.formData()

    const rawData = {
      companyName: formData.get('companyName') as string,
      adminName: formData.get('adminName') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) ?? '',
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    // Validate fields
    const result = signupSchema.safeParse(rawData)
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

    const { companyName, adminName, email, phone, password } = result.data

    // Check duplicate company name
    const existingCompany = await db.company.findUnique({ where: { name: companyName } })
    if (existingCompany) {
      return NextResponse.json(
        { success: false, error: 'A company with this name already exists', code: 'DUPLICATE_COMPANY' },
        { status: 409 }
      )
    }

    // Check duplicate email
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists', code: 'DUPLICATE_EMAIL' },
        { status: 409 }
      )
    }

    // Handle logo upload
    let logoUrl: string | null = null
    const logoFile = formData.get('logo') as File | null
    if (logoFile && logoFile.size > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos')
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      const ext = path.extname(logoFile.name) || '.png'
      const filename = `company-${Date.now()}${ext}`
      const bytes = await logoFile.arrayBuffer()
      await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))
      logoUrl = `/uploads/logos/${filename}`
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate verification token
    const verificationToken = generateVerificationToken()
    const verificationTokenExpiry = getTokenExpiry()

    // Build a placeholder loginId for admin (will be properly formatted)
    const companyCode = companyName.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'CO'
    const nameCode = adminName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'ADMN'
    const year = new Date().getFullYear()
    const adminLoginId = `${companyCode}${nameCode}${year}0001`

    // Create company + admin in a transaction
    const { company, admin } = await db.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: companyName, logoUrl },
      })

      // Create yearly serial entry for admin
      await tx.yearlySerial.create({
        data: { companyId: company.id, year, lastSerial: 1 },
      })

      const admin = await tx.user.create({
        data: {
          loginId: adminLoginId,
          email,
          passwordHash,
          name: adminName,
          phone: phone || null,
          role: Role.ADMIN, // NEVER set by user input — always forced to ADMIN for first user
          companyId: company.id,
          mustChangePassword: false,
          emailVerified: process.env.NODE_ENV === 'development', // auto-verify in dev
          verificationToken: process.env.NODE_ENV === 'development' ? null : verificationToken,
          verificationTokenExpiry: process.env.NODE_ENV === 'development' ? null : verificationTokenExpiry,
          joiningDate: new Date(),
          joiningYear: year,
          yearlySerial: 1,
        },
      })

      return { company, admin }
    })

    // Send verification email (or get dev URL)
    let devVerificationUrl: string | undefined
    if (process.env.NODE_ENV !== 'development') {
      const emailResult = await sendVerificationEmail(email, verificationToken)
      if (emailResult.devUrl) devVerificationUrl = emailResult.devUrl
    }

    // Create session automatically after signup
    await createSession(admin.id, admin.role, company.id)

    const responseData: Record<string, unknown> = {
      success: true,
      message:
        process.env.NODE_ENV === 'development'
          ? 'Account created successfully (email auto-verified in dev mode)'
          : 'Account created. Please check your email to verify your account.',
      companyId: company.id,
      userId: admin.id,
      loginId: admin.loginId,
    }

    if (process.env.NODE_ENV !== 'production' && devVerificationUrl) {
      responseData.devVerificationUrl = devVerificationUrl
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('[Signup] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
