import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const SendOTPSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
})

export async function POST(request: NextRequest) {
  const debugInfo: any = {
    step: 'start',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    errors: []
  }

  try {
    debugInfo.step = 'parsing_json'
    
    // Parse JSON with proper error handling
    let body
    try {
      body = await request.json()
      debugInfo.bodyReceived = true
    } catch (jsonError) {
      debugInfo.errors.push(`JSON Parse Error: ${jsonError}`)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON format in request body",
          code: "INVALID_JSON",
          debug: debugInfo
        },
        { status: 400 }
      )
    }

    debugInfo.step = 'validating_schema'
    const { email } = SendOTPSchema.parse(body)
    debugInfo.email = email
    debugInfo.emailValidated = true

    // Test university validation
    debugInfo.step = 'university_validation'
    try {
      const { validateEduEmail } = await import("@/lib/auth/university-detector")
      const eduValidation = validateEduEmail(email)
      debugInfo.eduValidation = eduValidation
      
      if (!eduValidation.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: eduValidation.error || "Only .edu email addresses are accepted",
            code: "INVALID_EDU_EMAIL",
            debug: debugInfo
          },
          { status: 400 }
        )
      }
    } catch (error) {
      debugInfo.errors.push(`University validation error: ${error}`)
      debugInfo.step = 'university_validation_failed'
    }

    const normalizedEmail = email.toLowerCase().trim()
    debugInfo.normalizedEmail = normalizedEmail

    // Test rate limiting
    debugInfo.step = 'rate_limiting'
    try {
      const { rateLimiter } = await import("@/lib/auth/rate-limit")
      await rateLimiter.checkRateLimit(normalizedEmail, "otp_request")
      debugInfo.rateLimitPassed = true
    } catch (error) {
      debugInfo.errors.push(`Rate limit error: ${error}`)
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
          debug: debugInfo
        },
        { status: 429 }
      )
    }

    // Test OTP generation
    debugInfo.step = 'otp_generation'
    let otp
    try {
      const { otpManager } = await import("@/lib/auth/otp")
      otp = await otpManager.generateOTP(normalizedEmail, "email")
      debugInfo.otpGenerated = true
      debugInfo.otpLength = otp?.length
    } catch (error) {
      debugInfo.errors.push(`OTP generation error: ${error}`)
      debugInfo.step = 'otp_generation_failed'
    }

    // Test email sending
    debugInfo.step = 'email_sending'
    try {
      const { OTPEmailService } = await import("@/lib/auth/otp-email")
      await OTPEmailService.sendOTP({
        to: normalizedEmail,
        code: otp,
        expiresInMinutes: 10
      })
      debugInfo.emailSent = true
    } catch (error) {
      debugInfo.errors.push(`Email sending error: ${error}`)
      debugInfo.step = 'email_sending_failed'
    }

    // Test rate limit increment
    debugInfo.step = 'rate_limit_increment'
    try {
      const { rateLimiter } = await import("@/lib/auth/rate-limit")
      await rateLimiter.incrementAttempts(normalizedEmail, "otp_request")
      debugInfo.rateLimitIncremented = true
    } catch (error) {
      debugInfo.errors.push(`Rate limit increment error: ${error}`)
      debugInfo.step = 'rate_limit_increment_failed'
    }

    // Test OTP expiry
    debugInfo.step = 'otp_expiry'
    let expiry
    try {
      const { otpManager } = await import("@/lib/auth/otp")
      expiry = await otpManager.getOTPExpiry(normalizedEmail, "email")
      debugInfo.expiryRetrieved = true
    } catch (error) {
      debugInfo.errors.push(`OTP expiry error: ${error}`)
      debugInfo.step = 'otp_expiry_failed'
    }

    debugInfo.step = 'success'
    debugInfo.completed = true

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
      expiresAt: expiry,
      email: normalizedEmail,
      debug: debugInfo
    })

  } catch (error) {
    debugInfo.errors.push(`Unexpected error: ${error}`)
    debugInfo.step = 'unexpected_error'
    debugInfo.errorMessage = error instanceof Error ? error.message : String(error)
    debugInfo.errorStack = error instanceof Error ? error.stack : undefined

    console.error("Send OTP error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors,
          debug: debugInfo
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send verification email",
        debug: debugInfo
      },
      { status: 500 }
    )
  }
}