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
  try {
    // Parse JSON with proper error handling
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error("JSON Parse Error:", jsonError)
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

    // Validate .edu email
    const eduValidation = validateEduEmail(email)
    if (!eduValidation.isValid) {
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

    // Check rate limit with error handling
    try {
      await rateLimiter.checkRateLimit(normalizedEmail, "otp_request")
    } catch (error) {
      console.error("Rate limit error:", error)
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
      otp = await otpManager.generateOTP(normalizedEmail, "email")
    } catch (error) {
      console.error("OTP generation error:", error)
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
      await OTPEmailService.sendOTP({
        to: normalizedEmail,
        code: otp,
        expiresInMinutes: 10
      })
    } catch (error) {
      console.error("Email sending error:", error)
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
      await rateLimiter.incrementAttempts(normalizedEmail, "otp_request")
    } catch (error) {
      console.error("Rate limit increment error:", error)
      // Don't fail the request for this
    }

    // Get expiry time for client
    let expiry
    try {
      expiry = await otpManager.getOTPExpiry(normalizedEmail, "email")
    } catch (error) {
      console.error("OTP expiry error:", error)
      // Use default expiry if this fails
      expiry = new Date(Date.now() + 10 * 60 * 1000)
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
      expiresAt: expiry,
      email: normalizedEmail
    })

  } catch (error) {
    console.error("Send OTP unexpected error:", error)

    if (error instanceof z.ZodError) {
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
        error: "Failed to send verification email",
        code: "UNEXPECTED_ERROR"
      },
      { status: 500 }
    )
  }
}