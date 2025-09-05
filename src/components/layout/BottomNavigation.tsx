'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Search, 
  Car, 
  User
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function BottomNavigation() {
  const pathname = usePathname()

  const navigationItems = [
    { href: '/rides', label: 'Find Ride', icon: Search },
    { href: '/rides/create', label: 'Drive', icon: Car },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  const isActive = (href: string) => {
    if (href === '/rides') {
      return pathname === '/rides' || pathname === '/' || (pathname.startsWith('/rides') && !pathname.startsWith('/rides/create'))
    }
    if (href === '/rides/create') {
      return pathname === '/rides/create' || pathname.startsWith('/rides/create')
    }
    if (href === '/profile') {
      return pathname === '/profile' || pathname.startsWith('/profile')
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden">
      <div className="grid grid-cols-3 h-16">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200 relative",
                active
                  ? "text-teal-600"
                  : "text-gray-400 hover:text-teal-600"
              )}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1"
              >
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  active ? "text-teal-600" : "text-gray-500"
                )} />
                <span className={cn(
                  "text-xs transition-all duration-200",
                  active ? "text-teal-600 font-semibold" : "text-gray-500"
                )}>
                  {item.label}
                </span>
              </motion.div>
              
              {active && (
                <motion.div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-teal-600 rounded-full"
                  layoutId="activeBottomTab"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}