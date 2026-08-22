import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/authGuard'
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
} from '@/lib/notifications/notificationService'

export const dynamic = 'force-dynamic'

// GET /api/notifications?limit=20&unreadOnly=false
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const notifications = await getNotifications(user.id, limit, !unreadOnly)
    const unreadCount = await getUnreadCount(user.id)

    return NextResponse.json({ notifications, unreadCount })
  } catch (err: any) {
    console.error('[GET /api/notifications]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/notifications — mark all as read
export async function PATCH(_req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (user instanceof NextResponse) return user

    await markAllAsRead(user.id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[PATCH /api/notifications]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
