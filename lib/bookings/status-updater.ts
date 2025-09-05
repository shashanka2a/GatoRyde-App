import { prisma } from '@/lib/db/client'
import { BookingStatus } from '@/lib/db/types'

export interface BookingStatusUpdate {
  bookingId: string
  newStatus: BookingStatus
  reason?: string
  disputeReason?: string
  finalShareCents?: number
}

export class BookingStatusUpdater {
  // Update booking status and trigger notifications
  static async updateBookingStatus({
    bookingId,
    newStatus,
    reason,
    disputeReason,
    finalShareCents
  }: BookingStatusUpdate): Promise<void> {
    try {
      // Get current booking status
      const currentBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { status: true }
      })

      if (!currentBooking) {
        throw new Error(`Booking not found: ${bookingId}`)
      }

      const oldStatus = currentBooking.status

      // Update booking in database
      const updateData: any = { status: newStatus }
      
      if (newStatus === 'completed' && finalShareCents) {
        updateData.finalShareCents = finalShareCents
        updateData.tripCompletedAt = new Date()
      }
      
      if (newStatus === 'in_progress') {
        updateData.tripStartedAt = new Date()
      }

      await prisma.booking.update({
        where: { id: bookingId },
        data: updateData
      })

      // Trigger notifications via webhook
      await this.triggerNotifications({
        bookingId,
        oldStatus,
        newStatus,
        reason,
        disputeReason
      })

      console.log(`Booking status updated: ${bookingId} (${oldStatus} → ${newStatus})`)

    } catch (error) {
      console.error(`Failed to update booking status: ${bookingId}`, error)
      throw error
    }
  }

  // Trigger notifications for status change
  private static async triggerNotifications({
    bookingId,
    oldStatus,
    newStatus,
    reason,
    disputeReason
  }: {
    bookingId: string
    oldStatus: BookingStatus
    newStatus: BookingStatus
    reason?: string
    disputeReason?: string
  }): Promise<void> {
    try {
      const webhookUrl = process.env.WEBHOOK_BASE_URL 
        ? `${process.env.WEBHOOK_BASE_URL}/api/webhooks/booking-status`
        : '/api/webhooks/booking-status'

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          oldStatus,
          newStatus,
          reason,
          disputeReason
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Webhook failed: ${response.status} - ${error}`)
      }

      console.log(`Notifications triggered for booking: ${bookingId}`)

    } catch (error) {
      console.error(`Failed to trigger notifications: ${bookingId}`, error)
      // Don't throw - notification failures shouldn't break booking updates
    }
  }

  // Convenience methods for common status updates
  static async authorizeBooking(bookingId: string): Promise<void> {
    await this.updateBookingStatus({
      bookingId,
      newStatus: 'authorized'
    })
  }

  static async startTrip(bookingId: string): Promise<void> {
    await this.updateBookingStatus({
      bookingId,
      newStatus: 'in_progress'
    })
  }

  static async completeTrip(bookingId: string, finalShareCents: number): Promise<void> {
    await this.updateBookingStatus({
      bookingId,
      newStatus: 'completed',
      finalShareCents
    })
  }

  static async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    await this.updateBookingStatus({
      bookingId,
      newStatus: 'cancelled',
      reason
    })
  }

  static async disputeBooking(bookingId: string, disputeReason: string): Promise<void> {
    await this.updateBookingStatus({
      bookingId,
      newStatus: 'disputed',
      disputeReason
    })
  }

  // Batch update multiple bookings (e.g., complete entire ride)
  static async completeRide(rideId: string, finalShareAmounts: Record<string, number>): Promise<void> {
    try {
      const bookings = await prisma.booking.findMany({
        where: { 
          rideId,
          status: 'in_progress'
        },
        select: { id: true }
      })

      // Update all bookings to completed
      await Promise.allSettled(
        bookings.map(booking => {
          const finalShareCents = finalShareAmounts[booking.id]
          if (!finalShareCents) {
            console.warn(`No final share amount provided for booking: ${booking.id}`)
            return Promise.resolve()
          }

          return this.completeTrip(booking.id, finalShareCents)
        })
      )

      console.log(`Ride completed: ${rideId} (${bookings.length} bookings)`)

    } catch (error) {
      console.error(`Failed to complete ride: ${rideId}`, error)
      throw error
    }
  }
}