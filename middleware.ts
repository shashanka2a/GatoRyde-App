import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth/jwt-edge'
import { getAuthCookies } from '@/lib/auth/cookies-server'
import { checkProfileCompletion } from '@/lib/auth/profile-completion'

// Routes that require .edu verification + session
const PROTECTED_ROUTES = [
  '/drive',
  '/profile',
  '/driver',
  '/dashboard',
  '/rides/create',
  '/rides/[id]/payment',
  '/api/rides/create',
  '/api/rides/update',
  '/api/rides/delete',
  '/api/profile',
  '/api/driver',
  '/api/bookings',
  '/api/ride-requests',
]

// Routes that are open to everyone (no login required)
const PUBLIC_ROUTES = [
  '/',
  '/ride',
  '/ride/search',
  '/rides', // Open access to browse rides
  '/browse-rides', // Browse rides page
  '/terms', // Terms of service
  '/auth/login',
  '/auth/verify',
  '/auth/complete-profile', // Profile completion page
  '/api/auth/verify',
  '/api/auth/login-otp',
  '/api/auth/session',
  '/api/auth/complete-profile',
  '/api/profile/update',
  '/api/rides/search',
  '/api/rides/public',
  '/api/rides/[id]', // Individual ride details API
  '/api/locations/popular', // Popular locations API
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    // First check cookies for quick authentication
    const authCookies = getAuthCookies(request)
    console.log('🔍 [MIDDLEWARE] Auth cookies:', authCookies)
    console.log('🔍 [MIDDLEWARE] Pathname:', pathname)
    
    if (!authCookies.uid || !authCookies.eduVerified) {
      console.log('❌ [MIDDLEWARE] Missing auth cookies')
      // Redirect to login for page requests
      if (!pathname.startsWith('/api/')) {
        console.log('❌ [MIDDLEWARE] Redirecting page to login')
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // For API requests, let them handle their own authentication
      console.log('🔍 [MIDDLEWARE] API route, letting through for JWT auth:', pathname)
      return NextResponse.next()
    }

    // Skip JWT verification for now to avoid double authentication
    // The cookies are sufficient for basic authentication
    console.log('✅ [MIDDLEWARE] Authentication successful via cookies')

    // Check profile completion for page requests (not API routes)
    if (!pathname.startsWith('/api/') && !pathname.startsWith('/auth/complete-profile')) {
      try {
        const profileStatus = await checkProfileCompletion(authCookies.uid)
        console.log('🔍 [MIDDLEWARE] Profile completion status:', profileStatus)
        
        // Redirect to profile completion if basic fields are missing
        if (!profileStatus.canAccessApp) {
          console.log('❌ [MIDDLEWARE] Profile incomplete, redirecting to completion')
          const completeProfileUrl = new URL('/auth/complete-profile', request.url)
          completeProfileUrl.searchParams.set('redirect', pathname)
          return NextResponse.redirect(completeProfileUrl)
        }
      } catch (error) {
        console.error('❌ [MIDDLEWARE] Error checking profile completion:', error)
        // Continue if there's an error checking profile
      }
    }

    // Add user info to request headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', authCookies.uid)
      requestHeaders.set('x-user-verified', authCookies.eduVerified.toString())

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