import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { verifyPassword, hashPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'

const signinSchema = z.object({
  loginId: z.string().min(1, 'Login ID or email is required'),
  password: z.string().min(1, 'Password is required'),
})

// Generic error — never reveal whether email/ID exists
const INVALID_CREDENTIALS = 'Invalid credentials. Please check your Login ID and password.'

// ─── Demo users for local dev when DB is not reachable ───
const DEMO_USERS = [
  {
    id: 'demo-admin-001',
    loginId: 'ADMIN001',
    email: 'admin@odoo.com',
    name: 'Admin User',
    passwordPlain: 'Admin@123456',
    role: 'ADMIN' as const,
    companyId: 'default-company',
    companyName: 'Odoo HRMS',
    isActive: true,
    emailVerified: true,
    mustChangePassword: false,
  },
  {
    id: 'demo-emp-001',
    loginId: 'EMP001',
    email: 'john.doe@odoo.com',
    name: 'John Doe',
    passwordPlain: 'Emp@123456',
    role: 'EMPLOYEE' as const,
    companyId: 'default-company',
    companyName: 'Odoo HRMS',
    isActive: true,
    emailVerified: true,
    mustChangePassword: false,
  },
]

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

    // Try DB first
    try {
      const user = await db.user.findFirst({
        where: {
          OR: [{ loginId }, { email: loginId }],
        },
        include: { company: true },
      })

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

      if (!user.isActive) {
        return NextResponse.json(
          { success: false, error: 'Your account has been deactivated. Please contact your administrator.' },
          { status: 401 }
        )
      }

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

      const token = await createSession(user.id, user.role, user.companyId, req)

      const response = NextResponse.json({
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
        redirectTo: user.mustChangePassword ? '/change-password' : '/dashboard',
      })

      // Set cookie on response
      response.cookies.set('odoo_hrms_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
      response.cookies.set('dayflow_user_id', user.id, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
      })

      return response
    } catch (dbError) {
      // DB unreachable — fall through to demo users
      console.warn('[Signin] DB unreachable, trying demo users:', (dbError as Error).message)
    }

    // ─── Demo user fallback (dev only) ───
    const demoUser = DEMO_USERS.find(
      (u) => u.loginId === loginId || u.email === loginId
    )

    if (!demoUser || demoUser.passwordPlain !== password) {
      return NextResponse.json(
        { success: false, error: INVALID_CREDENTIALS },
        { status: 401 }
      )
    }

    // Set a simple session cookie for demo mode
    const response = NextResponse.json({
      success: true,
      message: 'Signed in (demo mode)',
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        loginId: demoUser.loginId,
        role: demoUser.role,
        mustChangePassword: false,
        companyId: demoUser.companyId,
        companyName: demoUser.companyName,
      },
      redirectTo: '/dashboard',
    })

    response.cookies.set('dayflow_user_id', demoUser.id, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('[Signin] Error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

