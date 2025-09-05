import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { bookRide, startTrip, completeTrip } from '@/lib/rides/actions'
import { prisma } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/session'
import { sendOTPEmail } from '@/lib/auth/email'
import { sendOTPSMS } from '@/lib/auth/sms'

// Mock dependencies
jest.mock('@/lib/db/client', () => ({
  prisma: {
    ride: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    booking: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    contactLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

jest.mock('@/lib/auth/session')
jest.mock('@/lib/auth/email')
jest.mock('@/lib/auth/sms')
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>
const mockSendOTPEmail = sendOTPEmail as jest.MockedFunction<typeof sendOTPEmail>
const mockSendOTPSMS = sendOTPSMS as jest.MockedFunction<typeof sendOTPSMS>

describe('Booking Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('bookRide', () => {
    it('should successfully book a ride', async () => {
      // Mock authenticated user
      mockRequireAuth.mockResolvedValue({
        id: 'user-123',
        email: 'rider@test.com',
        phone: null,
        eduVerified: true,
      } as any)

      // Mock ride data
      const mockRide = {
        id: 'ride-123',
        driverId: 'driver-456',
        status: 'open',
        seatsAvailable: 3,
        seatsTotal: 4,
        totalCostCents: 2000,
        departAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        driver: {
          user: {
            id: 'driver-456',
            name: 'Driver Name',
            email: 'driver@test.com',
            phone: '+1234567890',
          }
        }
      }

      const mockUser = {
        name: 'Rider Name',
        email: 'rider@test.com',
        phone: '+0987654321',
      }

      const mockBooking = {
        id: 'booking-789',
        rideId: 'ride-123',
        riderId: 'user-123',
        seats: 1,
        authEstimateCents: 500,
        status: 'authorized',
      }

      // Setup mocks
      ;(prisma.ride.findUnique as jest.Mock).mockResolvedValue(mockRide)
      ;(prisma.booking.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          booking: {
            create: jest.fn().mockResolvedValue(mockBooking),
          },
          ride: {
            update: jest.fn().mockResolvedValue({}),
          },
        })
      })
      mockSendOTPEmail.mockResolvedValue()

      const result = await bookRide('ride-123', 1)

      expect(result.success).toBe(true)
      expect(result.bookingId).toBe('booking-789')
      expect(result.message).toContain('booked successfully')
      expect(mockSendOTPEmail).toHaveBeenCalled()
    })

    it('should reject booking own ride', async () => {
      mockRequireAuth.mockResolvedValue({
        id: 'driver-456',
        email: 'driver@test.com',
        phone: null,
        eduVerified: true,
      } as any)

      const mockRide = {
        id: 'ride-123',
        driverId: 'driver-456', // Same as user ID
        status: 'open',
        seatsAvailable: 3,
      }

      ;(prisma.ride.findUnique as jest.Mock).mockResolvedValue(mockRide)

      const result = await bookRide('ride-123', 1)

      expect(result.success).toBe(false)
      expect(result.message).toContain('cannot book your own ride')
    })

    it('should reject booking when not enough seats available', async () => {
      mockRequireAuth.mockResolvedValue({
        id: 'user-123',
        email: 'rider@test.com',
        phone: null,
        eduVerified: true,
      } as any)

      const mockRide = {
        id: 'ride-123',
        driverId: 'driver-456',
        status: 'open',
        seatsAvailable: 1, // Only 1 seat available
      }

      ;(prisma.ride.findUnique as jest.Mock).mockResolvedValue(mockRide)

      const result = await bookRide('ride-123', 2) // Requesting 2 seats

      expect(result.success).toBe(false)
      expect(result.message).toContain('Only 1 seats available')
    })
  })

  describe('startTrip', () => {
    it('should successfully start a trip with valid OTP', async () => {
      mockRequireAuth.mockResolvedValue({
        id: 'user-123',
        email: 'rider@test.com',
        phone: null,
        eduVerified: true,
      } as any)

      const mockBooking = {
        id: 'booking-789',
        riderId: 'user-123',
        tripStartOtp: '123456',
        otpExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        ride: {
          driverId: 'driver-456',
          driver: {
            user: {
              id: 'driver-456',
              name: 'Driver Name',
              phone: '+1234567890',
            }
          }
        },
        rider: {
          id: 'user-123',
          name: 'Rider Name',
          phone: '+0987654321',
        }
      }

      ;(prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking)
      ;(prisma.booking.update as jest.Mock).mockResolvedValue({})
      ;(prisma.contactLog.create as jest.Mock).mockResolvedValue({})
      mockSendOTPSMS.mockResolvedValue()

      const result = await startTrip('booking-789', '123456')

      expect(result.success).toBe(true)
      expect(result.message).toContain('Trip started successfully')
      expect(mockSendOTPSMS).toHaveBeenCalledTimes(2) // Both rider and driver
    })

    it('should reject invalid OTP', async () => {
      mockRequireAuth.mockResolvedValue({
        id: 'user-123',
        email: 'rider@test.com',
        phone: null,
        eduVerified: true,
      } as any)

      const mockBooking = {
        id: 'booking-789',
        riderId: 'user-123',
        tripStartOtp: '123456',
        otpExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
        ride: {
          driverId: 'driver-456',
        }
      }

      ;(prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking)

      const result = await startTrip('booking-789', '654321') // Wrong OTP

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid trip start code')
    })

    it('should reject expired OTP', async () => {
      mockRequireAuth.mockResolvedValue({
        id: 'user-123',
        email: 'rider@test.com',
        phone: null,
        eduVerified: true,
      } as any)

      const mockBooking = {
        id: 'booking-789',
        riderId: 'user-123',
        tripStartOtp: '123456',
        otpExpiresAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago (expired)
        ride: {
          driverId: 'driver-456',
        }
      }

      ;(prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking)

      const result = await startTrip('booking-789', '123456')

      expect(result.success).toBe(false)
      expect(result.message).toContain('Trip start code has expired')
    })
  })

  describe('completeTrip', () => {
    it('should successfully complete a trip', async () => {
      mockRequireAuth.mockResolvedValue({
        id: 'driver-456',
        email: 'driver@test.com',
        phone: null,
        eduVerified: true,
      } as any)

      const mockRide = {
        id: 'ride-123',
        driverId: 'driver-456',
        totalCostCents: 2000,
        bookings: [
          {
            id: 'booking-1',
            riderId: 'rider-1',
            rider: { id: 'rider-1', name: 'Rider 1', email: 'rider1@test.com' }
          },
          {
            id: 'booking-2',
            riderId: 'rider-2',
            rider: { id: 'rider-2', name: 'Rider 2', email: 'rider2@test.com' }
          }
        ]
      }

      ;(prisma.ride.findUnique as jest.Mock).mockResolvedValue(mockRide)
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          booking: {
            update: jest.fn().mockResolvedValue({}),
          },
          ride: {
            update: jest.fn().mockResolvedValue({}),
          },
        })
      })

      const result = await completeTrip('ride-123')

      expect(result.success).toBe(true)
      expect(result.message).toContain('Trip completed successfully')
      expect(result.completedBookings).toBe(2)
    })

    it('should reject completion by non-driver', async () => {
      mockRequireAuth.mockResolvedValue({
        id: 'user-123', // Not the driver
        email: 'user@test.com',
        phone: null,
        eduVerified: true,
      } as any)

      const mockRide = {
        id: 'ride-123',
        driverId: 'driver-456', // Different from user ID
        bookings: []
      }

      ;(prisma.ride.findUnique as jest.Mock).mockResolvedValue(mockRide)

      const result = await completeTrip('ride-123')

      expect(result.success).toBe(false)
      expect(result.message).toContain('Only the driver can complete')
    })

    it('should reject completion with no active bookings', async () => {
      mockRequireAuth.mockResolvedValue({
        id: 'driver-456',
        email: 'driver@test.com',
        phone: null,
        eduVerified: true,
      } as any)

      const mockRide = {
        id: 'ride-123',
        driverId: 'driver-456',
        bookings: [] // No in-progress bookings
      }

      ;(prisma.ride.findUnique as jest.Mock).mockResolvedValue(mockRide)

      const result = await completeTrip('ride-123')

      expect(result.success).toBe(false)
      expect(result.message).toContain('No active bookings to complete')
    })
  })
})