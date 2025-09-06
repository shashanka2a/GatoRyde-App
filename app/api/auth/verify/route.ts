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

    // Check rate limit
    try {
      await rateLimiter.checkRateLimit(normalizedEmail, "otp_request")
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED"
        },
        { status: 429 }
      )
    }

    // Generate OTP and store in local storage (10-minute TTL)
    const otp = await otpManager.generateOTP(normalizedEmail, "email")

    // Send OTP via Nodemailer (Gmail SMTP)
    await OTPEmailService.sendOTP({
      to: normalizedEmail,
      code: otp,
      expiresInMinutes: 10
    })

    // Increment rate limit counter
    await rateLimiter.incrementAttempts(normalizedEmail, "otp_request")

    // Get expiry time for client
    const expiry = await otpManager.getOTPExpiry(normalizedEmail, "email")

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
      expiresAt: expiry,
      email: normalizedEmail
    })

  } catch (error) {
    console.error("Send OTP error:", error)

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
        error: "Failed to send verification email"
      },
      { status: 500 }
    )
  }
}