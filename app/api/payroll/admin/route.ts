import { NextRequest, NextResponse } from 'next/server'
import { requireRoles } from '@/lib/authGuard'
import { getAdminPayroll } from '@/lib/payroll/payrollService'

// GET /api/payroll/admin?month=8&year=2026
export async function GET(req: NextRequest) {
  try {
    const user = await requireRoles(['ADMIN', 'HR'])
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(req.url)
    const now = new Date()
    const month = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1))
    const year = parseInt(searchParams.get('year') ?? String(now.getFullYear()))

    const result = await getAdminPayroll(month, year)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[GET /api/payroll/admin]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
