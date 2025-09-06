'use client'

import { useAuth } from '@/lib/auth/useAuth'
import { AuthNavigation } from '@/src/components/auth/AuthNavigation'
import { OfferRideButton, PostRequestButton } from '@/src/components/auth/ProtectedActions'
import Link from 'next/link'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Rydify</h1>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/ride" className="text-gray-600 hover:text-gray-900">
                Find Rides
              </Link>
              <Link href="/ride/search" className="text-gray-600 hover:text-gray-900">
                Search
              </Link>
            </nav>

            {/* Auth & Actions */}
            <div className="flex items-center space-x-4">
              <OfferRideButton className="hidden sm:flex" />
              <PostRequestButton className="hidden sm:flex" />
              <AuthNavigation />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Rydify. Safe rides for students.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Auth status indicator for debugging
export function AuthStatus() {
  const { user, loading } = useAuth()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs">
      {loading ? 'Loading...' : user ? `✅ ${user.email}` : '❌ Not signed in'}
    </div>
  )
}