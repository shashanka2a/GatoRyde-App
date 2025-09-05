import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST } from '../../app/api/auth/start-otp/route'

// Mock dependencies
jest.mock('@/lib/auth/rate-limit')
jest.mock('@/lib/auth/otp')
jest.mock('@/lib/auth/email')
jest.mock('@/lib/auth/sms')

import { rateLimiter } from '@/lib/auth/rate-limit'
import { otpManager } from '@/lib/auth/otp'
import { sendOTPEmail } from '@/lib/auth/email'
import { sendOTPSMS } from '@/lib/auth/sms'

const mockRateLimiter = rateLimiter as jest.Mocked<typeof rateLimiter>
const mockOtpManager = otpManager as jest.Mocked<typeof otpManager>
const mockSendOTPEmail = sendOTPEmail as jest.MockedFunction<typeof sendOTPEmail>
const mockSendOTPSMS = sendOTPSMS as jest.MockedFunction<typeof sendOTPSMS>

describe('/api/auth/start-otp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRateLimiter.checkRateLimit.mockResolvedValue()
    mockRateLimiter.incrementAttempts.mockResolvedValue()
    mockOtpManager.generateOTP.mockResolvedValue('123456')
    mockSendOTPEmail.mockResolvedValue()
    mockSendOTPSMS.mockResolvedValue()
  })

  describe('Happy Path', () => {
    it('should send email OTP successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/start-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'test@example.com',
          type: 'email',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('email')
      expect(mockRateLimiter.checkRateLimit).toHaveBeenCalledWith('test@example.com', 'otp_request')
      expect(mockOtpManager.generateOTP).toHaveBeenCalledWith('test@example.com', 'email')
      expect(mockSendOTPEmail).toHaveBeenCalledWith('test@example.com', '123456')
      expect(mockRateLimiter.incrementAttempts).toHaveBeenCalledWith('test@example.com', 'otp_request')
    })

    it('should send SMS OTP successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/start-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: '+15551234567',
          type: 'sms',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('phone')
      expect(mockOtpManager.generateOTP).toHaveBeenCalledWith('+15551234567', 'sms')
      expect(mockSendOTPSMS).toHaveBeenCalledWith('+15551234567', '123456')
    })

    it('should set referral cookie when provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/start-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'test@example.com',
          type: 'email',
          referral: 'friend123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Check if referral cookie is set
      const cookies = response.headers.get('set-cookie')
      expect(cookies).toContain('gr_ref=friend123')
    })
  })

  describe('Validation Errors', () => {
    it('should reject invalid email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/start-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'invalid-email',
          type: 'email',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Invalid email')
    })

    it('should reject invalid phone number', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/start-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: '123',
          type: 'sms',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Invalid phone number')
    })

    it('should reject missing identifier', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/start-otp', {
        method: 'POST',
        body: JSON.stringify({
          type: 'email',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should reject invalid type', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/start-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'test@example.com',
          type: 'invalid',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('Rate Limiting', () => {
    it('should handle rate limit exceeded', async () => {
      const rateLimitError = new (class extends Error {
        constructor() {
          super('Rate limit exceeded')
          this.name = 'RateLimitError'
        }
        resetTime = Date.now() + 60000
      })()

      mockRateLimiter.checkRateLimit.mockRejectedValue(rateLimitError)

      const request = new NextRequest('http://localhost:3000/api/auth/start-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'test@example.com',
          type: 'email',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Rate limit')
      expect(data.rateLimitReset).toBeDefined()
    })
  })

  describe('Service Errors', () => {
    it('should handle email sending failure', async () => {
      mockSendOTPEmail.mockRejectedValue(new Error('Email service down'))

      const request = new NextRequest('http://localhost:3000/api/auth/start-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'test@example.com',
          type: 'email',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Failed to send verification code')
    })

    it('should handle SMS sending failure', async () => {
      mockSendOTPSMS.mockRejectedValue(new Error('SMS service down'))

      const request = new NextRequest('http://localhost:3000/api/auth/start-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: '+15551234567',
          type: 'sms',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Failed to send verification code')
    })
  })
})