import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/session'

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/signin',
  '/signup',
  '/verify-email',
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/verify-email',
]

// Routes only accessible to unauthenticated users (redirect to dashboard if logged in)
const AUTH_ONLY_ROUTES = ['/signin', '/signup']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/uploads') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next()
  }

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  // Try real JWT session first
  const session = await getSessionFromRequest(req)

  // Fallback: accept demo cookie (dayflow_user_id) as a valid session marker
  const demoUserId = req.cookies.get('dayflow_user_id')?.value
  const isAuthenticated = !!session || !!demoUserId

  // If user is authenticated and tries to access auth pages → redirect to dashboard
  if (isAuthenticated && AUTH_ONLY_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If route requires auth and no session → redirect to signin
  if (!isPublicRoute && !isAuthenticated) {
    const signinUrl = new URL('/signin', req.url)
    signinUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signinUrl)
  }

  // Attach user context to headers for API routes
  if (session) {
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', session.userId)
    requestHeaders.set('x-user-role', session.role)
    requestHeaders.set('x-company-id', session.companyId)
    requestHeaders.set('x-session-id', session.sessionId)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Demo mode: pass demo user id via header
  if (demoUserId) {
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', demoUserId)
    requestHeaders.set('x-dev-user-id', demoUserId)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
