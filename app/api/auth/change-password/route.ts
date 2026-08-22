import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth/session'
import { hashPassword, verifyPassword } from '@/lib/auth/password'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one digit')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth()

    const body = await req.json()
    const result = changePasswordSchema.safeParse(body)

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

    const { currentPassword, newPassword } = result.data

    // Fetch user with password hash
    const user = await db.user.findUnique({ where: { id: authUser.id } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Prevent reusing the same password
    const samePassword = await verifyPassword(newPassword, user.passwordHash)
    if (samePassword) {
      return NextResponse.json(
        { success: false, error: 'New password must be different from current password' },
        { status: 400 }
      )
    }

    const newHash = await hashPassword(newPassword)

    await db.user.update({
      where: { id: authUser.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    if (error instanceof Response) return error as unknown as NextResponse
    console.error('[ChangePassword] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to change password. Please try again.' },
      { status: 500 }
    )
  }
}
