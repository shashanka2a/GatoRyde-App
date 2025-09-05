import { NotificationChannel } from './types'

export interface EmailProvider {
  sendEmail(to: string, subject: string, content: string): Promise<void>
}

export interface SMSProvider {
  sendSMS(to: string, content: string): Promise<void>
}

// Resend Email Provider
export class ResendEmailProvider implements EmailProvider {
  private apiKey: string
  private fromEmail: string

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY!
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@rydify.com'
  }

  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.fromEmail,
        to: [to],
        subject,
        text: content,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Resend API error: ${response.status} - ${error}`)
    }

    const result = await response.json()
    console.log(`Email sent via Resend: ${result.id}`)
  }
}

// Twilio SMS Provider
export class TwilioSMSProvider implements SMSProvider {
  private accountSid: string
  private authToken: string
  private fromPhone: string

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID!
    this.authToken = process.env.TWILIO_AUTH_TOKEN!
    this.fromPhone = process.env.TWILIO_FROM_PHONE!
  }

  async sendSMS(to: string, content: string): Promise<void> {
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: this.fromPhone,
          To: to,
          Body: content,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Twilio API error: ${response.status} - ${error}`)
    }

    const result = await response.json()
    console.log(`SMS sent via Twilio: ${result.sid}`)
  }
}

// Mock providers for development/testing
export class MockEmailProvider implements EmailProvider {
  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    console.log('=== MOCK EMAIL ===')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Content:\n${content}`)
    console.log('==================')
    
    // Simulate potential failure for testing
    if (Math.random() < 0.1) {
      throw new Error('Mock email failure for testing')
    }
  }
}

export class MockSMSProvider implements SMSProvider {
  async sendSMS(to: string, content: string): Promise<void> {
    console.log('=== MOCK SMS ===')
    console.log(`To: ${to}`)
    console.log(`Content: ${content}`)
    console.log('================')
    
    // Simulate potential failure for testing
    if (Math.random() < 0.1) {
      throw new Error('Mock SMS failure for testing')
    }
  }
}

// Provider factory
export class NotificationProviders {
  private static emailProvider: EmailProvider
  private static smsProvider: SMSProvider

  static getEmailProvider(): EmailProvider {
    if (!this.emailProvider) {
      if (process.env.NODE_ENV === 'production') {
        this.emailProvider = new ResendEmailProvider()
      } else {
        this.emailProvider = new MockEmailProvider()
      }
    }
    return this.emailProvider
  }

  static getSMSProvider(): SMSProvider {
    if (!this.smsProvider) {
      if (process.env.NODE_ENV === 'production') {
        this.smsProvider = new TwilioSMSProvider()
      } else {
        this.smsProvider = new MockSMSProvider()
      }
    }
    return this.smsProvider
  }

  static async sendNotification(
    channel: NotificationChannel,
    recipient: string,
    subject: string | undefined,
    content: string
  ): Promise<void> {
    switch (channel) {
      case 'email':
        if (!subject) {
          throw new Error('Email notifications require a subject')
        }
        await this.getEmailProvider().sendEmail(recipient, subject, content)
        break
        
      case 'sms':
        await this.getSMSProvider().sendSMS(recipient, content)
        break
        
      default:
        throw new Error(`Unsupported notification channel: ${channel}`)
    }
  }
}