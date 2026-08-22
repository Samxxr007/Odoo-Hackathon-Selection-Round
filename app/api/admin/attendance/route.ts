import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAdminDailyAttendance, AttendanceError } from '@/lib/attendance/services';
import { getBusinessDateString } from '@/lib/attendance/timezone';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Strict server-side RBAC check: ADMIN only
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || getBusinessDateString();
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;

    const data = await getAdminDailyAttendance({
      date,
      search,
      status,
    });

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

    console.error('Unhandled GET /api/admin/attendance Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to retrieve admin attendance dashboard.',
        },
      },
      { status: 500 }
    );
  }
}
