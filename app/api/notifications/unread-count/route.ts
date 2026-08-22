import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/authGuard'
import { getUnreadCount } from '@/lib/notifications/notificationService'

// GET /api/notifications/unread-count
export async function GET(_req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (user instanceof NextResponse) return user

    const count = await getUnreadCount(user.id)
    return NextResponse.json({ unreadCount: count })
  } catch (err: any) {
    console.error('[GET /api/notifications/unread-count]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
