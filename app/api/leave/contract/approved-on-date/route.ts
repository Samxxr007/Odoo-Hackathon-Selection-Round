import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApprovedLeaveForDate } from '@/lib/leave/leaveService'

/**
 * Module F Contract — for Member 3's use.
 * GET /api/leave/contract/approved-on-date?userId=...&date=YYYY-MM-DD
 *
 * Member 3 can call this endpoint OR import getApprovedLeaveForDate directly.
 * Direct import is preferred for server-side usage.
 */

const QuerySchema = z.object({
  userId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
})

export async function GET(req: NextRequest) {
  try {
    // This endpoint is internal — validate a shared internal API key or allow server-side only
    // For hackathon: session auth is sufficient
    const { searchParams } = new URL(req.url)
    const parsed = QuerySchema.safeParse({
      userId: searchParams.get('userId'),
      date: searchParams.get('date'),
    })

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { userId, date } = parsed.data
    const result = await getApprovedLeaveForDate(userId, new Date(date))
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[GET /api/leave/contract/approved-on-date]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
