import { NextRequest, NextResponse } from "next/server"
import { VerifyOTPSchema, OTPError, RateLimitError } from "@/lib/auth/types"
import { rateLimiter } from "@/lib/auth/rate-limit"
import { otpManager } from "@/lib/auth/otp"
import { validatePhoneNumber, normalizePhoneNumber } from "@/lib/auth/sms"
import { CookieManager } from "@/lib/auth/cookies"
import { prisma } from "@/lib/db/client"
import { UserRepository } from "@/lib/db/repositories"
import { validateEduEmail, getUniversityInfo } from "@/lib/auth/university-detector"
import { signIn } from "next-auth/react"
import { z } from "zod"
import { signJWT } from "@/lib/auth/jwt"
import { setAuthCookies } from "@/lib/auth/cookies-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, otp, type } = VerifyOTPSchema.parse(body)

    // Validate identifier based on type
    if (type === "email") {
      const emailSchema = z.string().email("Invalid email address")
      emailSchema.parse(identifier)
    } else if (type === "sms") {
      if (!validatePhoneNumber(identifier)) {
        throw new OTPError("Invalid phone number format", "INVALID_PHONE", 400)
      }
    }

    // Normalize identifier
    const normalizedIdentifier = type === "sms" 
      ? normalizePhoneNumber(identifier)
      : identifier.toLowerCase()

    // Check rate limit for verification attempts
    await rateLimiter.checkRateLimit(normalizedIdentifier, "otp_verify")

    // Verify OTP
    const isValidOTP = await otpManager.verifyOTP(normalizedIdentifier, otp, type)

    if (!isValidOTP) {
      // Increment failed verification attempts
      await rateLimiter.incrementAttempts(normalizedIdentifier, "otp_verify")
      
      throw new OTPError(
        "Invalid or expired verification code",
        "INVALID_OTP",
        400
      )
    }

    // OTP is valid - reset rate limits
    await rateLimiter.resetAttempts(normalizedIdentifier, "otp_request")
    await rateLimiter.resetAttempts(normalizedIdentifier, "otp_verify")

    // Find or create user
    const userRepository = new UserRepository()
    let user

    if (type === "email") {
      user = await userRepository.findByEmail(normalizedIdentifier)
      
      // Check if this is a .edu email and handle verification
      const eduValidation = validateEduEmail(normalizedIdentifier)
      const universityInfo = getUniversityInfo(normalizedIdentifier)
      
      if (!user) {
        user = await userRepository.create({
          email: normalizedIdentifier,
          eduVerified: eduValidation.isValid,
          universityId: universityInfo?.name || null,
          state: universityInfo?.state || null,
          city: universityInfo?.city || null,
        })
      } else if (eduValidation.isValid && !user.eduVerified) {
        // Update existing user with .edu verification
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            eduVerified: true,
            universityId: universityInfo?.name || user.universityId,
            state: universityInfo?.state || user.state,
            city: universityInfo?.city || user.city,
          }
        })
      }
    } else {
      user = await userRepository.findByPhone(normalizedIdentifier)
      if (!user) {
        user = await userRepository.create({
          email: "", // Will be updated later if needed
          phone: normalizedIdentifier,
          eduVerified: false,
        })
      }
    }

    // Get anonymous data from cookies
    const anonymousData = CookieManager.getAnonymousData(request)
    
    // Merge anonymous data into user profile
    if (anonymousData) {
      await CookieManager.mergeAnonymousDataIntoUser(user.id, anonymousData)
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: user.eduVerified && type === "email" 
        ? "Student email verified successfully!" 
        : "Verification successful",
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        eduVerified: user.eduVerified,
        universityId: user.universityId,
        state: user.state,
        city: user.city,
        photoUrl: user.photoUrl,
      },
    })

    // Clear anonymous data cookies after successful merge
    if (anonymousData) {
      CookieManager.clearAnonymousData(response)
    }

    // Also issue our app JWT so /api/auth/session can read it
    const token = await signJWT({
      id: user.id,
      email: user.email,
      eduVerified: user.eduVerified,
      university: user.universityId ? undefined : undefined,
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    // And set simple cookies the middleware expects
    setAuthCookies(user.id, user.eduVerified, response)

    return response

  } catch (error) {
    console.error("Verify OTP error:", error)

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
        message: "Verification failed. Please try again.",
      },
      { status: 500 }
    )
  }
}