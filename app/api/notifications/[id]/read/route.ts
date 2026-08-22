import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/authGuard'
import { markAsRead } from '@/lib/notifications/notificationService'

type Params = { params: Promise<{ id: string }> }

// PATCH /api/notifications/[id]/read
export async function PATCH(_req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser()
    if (user instanceof NextResponse) return user

    const resolved = await params
    await markAsRead(resolved.id, user.id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[PATCH /api/notifications/[id]/read]', err)
    const status = err.message?.includes('Forbidden') ? 403 : 500
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status })
  }
}
