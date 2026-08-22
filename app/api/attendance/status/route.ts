import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyEmployeeOwnership } from '@/lib/auth';
import { getEmployeeDailyStatusDetailed } from '@/lib/attendance/engine';
import { getBusinessDateString } from '@/lib/attendance/timezone';
import { AttendanceError } from '@/lib/attendance/services';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const targetEmployeeId = searchParams.get('employeeId') || session.userId;
    const date = searchParams.get('date') || getBusinessDateString();

    // Verify employee ownership or admin rights
    verifyEmployeeOwnership(session, targetEmployeeId);

    const statusDetail = await getEmployeeDailyStatusDetailed(targetEmployeeId, date);

    return NextResponse.json({
      success: true,
      data: statusDetail,
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
          message: 'Failed to compute daily attendance status.',
        },
      },
      { status: 500 }
    );
  }
}
