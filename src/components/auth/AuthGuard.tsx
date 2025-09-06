'use client'

import { useAuth } from '@/lib/auth/useAuth'
import { Button } from '@/src/components/ui/button'
import { Shield, Mail, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
  showLoginPrompt?: boolean
}

export function AuthGuard({ 
  children, 
  fallback, 
  requireAuth = true,
  showLoginPrompt = true 
}: AuthGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showLoginPrompt) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-lg border">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">
            You need to verify your .edu email to access this feature.
          </p>
          <Link href="/auth/login">
            <Button>
              <Mail className="h-4 w-4 mr-2" />
              Sign in with .edu Email
            </Button>
          </Link>
        </div>
      )
    }

    return null
  }

  if (requireAuth && user && !user.eduVerified) {
    return (
      <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Email Verification Required</h3>
        <p className="text-gray-600 mb-4">
          Please verify your .edu email address to access this feature.
        </p>
        <Link href="/auth/login">
          <Button variant="outline">
            Complete Verification
          </Button>
        </Link>
      </div>
    )
  }

  return <>{children}</>
}

// Hook for checking auth status in components
export function useAuthGuard() {
  const { user, loading } = useAuth()
  
  return {
    isAuthenticated: !!user,
    isVerified: !!user?.eduVerified,
    loading,
    user
  }
}