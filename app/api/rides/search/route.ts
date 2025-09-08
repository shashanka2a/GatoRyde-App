import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUniversityFilter, getUserUniversityDomain } from '@/lib/rides/university-filter'
import { calculateDistance } from '@/lib/rides/utils'
import { SearchRidesSchema } from '@/lib/rides/types'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [SEARCH RIDES] Request received')
    
    // Track location searches if origin/destination provided
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    
    // Track origin search
    if (origin) {
      try {
        await fetch(`${request.nextUrl.origin}/api/locations/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: origin,
            searchType: 'origin'
          })
        })
      } catch (error) {
        console.log('Failed to track origin search:', error)
      }
    }
    
    // Track destination search
    if (destination) {
      try {
        await fetch(`${request.nextUrl.origin}/api/locations/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: destination,
            searchType: 'destination'
          })
        })
      } catch (error) {
        console.log('Failed to track destination search:', error)
      }
    }
    
    // Fetch both rides and ride requests
    const [rides, rideRequests] = await Promise.all([
      // Fetch rides
      prisma.ride.findMany({
        where: {
          status: 'open',
          seatsAvailable: { gt: 0 },
          departAt: { gte: new Date() }
        },
        include: {
          driver: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  photoUrl: true,
                  ratingAvg: true,
                  ratingCount: true,
                }
              }
            }
          }
        },
        orderBy: [
          { departAt: 'asc' },
          { totalCostCents: 'asc' }
        ],
        take: 20
      }),
      
      // Fetch ride requests
      prisma.rideRequest.findMany({
        where: {
          status: 'open',
          departAt: { gte: new Date() }
        },
        include: {
          rider: {
            select: {
              id: true,
              name: true,
              email: true,
              photoUrl: true,
              ratingAvg: true,
              ratingCount: true,
              university: true,
            }
          }
        },
        orderBy: [
          { departAt: 'asc' },
          { createdAt: 'desc' }
        ],
        take: 20
      })
    ])
    
    console.log(`✅ [SEARCH RIDES] Found ${rides.length} rides and ${rideRequests.length} ride requests`)

    const transformedRides = rides.map(ride => ({
      id: ride.id,
      type: 'ride', // Distinguish from requests
      originText: ride.originText,
      originLat: ride.originLat,
      originLng: ride.originLng,
      destText: ride.destText,
      destLat: ride.destLat,
      destLng: ride.destLng,
      departAt: ride.departAt,
      totalCostCents: ride.totalCostCents,
      seatsAvailable: ride.seatsAvailable,
      seatsTotal: ride.seatsTotal,
      status: ride.status,
      notes: ride.notes,
      driver: {
        userId: ride.driver.userId,
        user: {
          id: ride.driver.user.id,
          name: ride.driver.user.name,
          email: ride.driver.user.email,
          photoUrl: ride.driver.user.photoUrl,
          ratingAvg: ride.driver.user.ratingAvg,
          ratingCount: ride.driver.user.ratingCount,
        }
      }
    }))

    const transformedRequests = rideRequests.map(request => ({
      id: request.id,
      type: 'request', // Distinguish from rides
      originText: request.originText,
      originLat: request.originLat,
      originLng: request.originLng,
      destText: request.destText,
      destLat: request.destLat,
      destLng: request.destLng,
      departAt: request.departAt,
      seatsNeeded: request.seatsNeeded,
      maxCostCents: request.maxCostCents,
      status: request.status,
      notes: request.notes,
      createdAt: request.createdAt,
      rider: {
        userId: request.rider.id,
        user: {
          id: request.rider.id,
          name: request.rider.name,
          email: request.rider.email,
          photoUrl: request.rider.photoUrl,
          ratingAvg: request.rider.ratingAvg,
          ratingCount: request.rider.ratingCount,
          university: request.rider.university,
        }
      }
    }))

    // Combine and sort by departure time
    const allItems = [...transformedRides, ...transformedRequests].sort((a, b) => 
      new Date(a.departAt).getTime() - new Date(b.departAt).getTime()
    )

    return NextResponse.json({
      success: true,
      rides: transformedRides,
      rideRequests: transformedRequests,
      allItems: allItems,
      total: allItems.length
    })

  } catch (error) {
    console.error('Search rides GET error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to search rides'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filters, page = 1, limit = 20 } = body

    // Get authenticated user for university filtering (optional for open access)
    let userEmail: string | null = null
    try {
      const uid = request.cookies.get('uid')?.value
      if (uid) {
        const user = await prisma.user.findUnique({
          where: { id: uid },
          select: { email: true }
        })
        userEmail = user?.email || null
      }
    } catch (error) {
      // User not authenticated - this is OK for open access
      console.log('No authenticated user - showing all rides')
    }

    // Validate input
    const validatedFilters = SearchRidesSchema.parse(filters)
    
    // Build base where clause
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

    // Add price filter
    if (validatedFilters.maxCostPerPerson) {
      where.totalCostCents = { lte: validatedFilters.maxCostPerPerson * 8 }
    }

    // Add university filtering (only if user is authenticated)
    let universityFilter = null
    if (userEmail) {
      universityFilter = getUniversityFilter(userEmail, validatedFilters.universityScope)
      if (universityFilter?.domains) {
        // Filter by driver's university domain
        where.driver = {
          user: {
            email: {
              endsWith: {
                in: universityFilter.domains.map(domain => `@${domain}`)
              }
            }
          }
        }
      }
    }

    // Get rides from database
    const rides = await prisma.ride.findMany({
      where,
      include: {
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                photoUrl: true,
                ratingAvg: true,
                ratingCount: true,
              }
            }
          }
        }
      },
      orderBy: [
        { departAt: 'asc' },
        { driver: { user: { ratingAvg: 'desc' } } },
        { totalCostCents: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit + 1,
    })

    // Transform to the expected format
    const transformedRides = rides.map(ride => ({
      id: ride.id,
      originText: ride.originText,
      originLat: ride.originLat,
      originLng: ride.originLng,
      destText: ride.destText,
      destLat: ride.destLat,
      destLng: ride.destLng,
      departAt: new Date(ride.departAt),
      totalCostCents: ride.totalCostCents,
      seatsAvailable: ride.seatsAvailable,
      seatsTotal: ride.seatsTotal,
      status: ride.status,
      notes: ride.notes,
      driver: {
        userId: ride.driver.userId,
        user: {
          id: ride.driver.user.id,
          name: ride.driver.user.name,
          photoUrl: ride.driver.user.photoUrl,
          ratingAvg: ride.driver.user.ratingAvg,
          ratingCount: ride.driver.user.ratingCount,
        },
        vehicle: null, // Vehicle info not included in current query
      },
      driverEmail: ride.driver.user.email,
    }))

    // Filter based on university scope
    let filteredRides = transformedRides
    if (userEmail && universityFilter?.domains) {
      if (validatedFilters.universityScope === 'my_university') {
        const userDomain = getUserUniversityDomain(userEmail)
        filteredRides = transformedRides.filter(ride => {
          const driverDomain = getUserUniversityDomain(ride.driverEmail)
          return driverDomain === userDomain
        })
      } else if (validatedFilters.universityScope === 'florida_schools') {
        filteredRides = transformedRides.filter(ride => {
          const driverDomain = getUserUniversityDomain(ride.driverEmail)
          return driverDomain && universityFilter.domains.includes(driverDomain)
        })
      }
    }

    // Apply location filtering if specified
    if (validatedFilters.origin || validatedFilters.destination) {
      filteredRides = filteredRides.filter(ride => {
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

    // Pagination
    const hasMore = filteredRides.length > limit
    const resultRides = hasMore ? filteredRides.slice(0, limit) : filteredRides

    return NextResponse.json({
      success: true,
      data: {
        rides: resultRides,
        hasMore,
        total: filteredRides.length
      }
    })

  } catch (error) {
    console.error('Search rides error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to search rides',
      errors: { search: 'Search failed' }
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
