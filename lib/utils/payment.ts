export interface PaymentLinkOptions {
  amount: number // in cents
  originText: string
  destText: string
  date: Date
}

export class PaymentUtils {
  static formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  static formatAmountForUrl(cents: number): string {
    return (cents / 100).toFixed(2)
  }

  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  static generateCashAppLink(
    handle: string, 
    options: PaymentLinkOptions
  ): string {
    const amount = this.formatAmountForUrl(options.amount)
    const note = encodeURIComponent(
      `GatoRyde ${options.originText} to ${options.destText} ${this.formatDate(options.date)}`
    )
    
    return `https://cash.app/$${handle}/${amount}?note=${note}`
  }

  static generateEmailLink(
    email: string,
    driverName: string | null,
    options: PaymentLinkOptions
  ): string {
    const formattedAmount = this.formatCurrency(options.amount)
    const subject = encodeURIComponent(`Payment for GatoRyde Trip - ${formattedAmount}`)
    const body = encodeURIComponent(
      `Hi ${driverName || 'there'},\n\n` +
      `I'm sending payment for our GatoRyde trip:\n` +
      `• Route: ${options.originText} to ${options.destText}\n` +
      `• Date: ${this.formatDate(options.date)}\n` +
      `• Amount: ${formattedAmount}\n\n` +
      `Thanks for the ride!\n\n` +
      `Best regards`
    )
    
    return `mailto:${email}?subject=${subject}&body=${body}`
  }

  static generateSMSLink(
    phone: string,
    options: PaymentLinkOptions
  ): string {
    const formattedAmount = this.formatCurrency(options.amount)
    const message = encodeURIComponent(
      `Hi! Sending ${formattedAmount} for our GatoRyde trip from ${options.originText} to ${options.destText} on ${this.formatDate(options.date)}. Thanks for the ride!`
    )
    
    return `sms:${phone}?body=${message}`
  }

  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      return false
    }
  }

  static validatePaymentHandle(handle: string, type: 'zelle' | 'cashapp'): string | null {
    if (!handle.trim()) {
      return null
    }

    switch (type) {
      case 'zelle':
        // Zelle typically uses email addresses or phone numbers
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        const phoneRegex = /^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/
        
        if (!emailRegex.test(handle) && !phoneRegex.test(handle)) {
          return 'Please enter a valid email address or phone number'
        }
        break
        
      case 'cashapp':
        // Cash App handles can contain letters, numbers, hyphens, and underscores
        const cashAppRegex = /^[a-zA-Z0-9_-]+$/
        
        if (!cashAppRegex.test(handle)) {
          return 'Cash App handle can only contain letters, numbers, hyphens, and underscores'
        }
        
        if (handle.length < 3 || handle.length > 20) {
          return 'Cash App handle must be between 3 and 20 characters'
        }
        break
        
      default:
        return 'Invalid payment type'
    }

    return null
  }
}