import crypto from "crypto"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const OTP_EXPIRY_MINUTES = 10

export class OTPManager {
  private getOTPKey(identifier: string, type: "email" | "sms"): string {
    return `otp:${type}:${identifier}`
  }

  async generateOTP(identifier: string, type: "email" | "sms"): Promise<string> {
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    
    console.log(`🔍 [OTP MANAGER] Generated OTP for ${identifier} (${type}): ${otp}`)
    
    const expiresAt = new Date(Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000))

    // Store OTP in database (upsert to replace existing)
    await prisma.oTP.upsert({
      where: {
        identifier_type: {
          identifier: identifier.toLowerCase().trim(),
          type: type
        }
      },
      update: {
        code: otp,
        expiresAt: expiresAt
      },
      create: {
        identifier: identifier.toLowerCase().trim(),
        type: type,
        code: otp,
        expiresAt: expiresAt
      }
    })
    
    console.log(`🔍 [OTP MANAGER] Stored OTP in database with expiry: ${expiresAt.toISOString()}`)

    return otp
  }

  async verifyOTP(
    identifier: string,
    otp: string,
    type: "email" | "sms"
  ): Promise<boolean> {
    console.log(`🔍 [OTP MANAGER] Verifying OTP for ${identifier} (${type})`)
    console.log(`🔍 [OTP MANAGER] Provided OTP: ${otp}`)
    console.log(`🔍 [OTP MANAGER] Current time: ${new Date().toISOString()}`)

    // Get OTP from database
    const stored = await prisma.oTP.findUnique({
      where: {
        identifier_type: {
          identifier: identifier.toLowerCase().trim(),
          type: type
        }
      }
    })

    console.log(`🔍 [OTP MANAGER] Stored OTP: ${stored?.code || 'NOT FOUND'}`)
    console.log(`🔍 [OTP MANAGER] Stored expiry: ${stored ? stored.expiresAt.toISOString() : 'N/A'}`)

    if (!stored || new Date() > stored.expiresAt) {
      console.log(`❌ [OTP MANAGER] OTP expired or doesn't exist`)
      // Clean up expired OTP
      if (stored) {
        await prisma.oTP.delete({
          where: { id: stored.id }
        })
      }
      return false // OTP expired or doesn't exist
    }

    const isValid = stored.code === otp
    console.log(`🔍 [OTP MANAGER] OTP verification result: ${isValid}`)

    if (isValid) {
      console.log(`✅ [OTP MANAGER] OTP verified successfully, deleting from database`)
      // Delete OTP after successful verification
      await prisma.oTP.delete({
        where: { id: stored.id }
      })
    }

    return isValid
  }

  async getOTPExpiry(identifier: string, type: "email" | "sms"): Promise<number | null> {
    const stored = await prisma.oTP.findUnique({
      where: {
        identifier_type: {
          identifier: identifier.toLowerCase().trim(),
          type: type
        }
      }
    })
    
    if (!stored || new Date() > stored.expiresAt) {
      // Clean up expired OTP
      if (stored) {
        await prisma.oTP.delete({
          where: { id: stored.id }
        })
      }
      return null
    }
    
    return stored.expiresAt.getTime()
  }

  async deleteOTP(identifier: string, type: "email" | "sms"): Promise<void> {
    await prisma.oTP.deleteMany({
      where: {
        identifier: identifier.toLowerCase().trim(),
        type: type
      }
    })
  }
}

export const otpManager = new OTPManager()