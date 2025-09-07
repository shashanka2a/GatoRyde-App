'use client'

import { usePathname } from 'next/navigation'

export function DebugNavigation() {
  const pathname = usePathname()
  
  const isActive = (href: string, label: string) => {
    if (href === '/rides') {
      return pathname === '/rides' || pathname === '/browse-rides' || pathname === '/ride' || pathname === '/'
    }
    if (label === 'Drive') {
      // Check for all possible drive-related paths
      return pathname === '/rides/create' || 
             pathname.startsWith('/rides/create') || 
             pathname === '/driver/onboarding' || 
             pathname.startsWith('/driver/onboarding') ||
             pathname === '/drive' ||
             pathname.startsWith('/drive') ||
             pathname.startsWith('/dashboard/driver')
    }
    if (href === '/profile') {
      return pathname === '/profile' || pathname.startsWith('/profile')
    }
    return pathname.startsWith(href)
  }

  const navigationItems = [
    { href: '/rides', label: 'Search' },
    { href: '/rides/create', label: 'Drive' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <div className="fixed top-20 right-4 bg-white p-4 border rounded shadow-lg z-50 text-sm">
      <div className="font-bold mb-2">Debug Navigation</div>
      <div>Current pathname: <code>{pathname}</code></div>
      <div className="mt-2">
        {navigationItems.map((item) => {
          const active = isActive(item.href, item.label)
          return (
            <div key={item.href} className={active ? 'text-teal-600 font-bold' : 'text-gray-500'}>
              {item.label}: {active ? 'ACTIVE' : 'inactive'} (href: {item.href})
            </div>
          )
        })}
      </div>
    </div>
  )
}
