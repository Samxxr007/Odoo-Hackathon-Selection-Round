import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { toggleAttendance, AttendanceError } from '@/lib/attendance/services';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const result = await toggleAttendance(session.userId);

    const isCheckedIn = result.action === 'CHECKED_IN' || (result.attendance && result.attendance.checkOut === null);

    return NextResponse.json({
      success: true,
      action: result.action,
      isCheckedIn,
      isCheckedOut: !isCheckedIn,
      record: result.attendance,
      attendance: result.attendance,
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

    console.error('Unhandled Toggle Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'An unexpected server error occurred while processing attendance.',
        },
      },
      { status: 500 }
    );
  }
}
