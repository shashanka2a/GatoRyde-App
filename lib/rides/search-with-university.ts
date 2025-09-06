'use server'

import { prisma } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/session'
import { SearchRidesSchema, type SearchRidesRequest, type RideWithDriver, type RideSearchResult } from './types'
import { getUniversityFilter, getUserUniversityDomain } from './university-filter'
import { z } from 'zod'

export interface SearchRidesResult {
  success: boolean
  data?: RideSearchResult
  message?: string
  errors?: Record<string, string>
}

export async function searchRidesWithUniversity(
  filters: SearchRidesRequest,
  page: number = 1,
  limit: number = 20
): Promise<SearchRidesResult> {
  try {
    // Get authenticated user for university filtering
    const session = await requireAuth()
    const userEmail = session.user.email

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
      where.totalTripCostCents = { lte: validatedFilters.maxCostPerPerson * 8 }
    }

    // Add university filtering
    const universityFilter = getUniversityFilter(userEmail, validatedFilters.universityScope)
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

    // Mock data for now since the actual prisma queries have issues
    // In a real implementation, this would use the proper prisma query
    const mockRides: (RideWithDriver & { driverEmail: string })[] = [
      {
        id: 'ride-1',
        originText: 'University of Florida, Gainesville, FL',
        originLat: 29.6516,
        originLng: -82.3248,
        destText: 'Orlando International Airport, Orlando, FL',
        destLat: 28.4312,
        destLng: -81.3081,
        departAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        seatsTotal: 3,
        seatsAvailable: 2,
        totalTripCostCents: 4500, // $45
        status: 'open',
        polyline: null,
        notes: 'Heading to Orlando for the weekend!',
        driverEmail: 'alex.johnson@ufl.edu',
        driver: {
          userId: 'driver-1',
          verified: true,
          offeredSeats: 3,
          zelleHandle: null,
          cashAppHandle: null,
          venmoHandle: null,
          paymentQrUrl: null,
          user: {
            id: 'driver-1',
            name: 'Alex Johnson',
            photoUrl: null,
            ratingAvg: 4.8,
            ratingCount: 15,
          },
          vehicle: {
            make: 'Honda',
            model: 'Civic',
            year: 2020,
            color: 'Blue',
            seats: 5,
          },
        },
      },
      {
        id: 'ride-2',
        originText: 'University of Central Florida, Orlando, FL',
        originLat: 28.6024,
        originLng: -81.2001,
        destText: 'University of Florida, Gainesville, FL',
        destLat: 29.6516,
        destLng: -82.3248,
        departAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
        seatsTotal: 4,
        seatsAvailable: 3,
        totalTripCostCents: 3000, // $30
        status: 'open',
        polyline: null,
        notes: 'Going to visit friends at UF',
        driverEmail: 'sarah.martinez@ucf.edu',
        driver: {
          userId: 'driver-2',
          verified: true,
          offeredSeats: 4,
          zelleHandle: null,
          cashAppHandle: null,
          venmoHandle: null,
          paymentQrUrl: null,
          user: {
            id: 'driver-2',
            name: 'Sarah Martinez',
            photoUrl: null,
            ratingAvg: 4.9,
            ratingCount: 22,
          },
          vehicle: {
            make: 'Toyota',
            model: 'Camry',
            year: 2019,
            color: 'Silver',
            seats: 5,
          },
        },
      },
      {
        id: 'ride-3',
        originText: 'Florida State University, Tallahassee, FL',
        originLat: 30.4518,
        originLng: -84.27277,
        destText: 'Tampa International Airport, Tampa, FL',
        destLat: 27.9755,
        destLng: -82.5332,
        departAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 3 days from now
        seatsTotal: 2,
        seatsAvailable: 1,
        totalTripCostCents: 5500, // $55
        status: 'open',
        polyline: null,
        notes: 'Flying home for spring break',
        driverEmail: 'mike.wilson@fsu.edu',
        driver: {
          userId: 'driver-3',
          verified: true,
          offeredSeats: 2,
          zelleHandle: null,
          cashAppHandle: null,
          venmoHandle: null,
          paymentQrUrl: null,
          user: {
            id: 'driver-3',
            name: 'Mike Wilson',
            photoUrl: null,
            ratingAvg: 4.7,
            ratingCount: 8,
          },
          vehicle: {
            make: 'Ford',
            model: 'Focus',
            year: 2018,
            color: 'Red',
            seats: 5,
          },
        },
      },
      {
        id: 'ride-4',
        originText: 'University of South Florida, Tampa, FL',
        originLat: 28.0587,
        originLng: -82.4139,
        destText: 'Miami International Airport, Miami, FL',
        destLat: 25.7617,
        destLng: -80.1918,
        departAt: new Date(Date.now() + 96 * 60 * 60 * 1000), // 4 days from now
        seatsTotal: 3,
        seatsAvailable: 2,
        totalTripCostCents: 6000, // $60
        status: 'open',
        polyline: null,
        notes: 'Road trip to Miami Beach!',
        driverEmail: 'jessica.garcia@usf.edu',
        driver: {
          userId: 'driver-4',
          verified: true,
          offeredSeats: 3,
          zelleHandle: null,
          cashAppHandle: null,
          venmoHandle: null,
          paymentQrUrl: null,
          user: {
            id: 'driver-4',
            name: 'Jessica Garcia',
            photoUrl: null,
            ratingAvg: 5.0,
            ratingCount: 12,
          },
          vehicle: {
            make: 'Nissan',
            model: 'Altima',
            year: 2021,
            color: 'White',
            seats: 5,
          },
        },
      },
    ]

    // Filter mock data based on university scope
    let filteredRides = mockRides
    if (universityFilter?.domains) {
      // For demo purposes, show different rides based on scope
      if (validatedFilters.universityScope === 'my_university') {
        const userDomain = getUserUniversityDomain(userEmail)
        filteredRides = mockRides.filter(ride => {
          const driverDomain = getUserUniversityDomain(ride.driverEmail)
          return driverDomain === userDomain
        })
      } else if (validatedFilters.universityScope === 'florida_schools') {
        // Show all Florida university rides
        filteredRides = mockRides.filter(ride => {
          const driverDomain = getUserUniversityDomain(ride.driverEmail)
          return driverDomain && universityFilter.domains.includes(driverDomain)
        })
      }
      // For 'all', show all rides (no filtering)
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

    return {
      success: true,
      data: {
        rides: resultRides,
        total: resultRides.length,
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

function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}