import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth/session'

export async function POST() {
  try {
    await destroySession()
    return NextResponse.json({ success: true, message: 'Signed out successfully' })
  } catch (error) {
    console.error('[Signout] Error:', error)
    // Still clear cookie on error
    const response = NextResponse.json({ success: true, message: 'Signed out' })
    response.cookies.delete(process.env.SESSION_COOKIE_NAME ?? 'odoo_hrms_session')
    return response
  }
}
