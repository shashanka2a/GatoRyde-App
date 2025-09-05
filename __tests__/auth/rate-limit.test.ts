import { describe, it, expect, beforeEach } from '@jest/globals'
import { RateLimiter } from '../../lib/auth/rate-limit'
import { RateLimitError } from '../../lib/auth/types'

describe('RateLimiter', () => {
  let limiter: RateLimiter

  beforeEach(() => {
    limiter = new RateLimiter()
    // Clear any existing rate limit data
    ;(limiter as any).rateLimitStore?.clear()
  })

  describe('checkRateLimit', () => {
    it('should allow request when under limit', async () => {
      // First request should be allowed
      await expect(
        limiter.checkRateLimit('test@example.com', 'otp_request')
      ).resolves.not.toThrow()
    })

    it('should throw RateLimitError when max attempts reached', async () => {
      // Simulate reaching max attempts (3 for otp_request)
      await limiter.incrementAttempts('test@example.com', 'otp_request')
      await limiter.incrementAttempts('test@example.com', 'otp_request')
      await limiter.incrementAttempts('test@example.com', 'otp_request')

      await expect(
        limiter.checkRateLimit('test@example.com', 'otp_request')
      ).rejects.toThrow(RateLimitError)
    })

    it('should allow request for different identifier', async () => {
      // Block one user
      await limiter.incrementAttempts('blocked@example.com', 'otp_request')
      await limiter.incrementAttempts('blocked@example.com', 'otp_request')
      await limiter.incrementAttempts('blocked@example.com', 'otp_request')

      // Different user should still be allowed
      await expect(
        limiter.checkRateLimit('allowed@example.com', 'otp_request')
      ).resolves.not.toThrow()
    })
  })

  describe('incrementAttempts', () => {
    it('should track attempts correctly', async () => {
      await limiter.incrementAttempts('test@example.com', 'otp_request')
      
      const result = await limiter.getRemainingAttempts('test@example.com', 'otp_request')
      expect(result.remaining).toBe(2) // 3 max - 1 used = 2 remaining
    })

    it('should increment existing attempts', async () => {
      await limiter.incrementAttempts('test@example.com', 'otp_request')
      await limiter.incrementAttempts('test@example.com', 'otp_request')

      const result = await limiter.getRemainingAttempts('test@example.com', 'otp_request')
      expect(result.remaining).toBe(1) // 3 max - 2 used = 1 remaining
    })
  })

  describe('resetAttempts', () => {
    it('should reset attempts to zero', async () => {
      // Add some attempts
      await limiter.incrementAttempts('test@example.com', 'otp_request')
      await limiter.incrementAttempts('test@example.com', 'otp_request')

      // Reset attempts
      await limiter.resetAttempts('test@example.com', 'otp_request')

      // Should be back to max attempts
      const result = await limiter.getRemainingAttempts('test@example.com', 'otp_request')
      expect(result.remaining).toBe(3)
    })
  })

  describe('getRemainingAttempts', () => {
    it('should return correct remaining attempts and reset time', async () => {
      await limiter.incrementAttempts('test@example.com', 'otp_request')
      await limiter.incrementAttempts('test@example.com', 'otp_request')

      const result = await limiter.getRemainingAttempts('test@example.com', 'otp_request')

      expect(result.remaining).toBe(1) // 3 max - 2 used = 1 remaining
      expect(result.resetTime).toBeGreaterThan(Date.now())
    })

    it('should return max attempts when no attempts recorded', async () => {
      const result = await limiter.getRemainingAttempts('test@example.com', 'otp_request')

      expect(result.remaining).toBe(3) // Max attempts for OTP requests
      expect(result.resetTime).toBe(0)
    })

    it('should not return negative remaining attempts', async () => {
      // Exceed max attempts
      for (let i = 0; i < 5; i++) {
        await limiter.incrementAttempts('test@example.com', 'otp_request')
      }

      const result = await limiter.getRemainingAttempts('test@example.com', 'otp_request')
      expect(result.remaining).toBe(0)
    })
  })

  describe('Different action types', () => {
    it('should use different limits for otp_verify', async () => {
      // otp_verify allows 5 attempts vs 3 for otp_request
      for (let i = 0; i < 4; i++) {
        await limiter.incrementAttempts('test@example.com', 'otp_verify')
      }

      await expect(
        limiter.checkRateLimit('test@example.com', 'otp_verify')
      ).resolves.not.toThrow()
    })

    it('should block otp_verify after 5 attempts', async () => {
      // Reach max verify attempts (5)
      for (let i = 0; i < 5; i++) {
        await limiter.incrementAttempts('test@example.com', 'otp_verify')
      }

      await expect(
        limiter.checkRateLimit('test@example.com', 'otp_verify')
      ).rejects.toThrow(RateLimitError)
    })

    it('should track otp_request and otp_verify separately', async () => {
      // Max out otp_request
      for (let i = 0; i < 3; i++) {
        await limiter.incrementAttempts('test@example.com', 'otp_request')
      }

      // otp_verify should still be available
      await expect(
        limiter.checkRateLimit('test@example.com', 'otp_verify')
      ).resolves.not.toThrow()
    })
  })
})