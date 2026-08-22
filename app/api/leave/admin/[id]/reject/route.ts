import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRoles } from '@/lib/authGuard'
import { rejectLeave } from '@/lib/leave/leaveService'

type Params = { params: Promise<{ id: string }> }

const RejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required.').max(500),
})

// POST /api/leave/admin/[id]/reject
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireRoles(['ADMIN', 'HR'])
    if (user instanceof NextResponse) return user

    const body = await req.json()
    const parsed = RejectSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const resolved = await params
    const updated = await rejectLeave(resolved.id, user.id, parsed.data.reason)
    return NextResponse.json(updated)
  } catch (err: any) {
    console.error('[POST /api/leave/admin/[id]/reject]', err)
    const status = err.message?.includes('Cannot') || err.message?.includes('required') ? 400 : 500
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status })
  }
}
