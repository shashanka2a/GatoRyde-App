import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/session'
import { NotificationQueue } from '@/lib/notifications/queue'
import { z } from 'zod'

const ResolveDisputeSchema = z.object({
  status: z.enum(['resolved', 'rejected']),
  resolution: z.string().min(10, 'Resolution must be at least 10 characters'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { disputeId: string } }
) {
  try {
    // Get authenticated user and verify admin access
    const session = await requireAuth()
    
    // TODO: Add proper admin role check
    // For now, we'll assume any authenticated user can access admin features
    
    const body = await request.json()
    const { status, resolution } = ResolveDisputeSchema.parse(body)
    const { disputeId } = params

    // Get dispute with related data
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        booking: {
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
              }
            }
          }
        },
        openedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    if (!dispute) {
      return NextResponse.json(
        { success: false, message: 'Dispute not found' },
        { status: 404 }
      )
    }

    if (dispute.status !== 'open') {
      return NextResponse.json(
        { success: false, message: 'Dispute is already resolved' },
        { status: 400 }
      )
    }

    // Update dispute status and resolution
    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status,
        resolution,
        updatedAt: new Date(),
      }
    })

    // Update booking status back to completed if dispute was resolved
    if (status === 'resolved') {
      await prisma.booking.update({
        where: { id: dispute.bookingId },
        data: {
          status: 'completed'
        }
      })
    }

    // Send resolution emails to both parties
    const riderName = dispute.booking.rider.name || 'Rider'
    const driverName = dispute.booking.ride.driver.user.name || 'Driver'

    const emailContent = `Your dispute has been ${status}.

Original Dispute: ${dispute.reason}

Resolution: ${resolution}

If you have any questions about this resolution, please contact our support team.

The GatoRyde Team`

    // Email to rider
    await NotificationQueue.enqueue({
      type: 'booking_disputed', // We'll reuse this type for resolution
      channel: 'email',
      recipientId: dispute.booking.rider.id,
      recipientEmail: dispute.booking.rider.email,
      subject: `GatoRyde: Dispute ${status.charAt(0).toUpperCase() + status.slice(1)} - ${dispute.booking.ride.originText} to ${dispute.booking.ride.destText}`,
      content: `Hi ${riderName},\n\n${emailContent}`,
      bookingId: dispute.bookingId,
    })

    // Email to driver
    await NotificationQueue.enqueue({
      type: 'booking_disputed',
      channel: 'email',
      recipientId: dispute.booking.ride.driver.user.id,
      recipientEmail: dispute.booking.ride.driver.user.email,
      subject: `GatoRyde: Dispute ${status.charAt(0).toUpperCase() + status.slice(1)} - ${dispute.booking.ride.originText} to ${dispute.booking.ride.destText}`,
      content: `Hi ${driverName},\n\n${emailContent}`,
      bookingId: dispute.bookingId,
    })

    return NextResponse.json({
      success: true,
      message: `Dispute ${status} successfully`,
      dispute: updatedDispute,
    })

  } catch (error) {
    console.error('Failed to resolve dispute:', error)

    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid resolution data',
          errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to resolve dispute' 
      },
      { status: 500 }
    )
  }
}