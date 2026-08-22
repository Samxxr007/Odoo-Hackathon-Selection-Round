import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getMonthlyAttendanceAnalytics } from '@/lib/attendance/analytics';
import { getBusinessDateString } from '@/lib/attendance/timezone';
import { AttendanceError } from '@/lib/attendance/services';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month') || getBusinessDateString().substring(0, 7);

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMPLOYEE_ID_REQUIRED',
            message: 'employeeId query parameter is required for analytics.',
          },
        },
        { status: 400 }
      );
    }

    const analytics = await getMonthlyAttendanceAnalytics(employeeId, month);

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    if (error instanceof AttendanceError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to retrieve attendance analytics.',
        },
      },
      { status: 500 }
    );
  }
}
