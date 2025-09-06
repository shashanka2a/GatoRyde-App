'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/session'
import { MapboxService } from '@/lib/maps/mapbox'
import { 
  CreateRideSchema, 
  SearchRidesSchema,
  calculateDistance,
  type CreateRideRequest,
  type SearchRidesRequest,
  type RideWithDriver,
  type RideSearchResult
} from './types'
import { getUniversityFilter } from './university-filter'
import { computeAuthEstimate, computeFinalShare, getRidersAfterBooking } from './pricing'
import { sendOTPEmail } from '@/lib/auth/email'
import { sendOTPSMS } from '@/lib/auth/sms'
import { z } from 'zod'
import crypto from 'crypto'

export interface CreateRideResult {
  success: boolean
  message: string
  rideId?: string
  errors?: Record<string, string>
}

export interface SearchRidesResult {
  success: boolean
  data?: RideSearchResult
  message?: string
  errors?: Record<string, string>
}

export async function createRide(data: CreateRideRequest): Promise<CreateRideResult> {
  try {
    // Get authenticated user
    const session = await requireAuth()
    const userId = session.user.id

    // Validate input
    const validatedData = CreateRideSchema.parse(data)

    // Check if user is a verified driver
    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: { vehicle: true }
    })

    if (!driver) {
      return {
        success: false,
        message: 'You must be registered as a driver to offer rides',
        errors: { driver: 'Driver registration required' }
      }
    }

    if (!driver.verified) {
      return {
        success: false,
        message: 'Your driver account must be verified before offering rides',
        errors: { verification: 'Driver verification required' }
      }
    }

    if (!driver.vehicle) {
      return {
        success: false,
        message: 'You must have a registered vehicle to offer rides',
        errors: { vehicle: 'Vehicle registration required' }
      }
    }

    // Validate seat constraints: seatsTotal ≤ min(vehicle.seats - 1, driver.offeredSeats)
    const maxAllowedSeats = Math.min(driver.vehicle.seats - 1, driver.offeredSeats)
    if (validatedData.seatsTotal > maxAllowedSeats) {
      return {
        success: false,
        message: `Cannot offer more than ${maxAllowedSeats} seats (vehicle: ${driver.vehicle.seats}, you typically offer: ${driver.offeredSeats})`,
        errors: { seatsTotal: 'Exceeds seat constraints' }
      }
    }

    // Get route polyline
    let polyline: string | null = null
    try {
      const route = await MapboxService.getRoute(
        [validatedData.origin.lng, validatedData.origin.lat],
        [validatedData.destination.lng, validatedData.destination.lat]
      )
      polyline = route?.polyline || null
    } catch (error) {
      console.error('Route generation error:', error)
      // Continue without polyline - it's optional
    }

    // Create ride
    const ride = await prisma.ride.create({
      data: {
        driverId: userId,
        originText: validatedData.origin.placeName,
        originLat: validatedData.origin.lat,
        originLng: validatedData.origin.lng,
        destText: validatedData.destination.placeName,
        destLat: validatedData.destination.lat,
        destLng: validatedData.destination.lng,
        departAt: new Date(validatedData.departAt),
        seatsTotal: validatedData.seatsTotal,
        seatsAvailable: validatedData.seatsTotal, // Initially all seats available
        totalTripCostCents: validatedData.totalTripCostCents,
        notes: validatedData.notes,
        polyline,
        status: 'open',
      }
    })

    revalidatePath('/rides')
    revalidatePath('/dashboard/rides')

    return {
      success: true,
      message: 'Ride created successfully!',
      rideId: ride.id
    }

  } catch (error) {
    console.error('Create ride error:', error)

    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return {
        success: false,
        message: 'Please check your ride details',
        errors
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create ride',
      errors: { form: 'Creation failed' }
    }
  }
}

export async function searchRides(
  filters: SearchRidesRequest,
  page: number = 1,
  limit: number = 20
): Promise<SearchRidesResult> {
  try {
    // Validate input
    const validatedFilters = SearchRidesSchema.parse(filters)
    
    // Build where clause
    const where: any = {
      status: 'open',
      seatsAvailable: { gte: validatedFilters.minSeats },
      departAt: { gte: new Date() }, // Only future rides
    }

    // Add time filters
    if (validatedFilters.departAfter) {
      where.departAt.gte = new Date(validatedFilters.departAfter)
    }
    if (validatedFilters.departBefore) {
      where.departAt.lte = new Date(validatedFilters.departBefore)
    }

    // Add price filter (cost per person based on current occupancy)
    if (validatedFilters.maxCostPerPerson) {
      // This is a simplified filter - in practice, you might want to do this calculation in the application layer
      // For now, we'll filter by total trip cost and let the UI show the per-person cost
      where.totalTripCostCents = { lte: validatedFilters.maxCostPerPerson * 8 } // Rough upper bound
    }

    // Get rides with driver info
    const rides = await prisma.ride.findMany({
      where,
      include: {
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                photoUrl: true,
                ratingAvg: true,
                ratingCount: true,
              }
            },
            vehicle: {
              select: {
                make: true,
                model: true,
                year: true,
                color: true,
                seats: true,
              }
            }
          }
        }
      },
      orderBy: [
        { departAt: 'asc' }, // Nearest departure time first
        { driver: { user: { ratingAvg: 'desc' } } }, // Higher rated drivers
        { totalTripCostCents: 'asc' }, // Lower total costs first
      ],
      skip: (page - 1) * limit,
      take: limit + 1, // Take one extra to check if there are more
    })

    // Filter by location radius if specified
    let filteredRides = rides
    if (validatedFilters.origin || validatedFilters.destination) {
      filteredRides = rides.filter(ride => {
        let matchesOrigin = true
        let matchesDestination = true

        if (validatedFilters.origin) {
          const originDistance = calculateDistance(
            validatedFilters.origin.lat,
            validatedFilters.origin.lng,
            ride.originLat,
            ride.originLng
          )
          matchesOrigin = originDistance <= validatedFilters.originRadius
        }

        if (validatedFilters.destination) {
          const destDistance = calculateDistance(
            validatedFilters.destination.lat,
            validatedFilters.destination.lng,
            ride.destLat,
            ride.destLng
          )
          matchesDestination = destDistance <= validatedFilters.destinationRadius
        }

        return matchesOrigin && matchesDestination
      })
    }

    // Check if there are more results
    const hasMore = filteredRides.length > limit
    const resultRides = hasMore ? filteredRides.slice(0, limit) : filteredRides

    // Transform to expected format
    const transformedRides: RideWithDriver[] = resultRides.map(ride => ({
      id: ride.id,
      originText: ride.originText,
      originLat: ride.originLat,
      originLng: ride.originLng,
      destText: ride.destText,
      destLat: ride.destLat,
      destLng: ride.destLng,
      departAt: ride.departAt,
      seatsTotal: ride.seatsTotal,
      seatsAvailable: ride.seatsAvailable,
      totalTripCostCents: ride.totalTripCostCents,
      status: ride.status as any,
      polyline: ride.polyline,
      notes: ride.notes,
      driver: {
        userId: ride.driver.userId,
        verified: ride.driver.verified,
        offeredSeats: ride.driver.offeredSeats,
        zelleHandle: ride.driver.zelleHandle,
        cashAppHandle: ride.driver.cashAppHandle,
        venmoHandle: ride.driver.venmoHandle,
        paymentQrUrl: ride.driver.paymentQrUrl,
        user: ride.driver.user,
        vehicle: ride.driver.vehicle,
      }
    }))

    return {
      success: true,
      data: {
        rides: transformedRides,
        total: transformedRides.length,
        hasMore,
      }
    }

  } catch (error) {
    console.error('Search rides error:', error)

    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return {
        success: false,
        message: 'Invalid search filters',
        errors
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to search rides',
      errors: { form: 'Search failed' }
    }
  }
}

export async function getRideById(rideId: string): Promise<RideWithDriver | null> {
  try {
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                photoUrl: true,
                ratingAvg: true,
                ratingCount: true,
              }
            },
            vehicle: {
              select: {
                make: true,
                model: true,
                year: true,
                color: true,
                seats: true,
              }
            }
          }
        }
      }
    })

    if (!ride) return null

    return {
      id: ride.id,
      originText: ride.originText,
      originLat: ride.originLat,
      originLng: ride.originLng,
      destText: ride.destText,
      destLat: ride.destLat,
      destLng: ride.destLng,
      departAt: ride.departAt,
      seatsTotal: ride.seatsTotal,
      seatsAvailable: ride.seatsAvailable,
      pricePerSeatCents: ride.pricePerSeatCents,
      status: ride.status as any,
      polyline: ride.polyline,
      driver: {
        userId: ride.driver.userId,
        verified: ride.driver.verified,
        user: ride.driver.user,
        vehicle: ride.driver.vehicle,
      }
    }
  } catch (error) {
    console.error('Get ride error:', error)
    return null
  }
}

export async function getUserRides(userId: string): Promise<RideWithDriver[]> {
  try {
    const rides = await prisma.ride.findMany({
      where: { driverId: userId },
      include: {
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                photoUrl: true,
                ratingAvg: true,
                ratingCount: true,
              }
            },
            vehicle: {
              select: {
                make: true,
                model: true,
                year: true,
                color: true,
                seats: true,
              }
            }
          }
        }
      },
      orderBy: { departAt: 'desc' }
    })

    return rides.map(ride => ({
      id: ride.id,
      originText: ride.originText,
      originLat: ride.originLat,
      originLng: ride.originLng,
      destText: ride.destText,
      destLat: ride.destLat,
      destLng: ride.destLng,
      departAt: ride.departAt,
      seatsTotal: ride.seatsTotal,
      seatsAvailable: ride.seatsAvailable,
      pricePerSeatCents: ride.pricePerSeatCents,
      status: ride.status as any,
      polyline: ride.polyline,
      driver: {
        userId: ride.driver.userId,
        verified: ride.driver.verified,
        user: ride.driver.user,
        vehicle: ride.driver.vehicle,
      }
    }))
  } catch (error) {
    console.error('Get user rides error:', error)
    return []
  }
}

// Booking and trip management actions

export interface BookRideResult {
  success: boolean
  message: string
  bookingId?: string
  errors?: Record<string, string>
}

export interface StartTripResult {
  success: boolean
  message: string
  errors?: Record<string, string>
}

export interface CompleteTripResult {
  success: boolean
  message: string
  completedBookings?: number
  errors?: Record<string, string>
}

const BookRideSchema = z.object({
  rideId: z.string().cuid(),
  seats: z.number().min(1).max(8).default(1),
})

const StartTripSchema = z.object({
  bookingId: z.string().cuid(),
  otp: z.string().length(6),
})

const CompleteTripSchema = z.object({
  rideId: z.string().cuid(),
})

export async function bookRide(rideId: string, seats: number = 1): Promise<BookRideResult> {
  try {
    // Get authenticated user
    const session = await requireAuth()
    const userId = session.user.id

    // Validate input
    const validatedData = BookRideSchema.parse({ rideId, seats })

    // Get ride with driver info
    const ride = await prisma.ride.findUnique({
      where: { id: validatedData.rideId },
      include: {
        driver: {
          include: {
            user: {
              select: {
                id: true,
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

    // Precondition: user != driver
    if (ride.driverId === userId) {
      return {
        success: false,
        message: 'You cannot book your own ride',
        errors: { user: 'Cannot book own ride' }
      }
    }

    // Precondition: ride open
    if (ride.status !== 'open') {
      return {
        success: false,
        message: 'This ride is no longer available for booking',
        errors: { status: 'Ride not open' }
      }
    }

    // Precondition: seats available
    if (ride.seatsAvailable < validatedData.seats) {
      return {
        success: false,
        message: `Only ${ride.seatsAvailable} seats available, but you requested ${validatedData.seats}`,
        errors: { seats: 'Not enough seats available' }
      }
    }

    // Check if user already has a booking for this ride
    const existingBooking = await prisma.booking.findFirst({
      where: {
        rideId: validatedData.rideId,
        riderId: userId,
        status: { in: ['authorized', 'confirmed', 'in_progress'] }
      }
    })

    if (existingBooking) {
      return {
        success: false,
        message: 'You already have an active booking for this ride',
        errors: { booking: 'Duplicate booking' }
      }
    }

    // Compute ridersAfterBooking and authEstimateCents
    const currentRiders = ride.seatsTotal - ride.seatsAvailable
    const ridersAfterBooking = getRidersAfterBooking(ride.seatsTotal, ride.seatsAvailable, validatedData.seats)
    const authEstimateCents = computeAuthEstimate(ride.totalCostCents, currentRiders, validatedData.seats)

    // Generate 6-digit tripStartOtp
    const tripStartOtp = crypto.randomInt(100000, 999999).toString()

    // Set otpExpiresAt = min(departAt, now+6h)
    const now = new Date()
    const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000)
    const otpExpiresAt = ride.departAt < sixHoursFromNow ? ride.departAt : sixHoursFromNow

    // Create booking and update ride in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create booking
      const booking = await tx.booking.create({
        data: {
          rideId: validatedData.rideId,
          riderId: userId,
          seats: validatedData.seats,
          authEstimateCents,
          status: 'authorized',
          tripStartOtp,
          otpExpiresAt,
        }
      })

      // Decrement ride seats available
      await tx.ride.update({
        where: { id: validatedData.rideId },
        data: {
          seatsAvailable: { decrement: validatedData.seats },
          status: ride.seatsAvailable - validatedData.seats === 0 ? 'full' : 'open'
        }
      })

      return booking
    })

    // Get rider info for email
    const rider = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true }
    })

    // Email OTP to rider (Resend)
    if (rider?.email) {
      try {
        await sendOTPEmail(rider.email, tripStartOtp)
      } catch (error) {
        console.error('Failed to send OTP email:', error)
        // Don't fail the booking if email fails
      }
    }

    revalidatePath('/rides')
    revalidatePath('/dashboard/bookings')

    return {
      success: true,
      message: 'Ride booked successfully! Check your email for the trip start code.',
      bookingId: result.id
    }

  } catch (error) {
    console.error('Book ride error:', error)

    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return {
        success: false,
        message: 'Invalid booking request',
        errors
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to book ride',
      errors: { form: 'Booking failed' }
    }
  }
}

export async function startTrip(bookingId: string, otp: string): Promise<StartTripResult> {
  try {
    // Get authenticated user
    const session = await requireAuth()
    const userId = session.user.id

    // Validate input
    const validatedData = StartTripSchema.parse({ bookingId, otp })

    // Get booking with ride and user info
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        ride: {
          include: {
            driver: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
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
            phone: true,
          }
        }
      }
    })

    if (!booking) {
      return {
        success: false,
        message: 'Booking not found',
        errors: { booking: 'Invalid booking ID' }
      }
    }

    // Verify user is either the rider or driver
    if (booking.riderId !== userId && booking.ride.driverId !== userId) {
      return {
        success: false,
        message: 'You are not authorized to start this trip',
        errors: { auth: 'Unauthorized' }
      }
    }

    // Validate OTP match
    if (booking.tripStartOtp !== validatedData.otp) {
      return {
        success: false,
        message: 'Invalid trip start code',
        errors: { otp: 'Invalid code' }
      }
    }

    // Validate OTP not expired
    if (!booking.otpExpiresAt || new Date() > booking.otpExpiresAt) {
      return {
        success: false,
        message: 'Trip start code has expired',
        errors: { otp: 'Code expired' }
      }
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: validatedData.bookingId },
      data: {
        status: 'in_progress',
        tripStartedAt: new Date(),
      }
    })

    // SMS both parties "Trip started" with safe info (no OTP)
    const riderName = booking.rider.name || 'Rider'
    const driverName = booking.ride.driver.user.name || 'Driver'
    const tripStartMessage = `Rydify: Trip started! ${riderName} and ${driverName} are now on their way. Safe travels!`

    // Send SMS to rider
    if (booking.rider.phone) {
      try {
        await sendOTPSMS(booking.rider.phone, tripStartMessage)
        
        // Log contact
        await prisma.contactLog.create({
          data: {
            bookingId: validatedData.bookingId,
            userId: booking.riderId,
            method: 'sms',
          }
        })
      } catch (error) {
        console.error('Failed to send SMS to rider:', error)
      }
    }

    // Send SMS to driver
    if (booking.ride.driver.user.phone) {
      try {
        await sendOTPSMS(booking.ride.driver.user.phone, tripStartMessage)
        
        // Log contact
        await prisma.contactLog.create({
          data: {
            bookingId: validatedData.bookingId,
            userId: booking.ride.driverId,
            method: 'sms',
          }
        })
      } catch (error) {
        console.error('Failed to send SMS to driver:', error)
      }
    }

    revalidatePath('/dashboard/bookings')
    revalidatePath('/dashboard/rides')

    return {
      success: true,
      message: 'Trip started successfully! Both parties have been notified.',
    }

  } catch (error) {
    console.error('Start trip error:', error)

    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return {
        success: false,
        message: 'Invalid trip start request',
        errors
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to start trip',
      errors: { form: 'Trip start failed' }
    }
  }
}

export async function completeTrip(rideId: string): Promise<CompleteTripResult> {
  try {
    // Get authenticated user
    const session = await requireAuth()
    const userId = session.user.id

    // Validate input
    const validatedData = CompleteTripSchema.parse({ rideId })

    // Get ride with bookings
    const ride = await prisma.ride.findUnique({
      where: { id: validatedData.rideId },
      include: {
        bookings: {
          where: {
            status: 'in_progress'
          },
          include: {
            rider: {
              select: {
                id: true,
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

    // Precondition: caller is driver of ride
    if (ride.driverId !== userId) {
      return {
        success: false,
        message: 'Only the driver can complete this trip',
        errors: { auth: 'Unauthorized' }
      }
    }

    // Precondition: ride has in_progress bookings
    if (ride.bookings.length === 0) {
      return {
        success: false,
        message: 'No active bookings to complete',
        errors: { bookings: 'No in-progress bookings' }
      }
    }

    // Determine finalRiders = count of bookings with status in_progress for ride
    const finalRiders = ride.bookings.length

    // Update all in_progress bookings
    const completedBookings = await prisma.$transaction(async (tx) => {
      const updates = []

      for (const booking of ride.bookings) {
        // Set finalShareCents and status
        const finalShareCents = computeFinalShare(ride.totalCostCents, finalRiders)
        
        const updatedBooking = await tx.booking.update({
          where: { id: booking.id },
          data: {
            finalShareCents,
            status: 'completed',
            tripCompletedAt: new Date(),
          }
        })

        updates.push(updatedBooking)
      }

      // Set ride status to completed
      await tx.ride.update({
        where: { id: validatedData.rideId },
        data: {
          status: 'completed'
        }
      })

      return updates
    })

    // TODO: Trigger payment-request notifications
    // This would typically involve sending emails/SMS to riders about payment
    // For now, we'll just log that payment requests should be sent
    console.log(`Payment requests should be sent for ${completedBookings.length} completed bookings`)

    revalidatePath('/dashboard/rides')
    revalidatePath('/dashboard/bookings')

    return {
      success: true,
      message: `Trip completed successfully! ${completedBookings.length} bookings have been finalized.`,
      completedBookings: completedBookings.length
    }

  } catch (error) {
    console.error('Complete trip error:', error)

    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return {
        success: false,
        message: 'Invalid trip completion request',
        errors
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to complete trip',
      errors: { form: 'Trip completion failed' }
    }
  }
}