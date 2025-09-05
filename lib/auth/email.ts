// Simplified email service for MVP
export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  try {
    console.log(`Mock email sent to ${email} with OTP: ${otp}`)
    // In production, implement actual email service
  } catch (error) {
    console.error("Failed to send OTP email:", error)
    throw new Error("Failed to send verification email")
  }
}