import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { otpManager } from "@/lib/auth/otp"
import { rateLimiter } from "@/lib/auth/rate-limit"
import { validateEduEmail, getUniversityName } from "@/lib/auth/university-detector"
import { PrismaClient } from "@prisma/client"
import { signJWT } from "@/lib/auth/jwt-edge"
import { OTPEmailService } from "@/lib/auth/otp-email"

const prisma = new PrismaClient()

const LoginOTPSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(6, "OTP must be 6 digits"),
})

// Test endpoint to verify route is working
export async function GET() {
  console.log("🔍 [LOGIN OTP] GET request received - endpoint is working")
  return NextResponse.json({ message: "Login OTP endpoint is working" })
}

export async function POST(request: NextRequest) {
  console.log("🔍 [LOGIN OTP] ===== ENDPOINT REACHED =====")
  console.log("🔍 [LOGIN OTP] Request received")
  console.log("🔍 [LOGIN OTP] Request URL:", request.url)
  console.log("🔍 [LOGIN OTP] Request method:", request.method)
  console.log("🔍 [LOGIN OTP] Request headers:", Object.fromEntries(request.headers.entries()))
  
  try {
    console.log("🔍 [LOGIN OTP] Attempting to parse request body...")
    const body = await request.json()
    console.log("🔍 [LOGIN OTP] Request body parsed successfully:", body)
    
    console.log("🔍 [LOGIN OTP] Attempting to validate with schema...")
    const { email, otp } = LoginOTPSchema.parse(body)
    console.log("🔍 [LOGIN OTP] Schema validation passed")
    console.log("🔍 [LOGIN OTP] Parsed email:", email)
    console.log("🔍 [LOGIN OTP] Parsed OTP:", otp)

    const normalizedEmail = email.toLowerCase().trim()
    console.log("🔍 [LOGIN OTP] Normalized email:", normalizedEmail)

    // Validate .edu email
    const eduValidation = validateEduEmail(normalizedEmail)
    console.log("🔍 [LOGIN OTP] Email validation result:", eduValidation)
    if (!eduValidation.isValid) {
      console.log("❌ [LOGIN OTP] Invalid .edu email:", eduValidation.error)
      return NextResponse.json(
        {
          success: false,
          error: eduValidation.error || "Only .edu email addresses are accepted",
          code: "INVALID_EDU_EMAIL"
        },
        { status: 400 }
      )
    }

    // Check rate limit for verification attempts
    try {
      console.log("🔍 [LOGIN OTP] Checking rate limit...")
      await rateLimiter.checkRateLimit(normalizedEmail, "otp_verify")
      console.log("✅ [LOGIN OTP] Rate limit check passed")
    } catch (error) {
      console.log("❌ [LOGIN OTP] Rate limit exceeded:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Too many verification attempts. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED"
        },
        { status: 429 }
      )
    }

    // Verify OTP from local storage
    console.log("🔍 [LOGIN OTP] Verifying OTP...")
    const isValidOTP = await otpManager.verifyOTP(normalizedEmail, otp, "email")
    console.log("🔍 [LOGIN OTP] OTP verification result:", isValidOTP)

    if (!isValidOTP) {
      console.log("❌ [LOGIN OTP] Invalid OTP provided")
      // Increment failed verification attempts
      await rateLimiter.incrementAttempts(normalizedEmail, "otp_verify")
      
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired verification code",
          code: "INVALID_OTP"
        },
        { status: 400 }
      )
    }

    // OTP is valid - reset rate limits
    await rateLimiter.resetAttempts(normalizedEmail, "otp_request")
    await rateLimiter.resetAttempts(normalizedEmail, "otp_verify")

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    const universityName = getUniversityName(normalizedEmail)
    const isNewUser = !user

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          eduVerified: true,
          university: universityName,
        }
      })

      // Send welcome email for new users
      try {
        await OTPEmailService.sendWelcomeEmail(normalizedEmail, user.name || undefined)
      } catch (error) {
        console.error("Failed to send welcome email:", error)
        // Don't fail the login if welcome email fails
      }
    } else {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          eduVerified: true,
          university: universityName,
        }
      })
    }

    // Generate JWT token for session
    const token = await signJWT({
      id: user.id,
      email: user.email,
      eduVerified: user.eduVerified,
      university: user.university,
    })

    // Create response with secure cookie
    const response = NextResponse.json({
      success: true,
      message: isNewUser ? "Account created and logged in successfully" : "Logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone, // Include phone for profile completion check
        eduVerified: user.eduVerified,
        university: user.university,
        photoUrl: user.photoUrl,
      },
      isNewUser
    })

    // Set secure HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return response

  } catch (error) {
    console.error("❌ [LOGIN OTP] Unexpected error:", error)
    console.error("❌ [LOGIN OTP] Error stack:", error instanceof Error ? error.stack : 'No stack trace')

    if (error instanceof z.ZodError) {
      console.log("❌ [LOGIN OTP] Zod validation error:", error.errors)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed"
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}