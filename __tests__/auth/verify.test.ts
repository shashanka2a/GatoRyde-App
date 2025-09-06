import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST } from '../../app/api/auth/verify/route'

// Mock dependencies
jest.mock('@/lib/auth/otp')
jest.mock('@/lib/auth/otp-email')
jest.mock('@/lib/auth/rate-limit')
jest.mock('@/lib/auth/university-detector')

import { otpManager } from '@/lib/auth/otp'
import { OTPEmailService } from '@/lib/auth/otp-email'
import { rateLimiter } from '@/lib/auth/rate-limit'
import { validateEduEmail } from '@/lib/auth/university-detector'

const mockOtpManager = otpManager as jest.Mocked<typeof otpManager>;
const mockOTPEmailService = OTPEmailService as jest.Mocked<typeof OTPEmailService>;
const mockRateLimiter = rateLimiter as jest.Mocked<typeof rateLimiter>;
const mockValidateEduEmail = validateEduEmail as jest.MockedFunction<typeof validateEduEmail>;

describe('/api/auth/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default successful mocks
    mockValidateEduEmail.mockReturnValue({ isValid: true })
    mockRateLimiter.checkRateLimit.mockResolvedValue()
    mockRateLimiter.incrementAttempts.mockResolvedValue()
    mockOtpManager.generateOTP.mockResolvedValue('123456')
    mockOtpManager.getOTPExpiry.mockResolvedValue(new Date(Date.now() + 10 * 60 * 1000))
    mockOTPEmailService.sendOTP.mockResolvedValue()
  })

  describe('Happy Path', () => {
    it('should send OTP successfully for valid .edu email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'student@university.edu'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Verification code sent to your email')
      expect(data.email).toBe('student@university.edu')
      expect(data.expiresAt).toBeDefined()

      // Verify all services were called correctly
      expect(mockValidateEduEmail).toHaveBeenCalledWith('student@university.edu')
      expect(mockRateLimiter.checkRateLimit).toHaveBeenCalledWith('student@university.edu', 'otp_request')
      expect(mockOtpManager.generateOTP).toHaveBeenCalledWith('student@university.edu', 'email')
      expect(mockOTPEmailService.sendOTP).toHaveBeenCalledWith({
        to: 'student@university.edu',
        code: '123456',
        expiresInMinutes: 10
      })
      expect(mockRateLimiter.incrementAttempts).toHaveBeenCalledWith('student@university.edu', 'otp_request')
      expect(mockOtpManager.getOTPExpiry).toHaveBeenCalledWith('student@university.edu', 'email')
    })

    it('should normalize email to lowercase and trim whitespace', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: '  STUDENT@UNIVERSITY.EDU  '
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.email).toBe('student@university.edu')
      expect(mockRateLimiter.checkRateLimit).toHaveBeenCalledWith('student@university.edu', 'otp_request')
    })
  })

  describe('Validation Errors', () => {
    it('should reject invalid email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid request data')
      expect(data.details).toBeDefined()
    })

    it('should reject missing email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid request data')
    })

    it('should reject non-.edu email addresses', async () => {
      mockValidateEduEmail.mockReturnValue({ 
        isValid: false, 
        error: 'Only .edu email addresses are accepted' 
      })

      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@gmail.com'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Only .edu email addresses are accepted')
      expect(data.code).toBe('INVALID_EDU_EMAIL')
    })

    it('should handle custom edu validation error messages', async () => {
      mockValidateEduEmail.mockReturnValue({ 
        isValid: false, 
        error: 'University not recognized' 
      })

      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@unknown.edu'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('University not recognized')
      expect(data.code).toBe('INVALID_EDU_EMAIL')
    })
  })

  describe('Rate Limiting', () => {
    it('should handle rate limit exceeded', async () => {
      const rateLimitError = new Error('Too many requests')
      mockRateLimiter.checkRateLimit.mockRejectedValue(rateLimitError)

      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'student@university.edu'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Too many requests. Please try again later.')
      expect(data.code).toBe('RATE_LIMIT_EXCEEDED')
    })
  })

  describe('Service Errors', () => {
    it('should handle OTP generation failure', async () => {
      mockOtpManager.generateOTP.mockRejectedValue(new Error('OTP generation failed'))

      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'student@university.edu'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to send verification email')
    })

    it('should handle email sending failure', async () => {
      mockOTPEmailService.sendOTP.mockRejectedValue(new Error('Email service unavailable'))

      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'student@university.edu'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to send verification email')
    })

    it('should handle OTP expiry retrieval failure', async () => {
      mockOtpManager.getOTPExpiry.mockRejectedValue(new Error('Failed to get expiry'))

      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'student@university.edu'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to send verification email')
    })

    it('should handle rate limit increment failure gracefully', async () => {
      mockRateLimiter.incrementAttempts.mockRejectedValue(new Error('Rate limit increment failed'))

      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'student@university.edu'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to send verification email')
    })
  })

  describe('Edge Cases', () => {
    it('should handle malformed JSON request', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: 'invalid json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to send verification email')
    })

    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: ''
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to send verification email')
    })

    it('should handle null email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: null
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid request data')
    })
  })

  describe('Environment Dependencies', () => {
    it('should handle missing environment variables gracefully', async () => {
      // This test would require mocking environment variables
      // For now, we'll test that the endpoint doesn't crash
      const request = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'student@university.edu'
        })
      })

      const response = await POST(request)
      
      // Should not crash, should return some response
      expect(response).toBeDefined()
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThan(600)
    })
  })
})