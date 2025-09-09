import { NextRequest, NextResponse } from "next/server"
import { clearAuthCookies } from "@/lib/auth/cookies-server"

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    })

    // Clear the auth token cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".rydify.app" : undefined,
    })

    // Clear the auth cookies for middleware
    clearAuthCookies(response)

    return response

  } catch (error) {
    console.error("Logout error:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Logout failed"
      },
      { status: 500 }
    )
  }
}