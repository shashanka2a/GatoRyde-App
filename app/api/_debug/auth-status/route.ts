import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { CookieManager } from "@/lib/auth/cookies"

// Only enable in development
const isDevelopment = process.env.NODE_ENV === "development"

export async function GET(request: NextRequest) {
  if (!isDevelopment) {
    return NextResponse.json(
      { error: "Debug endpoint only available in development" },
      { status: 404 }
    )
  }

  try {
    // Get session
    const session = await getSession()

    // Get cookies
    const referralCookie = CookieManager.getReferralCookie(request)
    const anonymousData = CookieManager.getAnonymousData(request)

    // Get all cookies (redact sensitive ones)
    const allCookies = Object.fromEntries(
      request.cookies.getAll().map(cookie => [
        cookie.name,
        cookie.name.includes('token') || cookie.name.includes('secret') 
          ? '[REDACTED]' 
          : cookie.value
      ])
    )

    // Get headers (redact sensitive ones)
    const headers = Object.fromEntries(
      Array.from(request.headers.entries()).map(([key, value]) => [
        key,
        key.toLowerCase().includes('authorization') || 
        key.toLowerCase().includes('cookie') ||
        key.toLowerCase().includes('token')
          ? '[REDACTED]'
          : value
      ])
    )

    const debugInfo = {
      timestamp: new Date().toISOString(),
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          phone: session.user.phone ? '[REDACTED]' : null,
          eduVerified: session.user.eduVerified,
          photoUrl: session.user.photoUrl,
        },
        expires: session.expires,
      } : null,
      cookies: {
        referral: referralCookie,
        anonymousData: anonymousData,
        all: allCookies,
      },
      headers,
      url: request.url,
      method: request.method,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasRedisConfig: false, // Redis removed for MVP simplicity
        hasEmailConfig: !!process.env.RESEND_API_KEY,
        hasSMSConfig: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
        hasNextAuthConfig: !!process.env.NEXTAUTH_SECRET,
      }
    }

    return NextResponse.json(debugInfo, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })

  } catch (error) {
    console.error("Debug auth status error:", error)
    
    return NextResponse.json(
      {
        error: "Failed to get auth status",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}