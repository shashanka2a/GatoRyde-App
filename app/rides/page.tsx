import { RidesPageClient } from './RidesPageClient'
import { Suspense } from 'react'

// Add metadata for better SEO and performance
export const metadata = {
  title: 'Find Rides - Rydify',
  description: 'Find safe, verified rides with fellow university students',
}

// Enable static generation for better performance
export const dynamic = 'force-dynamic' // Since we need user-specific data

export default async function RidesPage() {
  // This page is open access - no authentication required
  // Authentication state will be handled client-side for UI gating
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
          <div className="container mx-auto py-12 px-4">
            <div className="max-w-6xl mx-auto text-center">
              <h1 className="text-3xl lg:text-4xl font-bold mb-6">Find Ride</h1>
              <p className="text-xl text-teal-100">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <RidesPageClient />
    </Suspense>
  )
}