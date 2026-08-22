import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken } from '@/lib/auth/verification'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Verification token is required' },
      { status: 400 }
    )
  }

  const result = await verifyEmailToken(token)

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Email verified successfully. You can now sign in.',
  })
}
