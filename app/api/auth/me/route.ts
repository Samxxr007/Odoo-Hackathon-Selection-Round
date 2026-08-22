import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { getDbUserById } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (session) {
      const user = await db.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          loginId: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          companyId: true,
          company: { select: { name: true, logoUrl: true } },
          department: true,
          designation: true,
          joiningDate: true,
          location: true,
          managerId: true,
          profilePhotoUrl: true,
          isActive: true,
          mustChangePassword: true,
          emailVerified: true,
          createdAt: true,
        },
      })

      if (user && user.isActive) {
        const authUser = {
          ...user,
          companyName: user.company.name,
          companyLogoUrl: user.company.logoUrl,
        }
        return NextResponse.json({
          success: true,
          data: authUser,
          user: authUser,
        })
      }
    }

    // Fallback for header/in-memory session
    const authHeader = req.headers.get('x-user-id')
    if (authHeader) {
      const memUser = getDbUserById(authHeader)
      if (memUser) {
        return NextResponse.json({
          success: true,
          data: memUser.profile,
          user: memUser.profile,
        })
      }
    }

    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
