import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { cancelBooking, openDispute } from '@/lib/bookings/actions'
import { prisma } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/session'

// Mock dependencies
jest.mock('@/lib/db/client', () => ({
  prisma: {
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    ride: {
      update: jest.fn(),
    },
    dispute: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    contactLog: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

jest.mock('@/lib/auth/session', () => ({
  requireAuth: jest.fn(),
}))

jest.mock('@/lib/notifications/queue', () => ({
  NotificationQueue: {
    enqueue: jest.fn(),
  },
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>

describe('Booking Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAuth.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    } as any)
  })

  describe('cancelBooking', () => {
    const mockBooking = {
      id: 'booking123',
      riderId: 'rider123',
      rideId: 'ride123',
      seats: 2,
      status: 'authorized',
      ride: {
        id: 'ride123',
        driverId: 'driver123',
        originText: 'Origin City',
        destText: 'Destination City',
        departAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        driver: {
          user: {
            id: 'driver123',
            name: 'Driver Name',
            email: 'driver@example.com',
            phone: '+1234567890',
          }
        }
      },
      rider: {
        id: 'rider123',
        name: 'Rider Name',
        email: 'rider@example.com',
        phone: '+1234567890',
      }
    }

    it('should successfully cancel booking by rider >12h before departure', async () => {
      mockRequireAuth.mockResolvedValue({
        user: { id: 'rider123', email: 'rider@example.com' }
      } as any)

      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking as any)
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma as any)
      })

      const result = await cancelBooking('booking123', 'rider')

      expect(result.success).toBe(true)
      expect(result.message).toContain('Booking cancelled successfully')
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should tag late cancellation for rider <12h before departure', async () => {
      const soonDepartingBooking = {
        ...mockBooking,
        ride: {
          ...mockBooking.ride,
          departAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        }
      }

      mockRequireAuth.mockResolvedValue({
        user: { id: 'rider123', email: 'rider@example.com' }
      } as any)

      mockPrisma.booking.findUnique.mockResolvedValue(soonDepartingBooking as any)
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma as any)
      })

      const result = await cancelBooking('booking123', 'rider')

      expect(result.success).toBe(true)
      expect(result.message).toContain('Late cancellation fee may apply')
    })

    it('should reject cancellation by unauthorized user', async () => {
      mockRequireAuth.mockResolvedValue({
        user: { id: 'unauthorized123', email: 'unauthorized@example.com' }
      } as any)

      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking as any)

      const result = await cancelBooking('booking123', 'rider')

      expect(result.success).toBe(false)
      expect(result.message).toContain('not authorized')
    })

    it('should reject cancellation of non-cancellable booking', async () => {
      const completedBooking = {
        ...mockBooking,
        status: 'completed'
      }

      mockRequireAuth.mockResolvedValue({
        user: { id: 'rider123', email: 'rider@example.com' }
      } as any)

      mockPrisma.booking.findUnique.mockResolvedValue(completedBooking as any)

      const result = await cancelBooking('booking123', 'rider')

      expect(result.success).toBe(false)
      expect(result.message).toContain('cannot be cancelled')
    })
  })

  describe('openDispute', () => {
    const mockBooking = {
      id: 'booking123',
      riderId: 'rider123',
      rideId: 'ride123',
      seats: 2,
      status: 'completed',
      ride: {
        id: 'ride123',
        driverId: 'driver123',
        originText: 'Origin City',
        destText: 'Destination City',
        departAt: new Date(),
        driver: {
          user: {
            id: 'driver123',
            name: 'Driver Name',
            email: 'driver@example.com',
            phone: '+1234567890',
          }
        }
      },
      rider: {
        id: 'rider123',
        name: 'Rider Name',
        email: 'rider@example.com',
        phone: '+1234567890',
      }
    }

    it('should successfully open dispute', async () => {
      mockRequireAuth.mockResolvedValue({
        user: { id: 'rider123', email: 'rider@example.com' }
      } as any)

      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking as any)
      mockPrisma.dispute.findFirst.mockResolvedValue(null)
      mockPrisma.dispute.create.mockResolvedValue({
        id: 'dispute123',
        bookingId: 'booking123',
        openedById: 'rider123',
        reason: 'Driver was late',
        status: 'open',
      } as any)
      mockPrisma.contactLog.findMany.mockResolvedValue([])

      const result = await openDispute('booking123', 'Driver was late and unprofessional')

      expect(result.success).toBe(true)
      expect(result.message).toContain('Dispute opened successfully')
      expect(result.disputeId).toBe('dispute123')
    })

    it('should reject duplicate dispute', async () => {
      mockRequireAuth.mockResolvedValue({
        user: { id: 'rider123', email: 'rider@example.com' }
      } as any)

      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking as any)
      mockPrisma.dispute.findFirst.mockResolvedValue({
        id: 'existing-dispute',
        status: 'open'
      } as any)

      const result = await openDispute('booking123', 'Driver was late')

      expect(result.success).toBe(false)
      expect(result.message).toContain('already open')
    })

    it('should reject dispute on non-disputable booking', async () => {
      const authorizedBooking = {
        ...mockBooking,
        status: 'authorized'
      }

      mockRequireAuth.mockResolvedValue({
        user: { id: 'rider123', email: 'rider@example.com' }
      } as any)

      mockPrisma.booking.findUnique.mockResolvedValue(authorizedBooking as any)

      const result = await openDispute('booking123', 'Driver was late')

      expect(result.success).toBe(false)
      expect(result.message).toContain('cannot be disputed')
    })

    it('should reject dispute with insufficient reason', async () => {
      mockRequireAuth.mockResolvedValue({
        user: { id: 'rider123', email: 'rider@example.com' }
      } as any)

      const result = await openDispute('booking123', 'Bad')

      expect(result.success).toBe(false)
      expect(result.errors?.reason).toContain('at least 10 characters')
    })
  })
})