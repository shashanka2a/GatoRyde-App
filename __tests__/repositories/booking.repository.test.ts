import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { BookingRepository } from '../../lib/db/repositories/booking.repository'
import { RideRepository } from '../../lib/db/repositories/ride.repository'
import { UserRepository } from '../../lib/db/repositories/user.repository'
import { DriverRepository } from '../../lib/db/repositories/driver.repository'
import { prisma } from '../../lib/db/client'

describe('BookingRepository', () => {
  let bookingRepository: BookingRepository
  let rideRepository: RideRepository
  let userRepository: UserRepository
  let driverRepository: DriverRepository
  let testRideId: string
  let testRiderId: string

  beforeEach(async () => {
    bookingRepository = new BookingRepository()
    rideRepository = new RideRepository()
    userRepository = new UserRepository()
    driverRepository = new DriverRepository()

    // Create test driver
    const driver = await userRepository.create({
      name: 'Test Driver',
      email: 'driver@example.com',
    })

    await driverRepository.create({
      userId: driver.id,
      licenseNumber: 'DL123456',
      verified: true,
    })

    // Create test rider
    const rider = await userRepository.create({
      name: 'Test Rider',
      email: 'rider@example.com',
    })
    testRiderId = rider.id

    // Create test ride
    const ride = await rideRepository.create({
      driverId: driver.id,
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
    })
    testRideId = ride.id
  })

  afterEach(async () => {
    await prisma.booking.deleteMany()
    await prisma.ride.deleteMany()
    await prisma.driver.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('create', () => {
    it('should create a booking with valid data', async () => {
      const bookingData = {
        rideId: testRideId,
        riderId: testRiderId,
        seats: 2,
        amountCents: 1000,
      }

      const booking = await bookingRepository.create(bookingData)

      expect(booking).toMatchObject({
        rideId: testRideId,
        riderId: testRiderId,
        seats: 2,
        amountCents: 1000,
        status: 'pending',
      })
      expect(booking.id).toBeDefined()
      expect(booking.tripStartedAt).toBeNull()
      expect(booking.tripCompletedAt).toBeNull()
    })
  })

  describe('findById', () => {
    it('should find booking by id', async () => {
      const bookingData = {
        rideId: testRideId,
        riderId: testRiderId,
        seats: 2,
        amountCents: 1000,
      }

      const createdBooking = await bookingRepository.create(bookingData)
      const foundBooking = await bookingRepository.findById(createdBooking.id)

      expect(foundBooking).toMatchObject(createdBooking)
    })

    it('should return null for non-existent booking', async () => {
      const foundBooking = await bookingRepository.findById('non-existent-id')
      expect(foundBooking).toBeNull()
    })
  })

  describe('updateStatus', () => {
    it('should update booking status', async () => {
      const bookingData = {
        rideId: testRideId,
        riderId: testRiderId,
        seats: 2,
        amountCents: 1000,
      }

      const createdBooking = await bookingRepository.create(bookingData)
      const updatedBooking = await bookingRepository.updateStatus(createdBooking.id, 'confirmed')

      expect(updatedBooking.status).toBe('confirmed')
    })
  })

  describe('generateTripStartOtp', () => {
    it('should generate and set trip start OTP', async () => {
      const bookingData = {
        rideId: testRideId,
        riderId: testRiderId,
        seats: 2,
        amountCents: 1000,
      }

      const createdBooking = await bookingRepository.create(bookingData)
      const updatedBooking = await bookingRepository.generateTripStartOtp(createdBooking.id)

      expect(updatedBooking.tripStartOtp).toBeDefined()
      expect(updatedBooking.tripStartOtp).toMatch(/^\d{4}$/) // 4-digit OTP
    })
  })

  describe('startTrip', () => {
    it('should start trip with valid OTP', async () => {
      const bookingData = {
        rideId: testRideId,
        riderId: testRiderId,
        seats: 2,
        amountCents: 1000,
      }

      const createdBooking = await bookingRepository.create(bookingData)
      const bookingWithOtp = await bookingRepository.generateTripStartOtp(createdBooking.id)
      
      const startedBooking = await bookingRepository.startTrip(
        createdBooking.id, 
        bookingWithOtp.tripStartOtp!
      )

      expect(startedBooking.status).toBe('in_progress')
      expect(startedBooking.tripStartedAt).toBeInstanceOf(Date)
    })

    it('should throw error with invalid OTP', async () => {
      const bookingData = {
        rideId: testRideId,
        riderId: testRiderId,
        seats: 2,
        amountCents: 1000,
      }

      const createdBooking = await bookingRepository.create(bookingData)
      await bookingRepository.generateTripStartOtp(createdBooking.id)

      await expect(
        bookingRepository.startTrip(createdBooking.id, '0000')
      ).rejects.toThrow('Invalid OTP')
    })
  })

  describe('completeTrip', () => {
    it('should complete trip', async () => {
      const bookingData = {
        rideId: testRideId,
        riderId: testRiderId,
        seats: 2,
        amountCents: 1000,
      }

      const createdBooking = await bookingRepository.create(bookingData)
      const completedBooking = await bookingRepository.completeTrip(createdBooking.id)

      expect(completedBooking.status).toBe('completed')
      expect(completedBooking.tripCompletedAt).toBeInstanceOf(Date)
    })
  })

  describe('findByRiderId', () => {
    it('should find bookings by rider id', async () => {
      const bookingData = {
        rideId: testRideId,
        riderId: testRiderId,
        seats: 2,
        amountCents: 1000,
      }

      const createdBooking = await bookingRepository.create(bookingData)
      const bookings = await bookingRepository.findByRiderId(testRiderId)

      expect(bookings).toHaveLength(1)
      expect(bookings[0]).toMatchObject(createdBooking)
    })
  })

  describe('findByStatus', () => {
    it('should find bookings by status', async () => {
      const bookingData = {
        rideId: testRideId,
        riderId: testRiderId,
        seats: 2,
        amountCents: 1000,
      }

      const createdBooking = await bookingRepository.create(bookingData)
      const pendingBookings = await bookingRepository.findByStatus('pending')

      expect(pendingBookings).toHaveLength(1)
      expect(pendingBookings[0]).toMatchObject(createdBooking)
    })
  })
})