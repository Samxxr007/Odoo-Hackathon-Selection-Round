import { NextRequest, NextResponse } from 'next/server'
import { requireRoles } from '@/lib/authGuard'
import { getAllLeaveRequests } from '@/lib/leave/leaveService'
import type { LeaveStatus } from '@/types/leave'

export const dynamic = 'force-dynamic'

// GET /api/leave/admin?status=PENDING&userId=...
export async function GET(req: NextRequest) {
  try {
    const user = await requireRoles(['ADMIN', 'HR'])
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as LeaveStatus | null
    const userId = searchParams.get('userId') ?? undefined

    const requests = await getAllLeaveRequests(status ?? undefined, userId)
    return NextResponse.json(requests)
  } catch (err: any) {
    console.error('[GET /api/leave/admin]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
