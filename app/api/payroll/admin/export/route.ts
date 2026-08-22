import { NextRequest, NextResponse } from 'next/server'
import { requireRoles } from '@/lib/authGuard'
import { getAdminPayroll } from '@/lib/payroll/payrollService'

// GET /api/payroll/admin/export?month=8&year=2026
export async function GET(req: NextRequest) {
  try {
    const user = await requireRoles(['ADMIN', 'HR'])
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(req.url)
    const now = new Date()
    const month = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1))
    const year = parseInt(searchParams.get('year') ?? String(now.getFullYear()))

    const { rows, errors } = await getAdminPayroll(month, year)

    const csvRows: string[] = [
      'Employee Name,Email,Gross Salary,Payable Days,Total Working Days,Paid Leave Days,Unpaid Leave Days,Leave Deduction,Employee PF,Professional Tax,Net Pay',
    ]

    for (const r of rows) {
      csvRows.push(
        [
          `"${r.userName}"`,
          `"${r.userEmail}"`,
          r.grossAmount.toFixed(2),
          r.payableDays,
          r.totalWorkingDays,
          r.paidLeaveDays,
          r.unpaidLeaveDays,
          r.leaveDeduction.toFixed(2),
          r.employeePF.toFixed(2),
          r.professionalTax.toFixed(2),
          r.netPay.toFixed(2),
        ].join(',')
      )
    }

    // Append error rows
    if (errors.length > 0) {
      csvRows.push('')
      csvRows.push('--- ERRORS ---')
      csvRows.push('Employee Name,Errors')
      for (const e of errors) {
        csvRows.push(`"${e.name}","${e.errors.join('; ')}"`)
      }
    }

    const csv = csvRows.join('\n')
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="payroll-${monthNames[month - 1]}-${year}.csv"`,
      },
    })
  } catch (err: any) {
    console.error('[GET /api/payroll/admin/export]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
