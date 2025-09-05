import { 
  BookingAuthorizedTemplateData,
  TripStartedTemplateData, 
  TripCompletedTemplateData,
  BookingCancelledTemplateData,
  BookingDisputedTemplateData,
  NotificationType,
  NotificationChannel
} from './types'

export interface NotificationTemplate {
  subject?: string
  content: string
}

export class NotificationTemplates {
  // Utility function to redact PII for logging
  static redactPII(content: string): string {
    return content
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]')
      .replace(/\$[a-zA-Z0-9_-]+/g, '[CASHAPP_REDACTED]')
  }

  static formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  static formatDateTime(date: Date): string {
    // Always format in user's local timezone for notifications
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date)
  }

  // BOOKING AUTHORIZED TEMPLATES
  static getBookingAuthorizedRiderEmail(data: BookingAuthorizedTemplateData): NotificationTemplate {
    return {
      subject: `GatoRyde: Booking Confirmed - ${data.originText} to ${data.destText}`,
      content: `Hi ${data.riderName},

Great news! Your booking has been confirmed for:

🚗 Route: ${data.originText} → ${data.destText}
📅 Departure: ${this.formatDateTime(data.departAt)}
👥 Seats: ${data.seats}
💰 Estimated cost: ${this.formatCurrency(data.estimatedCost)}
🚨 Your OTP Code: ${data.otpCode || 'Will be provided before trip'}

Driver: ${data.driverName}

Please save your OTP code - you'll need it when the trip starts. The driver will ask for this code to verify your booking.

Safe travels!

The GatoRyde Team
---
This is an automated message from GatoRyde. Please do not reply to this email.`
    }
  }

  static getBookingAuthorizedDriverEmail(data: BookingAuthorizedTemplateData): NotificationTemplate {
    return {
      subject: `GatoRyde: New Booking - ${data.riderName} (${data.seats} seat${data.seats > 1 ? 's' : ''})`,
      content: `Hi ${data.driverName},

You have a new booking for your ride:

👤 Rider: ${data.riderName}
🚗 Route: ${data.originText} → ${data.destText}
📅 Departure: ${this.formatDateTime(data.departAt)}
👥 Seats booked: ${data.seats}
💰 Rider's share: ${this.formatCurrency(data.estimatedCost)}

The rider has been given an OTP code that they'll need to provide when the trip starts. Please ask the rider for their OTP code to verify the booking before beginning the journey.

You can manage your bookings in the GatoRyde driver dashboard.

Safe travels!

The GatoRyde Team
---
This is an automated message from GatoRyde. Please do not reply to this email.`
    }
  }

  // TRIP STARTED TEMPLATES
  static getTripStartedSMS(data: TripStartedTemplateData): NotificationTemplate {
    return {
      content: `GatoRyde: Your trip from ${data.originText} to ${data.destText} with ${data.driverName} has started! Have a safe journey. - GatoRyde`
    }
  }

  static getTripStartedDriverSMS(data: TripStartedTemplateData): NotificationTemplate {
    return {
      content: `GatoRyde: Trip started with ${data.riderName} (${data.seats} seat${data.seats > 1 ? 's' : ''}). Route: ${data.originText} → ${data.destText}. Drive safely! - GatoRyde`
    }
  }

  // TRIP COMPLETED TEMPLATES
  static getTripCompletedRiderEmail(data: TripCompletedTemplateData): NotificationTemplate {
    const paymentSection = this.generatePaymentSection(data)
    
    return {
      subject: `GatoRyde: Trip Completed - Payment Due ${this.formatCurrency(data.finalShareCents)}`,
      content: `Hi ${data.riderName},

Your trip has been completed! Here are the details:

🚗 Route: ${data.originText} → ${data.destText}
📅 Date: ${this.formatDateTime(data.departAt)}
👥 Seats: ${data.seats}
💰 Your share: ${this.formatCurrency(data.finalShareCents)}

${paymentSection}

Thank you for using GatoRyde! Please rate your experience in the app.

The GatoRyde Team
---
This is an automated message from GatoRyde. Please do not reply to this email.`
    }
  }

  static getTripCompletedDriverEmail(data: TripCompletedTemplateData): NotificationTemplate {
    return {
      subject: `GatoRyde: Trip Completed - Payment Expected ${this.formatCurrency(data.finalShareCents)}`,
      content: `Hi ${data.driverName},

Your trip has been completed! Here are the payment details:

👤 Rider: ${data.riderName}
🚗 Route: ${data.originText} → ${data.destText}
📅 Date: ${this.formatDateTime(data.departAt)}
👥 Seats: ${data.seats}
💰 Amount due: ${this.formatCurrency(data.finalShareCents)}

The rider has been notified about payment and provided with your payment information. You can track payment status in your driver dashboard.

Thank you for driving with GatoRyde!

The GatoRyde Team
---
This is an automated message from GatoRyde. Please do not reply to this email.`
    }
  }

  // BOOKING CANCELLED TEMPLATES
  static getBookingCancelledEmail(data: BookingCancelledTemplateData, isDriver: boolean): NotificationTemplate {
    const recipient = isDriver ? data.driverName : data.riderName
    const other = isDriver ? data.riderName : data.driverName
    
    // Handle driver cancellation with apology and re-search link
    if ((data as any).isDriverCancellation) {
      return {
        subject: `GatoRyde: Driver Cancelled - ${data.originText} to ${data.destText}`,
        content: `Hi ${data.riderName},

We're sorry to inform you that your driver has cancelled the ride:

🚗 Route: ${data.originText} → ${data.destText}
📅 Departure: ${this.formatDateTime(data.departAt)}
👥 Seats: ${data.seats}
👤 Driver: ${data.driverName}

${(data as any).apologyMessage || 'We sincerely apologize for the inconvenience.'}

🔍 FIND ALTERNATIVE RIDES:
${(data as any).reSearchUrl ? `Click here to search for similar rides: ${(data as any).reSearchUrl}` : 'Please visit GatoRyde to search for alternative rides.'}

If you have any questions or need assistance finding another ride, please contact our support team.

The GatoRyde Team
---
This is an automated message from GatoRyde. Please do not reply to this email.`
      }
    }

    // Handle rider cancellation
    if ((data as any).isRiderCancellation) {
      const additionalMessage = (data as any).additionalMessage
      return {
        subject: `GatoRyde: Rider Cancelled - ${data.originText} to ${data.destText}`,
        content: `Hi ${data.driverName},

A rider has cancelled their booking for:

🚗 Route: ${data.originText} → ${data.destText}
📅 Departure: ${this.formatDateTime(data.departAt)}
👥 Seats: ${data.seats}
👤 Rider: ${data.riderName}
${data.reason ? `📝 Reason: ${data.reason}` : ''}

${additionalMessage ? `⚠️ ${additionalMessage}` : ''}

This seat is now available for other riders to book. You can view your updated ride in the driver dashboard.

The GatoRyde Team
---
This is an automated message from GatoRyde. Please do not reply to this email.`
      }
    }

    // Default cancellation template
    return {
      subject: `GatoRyde: Booking Cancelled - ${data.originText} to ${data.destText}`,
      content: `Hi ${recipient},

A booking has been cancelled for:

🚗 Route: ${data.originText} → ${data.destText}
📅 Departure: ${this.formatDateTime(data.departAt)}
👥 Seats: ${data.seats}
${isDriver ? `👤 Rider: ${other}` : `👤 Driver: ${other}`}
${data.reason ? `📝 Reason: ${data.reason}` : ''}

${isDriver 
  ? 'This seat is now available for other riders to book.'
  : 'You can search for alternative rides on GatoRyde.'
}

If you have any questions, please contact our support team.

The GatoRyde Team
---
This is an automated message from GatoRyde. Please do not reply to this email.`
    }
  }

  // BOOKING DISPUTED TEMPLATES
  static getBookingDisputedEmail(data: BookingDisputedTemplateData, isDriver: boolean): NotificationTemplate {
    const recipient = isDriver ? data.driverName : data.riderName
    const other = isDriver ? data.riderName : data.driverName
    
    return {
      subject: `GatoRyde: Dispute Opened - ${data.originText} to ${data.destText}`,
      content: `Hi ${recipient},

A dispute has been opened for your recent trip:

🚗 Route: ${data.originText} → ${data.destText}
📅 Date: ${this.formatDateTime(data.departAt)}
👥 Seats: ${data.seats}
${isDriver ? `👤 Rider: ${other}` : `👤 Driver: ${other}`}
📝 Dispute reason: ${data.disputeReason}

Our support team will review this dispute and contact you within 24-48 hours. Please do not attempt to resolve this directly with the other party.

You can view the dispute status in your GatoRyde dashboard.

The GatoRyde Team
---
This is an automated message from GatoRyde. Please do not reply to this email.`
    }
  }

  private static generatePaymentSection(data: TripCompletedTemplateData): string {
    let paymentSection = `PAYMENT INFORMATION:
Driver: ${data.driverName}
Email: ${data.driverEmail}`

    if (data.driverPhone) {
      paymentSection += `\nPhone: ${data.driverPhone}`
    }

    paymentSection += '\n\nPayment Options:'

    if (data.cashAppHandle) {
      paymentSection += `\n• Cash App: $${data.cashAppHandle}`
      paymentSection += `\n  Quick pay: https://cash.app/$${data.cashAppHandle}/${(data.finalShareCents / 100).toFixed(2)}`
    }

    if (data.zelleHandle) {
      paymentSection += `\n• Zelle: ${data.zelleHandle}`
    }

    if (data.cashAppQrUrl || data.zelleQrUrl) {
      paymentSection += '\n\nQR Codes available in the GatoRyde app for easy payment.'
    }

    paymentSection += '\n\n⚠️ IMPORTANT: GatoRyde does not process payments. All transactions are between you and the driver. Report any payment issues through the dispute system.'

    return paymentSection
  }

  // Template selector
  static getTemplate(
    type: NotificationType,
    channel: NotificationChannel,
    isDriver: boolean,
    templateData: any
  ): NotificationTemplate {
    switch (type) {
      case 'booking_authorized':
        if (channel === 'email') {
          return isDriver 
            ? this.getBookingAuthorizedDriverEmail(templateData)
            : this.getBookingAuthorizedRiderEmail(templateData)
        }
        break

      case 'trip_started':
        if (channel === 'sms') {
          return isDriver
            ? this.getTripStartedDriverSMS(templateData)
            : this.getTripStartedSMS(templateData)
        }
        break

      case 'trip_completed':
        if (channel === 'email') {
          return isDriver
            ? this.getTripCompletedDriverEmail(templateData)
            : this.getTripCompletedRiderEmail(templateData)
        }
        break

      case 'booking_cancelled':
        if (channel === 'email') {
          return this.getBookingCancelledEmail(templateData, isDriver)
        }
        break

      case 'booking_disputed':
        if (channel === 'email') {
          return this.getBookingDisputedEmail(templateData, isDriver)
        }
        break
    }

    throw new Error(`No template found for type: ${type}, channel: ${channel}`)
  }
}