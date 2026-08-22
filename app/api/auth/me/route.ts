import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/session'

export async function GET() {
  try {
    const user = await requireAuth()
    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    if (error instanceof Response) return error as unknown as NextResponse
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
}
