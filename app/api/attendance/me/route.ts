import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getEmployeeMonthlyAttendance, AttendanceError } from '@/lib/attendance/services';
import { getBusinessDateString } from '@/lib/attendance/timezone';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get('month');

    // Default to current business month YYYY-MM
    const currentBusinessDate = getBusinessDateString();
    const month = monthParam || currentBusinessDate.substring(0, 7);

    const data = await getEmployeeMonthlyAttendance(session.userId, month);

    return NextResponse.json({
      success: true,
      data,
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

    console.error('Unhandled GET /api/attendance/me Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to retrieve monthly attendance history.',
        },
      },
      { status: 500 }
    );
  }
}
