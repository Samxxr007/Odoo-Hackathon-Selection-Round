import { NextRequest, NextResponse } from 'next/server'
import { requireRoles } from '@/lib/authGuard'
import { approveLeave } from '@/lib/leave/leaveService'

type Params = { params: Promise<{ id: string }> }

// POST /api/leave/admin/[id]/approve
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireRoles(['ADMIN', 'HR'])
    if (user instanceof NextResponse) return user

    const resolved = await params
    const updated = await approveLeave(resolved.id, user.id)
    return NextResponse.json(updated)
  } catch (err: any) {
    console.error('[POST /api/leave/admin/[id]/approve]', err)
    const status = err.message?.includes('Cannot') ? 400 : 500
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status })
  }
}
