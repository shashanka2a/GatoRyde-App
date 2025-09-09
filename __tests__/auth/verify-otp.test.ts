import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST } from '../../app/api/auth/verify-otp/route'

// Mock dependencies
jest.mock('@/lib/auth/rate-limit')
jest.mock('@/lib/auth/otp')
jest.mock('@/lib/auth/cookies')
jest.mock('@/lib/db/repositories')

import { rateLimiter } from '@/lib/auth/rate-limit'
import { otpManager } from '@/lib/auth/otp'
import { CookieManager } from '@/lib/auth/cookies'
import { UserRepository } from '@/lib/db/repositories'

const mockRateLimiter = rateLimiter as jest.Mocked<typeof rateLimiter>;
const mockOtpManager = otpManager as jest.Mocked<typeof otpManager>;
const mockCookieManager = CookieManager as jest.Mocked<typeof CookieManager>;
const mockUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;

describe('/api/auth/verify-otp', () => {
  let mockUserRepo: jest.Mocked<UserRepository>

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUserRepo = {
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      create: jest.fn(),
    } as any

    mockUserRepository.mockImplementation(() => mockUserRepo)
    
    mockRateLimiter.checkRateLimit.mockResolvedValue()
    mockRateLimiter.incrementAttempts.mockResolvedValue()
    mockRateLimiter.resetAttempts.mockResolvedValue()
    mockOtpManager.verifyOTP.mockResolvedValue(true)
    mockCookieManager.getAnonymousData.mockReturnValue(null)
    mockCookieManager.mergeAnonymousDataIntoUser.mockResolvedValue()
  })

  describe('Happy Path', () => {
    it('should verify email OTP for existing user', async () => {
      const existingUser = {
        id: 'user123',
        email: 'test@example.com',
        phone: null,
        eduVerified: true,
        photoUrl: null,
      }

      mockUserRepo.findByEmail.mockResolvedValue(existingUser)

      const request = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'test@example.com',
          otp: '123456',
          type: 'email',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toEqual(existingUser)
      expect(mockOtpManager.verifyOTP).toHaveBeenCalledWith('test@example.com', '123456', 'email')
      expect(mockRateLimiter.resetAttempts).toHaveBeenCalledWith('test@example.com', 'otp_request')
      expect(mockRateLimiter.resetAttempts).toHaveBeenCalledWith('test@example.com', 'otp_verify')
    })

    it('should verify SMS OTP for new user', async () => {
      const newUser = {
        id: 'user456',
        email: '',
        phone: '+15551234567',
        eduVerified: false,
        photoUrl: null,
      }

      mockUserRepo.findByPhone.mockResolvedValue(null)
      mockUserRepo.create.mockResolvedValue(newUser)

      const request = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: '+15551234567',
          otp: '654321',
          type: 'sms',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toEqual(newUser)
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        email: '',
        phone: '+15551234567',
        eduVerified: false,
      })
    })

    it('should merge anonymous data into user profile', async () => {
      const existingUser = {
        id: 'user123',
        email: 'test@example.com',
        phone: null,
        eduVerified: false,
        photoUrl: null,
      }

      const anonymousData = {
        referral: 'friend123',
        preferences: { theme: 'dark' },
      }

      mockUserRepo.findByEmail.mockResolvedValue(existingUser)
      mockCookieManager.getAnonymousData.mockReturnValue(anonymousData)

      const request = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'test@example.com',
          otp: '123456',
          type: 'email',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockCookieManager.mergeAnonymousDataIntoUser).toHaveBeenCalledWith('user123', anonymousData)
    })
  })

  describe('Invalid OTP', () => {
    it('should reject invalid OTP', async () => {
      mockOtpManager.verifyOTP.mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'test@example.com',
          otp: '000000',
          type: 'email',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Invalid or expired')
      expect(mockRateLimiter.incrementAttempts).toHaveBeenCalledWith('test@example.com', 'otp_verify')
    })

    it('should reject expired OTP', async () => {
      mockOtpManager.verifyOTP.mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'test@example.com',
          otp: '123456',
          type: 'email',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Invalid or expired')
    })
  })

  describe('Rate Limiting', () => {
    it('should handle verification rate limit exceeded', async () => {
      const rateLimitError = new (class extends Error {
        constructor() {
          super('Too many verification attempts')
          this.name = 'RateLimitError'
        }
        resetTime = Date.now() + 30000
      })()

      mockRateLimiter.checkRateLimit.mockRejectedValue(rateLimitError)

      const request = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'test@example.com',
          otp: '123456',
          type: 'email',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Too many verification attempts')
      expect(data.rateLimitReset).toBeDefined()
    })
  })

  describe('Validation Errors', () => {
    it('should reject invalid email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'invalid-email',
          otp: '123456',
          type: 'email',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Invalid email')
    })

    it('should reject invalid phone format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: '123',
          otp: '123456',
          type: 'sms',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Invalid phone number')
    })

    it('should reject invalid OTP length', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'test@example.com',
          otp: '123',
          type: 'email',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('OTP must be 6 digits')
    })
  })

  describe('Cookie Management', () => {
    it('should clear anonymous data cookies after successful verification', async () => {
      const existingUser = {
        id: 'user123',
        email: 'test@example.com',
        phone: null,
        eduVerified: false,
        photoUrl: null,
      }

      const anonymousData = { referral: 'friend123' }

      mockUserRepo.findByEmail.mockResolvedValue(existingUser)
      mockCookieManager.getAnonymousData.mockReturnValue(anonymousData)

      const request = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'test@example.com',
          otp: '123456',
          type: 'email',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockCookieManager.clearAnonymousData).toHaveBeenCalled()
    })

    it('should set session cookie after successful verification', async () => {
      const existingUser = {
        id: 'user123',
        email: 'test@example.com',
        phone: null,
        eduVerified: false,
        photoUrl: null,
      }

      mockUserRepo.findByEmail.mockResolvedValue(existingUser)

      const request = new NextRequest('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'test@example.com',
          otp: '123456',
          type: 'email',
        }),
      })

      const response = await POST(request)
      const cookies = response.headers.get('set-cookie')

      expect(response.status).toBe(200)
      expect(cookies).toContain('gr_session=user123')
    })
  })
})