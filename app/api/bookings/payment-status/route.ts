import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, paidByRider, confirmedByDriver, proofOfPaymentUrl } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}
    
    if (typeof paidByRider === 'boolean') {
      updateData.paidByRider = paidByRider
    }
    
    if (typeof confirmedByDriver === 'boolean') {
      updateData.confirmedByDriver = confirmedByDriver
    }
    
    if (proofOfPaymentUrl !== undefined) {
      updateData.proofOfPaymentUrl = proofOfPaymentUrl
    }

    // Update booking payment status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        ride: {
          select: {
            originText: true,
            destText: true,
            departAt: true,
            driver: {
              select: {
                userId: true,
                user: {
                  select: {
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

    return NextResponse.json({
      success: true,
      booking: updatedBooking
    })

  } catch (error) {
    console.error('Payment status update error:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // For static generation, return empty booking
    return NextResponse.json({
      success: true,
      booking: null
    })

  } catch (error) {
    console.error('Payment status fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-static'