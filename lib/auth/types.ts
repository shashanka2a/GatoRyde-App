import { z } from "zod"

// Email OTP Request schemas (SMS removed - only .edu email verification)
export const StartOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  referral: z.string().optional(),
})

export const VerifyOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
})

// Response types
export const OTPResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  rateLimitReset: z.number().optional(),
})

export const VerifyResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
    eduVerified: z.boolean(),
    university: z.string().nullable(),
    name: z.string().nullable(),
    photoUrl: z.string().nullable(),
  }).optional(),
})

// Error types
export class OTPError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = "OTPError"
  }
}

export class RateLimitError extends OTPError {
  constructor(message: string, public resetTime: number) {
    super(message, "RATE_LIMIT_EXCEEDED", 429)
  }
}

// Type exports
export type StartOTPRequest = z.infer<typeof StartOTPSchema>
export type VerifyOTPRequest = z.infer<typeof VerifyOTPSchema>
export type OTPResponse = z.infer<typeof OTPResponseSchema>
export type VerifyResponse = z.infer<typeof VerifyResponseSchema>

// Session types (email-only authentication)
export interface ExtendedUser {
  id: string
  email: string
  phone: string | null
  eduVerified: boolean
  university: string | null
  name: string | null
  photoUrl: string | null
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser
  }
  
  interface User extends ExtendedUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    phone: string | null
    eduVerified: boolean
    university: string | null
    name: string | null
    photoUrl: string | null
  }
}