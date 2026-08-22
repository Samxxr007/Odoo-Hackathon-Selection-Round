import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();
    const targetRole = role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';

    const user = await prisma.user.findFirst({
      where: { role: targetRole },
      orderBy: { createdAt: 'asc' },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found for specified role.' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user,
    });

    // Set session cookie
    response.cookies.set('dayflow_user_id', user.id, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
