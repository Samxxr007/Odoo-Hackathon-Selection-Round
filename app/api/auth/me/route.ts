import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
        },
        { status: 401 }
      );
    }

    // Strip any parenthetical role suffix (e.g. "Sarah Connor (HR Admin)" -> "Sarah Connor")
    const cleanName = session.user.name ? session.user.name.replace(/\s*\([^)]*\)/g, '').trim() : '';

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        name: cleanName,
        email: session.user.email,
        role: session.user.role,
        department: session.user.department,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to retrieve session.' },
      },
      { status: 500 }
    );
  }
}
