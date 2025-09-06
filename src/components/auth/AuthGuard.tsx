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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 dark:border-teal-400"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showLoginPrompt) {
      return (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need to verify your .edu email to access this feature.
          </p>
          <Link href="/auth/login">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200">
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
      <div className="text-center p-8 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 shadow-md">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Verification Required</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please verify your .edu email address to access this feature.
        </p>
        <Link href="/auth/login">
          <Button 
            variant="outline" 
            className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/30 rounded-xl px-6 py-3 font-medium transition-all duration-200"
          >
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