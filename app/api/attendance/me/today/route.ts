import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getTodayAttendance, AttendanceError } from '@/lib/attendance/services';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const data = await getTodayAttendance(session.userId);

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

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch today\'s attendance status.',
        },
      },
      { status: 500 }
    );
  }
}
