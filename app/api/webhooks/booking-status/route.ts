import { NextRequest, NextResponse } from 'next/server'
import { Notifier } from '@/lib/notifications/notifier'
import { BookingStatus } from '@/lib/db/types'

interface BookingStatusWebhook {
  bookingId: string
  oldStatus: BookingStatus
  newStatus: BookingStatus
  reason?: string
  disputeReason?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingStatusWebhook = await request.json()
    const { bookingId, oldStatus, newStatus, reason, disputeReason } = body

    if (!bookingId || !newStatus) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, newStatus' },
        { status: 400 }
      )
    }

    console.log(`Booking status change: ${bookingId} (${oldStatus} → ${newStatus})`)

    // Trigger appropriate notifications based on status change
    switch (newStatus) {
      case 'authorized':
        await Notifier.notifyBookingAuthorized(bookingId)
        break

      case 'in_progress':
        await Notifier.notifyTripStarted(bookingId)
        break

      case 'completed':
        await Notifier.notifyTripCompleted(bookingId)
        break

      case 'cancelled':
        await Notifier.notifyBookingCancelled(bookingId, reason)
        break

      case 'disputed':
        if (!disputeReason) {
          return NextResponse.json(
            { error: 'disputeReason required for disputed status' },
            { status: 400 }
          )
        }
        await Notifier.notifyBookingDisputed(bookingId, disputeReason)
        break

      default:
        console.log(`No notifications configured for status: ${newStatus}`)
    }

    return NextResponse.json({
      success: true,
      message: `Notifications queued for booking ${bookingId} (${newStatus})`
    })

  } catch (error) {
    console.error('Booking status webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    )
  }
}