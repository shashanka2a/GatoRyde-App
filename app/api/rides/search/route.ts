import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUniversityFilter, getUserUniversityDomain } from '@/lib/rides/university-filter'
import { calculateDistance } from '@/lib/rides/utils'
import { SearchRidesSchema } from '@/lib/rides/types'

const prisma = new PrismaClient()

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
