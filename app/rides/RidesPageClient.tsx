'use client'

import { useState, useEffect } from 'react'
import { searchRides } from '@/lib/rides/actions'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import Link from 'next/link'
import type { SearchFilters, RideWithDriver } from '@/lib/rides/types'

// Direct imports for now to fix build issues
import { RideSearchForm } from '@/src/components/rides/RideSearchForm'
import { RideList } from '@/src/components/rides/RideList'

// Import only essential icons for initial render
import {
  Search,
  Map,
  List,
  Plus,
  AlertTriangle,
  Users,
  MapPin,
  Shield,
  Car,
  MessageSquare
} from 'lucide-react'


interface RidesPageClientProps {
  userEduVerified: boolean
}

export function RidesPageClient({ userEduVerified }: RidesPageClientProps) {
  const [rides, setRides] = useState<RideWithDriver[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showMapboxWarning, setShowMapboxWarning] = useState(false)
  const [searchType, setSearchType] = useState<'drivers' | 'requests'>('drivers')

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

    try {
      const result = await searchRides(filters)

      if (result.success && result.data) {
        setRides(result.data.rides)
      } else {
        setError(result.message || 'Failed to search rides')
        setRides([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setError('Failed to search rides. Please try again.')
      setRides([])
    } finally {
      setIsLoading(false)
    }
  }

  // Show simple loading state for initial render
  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
          <div className="container mx-auto py-12 px-4">
            <div className="max-w-6xl mx-auto text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Search className="w-12 h-12 text-yellow-300" />
                <h1 className="text-3xl lg:text-4xl font-bold">Find Ride</h1>
                <Car className="w-12 h-12 text-yellow-300" />
              </div>
              <p className="text-xl text-teal-100 mb-6 max-w-2xl mx-auto">
                Connect with verified students heading your way
              </p>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="h-96 bg-white rounded-lg shadow-xl animate-pulse" />
              </div>
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-white rounded-lg shadow-xl animate-pulse" />
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* Simplified Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Car className="w-8 h-8 text-yellow-300" />
                <h1 className="text-2xl lg:text-3xl font-bold">Find Rides</h1>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full">
                <Shield className="h-4 w-4" />
                <span>Verified Students Only</span>
              </div>
            </div>
            <p className="text-teal-100 max-w-xl">
              Connect with verified students for safe, affordable campus transportation
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 pb-24 md:pb-8" id="search-section">
        <div className="max-w-6xl mx-auto">

          {/* Edu Verification Warning */}
          {!userEduVerified && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Verification Required:</strong> Complete your student verification to contact drivers and join rides.
                <Link href="/dashboard/kyc" className="ml-2 text-orange-600 hover:text-orange-700 underline font-medium">
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
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-4 md:p-6">
                <RideSearchForm
                  onSearch={handleSearch}
                  isLoading={isLoading}
                  searchType={searchType}
                  onSearchTypeChange={setSearchType}
                />
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div>
            <Tabs defaultValue="list" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-white shadow-lg border-0">
                  <TabsTrigger
                    value="list"
                    className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white"
                  >
                    <List className="w-4 h-4" />
                    List View
                  </TabsTrigger>
                  <TabsTrigger
                    value="map"
                    className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white"
                  >
                    <Map className="w-4 h-4" />
                    Map View
                  </TabsTrigger>
                </TabsList>

                {hasSearched && !isLoading && (
                  <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">
                      <span className="text-teal-600 font-bold">{rides.length}</span> ride{rides.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                )}
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
                  isLoading={isLoading}
                  emptyMessage={
                    hasSearched
                      ? "No rides match your search criteria. Try adjusting your filters or check back later."
                      : "Search for rides to get started!"
                  }
                  showDistance={!!userLocation}
                  userLocation={userLocation || undefined}
                  userEduVerified={userEduVerified}
                />
              </TabsContent>

              <TabsContent value="map">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Map className="w-5 h-5" />
                      Map View
                    </CardTitle>
                    <CardDescription className="text-teal-100">
                      Interactive map showing ride locations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {showMapboxWarning ? (
                      <div className="text-center py-16">
                        <Map className="w-16 h-16 text-teal-400 mx-auto mb-6" />
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
                          className="border-teal-600 text-teal-600 hover:bg-teal-50"
                        >
                          <List className="w-4 h-4 mr-2" />
                          Switch to List View
                        </Button>
                      </div>
                    ) : (
                      <div className="h-96 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg flex items-center justify-center border border-teal-200">
                        <div className="text-center">
                          <Map className="w-16 h-16 text-teal-500 mx-auto mb-4" />
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
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-1">
                <div className="bg-white rounded-lg">
                  <CardContent className="text-center py-12">
                    <div>
                      {searchType === 'drivers' ? (
                        <Car className="w-16 h-16 text-teal-500 mx-auto mb-6" />
                      ) : (
                        <MessageSquare className="w-16 h-16 text-teal-500 mx-auto mb-6" />
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
                            onClick={() => setSearchType('requests')}
                            size="lg"
                            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-4 font-semibold"
                          >
                            <MessageSquare className="w-5 h-5 mr-3" />
                            Post Ride Request
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => window.location.reload()}
                            className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-4 font-semibold"
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
                              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-4 font-semibold"
                            >
                              <Plus className="w-5 h-5 mr-3" />
                              Offer a Ride
                            </Button>
                          </Link>
                          <Button
                            onClick={() => setSearchType('drivers')}
                            variant="outline"
                            size="lg"
                            className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-4 font-semibold"
                          >
                            <Car className="w-5 h-5 mr-3" />
                            Find Drivers
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}