import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import type { SessionPayload, AuthUser } from '@/types'
import { Role } from '@prisma/client'

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'odoo_hrms_session'
const EXPIRY_DAYS = parseInt(process.env.SESSION_EXPIRY_DAYS ?? '7', 10)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-secret-change-me'
)

// ─────────────────────────────────────────────
// JWT helpers
// ─────────────────────────────────────────────

async function signToken(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(JWT_SECRET)
}

async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────
// Session management
// ─────────────────────────────────────────────

/**
 * Create a new session for a user, store it in DB, set cookie.
 */
export async function createSession(
  userId: string,
  role: Role,
  companyId: string,
  req?: NextRequest
): Promise<string> {
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  // Create DB session record first to get the ID
  const session = await db.session.create({
    data: {
      userId,
      token: 'placeholder', // will be updated below
      expiresAt,
      ipAddress: req?.headers.get('x-forwarded-for') ?? undefined,
      userAgent: req?.headers.get('user-agent') ?? undefined,
    },
  })

  // Sign JWT with sessionId embedded
  const token = await signToken({
    sessionId: session.id,
    userId,
    role,
    companyId,
  })

  // Update session record with real token
  await db.session.update({
    where: { id: session.id },
    data: { token },
  })

  // Set HttpOnly cookie
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  return token
}

/**
 * Get the current session from the cookie.
 * Returns null if session is missing, invalid, expired, or revoked.
 */
export async function getSession(): Promise<{
  session: { id: string; userId: string; expiresAt: Date }
  payload: SessionPayload
} | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  // Verify session exists and is not expired in DB (invalidation support)
  const dbSession = await db.session.findUnique({
    where: { token },
  })

  if (!dbSession || dbSession.expiresAt < new Date()) {
    // Session revoked or expired — clear cookie
    cookieStore.delete(COOKIE_NAME)
    return null
  }

  return { session: dbSession, payload }
}

/**
 * Get the session from a request (for middleware use).
 */
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  return payload
}

/**
 * Destroy the current session: delete from DB + clear cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (token) {
    // Remove from DB (best-effort)
    await db.session.deleteMany({ where: { token } }).catch(() => {})
    cookieStore.delete(COOKIE_NAME)
  }
}

/**
 * Require an authenticated session. Throws with a 401 response if missing.
 * Returns the current AuthUser.
 */
export async function requireAuth(): Promise<AuthUser> {
  const result = await getSession()
  if (!result) {
    throw new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const user = await db.user.findUnique({
    where: { id: result.payload.userId },
    include: { company: true },
  })

  if (!user || !user.isActive) {
    throw new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return {
    id: user.id,
    loginId: user.loginId,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    companyId: user.companyId,
    companyName: user.company?.name ?? 'Odoo HRMS',
    companyLogoUrl: user.company?.logoUrl ?? null,
    department: user.department,
    designation: user.designation,
    joiningDate: user.joiningDate,
    location: user.location,
    managerId: user.managerId,
    profilePhotoUrl: user.profilePhotoUrl,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  }
}
