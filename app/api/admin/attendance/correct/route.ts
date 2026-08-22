import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { correctAttendanceCheckout, AttendanceError } from '@/lib/attendance/services';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin(req);

    const body = await req.json();
    const { attendanceId, checkOutTime, reason } = body;

    if (!attendanceId || !checkOutTime || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'attendanceId, checkOutTime, and reason are required.',
          },
        },
        { status: 400 }
      );
    }

    const correctedCheckOut = new Date(checkOutTime);
    if (isNaN(correctedCheckOut.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TIMESTAMP',
            message: 'Invalid ISO timestamp for corrected check-out.',
          },
        },
        { status: 400 }
      );
    }

    const updatedRecord = await correctAttendanceCheckout({
      adminId: session.userId,
      attendanceId,
      correctedCheckOut,
      reason,
    });

    return NextResponse.json({
      success: true,
      attendance: updatedRecord,
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
          message: 'Failed to correct attendance record.',
        },
      },
      { status: 500 }
    );
  }
}
