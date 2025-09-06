import { NextRequest, NextResponse } from "next/server"
import { StartOTPSchema, OTPError, RateLimitError } from "@/lib/auth/types"
import { rateLimiter } from "@/lib/auth/rate-limit"
import { otpManager } from "@/lib/auth/otp"
import { sendOTPEmail } from "@/lib/auth/email"
import { sendOTPSMS, validatePhoneNumber, normalizePhoneNumber } from "@/lib/auth/sms"
import { validateEduEmail, getUniversityName } from "@/lib/auth/university-detector"
import { CookieManager } from "@/lib/auth/cookies"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, type, referral } = StartOTPSchema.parse(body)

    // Validate identifier based on type
    if (type === "email") {
      const emailSchema = z.string().email("Invalid email address")
      emailSchema.parse(identifier)
      
      // Validate .edu email
      const eduValidation = validateEduEmail(identifier)
      if (!eduValidation.isValid) {
        throw new OTPError(
          eduValidation.error || "Only .edu email addresses are accepted",
          "INVALID_EDU_EMAIL",
          400
        )
      }
    } else if (type === "sms") {
      if (!validatePhoneNumber(identifier)) {
        throw new OTPError("Invalid phone number format", "INVALID_PHONE", 400)
      }
    }

    // Normalize identifier
    const normalizedIdentifier = type === "sms" 
      ? normalizePhoneNumber(identifier)
      : identifier.toLowerCase()

    // Check rate limit
    await rateLimiter.checkRateLimit(normalizedIdentifier, "otp_request")

    // Generate and send OTP
    const otp = await otpManager.generateOTP(normalizedIdentifier, type)

    if (type === "email") {
      const universityName = getUniversityName(normalizedIdentifier)
      await sendOTPEmail(normalizedIdentifier, otp, universityName)
    } else {
      await sendOTPSMS(normalizedIdentifier, otp)
    }

    // Increment rate limit counter
    await rateLimiter.incrementAttempts(normalizedIdentifier, "otp_request")

    // Create response
    const universityName = type === "email" ? getUniversityName(normalizedIdentifier) : null
    const response = NextResponse.json({
      success: true,
      message: type === "email" && universityName
        ? `Verification code sent to your ${universityName} email`
        : `Verification code sent to your ${type === "email" ? "email" : "phone"}`,
    })

    // Set referral cookie if provided
    if (referral) {
      CookieManager.setReferralCookie(response, referral)
    }

    return response

  } catch (error) {
    console.error("Start OTP error:", error)

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
      },
      { status: 500 }
    )
  }
}