'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/src/components/ui/button'
import { 
  Bell,
  Settings,
  Search,
  Car,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppNavigation() {
  const pathname = usePathname()

  // Check if user needs onboarding
  const getDriveHref = () => {
    if (typeof window !== 'undefined') {
      const hasDriverProfile = localStorage.getItem('hasDriverProfile')
      return hasDriverProfile ? '/rides/create' : '/driver/onboarding'
    }
    return '/rides/create'
  }

  const navigationItems = [
    { href: '/rides', label: 'Find Ride', icon: Search },
    { href: getDriveHref(), label: 'Drive', icon: Car },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  const isActive = (href: string) => {
    if (href === '/rides') {
      return pathname === '/rides' || pathname === '/' || (pathname.startsWith('/rides') && !pathname.startsWith('/rides/create'))
    }
    if (href === '/rides/create' || href === '/driver/onboarding') {
      return pathname === '/rides/create' || pathname.startsWith('/rides/create') || pathname === '/driver/onboarding' || pathname.startsWith('/driver/onboarding')
    }
    if (href === '/profile') {
      return pathname === '/profile' || pathname.startsWith('/profile')
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Acts as home button */}
            <Link href="/rides" className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white w-8 h-8 rounded-lg font-bold text-lg flex items-center justify-center">
                R
              </div>
              <span className="text-xl text-gray-900 font-bold">Rydify</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                      active
                        ? "text-teal-600 bg-teal-50"
                        : "text-gray-600 hover:text-teal-600 hover:bg-teal-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {active && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Spacer for mobile layout */}
            <div className="md:hidden">
            </div>
          </div>
        </div>
      </nav>
  )
}