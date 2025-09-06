import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string | null
  eduVerified: boolean
  university: string | null
  photoUrl: string | null
  createdAt: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        setState({
          user: data.user,
          isLoading: false,
          isAuthenticated: data.success && !!data.user
        })
      } catch (error) {
        console.error('Failed to fetch session:', error)
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    fetchSession()
  }, [])

  return state
}