import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'

// Simple in-memory rate limiting for MVP (replace with Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const LogContactSchema = z.object({
  bookingId: z.string().cuid(),
  method: z.enum(['sms', 'email']),
})

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await requireAuth()
    const userId = session.user.id

    // Parse request body
    const body = await request.json()
    const { bookingId, method } = LogContactSchema.parse(body)

    // Verify booking exists and user is the rider
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: {
          include: {
            driver: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.riderId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Simple rate limiting check (MVP implementation)
    const rateLimitKey = `contact_limit:${userId}:${bookingId}`
    const now = Date.now()
    const rateLimit = rateLimitStore.get(rateLimitKey)

    if (rateLimit && now < rateLimit.resetTime) {
      if (rateLimit.count >= 5) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Rate limit exceeded. Maximum 5 contact attempts per hour per booking.' 
          },
          { status: 429 }
        )
      }
      rateLimit.count++
    } else {
      // Reset or create new rate limit entry
      rateLimitStore.set(rateLimitKey, {
        count: 1,
        resetTime: now + (60 * 60 * 1000) // 1 hour from now
      })
    }

    // Create contact log entry
    const contactLog = await prisma.contactLog.create({
      data: {
        bookingId,
        userId,
        method,
        contactedAt: new Date(),
      }
    })

    // Optional: If Twilio proxy is enabled, handle proxied SMS
    if (method === 'sms' && process.env.TWILIO_PROXY_ENABLED === 'true') {
      await handleProxiedSMS(booking, userId)
    }

    return NextResponse.json({
      success: true,
      message: 'Contact logged successfully',
      contactLogId: contactLog.id,
    })

  } catch (error) {
    console.error('Contact log error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request data',
          errors: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to log contact' 
      },
      { status: 500 }
    )
  }
}

async function handleProxiedSMS(booking: any, userId: string) {
  // Simplified proxy SMS handling for MVP
  try {
    console.log('Proxy SMS requested for booking:', booking.id)
    // In production, implement Twilio Proxy here
  } catch (error) {
    console.error('Failed to handle proxy SMS:', error)
  }
}