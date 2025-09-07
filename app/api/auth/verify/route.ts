import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { otpManager } from "@/lib/auth/otp"
import { OTPEmailService } from "@/lib/auth/otp-email"
import { rateLimiter } from "@/lib/auth/rate-limit"
import { validateEduEmail } from "@/lib/auth/university-detector"

const SendOTPSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
})

export async function POST(request: NextRequest) {
  console.log("🔍 [AUTH VERIFY] Request received")
  console.log("🔍 [AUTH VERIFY] Request URL:", request.url)
  console.log("🔍 [AUTH VERIFY] Request method:", request.method)
  console.log("🔍 [AUTH VERIFY] Request headers:", Object.fromEntries(request.headers.entries()))
  
  try {
    // Parse JSON with proper error handling
    let body
    try {
      body = await request.json()
      console.log("🔍 [AUTH VERIFY] Request body:", body)
    } catch (jsonError) {
      console.error("❌ [AUTH VERIFY] JSON Parse Error:", jsonError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON format in request body",
          code: "INVALID_JSON"
        },
        { status: 400 }
      )
    }

    const { email } = SendOTPSchema.parse(body)
    console.log("🔍 [AUTH VERIFY] Parsed email:", email)

    // Validate .edu email
    const eduValidation = validateEduEmail(email)
    console.log("🔍 [AUTH VERIFY] Email validation result:", eduValidation)
    if (!eduValidation.isValid) {
      console.log("❌ [AUTH VERIFY] Invalid .edu email:", eduValidation.error)
      return NextResponse.json(
        {
          success: false,
          error: eduValidation.error || "Only .edu email addresses are accepted",
          code: "INVALID_EDU_EMAIL"
        },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    console.log("🔍 [AUTH VERIFY] Normalized email:", normalizedEmail)

    // Check rate limit with error handling
    try {
      console.log("🔍 [AUTH VERIFY] Checking rate limit...")
      await rateLimiter.checkRateLimit(normalizedEmail, "otp_request")
      console.log("✅ [AUTH VERIFY] Rate limit check passed")
    } catch (error) {
      console.error("❌ [AUTH VERIFY] Rate limit error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED"
        },
        { status: 429 }
      )
    }

    // Generate OTP with error handling
    let otp
    try {
      console.log("🔍 [AUTH VERIFY] Generating OTP...")
      otp = await otpManager.generateOTP(normalizedEmail, "email")
      console.log("✅ [AUTH VERIFY] OTP generated successfully")
    } catch (error) {
      console.error("❌ [AUTH VERIFY] OTP generation error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate verification code",
          code: "OTP_GENERATION_FAILED"
        },
        { status: 500 }
      )
    }

    // Send OTP via email with detailed error handling
    try {
      console.log("🔍 [AUTH VERIFY] Sending OTP email...")
      await OTPEmailService.sendOTP({
        to: normalizedEmail,
        code: otp,
        expiresInMinutes: 10
      })
      console.log("✅ [AUTH VERIFY] OTP email sent successfully")
    } catch (error) {
      console.error("❌ [AUTH VERIFY] Email sending error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send verification email. Please try again.",
          code: "EMAIL_SEND_FAILED"
        },
        { status: 500 }
      )
    }

    // Increment rate limit counter (non-critical, don't fail if this errors)
    try {
      console.log("🔍 [AUTH VERIFY] Incrementing rate limit counter...")
      await rateLimiter.incrementAttempts(normalizedEmail, "otp_request")
      console.log("✅ [AUTH VERIFY] Rate limit counter incremented")
    } catch (error) {
      console.error("⚠️ [AUTH VERIFY] Rate limit increment error (non-critical):", error)
      // Don't fail the request for this
    }

    // Get expiry time for client
    let expiry
    try {
      console.log("🔍 [AUTH VERIFY] Getting OTP expiry...")
      expiry = await otpManager.getOTPExpiry(normalizedEmail, "email")
      console.log("✅ [AUTH VERIFY] OTP expiry retrieved:", expiry)
    } catch (error) {
      console.error("⚠️ [AUTH VERIFY] OTP expiry error (using default):", error)
      // Use default expiry if this fails
      expiry = new Date(Date.now() + 10 * 60 * 1000)
    }

    const response = {
      success: true,
      message: "Verification code sent to your email",
      expiresAt: expiry,
      email: normalizedEmail
    }
    
    console.log("✅ [AUTH VERIFY] Sending success response:", response)
    return NextResponse.json(response)

  } catch (error) {
    console.error("❌ [AUTH VERIFY] Unexpected error:", error)
    console.error("❌ [AUTH VERIFY] Error stack:", error instanceof Error ? error.stack : 'No stack trace')

    if (error instanceof z.ZodError) {
      console.log("❌ [AUTH VERIFY] Zod validation error:", error.errors)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.log("❌ [AUTH VERIFY] Returning 500 error response")
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send verification email",
        code: "UNEXPECTED_ERROR"
      },
      { status: 500 }
    )
  }
}