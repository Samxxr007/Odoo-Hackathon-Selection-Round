import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/authGuard'
import { getCalendarData } from '@/lib/leave/calendarService'

// GET /api/leave/calendar?year=2026
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))
    const isAdmin = user.role === 'ADMIN' || user.role === 'HR'

    const events = await getCalendarData(user.id, year, isAdmin)
    return NextResponse.json(events)
  } catch (err: any) {
    console.error('[GET /api/leave/calendar]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
