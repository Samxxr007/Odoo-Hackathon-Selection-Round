import { NextRequest, NextResponse } from 'next/server'
import { requireRoles } from '@/lib/authGuard'
import { getAllLeaveRequests } from '@/lib/leave/leaveService'
import { getAllLeaveBalances } from '@/lib/leave/balanceService'
import { prisma } from '@/lib/prisma'
import type { LeaveStatus } from '@/types/leave'

// GET /api/leave/admin/export?type=requests|balances&format=csv
export async function GET(req: NextRequest) {
  try {
    const user = await requireRoles(['ADMIN', 'HR'])
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') ?? 'requests'
    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))

    if (type === 'balances') {
      const employees = await prisma.user.findMany({
        where: { isActive: true, role: 'EMPLOYEE' },
        select: { id: true, name: true, email: true },
      })

      const rows: string[] = [
        'Employee Name,Email,Leave Type,Allocated,Consumed,Pending,Available,Year',
      ]

      for (const emp of employees) {
        const balances = await getAllLeaveBalances(emp.id, year)
        for (const b of balances) {
          const available = b.available === Infinity ? 'Unlimited' : b.available
          rows.push(
            `"${emp.name}","${emp.email}","${b.leaveType}",${b.allocated},${b.consumed},${b.pending},${available},${year}`
          )
        }
      }

      const csv = rows.join('\n')
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="leave-balances-${year}.csv"`,
        },
      })
    }

    // Default: leave requests
    const status = searchParams.get('status') as LeaveStatus | null
    const requests = await getAllLeaveRequests(status ?? undefined)

    const rows: string[] = [
      'Employee Name,Email,Leave Type,From Date,To Date,Days,Status,Remarks,Requested At,Decided By,Decided At,Rejection Reason',
    ]

    for (const r of requests) {
      rows.push(
        [
          `"${r.userName}"`,
          `"${r.userEmail}"`,
          `"${r.leaveType}"`,
          r.fromDate.split('T')[0],
          r.toDate.split('T')[0],
          r.days,
          r.status,
          `"${r.remarks ?? ''}"`,
          r.requestedAt.split('T')[0],
          `"${r.decidedByName ?? ''}"`,
          r.decidedAt ? r.decidedAt.split('T')[0] : '',
          `"${r.rejectionReason ?? ''}"`,
        ].join(',')
      )
    }

    const csv = rows.join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leave-requests-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (err: any) {
    console.error('[GET /api/leave/admin/export]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
