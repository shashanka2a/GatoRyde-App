'use client'

import { useState, useEffect } from 'react'

export interface User {
  id: string
  email: string
  name?: string | null
  eduVerified: boolean
  university?: string | null
  photoUrl?: string | null
  createdAt: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  // Check session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      setAuthState({
        user: data.user || null,
        loading: false,
        error: null
      })
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: 'Failed to check session'
      })
    }
  }

  const sendOTP = async (email: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      return data
    } catch (error) {
      throw error
    }
  }

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await fetch('/api/auth/login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Invalid OTP')
      }

      // Update auth state with new user
      setAuthState({
        user: data.user,
        loading: false,
        error: null
      })

      return data
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })

      setAuthState({
        user: null,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    ...authState,
    sendOTP,
    verifyOTP,
    logout,
    refetch: checkSession
  }
}