'use client'

import { useState, useEffect } from 'react'
// Removed server-side import - using API route instead
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import Link from 'next/link'
import type { SearchFilters, RideWithDriver } from '@/lib/rides/types'
import { getFilterScopeDescription } from '@/lib/rides/university-filter'
import { useAuth } from '@/lib/auth/useAuth'

// Direct imports for now to fix build issues
import { RideSearchForm } from '@/src/components/rides/RideSearchForm'
import { RideList } from '@/src/components/rides/RideList'
import PostRideRequestForm from '@/src/components/rides/PostRideRequestForm'

// Import only essential icons for initial render
import {
  Search,
  Map,
  List,
  Plus,
  AlertTriangle,
  Shield,
  Car,
  MessageSquare
} from 'lucide-react'


export function RidesPageClient() {
  const { user, loading } = useAuth()
  
  // Get user info from auth context (user might be null for unauthenticated users)
  const userEduVerified = user?.eduVerified || false
  const userEmail = user?.email
  const [rides, setRides] = useState<RideWithDriver[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showMapboxWarning, setShowMapboxWarning] = useState(false)
  const [searchType, setSearchType] = useState<'drivers' | 'requests'>('drivers')
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null)
  const [driverEmails, setDriverEmails] = useState<Record<string, string>>({})
  const [showRideRequestForm, setShowRideRequestForm] = useState(false)
  const [rideRequests, setRideRequests] = useState<any[]>([])
  const [allItems, setAllItems] = useState<any[]>([])

  // Optimized initialization - defer non-critical operations
  useEffect(() => {
    // Mark initial load as complete immediately for faster perceived performance
    setIsInitialLoad(false)

    // Preload critical components in the background
    const preloadComponents = () => {
      // Preload heavy components
      import('@/src/components/rides/RideSearchForm')
      import('@/src/components/rides/RideList')
      import('@/src/components/rides/LocationAutocomplete')
    }

    // Defer Mapbox check to avoid blocking initial render
    const checkMapbox = async () => {
      try {
        const { MapboxService } = await import('@/lib/maps/mapbox')
        setShowMapboxWarning(!MapboxService.isAvailable())
      } catch {
        setShowMapboxWarning(true)
      }
    }

    // Get user location in background without blocking UI
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          },
          () => {
            // Silently handle location errors
          },
          { timeout: 5000, enableHighAccuracy: false } // Fast, low-accuracy location
        )
      }
    }

    // Start preloading immediately
    preloadComponents()

    // Run other non-critical operations after a short delay
    setTimeout(() => {
      checkMapbox()
      getUserLocation()
    }, 50)
  }, [])

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true)
    setError(null)
    setHasSearched(true)
    setCurrentFilters(filters)

    try {
      const response = await fetch('/api/rides/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      })

      const result = await response.json()

      if (result.success) {
        // Handle new API response format with both rides and ride requests
        if (result.rides) {
          setRides(result.rides)
        }
        if (result.rideRequests) {
          setRideRequests(result.rideRequests)
        }
        if (result.allItems) {
          setAllItems(result.allItems)
        }

        // Extract driver emails for university badges
        const emails: Record<string, string> = {}
        if (result.rides) {
          result.rides.forEach((ride: any) => {
            if (ride.driverEmail) {
              emails[ride.driver.userId] = ride.driverEmail
            }
          })
        }
        setDriverEmails(emails)
      } else {
        setError(result.message || 'Failed to search rides')
        setRides([])
        setRideRequests([])
        setAllItems([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setError('Failed to search rides. Please try again.')
      setRides([])
      setRideRequests([])
      setAllItems([])
    } finally {
      setIsLoading(false)
    }
  }

  // Show simple loading state for initial render
  if (isInitialLoad) {
    return (
      <div className="min-h-screen">
        {/* Loading Content */}
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="h-96 bg-white rounded-lg shadow-sm animate-pulse" />
              </div>
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-white rounded-lg shadow-sm animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4" id="search-section">
        <div className="max-w-6xl mx-auto">

          {/* Edu Verification Info */}
          {!userEduVerified && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Student Verification:</strong> Verify your .edu email to contact drivers and post rides.
                <Link href="/auth/login" className="ml-2 text-blue-600 hover:text-blue-700 underline font-medium">
                  Verify Now →
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Mapbox Warning */}
          {showMapboxWarning && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Map Features Limited:</strong> Some map functionality may be unavailable. List view is fully functional.
              </AlertDescription>
            </Alert>
          )}

          {/* Mobile-First Search Form */}
          <div className="mb-8">
            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardContent className="p-4 md:p-6">
                <RideSearchForm
                  onSearch={handleSearch}
                  isLoading={isLoading}
                  searchType={searchType}
                  onSearchTypeChange={setSearchType}
                  userEmail={userEmail}
                />
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div>
            <Tabs defaultValue="list" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-white shadow-sm border border-gray-200">
                  <TabsTrigger
                    value="list"
                    className="flex items-center gap-2 data-[state=active]:bg-gray-900 data-[state=active]:text-white"
                  >
                    <List className="w-4 h-4" />
                    List View
                  </TabsTrigger>
                  <TabsTrigger
                    value="map"
                    className="flex items-center gap-2 data-[state=active]:bg-gray-900 data-[state=active]:text-white"
                  >
                    <Map className="w-4 h-4" />
                    Map View
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-3">
                  {/* University Filter Status */}
                  {currentFilters && userEmail && (
                    <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">
                        🎓 {getFilterScopeDescription(userEmail, currentFilters.universityScope)}
                      </p>
                    </div>
                  )}

                  {hasSearched && !isLoading && (
                    <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                      <p className="text-sm font-medium text-gray-700">
                        <span className="text-gray-900 font-bold">{rides.length}</span> ride{rides.length !== 1 ? 's' : ''} found
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription className="text-red-800">
                    <strong>Search Error:</strong> {error}
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="list">
                <RideList
                  rides={rides}
                  rideRequests={rideRequests}
                  allItems={allItems}
                  isLoading={isLoading}
                  emptyMessage={
                    hasSearched
                      ? "No rides or requests match your search criteria. Try adjusting your filters or check back later."
                      : "Search for rides to get started!"
                  }
                  showDistance={!!userLocation}
                  userLocation={userLocation || undefined}
                  userEduVerified={userEduVerified}
                  driverEmails={driverEmails}
                />
              </TabsContent>

              <TabsContent value="map">
                <Card className="shadow-sm border border-gray-200 bg-white">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Map className="w-5 h-5" />
                      Map View
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Interactive map showing ride locations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {showMapboxWarning ? (
                      <div className="text-center py-16">
                        <Map className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          Map View Coming Soon
                        </h3>
                        <p className="text-gray-600 mb-4 max-w-md mx-auto">
                          We're working on bringing you an interactive map experience.
                          For now, use the list view to browse available rides.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => (document.querySelector('[value="list"]') as HTMLElement)?.click()}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <List className="w-4 h-4 mr-2" />
                          Switch to List View
                        </Button>
                      </div>
                    ) : (
                      <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                        <div className="text-center">
                          <Map className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Interactive Map Loading...
                          </h3>
                          <p className="text-gray-600">
                            Preparing your personalized ride map
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Empty State with Context-Aware CTAs */}
        {rides.length === 0 && hasSearched && !isLoading && !error && (
          <div className="mt-12">
            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardContent className="text-center py-12">
                <div>
                  {searchType === 'drivers' ? (
                    <Car className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  ) : (
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  )}
                </div>

                {searchType === 'drivers' ? (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      No rides yet for this day
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Be the first to offer a ride on this route! Post a request to let drivers know you need a ride.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button
                        onClick={() => setShowRideRequestForm(true)}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 px-8 py-4 font-semibold"
                      >
                        <MessageSquare className="w-5 h-5 mr-3" />
                        Post Ride Request
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => window.location.reload()}
                        className="border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 px-8 py-4 font-semibold"
                      >
                        <Search className="w-5 h-5 mr-3" />
                        Search Again
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      No requests yet
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Be the first to help fellow students! Offer a ride and start earning.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Link href="/rides/create">
                        <Button
                          size="lg"
                          className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md transition-all duration-200 px-8 py-4 font-semibold"
                        >
                          <Plus className="w-5 h-5 mr-3" />
                          Offer a Ride
                        </Button>
                      </Link>
                      <Button
                        onClick={() => setSearchType('drivers')}
                        variant="outline"
                        size="lg"
                        className="border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 px-8 py-4 font-semibold"
                      >
                        <Car className="w-5 h-5 mr-3" />
                        Find Drivers
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Ride Request Form Modal */}
      {showRideRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PostRideRequestForm
              onSuccess={() => {
                setShowRideRequestForm(false)
                // Optionally refresh the page or show success message
                window.location.reload()
              }}
              onCancel={() => setShowRideRequestForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}