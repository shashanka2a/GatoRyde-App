import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { RideRepository } from '../../lib/db/repositories/ride.repository'
import { UserRepository } from '../../lib/db/repositories/user.repository'
import { DriverRepository } from '../../lib/db/repositories/driver.repository'
import { prisma } from '../../lib/db/client'

describe('RideRepository', () => {
  let rideRepository: RideRepository
  let userRepository: UserRepository
  let driverRepository: DriverRepository
  let testDriverId: string

  beforeEach(async () => {
    rideRepository = new RideRepository()
    userRepository = new UserRepository()
    driverRepository = new DriverRepository()

    // Create test user and driver
    const user = await userRepository.create({
      name: 'Test Driver',
      email: 'driver@example.com',
    })

    const driver = await driverRepository.create({
      userId: user.id,
      licenseNumber: 'DL123456',
      verified: true,
    })

    testDriverId = driver.userId
  })

  afterEach(async () => {
    await prisma.ride.deleteMany()
    await prisma.driver.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('create', () => {
    it('should create a ride with valid data', async () => {
      const rideData = {
        driverId: testDriverId,
        originText: 'University of Florida',
        originLat: 29.6516,
        originLng: -82.3248,
        destText: 'Gainesville Mall',
        destLat: 29.6903,
        destLng: -82.3567,
        departAt: new Date('2024-12-01T10:00:00Z'),
        seatsTotal: 4,
        seatsAvailable: 4,
        pricePerSeatCents: 500,
      }

      const ride = await rideRepository.create(rideData)

      expect(ride).toMatchObject({
        driverId: testDriverId,
        originText: 'University of Florida',
        originLat: 29.6516,
        originLng: -82.3248,
        destText: 'Gainesville Mall',
        destLat: 29.6903,
        destLng: -82.3567,
        seatsTotal: 4,
        seatsAvailable: 4,
        pricePerSeatCents: 500,
        status: 'open',
      })
      expect(ride.id).toBeDefined()
    })

    it('should set seatsAvailable equal to seatsTotal on creation', async () => {
      const rideData = {
        driverId: testDriverId,
        originText: 'University of Florida',
        originLat: 29.6516,
        originLng: -82.3248,
        destText: 'Gainesville Mall',
        destLat: 29.6903,
        destLng: -82.3567,
        departAt: new Date('2024-12-01T10:00:00Z'),
        seatsTotal: 3,
        seatsAvailable: 3,
        pricePerSeatCents: 500,
      }

      const ride = await rideRepository.create(rideData)

      expect(ride.seatsAvailable).toBe(3)
      expect(ride.seatsTotal).toBe(3)
    })
  })

  describe('findById', () => {
    it('should find ride by id', async () => {
      const rideData = {
        driverId: testDriverId,
        originText: 'University of Florida',
        originLat: 29.6516,
        originLng: -82.3248,
        destText: 'Gainesville Mall',
        destLat: 29.6903,
        destLng: -82.3567,
        departAt: new Date('2024-12-01T10:00:00Z'),
        seatsTotal: 4,
        seatsAvailable: 4,
        pricePerSeatCents: 500,
      }

      const createdRide = await rideRepository.create(rideData)
      const foundRide = await rideRepository.findById(createdRide.id)

      expect(foundRide).toMatchObject(createdRide)
    })

    it('should return null for non-existent ride', async () => {
      const foundRide = await rideRepository.findById('non-existent-id')
      expect(foundRide).toBeNull()
    })
  })

  describe('findAvailable', () => {
    it('should find available rides', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow

      const rideData = {
        driverId: testDriverId,
        originText: 'University of Florida',
        originLat: 29.6516,
        originLng: -82.3248,
        destText: 'Gainesville Mall',
        destLat: 29.6903,
        destLng: -82.3567,
        departAt: futureDate,
        seatsTotal: 4,
        seatsAvailable: 2,
        pricePerSeatCents: 500,
      }

      const createdRide = await rideRepository.create(rideData)
      const availableRides = await rideRepository.findAvailable()

      expect(availableRides).toHaveLength(1)
      expect(availableRides[0]).toMatchObject(createdRide)
    })

    it('should not return rides with no available seats', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)

      const rideData = {
        driverId: testDriverId,
        originText: 'University of Florida',
        originLat: 29.6516,
        originLng: -82.3248,
        destText: 'Gainesville Mall',
        destLat: 29.6903,
        destLng: -82.3567,
        departAt: futureDate,
        seatsTotal: 4,
        seatsAvailable: 0,
        pricePerSeatCents: 500,
      }

      await rideRepository.create(rideData)
      const availableRides = await rideRepository.findAvailable()

      expect(availableRides).toHaveLength(0)
    })

    it('should not return past rides', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday

      const rideData = {
        driverId: testDriverId,
        originText: 'University of Florida',
        originLat: 29.6516,
        originLng: -82.3248,
        destText: 'Gainesville Mall',
        destLat: 29.6903,
        destLng: -82.3567,
        departAt: pastDate,
        seatsTotal: 4,
        seatsAvailable: 2,
        pricePerSeatCents: 500,
      }

      await rideRepository.create(rideData)
      const availableRides = await rideRepository.findAvailable()

      expect(availableRides).toHaveLength(0)
    })
  })

  describe('updateSeatsAvailable', () => {
    it('should update available seats', async () => {
      const rideData = {
        driverId: testDriverId,
        originText: 'University of Florida',
        originLat: 29.6516,
        originLng: -82.3248,
        destText: 'Gainesville Mall',
        destLat: 29.6903,
        destLng: -82.3567,
        departAt: new Date('2024-12-01T10:00:00Z'),
        seatsTotal: 4,
        seatsAvailable: 4,
        pricePerSeatCents: 500,
      }

      const createdRide = await rideRepository.create(rideData)
      const updatedRide = await rideRepository.updateSeatsAvailable(createdRide.id, 2)

      expect(updatedRide.seatsAvailable).toBe(2)
    })

    it('should update status to full when no seats available', async () => {
      const rideData = {
        driverId: testDriverId,
        originText: 'University of Florida',
        originLat: 29.6516,
        originLng: -82.3248,
        destText: 'Gainesville Mall',
        destLat: 29.6903,
        destLng: -82.3567,
        departAt: new Date('2024-12-01T10:00:00Z'),
        seatsTotal: 2,
        seatsAvailable: 2,
        pricePerSeatCents: 500,
      }

      const createdRide = await rideRepository.create(rideData)
      const updatedRide = await rideRepository.updateSeatsAvailable(createdRide.id, 2)

      expect(updatedRide.seatsAvailable).toBe(0)
      expect(updatedRide.status).toBe('full')
    })
  })

  describe('updateStatus', () => {
    it('should update ride status', async () => {
      const rideData = {
        driverId: testDriverId,
        originText: 'University of Florida',
        originLat: 29.6516,
        originLng: -82.3248,
        destText: 'Gainesville Mall',
        destLat: 29.6903,
        destLng: -82.3567,
        departAt: new Date('2024-12-01T10:00:00Z'),
        seatsTotal: 4,
        seatsAvailable: 4,
        pricePerSeatCents: 500,
      }

      const createdRide = await rideRepository.create(rideData)
      const updatedRide = await rideRepository.updateStatus(createdRide.id, 'in_progress')

      expect(updatedRide.status).toBe('in_progress')
    })
  })
})