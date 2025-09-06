import { NextRequest, NextResponse } from "next/server"
import { OTPError, RateLimitError } from "@/lib/auth/types"
import { rateLimiter } from "@/lib/auth/rate-limit"
import { otpManager } from "@/lib/auth/otp"
import { sendOTPEmail } from "@/lib/auth/email"
import { validateEduEmail, getUniversityName } from "@/lib/auth/university-detector"
import { CookieManager } from "@/lib/auth/cookies"
import { z } from "zod"

// Schema for email-only OTP requests
const EmailOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  referral: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, referral } = EmailOTPSchema.parse(body)

    // Validate .edu email
    const eduValidation = validateEduEmail(email)
    if (!eduValidation.isValid) {
      throw new OTPError(
        eduValidation.error || "Only .edu email addresses are accepted",
        "INVALID_EDU_EMAIL",
        400
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Check rate limit
    await rateLimiter.checkRateLimit(normalizedEmail, "otp_request")

    // Generate and send OTP via email
    const otp = await otpManager.generateOTP(normalizedEmail, "email")
    const universityName = getUniversityName(normalizedEmail)
    await sendOTPEmail(normalizedEmail, otp, universityName)

    // Increment rate limit counter
    await rateLimiter.incrementAttempts(normalizedEmail, "otp_request")

    // Create response
    const response = NextResponse.json({
      success: true,
      message: universityName
        ? `Verification code sent to your ${universityName} email`
        : "Verification code sent to your email",
    })

    // Set referral cookie if provided
    if (referral) {
      CookieManager.setReferralCookie(response, referral)
    }

    return response

  } catch (error) {
    console.error("Start OTP error:", error)
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.errors[0]?.message || "Invalid input",
          errors: error.errors,
        },
        { status: 400 }
      )
    }

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          rateLimitReset: error.resetTime,
        },
        { status: 429 }
      )
    }

    if (error instanceof OTPError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send verification code. Please try again.",
        debug: process.env.NODE_ENV === 'development' ? {
          error: error instanceof Error ? error.message : 'Unknown error'
        } : undefined
      },
      { status: 500 }
    )
  }
}