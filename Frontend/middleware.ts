import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Route protection middleware.
 *
 * - Public routes (login, register, forgot-password, etc.) are accessible to all.
 * - Everything else requires an access_token cookie or will redirect to /login.
 *
 * Note: The actual token validation happens server-side in the Django backend.
 * This middleware only checks for the *presence* of the token to avoid rendering
 * protected pages before the client-side AuthContext kicks in.
 */

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes and static assets
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path))
  const isAssetOrApi = pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/images') || pathname.includes('.')

  if (isPublicPath || isAssetOrApi) {
    return NextResponse.next()
  }

  // Check for access token in localStorage is not possible in middleware (server-side),
  // so we check the refresh cookie set by the backend as a proxy for auth state.
  const refreshCookie = request.cookies.get('adoratrip_refresh')

  if (!refreshCookie) {
    const loginUrl = new URL('/login', request.url)

    loginUrl.searchParams.set('callbackUrl', pathname)

    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
