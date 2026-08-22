import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/authGuard'
import { getAllLeaveBalances } from '@/lib/leave/balanceService'

// GET /api/leave/balance?year=2026
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))

    // Admin can query other users; employee only their own
    const targetUserId =
      (user.role === 'ADMIN' || user.role === 'HR')
        ? (searchParams.get('userId') ?? user.id)
        : user.id

    const balances = await getAllLeaveBalances(targetUserId, year)
    return NextResponse.json(balances)
  } catch (err: any) {
    console.error('[GET /api/leave/balance]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
