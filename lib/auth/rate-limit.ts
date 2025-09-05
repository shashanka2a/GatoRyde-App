// Simple in-memory rate limiting for MVP
const rateLimitStore = new Map<string, { attempts: number; resetTime: number; blockUntil?: number }>()

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

const OTP_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 3, // 3 OTP requests
  windowMs: 15 * 60 * 1000, // per 15 minutes
  blockDurationMs: 60 * 60 * 1000, // block for 1 hour after exceeding
}

const VERIFY_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 5, // 5 verification attempts
  windowMs: 15 * 60 * 1000, // per 15 minutes
  blockDurationMs: 30 * 60 * 1000, // block for 30 minutes after exceeding
}

export class RateLimitError extends Error {
  constructor(message: string, public blockUntil: number) {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class RateLimiter {
  private getKey(identifier: string, action: string): string {
    return `rate_limit:${action}:${identifier}`
  }

  async checkRateLimit(
    identifier: string,
    action: "otp_request" | "otp_verify"
  ): Promise<void> {
    const config = action === "otp_request" ? OTP_RATE_LIMIT : VERIFY_RATE_LIMIT
    const key = this.getKey(identifier, action)
    const now = Date.now()
    
    const stored = rateLimitStore.get(key)

    // Check if currently blocked
    if (stored?.blockUntil && now < stored.blockUntil) {
      throw new RateLimitError(
        `Too many ${action.replace('_', ' ')} attempts. Try again later.`,
        stored.blockUntil
      )
    }

    // Reset if window expired
    if (stored && now > stored.resetTime) {
      rateLimitStore.delete(key)
    }

    const current = rateLimitStore.get(key)
    const attempts = current?.attempts || 0

    if (attempts >= config.maxAttempts) {
      // Block the identifier
      const blockUntil = now + config.blockDurationMs
      rateLimitStore.set(key, {
        attempts: attempts + 1,
        resetTime: now + config.windowMs,
        blockUntil
      })
      
      throw new RateLimitError(
        `Rate limit exceeded. Blocked until ${new Date(blockUntil).toISOString()}`,
        blockUntil
      )
    }
  }

  async incrementAttempts(
    identifier: string,
    action: "otp_request" | "otp_verify"
  ): Promise<void> {
    const config = action === "otp_request" ? OTP_RATE_LIMIT : VERIFY_RATE_LIMIT
    const key = this.getKey(identifier, action)
    const now = Date.now()

    const stored = rateLimitStore.get(key)
    
    if (!stored || now > stored.resetTime) {
      rateLimitStore.set(key, {
        attempts: 1,
        resetTime: now + config.windowMs
      })
    } else {
      stored.attempts++
    }
  }

  async resetAttempts(
    identifier: string,
    action: "otp_request" | "otp_verify"
  ): Promise<void> {
    const key = this.getKey(identifier, action)
    rateLimitStore.delete(key)
  }

  async getRemainingAttempts(
    identifier: string,
    action: "otp_request" | "otp_verify"
  ): Promise<{ remaining: number; resetTime: number }> {
    const config = action === "otp_request" ? OTP_RATE_LIMIT : VERIFY_RATE_LIMIT
    const key = this.getKey(identifier, action)
    const now = Date.now()
    
    const stored = rateLimitStore.get(key)
    
    if (!stored || now > stored.resetTime) {
      return { remaining: config.maxAttempts, resetTime: 0 }
    }
    
    const remaining = Math.max(0, config.maxAttempts - stored.attempts)
    return { remaining, resetTime: stored.resetTime }
  }
}

export const rateLimiter = new RateLimiter()