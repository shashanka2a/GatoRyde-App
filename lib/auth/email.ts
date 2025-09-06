// Simplified email service for MVP
export async function sendOTPEmail(email: string, otp: string, universityName?: string | null): Promise<void> {
  try {
    const universityText = universityName ? ` (${universityName})` : ''
    console.log(`Mock email sent to ${email}${universityText} with OTP: ${otp}`)
    // In production, implement actual email service with university-specific templates
  } catch (error) {
    console.error("Failed to send OTP email:", error)
    throw new Error("Failed to send verification email")
  }
}