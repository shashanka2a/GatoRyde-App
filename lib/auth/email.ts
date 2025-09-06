import { OTPEmailService } from './otp-email'

export async function sendOTPEmail(email: string, otp: string, universityName?: string | null): Promise<void> {
  try {
    await OTPEmailService.sendOTP({
      to: email,
      code: otp,
      expiresInMinutes: 10
    })
    
    const universityText = universityName ? ` (${universityName})` : ''
    console.log(`OTP email sent to ${email}${universityText}`)
  } catch (error) {
    console.error("Failed to send OTP email:", error)
    throw new Error("Failed to send verification email")
  }
}