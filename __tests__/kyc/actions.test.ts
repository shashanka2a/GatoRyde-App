import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals'
import { submitKYCVerification, reviewKYCVerification } from '../../lib/kyc/actions'

// Mock dependencies
jest.mock('../../lib/auth/session', () => ({
  requireAuth: jest.fn(() => Promise.resolve({
    user: { id: 'user123', email: 'test@example.com' }
  }))
}))

jest.mock('../../lib/db/client', () => ({
  prisma: {
    verification: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    driver: {
      upsert: jest.fn(),
    },
  },
}))

jest.mock('../../lib/storage/kyc-storage', () => ({
  KYCStorageManager: {
    uploadMultipleFiles: jest.fn(),
    deleteMultipleFiles: jest.fn(),
  },
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const { prisma } = require('../../lib/db/client')
const { KYCStorageManager } = require('../../lib/storage/kyc-storage')

describe('KYC Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('submitKYCVerification', () => {
    it('should submit license verification successfully', async () => {
      // Mock no existing verification
      prisma.verification.findFirst.mockResolvedValue(null)

      // Mock successful file upload
      KYCStorageManager.uploadMultipleFiles.mockResolvedValue({
        licensePhoto: {
          url: 'https://example.com/license.jpg',
          path: 'user123/license/license.jpg',
          size: 1024,
          type: 'image/jpeg'
        },
        selfiePhoto: {
          url: 'https://example.com/selfie.jpg',
          path: 'user123/license/selfie.jpg',
          size: 2048,
          type: 'image/jpeg'
        }
      })

      // Mock verification creation
      prisma.verification.create.mockResolvedValue({
        id: 'verification123',
        userId: 'user123',
        type: 'license',
        status: 'pending'
      })

      // Mock driver upsert
      prisma.driver.upsert.mockResolvedValue({})

      // Create form data
      const formData = new FormData()
      formData.append('type', 'license')
      formData.append('data', JSON.stringify({
        licenseNumber: 'DL123456',
        licenseState: 'FL',
        expirationDate: '2025-12-31'
      }))
      
      // Mock files
      const licenseFile = new File(['license'], 'license.jpg', { type: 'image/jpeg' })
      const selfieFile = new File(['selfie'], 'selfie.jpg', { type: 'image/jpeg' })
      formData.append('licensePhoto', licenseFile)
      formData.append('selfiePhoto', selfieFile)

      const result = await submitKYCVerification(formData)

      expect(result.success).toBe(true)
      expect(result.message).toContain('Verification submitted successfully')
      expect(result.verificationId).toBe('verification123')

      expect(prisma.verification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          type: 'license',
          status: 'pending',
          data: {
            licenseNumber: 'DL123456',
            licenseState: 'FL',
            expirationDate: '2025-12-31'
          },
          files: expect.any(Object)
        }
      })

      expect(prisma.driver.upsert).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        create: {
          userId: 'user123',
          licenseNumber: 'DL123456',
          verified: false,
        },
        update: {
          licenseNumber: 'DL123456',
        }
      })
    })

    it('should reject duplicate pending verification', async () => {
      // Mock existing pending verification
      prisma.verification.findFirst.mockResolvedValue({
        id: 'existing123',
        type: 'license',
        status: 'pending'
      })

      const formData = new FormData()
      formData.append('type', 'license')
      formData.append('data', JSON.stringify({
        licenseNumber: 'DL123456',
        licenseState: 'FL',
        expirationDate: '2025-12-31'
      }))

      const result = await submitKYCVerification(formData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('already have a pending license verification')
      expect(result.errors?.form).toBe('Duplicate submission')
    })

    it('should handle missing required files', async () => {
      prisma.verification.findFirst.mockResolvedValue(null)

      const formData = new FormData()
      formData.append('type', 'license')
      formData.append('data', JSON.stringify({
        licenseNumber: 'DL123456',
        licenseState: 'FL',
        expirationDate: '2025-12-31'
      }))
      // Missing licensePhoto and selfiePhoto files

      const result = await submitKYCVerification(formData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('licensePhoto is required')
    })

    it('should handle file upload errors', async () => {
      prisma.verification.findFirst.mockResolvedValue(null)

      // Mock file upload failure
      KYCStorageManager.uploadMultipleFiles.mockRejectedValue(
        new Error('Upload failed: Network error')
      )

      const formData = new FormData()
      formData.append('type', 'license')
      formData.append('data', JSON.stringify({
        licenseNumber: 'DL123456',
        licenseState: 'FL',
        expirationDate: '2025-12-31'
      }))
      
      const licenseFile = new File(['license'], 'license.jpg', { type: 'image/jpeg' })
      const selfieFile = new File(['selfie'], 'selfie.jpg', { type: 'image/jpeg' })
      formData.append('licensePhoto', licenseFile)
      formData.append('selfiePhoto', selfieFile)

      const result = await submitKYCVerification(formData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Upload failed: Network error')
    })

    it('should handle validation errors', async () => {
      const formData = new FormData()
      formData.append('type', 'license')
      formData.append('data', JSON.stringify({
        licenseNumber: '', // Invalid - empty
        licenseState: 'INVALID', // Invalid - not 2 chars
        expirationDate: '2020-01-01' // Invalid - expired
      }))

      const result = await submitKYCVerification(formData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Please check your form data')
      expect(result.errors).toBeDefined()
    })
  })

  describe('reviewKYCVerification', () => {
    it('should approve license verification successfully', async () => {
      // Mock verification lookup
      prisma.verification.findUnique.mockResolvedValue({
        id: 'verification123',
        userId: 'user123',
        type: 'license',
        status: 'pending',
        data: { licenseNumber: 'DL123456' },
        files: {
          licensePhoto: { path: 'user123/license/license.jpg' }
        },
        user: { id: 'user123', email: 'test@example.com' }
      })

      // Mock verification update
      prisma.verification.update.mockResolvedValue({
        id: 'verification123',
        status: 'approved'
      })

      // Mock driver update
      prisma.driver.upsert.mockResolvedValue({})

      const result = await reviewKYCVerification(
        'verification123',
        'approved',
        'License looks good'
      )

      expect(result.success).toBe(true)
      expect(result.message).toBe('Verification approved successfully')

      expect(prisma.verification.update).toHaveBeenCalledWith({
        where: { id: 'verification123' },
        data: {
          status: 'approved',
          notes: 'License looks good',
          reviewedBy: 'user123',
          reviewedAt: expect.any(Date),
        }
      })

      expect(prisma.driver.upsert).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        create: {
          userId: 'user123',
          licenseNumber: 'DL123456',
          verified: true,
        },
        update: {
          verified: true,
        }
      })
    })

    it('should reject verification and clean up files', async () => {
      // Mock verification lookup
      prisma.verification.findUnique.mockResolvedValue({
        id: 'verification123',
        userId: 'user123',
        type: 'license',
        status: 'pending',
        files: {
          licensePhoto: { path: 'user123/license/license.jpg' },
          selfiePhoto: { path: 'user123/license/selfie.jpg' }
        },
        user: { id: 'user123', email: 'test@example.com' }
      })

      // Mock verification update
      prisma.verification.update.mockResolvedValue({
        id: 'verification123',
        status: 'rejected'
      })

      // Mock file cleanup
      KYCStorageManager.deleteMultipleFiles.mockResolvedValue(undefined)

      const result = await reviewKYCVerification(
        'verification123',
        'rejected',
        'License image is unclear'
      )

      expect(result.success).toBe(true)
      expect(result.message).toBe('Verification rejected successfully')

      expect(KYCStorageManager.deleteMultipleFiles).toHaveBeenCalledWith([
        'user123/license/license.jpg',
        'user123/license/selfie.jpg'
      ])
    })

    it('should handle verification not found', async () => {
      prisma.verification.findUnique.mockResolvedValue(null)

      const result = await reviewKYCVerification(
        'nonexistent123',
        'approved'
      )

      expect(result.success).toBe(false)
      expect(result.message).toBe('Verification not found')
      expect(result.errors?.form).toBe('Invalid verification ID')
    })

    it('should handle already reviewed verification', async () => {
      prisma.verification.findUnique.mockResolvedValue({
        id: 'verification123',
        status: 'approved', // Already reviewed
        user: { id: 'user123', email: 'test@example.com' }
      })

      const result = await reviewKYCVerification(
        'verification123',
        'approved'
      )

      expect(result.success).toBe(false)
      expect(result.message).toBe('Verification has already been reviewed')
      expect(result.errors?.form).toBe('Already reviewed')
    })

    it('should handle database errors', async () => {
      prisma.verification.findUnique.mockRejectedValue(
        new Error('Database connection failed')
      )

      const result = await reviewKYCVerification(
        'verification123',
        'approved'
      )

      expect(result.success).toBe(false)
      expect(result.message).toBe('Database connection failed')
    })
  })

  describe('Access Control', () => {
    it('should require authentication for submission', async () => {
      const { requireAuth } = require('../../lib/auth/session')
      requireAuth.mockRejectedValue(new Error('Unauthorized'))

      const formData = new FormData()
      formData.append('type', 'license')
      formData.append('data', JSON.stringify({}))

      const result = await submitKYCVerification(formData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Unauthorized')
    })

    it('should require authentication for review', async () => {
      const { requireAuth } = require('../../lib/auth/session')
      requireAuth.mockRejectedValue(new Error('Unauthorized'))

      const result = await reviewKYCVerification('verification123', 'approved')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Unauthorized')
    })
  })
})