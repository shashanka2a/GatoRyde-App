import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Search parameters schema
const searchSchema = z.object({
  origin: z.object({
    lat: z.number(),
    lng: z.number(),
    text: z.string()
  }),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
    text: z.string()
  }),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  seatsNeeded: z.number().min(1).max(8).default(1),
  maxDistance: z.number().min(1).max(100).default(10) // km radius
})

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Calculate time proximity score (closer to requested time = higher score)
function calculateTimeProximity(rideTime: Date, requestedTime: Date): number {
  const timeDiff = Math.abs(rideTime.getTime() - requestedTime.getTime())
  const hoursDiff = timeDiff / (1000 * 60 * 60)
  
  // Score decreases as time difference increases
  // Perfect match = 100, 1 hour diff = 90, 2 hours = 80, etc.
  return Math.max(0, 100 - (hoursDiff * 10))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse search parameters
    const params = {
      origin: {
        lat: parseFloat(searchParams.get('originLat') || '0'),
        lng: parseFloat(searchParams.get('originLng') || '0'),
        text: searchParams.get('originText') || ''
      },
      destination: {
        lat: parseFloat(searchParams.get('destLat') || '0'),
        lng: parseFloat(searchParams.get('destLng') || '0'),
        text: searchParams.get('destText') || ''
      },
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      seatsNeeded: parseInt(searchParams.get('seatsNeeded') || '1'),
      maxDistance: parseInt(searchParams.get('maxDistance') || '10')
    }

    // Validate parameters
    const validatedParams = searchSchema.parse(params)

    // Build date filter
    const dateFilter: any = {}
    if (validatedParams.dateFrom) {
      dateFilter.gte = new Date(validatedParams.dateFrom)
    }
    if (validatedParams.dateTo) {
      dateFilter.lte = new Date(validatedParams.dateTo)
    }

    // If no date range specified, default to next 7 days
    if (!validatedParams.dateFrom && !validatedParams.dateTo) {
      dateFilter.gte = new Date()
      dateFilter.lte = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }

    // Search for rides
    const rides = await prisma.ride.findMany({
      where: {
        status: 'open',
        seatsAvailable: {
          gte: validatedParams.seatsNeeded
        },
        departAt: dateFilter
      },
      include: {
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                photoUrl: true,
                ratingAvg: true,
                ratingCount: true,
                eduVerified: true
              }
            },
            vehicle: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                color: true,
                seats: true
              }
            }
          }
        }
      },
      orderBy: {
        departAt: 'asc'
      }
    })

    // Filter by distance and calculate scores
    const matchingRides = rides
      .map(ride => {
        // Calculate distance from origin
        const originDistance = calculateDistance(
          validatedParams.origin.lat,
          validatedParams.origin.lng,
          ride.originLat,
          ride.originLng
        )

        // Calculate distance to destination
        const destDistance = calculateDistance(
          validatedParams.destination.lat,
          validatedParams.destination.lng,
          ride.destLat,
          ride.destLng
        )

        // Calculate time proximity (use middle of date range if specified)
        let targetTime = new Date()
        if (validatedParams.dateFrom && validatedParams.dateTo) {
          const fromTime = new Date(validatedParams.dateFrom).getTime()
          const toTime = new Date(validatedParams.dateTo).getTime()
          targetTime = new Date((fromTime + toTime) / 2)
        } else if (validatedParams.dateFrom) {
          targetTime = new Date(validatedParams.dateFrom)
        }

        const timeProximity = calculateTimeProximity(ride.departAt, targetTime)

        // Calculate overall score (distance + time proximity)
        const distanceScore = Math.max(0, 100 - (originDistance + destDistance) * 5)
        const overallScore = (distanceScore * 0.6) + (timeProximity * 0.4)

        return {
          ...ride,
          originDistance,
          destDistance,
          timeProximity,
          overallScore,
          // Add driver verification level
          driverVerificationLevel: ride.driver.user.eduVerified 
            ? (ride.driver.kycVerified && ride.driver.licenseVerified ? 'ENHANCED' : 'BASIC')
            : 'UNVERIFIED'
        }
      })
      .filter(ride => {
        // Filter by maximum distance
        return ride.originDistance <= validatedParams.maxDistance && 
               ride.destDistance <= validatedParams.maxDistance
      })
      .sort((a, b) => b.overallScore - a.overallScore) // Sort by best match first

    return NextResponse.json({
      success: true,
      data: {
        rides: matchingRides,
        searchParams: validatedParams,
        totalResults: matchingRides.length
      }
    })

  } catch (error) {
    console.error('Ride search error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid search parameters',
        errors: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to search rides'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    message: 'Method not allowed'
  }, { status: 405 })
}