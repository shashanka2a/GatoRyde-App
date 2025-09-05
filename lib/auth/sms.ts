// Simplified SMS service for MVP
export async function sendOTPSMS(phone: string, otp: string): Promise<void> {
  try {
    console.log(`Mock SMS sent to ${phone} with OTP: ${otp}`)
    // In production, implement actual SMS service
  } catch (error) {
    console.error("Failed to send OTP SMS:", error)
    throw new Error("Failed to send verification SMS")
  }
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic US phone number validation
  const phoneRegex = /^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Check if it's a valid US phone number (10 or 11 digits)
  if (cleanPhone.length === 10) {
    return phoneRegex.test(`+1${cleanPhone}`)
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return phoneRegex.test(`+${cleanPhone}`)
  }
  
  return false
}

export function normalizePhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length === 10) {
    return `+1${cleanPhone}`
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return `+${cleanPhone}`
  }
  
  throw new Error("Invalid phone number format")
}