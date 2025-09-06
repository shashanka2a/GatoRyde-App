import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth/jwt'

// Routes that require .edu verification + session
const PROTECTED_ROUTES = [
  '/drive',
  '/profile',
  '/api/rides/create',
  '/api/rides/update',
  '/api/rides/delete',
  '/api/profile',
  '/api/driver',
]

// Routes that are open to everyone (no login required)
const PUBLIC_ROUTES = [
  '/',
  '/ride',
  '/ride/search',
  '/auth/login',
  '/auth/verify',
  '/api/auth/verify',
  '/api/auth/login-otp',
  '/api/auth/session',
  '/api/rides/search',
  '/api/rides/public',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    const user = await getTokenFromRequest(request)

    if (!user) {
      // Redirect to login for page requests
      if (!pathname.startsWith('/api/')) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Return 401 for API requests
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has .edu verification
    if (!user.eduVerified) {
      if (!pathname.startsWith('/api/')) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        loginUrl.searchParams.set('error', 'edu-verification-required')
        return NextResponse.redirect(loginUrl)
      }

      return NextResponse.json(
        { success: false, error: '.edu email verification required' },
        { status: 403 }
      )
    }

    // Add user info to request headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', user.id)
      requestHeaders.set('x-user-email', user.email)
      requestHeaders.set('x-user-verified', user.eduVerified.toString())

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
  }

  return NextResponse.next()
}

function isPublicRoute(pathname: string): boolean {
  // Exact matches
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true
  }

  // Pattern matches
  if (pathname.startsWith('/ride/') && !pathname.includes('/edit')) {
    return true // Allow ride details pages (read-only)
  }

  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon') || 
      pathname.startsWith('/images/') ||
      pathname.startsWith('/api/auth/')) {
    return true // Allow Next.js assets and auth endpoints
  }

  return false
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}