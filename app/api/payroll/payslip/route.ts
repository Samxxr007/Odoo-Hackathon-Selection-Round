import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/authGuard'
import { generatePayslip } from '@/lib/payroll/payrollService'

export const dynamic = 'force-dynamic'

// GET /api/payroll/payslip?month=8&year=2026
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(req.url)
    const now = new Date()
    const month = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1))
    const year = parseInt(searchParams.get('year') ?? String(now.getFullYear()))

    // Employees see only their own payslip
    // Admin can query any user's payslip via userId param
    const targetUserId =
      user.role === 'ADMIN' || user.role === 'HR'
        ? (searchParams.get('userId') ?? user.id)
        : user.id

    const payslip = await generatePayslip(targetUserId, month, year)
    return NextResponse.json(payslip)
  } catch (err: any) {
    console.error('[GET /api/payroll/payslip]', err)
    const status = err.message?.includes('validation') ? 422 : 500
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status })
  }
}
