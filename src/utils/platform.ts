/**
 * Utility functions for platform detection and native app integration
 */

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false
  
  return /Android/.test(navigator.userAgent)
}

export function openSMS(phoneNumber: string, message: string): void {
  const encodedMessage = encodeURIComponent(message)
  
  if (isIOS()) {
    // iOS format
    window.location.href = `sms:${phoneNumber}&body=${encodedMessage}`
  } else {
    // Android and other platforms
    window.location.href = `sms:${phoneNumber}?body=${encodedMessage}`
  }
}

export function openEmail(email: string, subject: string, body?: string): void {
  const encodedSubject = encodeURIComponent(subject)
  const encodedBody = body ? encodeURIComponent(body) : ''
  
  let mailtoUrl = `mailto:${email}?subject=${encodedSubject}`
  if (encodedBody) {
    mailtoUrl += `&body=${encodedBody}`
  }
  
  window.location.href = mailtoUrl
}

export function getPlatformName(): string {
  if (isIOS()) return 'iOS'
  if (isAndroid()) return 'Android'
  return 'Desktop'
}