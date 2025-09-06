import { NotificationProviders } from '../notifications/providers'

export interface OTPEmailOptions {
  to: string
  code: string
  expiresInMinutes?: number
}

export class OTPEmailService {
  static async sendOTP({ to, code, expiresInMinutes = 10 }: OTPEmailOptions): Promise<void> {
    const subject = 'Your Rydify Verification Code'
    
    const content = `
Your Rydify verification code is: ${code}

This code will expire in ${expiresInMinutes} minutes.

If you didn't request this code, please ignore this email.

Best regards,
The Rydify Team
    `.trim()

    try {
      await NotificationProviders.sendNotification('email', to, subject, content)
      console.log(`OTP email sent successfully to ${to}`)
    } catch (error) {
      console.error('Failed to send OTP email:', error)
      throw new Error('Failed to send verification email')
    }
  }

  static async sendWelcomeEmail(to: string, name?: string): Promise<void> {
    const subject = 'Welcome to Rydify!'
    
    const content = `
${name ? `Hi ${name},` : 'Hi there,'}

Welcome to Rydify! Your account has been successfully verified.

You can now:
- Book rides with verified drivers
- Offer rides to fellow students
- Connect with your university community

Get started by visiting: https://rydify.app

Safe travels,
The Rydify Team
    `.trim()

    try {
      await NotificationProviders.sendNotification('email', to, subject, content)
      console.log(`Welcome email sent successfully to ${to}`)
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      // Don't throw here - welcome email failure shouldn't block the flow
    }
  }
}