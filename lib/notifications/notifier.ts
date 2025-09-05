import { prisma } from '@/lib/db/client'
import { NotificationQueue } from './queue'
import { NotificationTemplates } from './templates'
import { 
  NotificationType,
  BookingAuthorizedTemplateData,
  TripStartedTemplateData,
  TripCompletedTemplateData,
  BookingCancelledTemplateData,
  BookingDisputedTemplateData
} from './types'

export class Notifier {
  // Generate OTP code
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // BOOKING AUTHORIZED - Send OTP to rider, notify driver
  static async notifyBookingAuthorized(bookingId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          ride: {
            include: {
              driver: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      phone: true
                    }
                  }
                }
              }
            }
          },
          rider: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        }
      })

      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`)
      }

      // Generate and save OTP
      const otpCode = this.generateOTP()
      const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          tripStartOtp: otpCode,
          otpExpiresAt
        }
      })

      const templateData: BookingAuthorizedTemplateData = {
        riderName: booking.rider.name || 'Rider',
        driverName: booking.ride.driver.user.name || 'Driver',
        originText: booking.ride.originText,
        destText: booking.ride.destText,
        departAt: booking.ride.departAt,
        seats: booking.seats,
        otpCode,
        estimatedCost: booking.authEstimateCents
      }

      // Email rider with OTP
      if (booking.rider.email) {
        const riderTemplate = NotificationTemplates.getTemplate(
          'booking_authorized', 'email', false, templateData
        )

        await NotificationQueue.enqueue({
          type: 'booking_authorized',
          channel: 'email',
          recipientId: booking.rider.id,
          recipientEmail: booking.rider.email,
          subject: riderTemplate.subject,
          content: riderTemplate.content,
          templateData,
          bookingId,
          rideId: booking.rideId
        })
      }

      // Email driver about new booking (without OTP)
      if (booking.ride.driver.user.email) {
        const driverTemplateData = {
          ...templateData,
          otpCode: undefined // Never send OTP to driver
        }
        
        const driverTemplate = NotificationTemplates.getTemplate(
          'booking_authorized', 'email', true, driverTemplateData
        )

        await NotificationQueue.enqueue({
          type: 'booking_authorized',
          channel: 'email',
          recipientId: booking.ride.driver.user.id,
          recipientEmail: booking.ride.driver.user.email,
          subject: driverTemplate.subject,
          content: driverTemplate.content,
          templateData: driverTemplateData,
          bookingId,
          rideId: booking.rideId
        })
      }

      console.log(`Booking authorized notifications queued for booking: ${bookingId}`)

    } catch (error) {
      console.error(`Error notifying booking authorized: ${bookingId}`, error)
      throw error
    }
  }

  // TRIP STARTED - SMS both parties
  static async notifyTripStarted(bookingId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          ride: {
            include: {
              driver: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      phone: true
                    }
                  }
                }
              }
            }
          },
          rider: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          }
        }
      })

      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`)
      }

      const templateData: TripStartedTemplateData = {
        riderName: booking.rider.name || 'Rider',
        driverName: booking.ride.driver.user.name || 'Driver',
        originText: booking.ride.originText,
        destText: booking.ride.destText,
        departAt: booking.ride.departAt,
        seats: booking.seats
      }

      // SMS rider
      if (booking.rider.phone) {
        const riderTemplate = NotificationTemplates.getTemplate(
          'trip_started', 'sms', false, templateData
        )

        await NotificationQueue.enqueue({
          type: 'trip_started',
          channel: 'sms',
          recipientId: booking.rider.id,
          recipientPhone: booking.rider.phone,
          content: riderTemplate.content,
          templateData,
          bookingId,
          rideId: booking.rideId
        })
      }

      // SMS driver
      if (booking.ride.driver.user.phone) {
        const driverTemplate = NotificationTemplates.getTemplate(
          'trip_started', 'sms', true, templateData
        )

        await NotificationQueue.enqueue({
          type: 'trip_started',
          channel: 'sms',
          recipientId: booking.ride.driver.user.id,
          recipientPhone: booking.ride.driver.user.phone,
          content: driverTemplate.content,
          templateData,
          bookingId,
          rideId: booking.rideId
        })
      }

      console.log(`Trip started notifications queued for booking: ${bookingId}`)

    } catch (error) {
      console.error(`Error notifying trip started: ${bookingId}`, error)
      throw error
    }
  }

  // TRIP COMPLETED - Email both with payment info
  static async notifyTripCompleted(bookingId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          ride: {
            include: {
              driver: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      phone: true
                    }
                  }
                }
              }
            }
          },
          rider: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`)
      }

      if (!booking.finalShareCents) {
        throw new Error(`Final share not set for booking: ${bookingId}`)
      }

      const templateData: TripCompletedTemplateData = {
        riderName: booking.rider.name || 'Rider',
        driverName: booking.ride.driver.user.name || 'Driver',
        driverEmail: booking.ride.driver.user.email,
        driverPhone: booking.ride.driver.user.phone,
        originText: booking.ride.originText,
        destText: booking.ride.destText,
        departAt: booking.ride.departAt,
        seats: booking.seats,
        finalShareCents: booking.finalShareCents,
        zelleHandle: booking.ride.driver.zelleHandle,
        cashAppHandle: booking.ride.driver.cashAppHandle,
        zelleQrUrl: booking.ride.driver.zelleQrUrl,
        cashAppQrUrl: booking.ride.driver.cashAppQrUrl
      }

      // Email rider with payment info
      if (booking.rider.email) {
        const riderTemplate = NotificationTemplates.getTemplate(
          'trip_completed', 'email', false, templateData
        )

        await NotificationQueue.enqueue({
          type: 'trip_completed',
          channel: 'email',
          recipientId: booking.rider.id,
          recipientEmail: booking.rider.email,
          subject: riderTemplate.subject,
          content: riderTemplate.content,
          templateData,
          bookingId,
          rideId: booking.rideId
        })
      }

      // Email driver about expected payment
      if (booking.ride.driver.user.email) {
        const driverTemplate = NotificationTemplates.getTemplate(
          'trip_completed', 'email', true, templateData
        )

        await NotificationQueue.enqueue({
          type: 'trip_completed',
          channel: 'email',
          recipientId: booking.ride.driver.user.id,
          recipientEmail: booking.ride.driver.user.email,
          subject: driverTemplate.subject,
          content: driverTemplate.content,
          templateData,
          bookingId,
          rideId: booking.rideId
        })
      }

      console.log(`Trip completed notifications queued for booking: ${bookingId}`)

    } catch (error) {
      console.error(`Error notifying trip completed: ${bookingId}`, error)
      throw error
    }
  }

  // BOOKING CANCELLED - Email both parties
  static async notifyBookingCancelled(bookingId: string, reason?: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          ride: {
            include: {
              driver: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true
                    }
                  }
                }
              }
            }
          },
          rider: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`)
      }

      const templateData: BookingCancelledTemplateData = {
        riderName: booking.rider.name || 'Rider',
        driverName: booking.ride.driver.user.name || 'Driver',
        originText: booking.ride.originText,
        destText: booking.ride.destText,
        departAt: booking.ride.departAt,
        seats: booking.seats,
        reason
      }

      // Email rider
      if (booking.rider.email) {
        const riderTemplate = NotificationTemplates.getTemplate(
          'booking_cancelled', 'email', false, templateData
        )

        await NotificationQueue.enqueue({
          type: 'booking_cancelled',
          channel: 'email',
          recipientId: booking.rider.id,
          recipientEmail: booking.rider.email,
          subject: riderTemplate.subject,
          content: riderTemplate.content,
          templateData,
          bookingId,
          rideId: booking.rideId
        })
      }

      // Email driver
      if (booking.ride.driver.user.email) {
        const driverTemplate = NotificationTemplates.getTemplate(
          'booking_cancelled', 'email', true, templateData
        )

        await NotificationQueue.enqueue({
          type: 'booking_cancelled',
          channel: 'email',
          recipientId: booking.ride.driver.user.id,
          recipientEmail: booking.ride.driver.user.email,
          subject: driverTemplate.subject,
          content: driverTemplate.content,
          templateData,
          bookingId,
          rideId: booking.rideId
        })
      }

      console.log(`Booking cancelled notifications queued for booking: ${bookingId}`)

    } catch (error) {
      console.error(`Error notifying booking cancelled: ${bookingId}`, error)
      throw error
    }
  }

  // BOOKING DISPUTED - Email both parties
  static async notifyBookingDisputed(bookingId: string, disputeReason: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          ride: {
            include: {
              driver: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true
                    }
                  }
                }
              }
            }
          },
          rider: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`)
      }

      const templateData: BookingDisputedTemplateData = {
        riderName: booking.rider.name || 'Rider',
        driverName: booking.ride.driver.user.name || 'Driver',
        originText: booking.ride.originText,
        destText: booking.ride.destText,
        departAt: booking.ride.departAt,
        seats: booking.seats,
        disputeReason
      }

      // Email rider
      if (booking.rider.email) {
        const riderTemplate = NotificationTemplates.getTemplate(
          'booking_disputed', 'email', false, templateData
        )

        await NotificationQueue.enqueue({
          type: 'booking_disputed',
          channel: 'email',
          recipientId: booking.rider.id,
          recipientEmail: booking.rider.email,
          subject: riderTemplate.subject,
          content: riderTemplate.content,
          templateData,
          bookingId,
          rideId: booking.rideId
        })
      }

      // Email driver
      if (booking.ride.driver.user.email) {
        const driverTemplate = NotificationTemplates.getTemplate(
          'booking_disputed', 'email', true, templateData
        )

        await NotificationQueue.enqueue({
          type: 'booking_disputed',
          channel: 'email',
          recipientId: booking.ride.driver.user.id,
          recipientEmail: booking.ride.driver.user.email,
          subject: driverTemplate.subject,
          content: driverTemplate.content,
          templateData,
          bookingId,
          rideId: booking.rideId
        })
      }

      console.log(`Booking disputed notifications queued for booking: ${bookingId}`)

    } catch (error) {
      console.error(`Error notifying booking disputed: ${bookingId}`, error)
      throw error
    }
  }

  // Batch notify multiple riders for driver (e.g., trip completed with multiple bookings)
  static async notifyMultipleRiders(
    rideId: string, 
    notificationType: NotificationType
  ): Promise<void> {
    try {
      const bookings = await prisma.booking.findMany({
        where: { 
          rideId,
          status: 'completed' // Only notify completed bookings
        }
      })

      // Process notifications for each booking
      await Promise.allSettled(
        bookings.map(booking => {
          switch (notificationType) {
            case 'trip_completed':
              return this.notifyTripCompleted(booking.id)
            default:
              throw new Error(`Batch notification not supported for type: ${notificationType}`)
          }
        })
      )

      console.log(`Batch notifications queued for ride: ${rideId} (${bookings.length} bookings)`)

    } catch (error) {
      console.error(`Error in batch notification for ride: ${rideId}`, error)
      throw error
    }
  }
}