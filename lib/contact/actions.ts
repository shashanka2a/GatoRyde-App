'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/session'
import { ContactRideRequest } from '@/lib/rides/types'
import { z } from 'zod'

export interface ContactRideResult {
  success: boolean
  message: string
  contactInfo?: {
    smsLink?: string
    emailLink?: string
    paymentMethods?: {
      zelle?: string
      cashApp?: string
      venmo?: string
      qrCodeUrl?: string
    }
  }
  errors?: Record<string, string>
}

const ContactRideSchema = z.object({
  rideId: z.string().cuid(),
  method: z.enum(['sms', 'email']),
  seatsRequested: z.number().min(1).max(8),
})

export async function contactDriver(data: ContactRideRequest): Promise<ContactRideResult> {
  try {
    // Get authenticated user
    const session = await requireAuth()
    const userId = session.user.id

    // Validate input
    const validatedData = ContactRideSchema.parse(data)

    // Check if user is edu-verified
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { eduVerified: true, name: true, email: true, phone: true }
    })

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        errors: { user: 'Invalid user' }
      }
    }

    if (!user.eduVerified) {
      return {
        success: false,
        message: 'Only edu-verified students can contact drivers',
        errors: { verification: 'Education verification required' }
      }
    }

    // Get ride with driver info
    const ride = await prisma.ride.findUnique({
      where: { id: validatedData.rideId },
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
    })

    if (!ride) {
      return {
        success: false,
        message: 'Ride not found',
        errors: { ride: 'Invalid ride ID' }
      }
    }

    if (ride.status !== 'open') {
      return {
        success: false,
        message: 'This ride is no longer available',
        errors: { status: 'Ride not open' }
      }
    }

    if (ride.seatsAvailable < validatedData.seatsRequested) {
      return {
        success: false,
        message: `Only ${ride.seatsAvailable} seats available, but you requested ${validatedData.seatsRequested}`,
        errors: { seats: 'Not enough seats available' }
      }
    }

    // Check if user already contacted this driver
    const existingContact = await prisma.rideContact.findUnique({
      where: {
        rideId_riderId: {
          rideId: validatedData.rideId,
          riderId: userId,
        }
      }
    })

    if (existingContact) {
      return {
        success: false,
        message: 'You have already contacted this driver for this ride',
        errors: { contact: 'Duplicate contact attempt' }
      }
    }

    // Create contact record
    await prisma.rideContact.create({
      data: {
        rideId: validatedData.rideId,
        riderId: userId,
        method: validatedData.method,
        seatsRequested: validatedData.seatsRequested,
      }
    })

    // Generate contact links and payment info
    const contactInfo = generateContactInfo(
      ride,
      user,
      validatedData.method,
      validatedData.seatsRequested
    )

    revalidatePath(`/rides/${validatedData.rideId}`)

    return {
      success: true,
      message: 'Contact information generated successfully',
      contactInfo
    }

  } catch (error) {
    console.error('Contact driver error:', error)

    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return {
        success: false,
        message: 'Invalid contact request',
        errors
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to contact driver',
      errors: { form: 'Contact failed' }
    }
  }
}

function generateContactInfo(
  ride: any,
  rider: any,
  method: 'sms' | 'email',
  seatsRequested: number
): ContactRideResult['contactInfo'] {
  const driverName = ride.driver.user.name || 'Driver'
  const riderName = rider.name || 'Student'
  const costPerPerson = Math.ceil(ride.totalTripCostCents / (ride.seatsTotal - ride.seatsAvailable + seatsRequested + 1))
  const totalCostForRider = costPerPerson * seatsRequested

  // Create message content
  const subject = `Rydify: Ride Request - ${ride.originText} to ${ride.destText}`
  const message = `Hi ${driverName}!

I'm ${riderName}, a verified UF student interested in your ride:

🚗 Route: ${ride.originText} → ${ride.destText}
📅 Departure: ${new Date(ride.departAt).toLocaleDateString()} at ${new Date(ride.departAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
👥 Seats needed: ${seatsRequested}
💰 My share: $${(totalCostForRider / 100).toFixed(2)} (total trip: $${(ride.totalTripCostCents / 100).toFixed(2)})

Please let me know if you have space available!

Thanks,
${riderName}

---
This message was sent through Rydify (rydify.com)`

  const contactInfo: ContactRideResult['contactInfo'] = {}

  // Generate SMS deep link
  if (method === 'sms' && ride.driver.user.phone) {
    const encodedMessage = encodeURIComponent(message)
    contactInfo.smsLink = `sms:${ride.driver.user.phone}?body=${encodedMessage}`
  }

  // Generate email deep link
  if (method === 'email' && ride.driver.user.email) {
    const encodedSubject = encodeURIComponent(subject)
    const encodedMessage = encodeURIComponent(message)
    contactInfo.emailLink = `mailto:${ride.driver.user.email}?subject=${encodedSubject}&body=${encodedMessage}`
  }

  // Include payment methods
  contactInfo.paymentMethods = {
    zelle: ride.driver.zelleHandle,
    cashApp: ride.driver.cashAppHandle,
    venmo: ride.driver.venmoHandle,
    qrCodeUrl: ride.driver.paymentQrUrl,
  }

  return contactInfo
}

export async function getRideContacts(rideId: string) {
  try {
    const session = await requireAuth()
    
    // Verify user owns this ride
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      select: { driverId: true }
    })

    if (!ride || ride.driverId !== session.user.id) {
      throw new Error('Unauthorized')
    }

    const contacts = await prisma.rideContact.findMany({
      where: { rideId },
      include: {
        rider: {
          select: {
            name: true,
            email: true,
            phone: true,
            eduVerified: true,
          }
        }
      },
      orderBy: { contactedAt: 'desc' }
    })

    return contacts
  } catch (error) {
    console.error('Get ride contacts error:', error)
    return []
  }
}