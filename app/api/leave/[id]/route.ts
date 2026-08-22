import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/authGuard'
import { getLeaveRequestById, cancelLeave } from '@/lib/leave/leaveService'

type Params = { params: { id: string } }

// GET /api/leave/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser()
    if (user instanceof NextResponse) return user

    const request = await getLeaveRequestById(params.id, user.id, user.role)
    return NextResponse.json(request)
  } catch (err: any) {
    if (err.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('[GET /api/leave/[id]]', err)
    return NextResponse.json({ error: err.message || 'Not found' }, { status: 404 })
  }
}

// DELETE /api/leave/[id] — employee cancels own pending/approved leave
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser()
    if (user instanceof NextResponse) return user

    await cancelLeave(params.id, user.id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[DELETE /api/leave/[id]]', err)
    const status = err.message?.includes('own') || err.message?.includes('Cannot') ? 400 : 500
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status })
  }
}
