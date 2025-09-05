import crypto from "crypto"

// Simple in-memory OTP storage for MVP
const otpStore = new Map<string, { otp: string; expiry: number }>()

const OTP_EXPIRY_MINUTES = 10

export class OTPManager {
  private getOTPKey(identifier: string, type: "email" | "sms"): string {
    return `otp:${type}:${identifier}`
  }

  async generateOTP(identifier: string, type: "email" | "sms"): Promise<string> {
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    
    const key = this.getOTPKey(identifier, type)
    const expiry = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000)

    // Store OTP with expiry
    otpStore.set(key, { otp, expiry })

    return otp
  }

  async verifyOTP(
    identifier: string,
    otp: string,
    type: "email" | "sms"
  ): Promise<boolean> {
    const key = this.getOTPKey(identifier, type)
    const stored = otpStore.get(key)

    if (!stored || Date.now() > stored.expiry) {
      otpStore.delete(key)
      return false // OTP expired or doesn't exist
    }

    const isValid = stored.otp === otp

    if (isValid) {
      // Delete OTP after successful verification
      otpStore.delete(key)
    }

    return isValid
  }

  async getOTPExpiry(identifier: string, type: "email" | "sms"): Promise<number | null> {
    const key = this.getOTPKey(identifier, type)
    const stored = otpStore.get(key)
    
    if (!stored || Date.now() > stored.expiry) {
      otpStore.delete(key)
      return null
    }

    return stored.expiry
  }

  async deleteOTP(identifier: string, type: "email" | "sms"): Promise<void> {
    const key = this.getOTPKey(identifier, type)
    otpStore.delete(key)
  }
}

export const otpManager = new OTPManager()