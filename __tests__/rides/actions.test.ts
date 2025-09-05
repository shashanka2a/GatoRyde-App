import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals'
import { createRide, searchRides } from '../../lib/rides/actions'

// Mock dependencies
jest.mock('../../lib/auth/session', () => ({
  requireAuth: jest.fn(() => Promise.resolve({
    user: { id: 'user123', email: 'test@example.com' }
  }))
}))

jest.mock('../../lib/db/client', () => ({
  prisma: {
    driver: {
      findUnique: jest.fn(),
    },
    ride: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('../../lib/maps/mapbox', () => ({
  MapboxService: {
    getRoute: jest.fn(),
  },
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const { prisma } = require('../../lib/db/client')
const { MapboxService } = require('../../lib/maps/mapbox')

describe('Ride Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('createRide', () => {
    const validRideData = {
      origin: {
        text: 'University of Florida',
        placeName: 'University of Florida, Gainesville, FL',
        lat: 29.6436,
        lng: -82.3549,
      },
      destination: {
        text: 'Oaks Mall',
        placeName: 'Oaks Mall, Gainesville, FL',
        lat: 29.6516,
        lng: -82.3707,
      },
      departAt: '2025-12-31T10:00:00',
      seatsTotal: 3,
      pricePerSeatCents: 500,
      notes: 'Test ride',
    }

    it('should create ride successfully for verified driver', async () => {
      // Mock verified driver with vehicle
      prisma.driver.findUnique.mockResolvedValue({
        userId: 'user123',
        verified: true,
        vehicle: {
          id: 'vehicle123',
          make: 'Toyota',
          model: 'Camry',
          seats: 5,
        }
      })

      // Mock route generation
      MapboxService.getRoute.mockResolvedValue({
        polyline: 'encoded_polyline',
        distance: 5000,
        duration: 600,
      })

      // Mock ride creation
      prisma.ride.create.mockResolvedValue({
        id: 'ride123',
        ...validRideData,
      })

      const result = await createRide(validRideData)

      expect(result.success).toBe(true)
      expect(result.message).toContain('Ride created successfully')
      expect(result.rideId).toBe('ride123')

      expect(prisma.ride.create).toHaveBeenCalledWith({
        data: {
          driverId: 'user123',
          originText: validRideData.origin.placeName,
          originLat: validRideData.origin.lat,
          originLng: validRideData.origin.lng,
          destText: validRideData.destination.placeName,
          destLat: validRideData.destination.lat,
          destLng: validRideData.destination.lng,
          departAt: new Date(validRideData.departAt),
          seatsTotal: validRideData.seatsTotal,
          seatsAvailable: validRideData.seatsTotal,
          pricePerSeatCents: validRideData.pricePerSeatCents,
          polyline: 'encoded_polyline',
          status: 'open',
        }
      })
    })

    it('should reject ride creation for non-driver', async () => {
      prisma.driver.findUnique.mockResolvedValue(null)

      const result = await createRide(validRideData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('must be registered as a driver')
      expect(result.errors?.driver).toBe('Driver registration required')
    })

    it('should reject ride creation for unverified driver', async () => {
      prisma.driver.findUnique.mockResolvedValue({
        userId: 'user123',
        verified: false,
        vehicle: { seats: 5 }
      })

      const result = await createRide(validRideData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('must be verified')
      expect(result.errors?.verification).toBe('Driver verification required')
    })

    it('should reject ride creation for driver without vehicle', async () => {
      prisma.driver.findUnique.mockResolvedValue({
        userId: 'user123',
        verified: true,
        vehicle: null
      })

      const result = await createRide(validRideData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('must have a registered vehicle')
      expect(result.errors?.vehicle).toBe('Vehicle registration required')
    })

    it('should reject ride with more seats than vehicle capacity', async () => {
      prisma.driver.findUnique.mockResolvedValue({
        userId: 'user123',
        verified: true,
        vehicle: { seats: 2 } // Less than requested 3 seats
      })

      const result = await createRide(validRideData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Cannot offer more seats than your vehicle has')
      expect(result.errors?.seatsTotal).toBe('Exceeds vehicle capacity')
    })

    it('should handle route generation failure gracefully', async () => {
      prisma.driver.findUnique.mockResolvedValue({
        userId: 'user123',
        verified: true,
        vehicle: { seats: 5 }
      })

      // Mock route generation failure
      MapboxService.getRoute.mockRejectedValue(new Error('Route error'))

      prisma.ride.create.mockResolvedValue({
        id: 'ride123',
        ...validRideData,
      })

      const result = await createRide(validRideData)

      expect(result.success).toBe(true) // Should still succeed without polyline
      expect(prisma.ride.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            polyline: null, // Should be null when route fails
          })
        })
      )
    })

    it('should validate departure time is in future', async () => {
      const pastRideData = {
        ...validRideData,
        departAt: '2020-01-01T10:00:00', // Past date
      }

      const result = await createRide(pastRideData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Please check your ride details')
      expect(result.errors).toBeDefined()
    })

    it('should validate seat count limits', async () => {
      const invalidSeatsData = {
        ...validRideData,
        seatsTotal: 10, // Too many seats
      }

      const result = await createRide(invalidSeatsData)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should validate price limits', async () => {
      const invalidPriceData = {
        ...validRideData,
        pricePerSeatCents: 15000, // $150, too expensive
      }

      const result = await createRide(invalidPriceData)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })
  })

  describe('searchRides', () => {
    const mockRides = [
      {
        id: 'ride1',
        originText: 'University of Florida',
        originLat: 29.6436,
        originLng: -82.3549,
        destText: 'Oaks Mall',
        destLat: 29.6516,
        destLng: -82.3707,
        departAt: new Date('2025-12-31T10:00:00'),
        seatsTotal: 3,
        seatsAvailable: 2,
        pricePerSeatCents: 500,
        status: 'open',
        polyline: 'encoded_polyline',
        driver: {
          userId: 'driver1',
          verified: true,
          user: {
            id: 'driver1',
            name: 'John Doe',
            photoUrl: null,
            ratingAvg: 4.5,
            ratingCount: 10,
          },
          vehicle: {
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'Blue',
            seats: 5,
          }
        }
      }
    ]

    it('should search rides successfully with basic filters', async () => {
      prisma.ride.findMany.mockResolvedValue(mockRides)

      const filters = {
        originRadius: 10,
        destinationRadius: 10,
        minSeats: 1,
      }

      const result = await searchRides(filters)

      expect(result.success).toBe(true)
      expect(result.data?.rides).toHaveLength(1)
      expect(result.data?.rides[0].id).toBe('ride1')

      expect(prisma.ride.findMany).toHaveBeenCalledWith({
        where: {
          status: 'open',
          seatsAvailable: { gte: 1 },
          departAt: { gte: expect.any(Date) },
        },
        include: expect.any(Object),
        orderBy: [
          { departAt: 'asc' },
          { driver: { user: { ratingAvg: 'desc' } } },
          { pricePerSeatCents: 'asc' },
        ],
        skip: 0,
        take: 21, // limit + 1
      })
    })

    it('should filter by time range', async () => {
      prisma.ride.findMany.mockResolvedValue(mockRides)

      const filters = {
        originRadius: 10,
        destinationRadius: 10,
        minSeats: 1,
        departAfter: '2025-12-31T08:00:00',
        departBefore: '2025-12-31T12:00:00',
      }

      const result = await searchRides(filters)

      expect(result.success).toBe(true)
      expect(prisma.ride.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            departAt: {
              gte: new Date('2025-12-31T08:00:00'),
              lte: new Date('2025-12-31T12:00:00'),
            },
          }),
        })
      )
    })

    it('should filter by maximum price', async () => {
      prisma.ride.findMany.mockResolvedValue(mockRides)

      const filters = {
        originRadius: 10,
        destinationRadius: 10,
        minSeats: 1,
        maxPrice: 1000, // $10.00
      }

      const result = await searchRides(filters)

      expect(result.success).toBe(true)
      expect(prisma.ride.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            pricePerSeatCents: { lte: 1000 },
          }),
        })
      )
    })

    it('should filter by minimum seats', async () => {
      prisma.ride.findMany.mockResolvedValue(mockRides)

      const filters = {
        originRadius: 10,
        destinationRadius: 10,
        minSeats: 2,
      }

      const result = await searchRides(filters)

      expect(result.success).toBe(true)
      expect(prisma.ride.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            seatsAvailable: { gte: 2 },
          }),
        })
      )
    })

    it('should filter by location radius', async () => {
      // Mock rides that are within and outside radius
      const ridesWithLocations = [
        {
          ...mockRides[0],
          originLat: 29.6436, // UF coordinates
          originLng: -82.3549,
        },
        {
          ...mockRides[0],
          id: 'ride2',
          originLat: 30.0000, // Far away coordinates
          originLng: -83.0000,
        }
      ]

      prisma.ride.findMany.mockResolvedValue(ridesWithLocations)

      const filters = {
        origin: {
          text: 'University of Florida',
          placeName: 'University of Florida, Gainesville, FL',
          lat: 29.6436,
          lng: -82.3549,
        },
        originRadius: 5, // 5km radius
        destinationRadius: 10,
        minSeats: 1,
      }

      const result = await searchRides(filters)

      expect(result.success).toBe(true)
      // Should filter out the far away ride
      expect(result.data?.rides).toHaveLength(1)
      expect(result.data?.rides[0].id).toBe('ride1')
    })

    it('should handle pagination correctly', async () => {
      const manyRides = Array.from({ length: 25 }, (_, i) => ({
        ...mockRides[0],
        id: `ride${i}`,
      }))

      prisma.ride.findMany.mockResolvedValue(manyRides)

      const filters = {
        originRadius: 10,
        destinationRadius: 10,
        minSeats: 1,
      }

      const result = await searchRides(filters, 1, 20)

      expect(result.success).toBe(true)
      expect(result.data?.rides).toHaveLength(20) // Should limit to 20
      expect(result.data?.hasMore).toBe(true) // Should indicate more results
    })

    it('should handle database errors', async () => {
      prisma.ride.findMany.mockRejectedValue(new Error('Database error'))

      const filters = {
        originRadius: 10,
        destinationRadius: 10,
        minSeats: 1,
      }

      const result = await searchRides(filters)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Database error')
    })

    it('should validate search filters', async () => {
      const invalidFilters = {
        originRadius: -5, // Invalid negative radius
        destinationRadius: 10,
        minSeats: 1,
      }

      const result = await searchRides(invalidFilters as any)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid search filters')
      expect(result.errors).toBeDefined()
    })
  })

  describe('Timezone handling', () => {
    it('should handle different timezones correctly', async () => {
      prisma.driver.findUnique.mockResolvedValue({
        userId: 'user123',
        verified: true,
        vehicle: { seats: 5 }
      })

      prisma.ride.create.mockResolvedValue({ id: 'ride123' })

      // Test with timezone-aware date
      const rideData = {
        ...{
          origin: {
            text: 'University of Florida',
            placeName: 'University of Florida, Gainesville, FL',
            lat: 29.6436,
            lng: -82.3549,
          },
          destination: {
            text: 'Oaks Mall',
            placeName: 'Oaks Mall, Gainesville, FL',
            lat: 29.6516,
            lng: -82.3707,
          },
          seatsTotal: 3,
          pricePerSeatCents: 500,
        },
        departAt: '2025-12-31T15:00:00-05:00', // EST timezone
      }

      const result = await createRide(rideData)

      expect(result.success).toBe(true)
      expect(prisma.ride.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            departAt: expect.any(Date),
          })
        })
      )
    })
  })
})