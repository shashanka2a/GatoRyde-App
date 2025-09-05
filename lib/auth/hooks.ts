'use client'

import { useState } from 'react'
import { StartOTPRequest, VerifyOTPRequest, OTPResponse, VerifyResponse } from './types'

export function useOTPAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startOTP = async (data: StartOTPRequest): Promise<OTPResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/start-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send OTP')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async (data: VerifyOTPRequest): Promise<VerifyResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to verify OTP')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    startOTP,
    verifyOTP,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}