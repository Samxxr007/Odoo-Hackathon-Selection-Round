import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'

const signinSchema = z.object({
  loginId: z.string().min(1, 'Login ID or email is required'),
  password: z.string().min(1, 'Password is required'),
})

// Generic error — never reveal whether email/ID exists
const INVALID_CREDENTIALS = 'Invalid credentials. Please check your Login ID and password.'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const result = signinSchema.safeParse(body)
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

    const { loginId, password } = result.data

    // Find user by loginId OR email
    const user = await db.user.findFirst({
      where: {
        OR: [{ loginId }, { email: loginId }],
      },
      include: { company: true },
    })

    // Always run password verification to prevent timing attacks
    const dummyHash = '$2a$12$dummy.hash.to.prevent.timing.attacks.xxxxxx'
    const passwordValid = user
      ? await verifyPassword(password, user.passwordHash)
      : await verifyPassword(password, dummyHash).then(() => false)

    if (!user || !passwordValid) {
      return NextResponse.json(
        { success: false, error: INVALID_CREDENTIALS },
        { status: 401 }
      )
    }

    // Check account is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Your account has been deactivated. Please contact your administrator.' },
        { status: 401 }
      )
    }

    // Check email verification (skip in development)
    if (!user.emailVerified && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        {
          success: false,
          error: 'Please verify your email address before signing in.',
          code: 'EMAIL_NOT_VERIFIED',
        },
        { status: 401 }
      )
    }

    // Create session
    await createSession(user.id, user.role, user.companyId, req)

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        loginId: user.loginId,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        companyId: user.companyId,
        companyName: user.company?.name ?? 'Odoo HRMS',
      },
      redirectTo: user.mustChangePassword ? '/change-password' : (user.role === 'ADMIN' ? '/dashboard' : '/employee-dashboard'),
    })
  } catch (error) {
    console.error('[Signin] Error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
