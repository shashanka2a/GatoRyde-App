'use client'

import { useState, useEffect } from 'react'
import { LocationAutocomplete } from '@/src/components/rides/LocationAutocomplete'
import { RideResultCard } from '@/src/components/ride/RideResultCard'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Switch } from '@/src/components/ui/switch'
import { Label } from '@/src/components/ui/label'
import { type Location } from '@/lib/maps/mapbox'
import { Search, ArrowUpDown, Calendar, Plus, Car, Users, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface RidePageClientProps {
  userEduVerified: boolean
}

interface RideResult {
  id: string
  originText: string
  destText: string
  departAt: Date
  seatsTotal: number
  seatsAvailable: number
  totalTripCostCents: number
  driver: {
    user: {
      id: string
      name: string | null
      email: string
      phone: string | null
      photoUrl: string | null
      ratingAvg: number | null
      ratingCount: number
      eduVerified: boolean
    }
    vehicle: {
      make: string
      model: string
      year: number
      color: string
      seats: number
    } | null
  }
  driverVerificationLevel: 'BASIC' | 'ENHANCED' | 'UNVERIFIED'
  originDistance?: number
  destDistance?: number
  overallScore?: number
}

interface SearchFilters {
  origin: Location | null
  destination: Location | null
  departureDate: string
  returnDate?: string
  passengers: number
  isRoundTrip: boolean
}

export function RidePageClient({ userEduVerified }: RidePageClientProps) {
  const [rides, setRides] = useState<RideResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search filters state
  const [filters, setFilters] = useState<SearchFilters>({
    origin: null,
    destination: null,
    departureDate: '',
    returnDate: '',
    passengers: 1,
    isRoundTrip: false
  })

  // Date chips for quick selection
  const getDateChips = () => {
    const today = new Date()
    const chips = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      chips.push({
        date: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      })
    }
    return chips
  }

  // Initialize with today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setFilters(prev => ({ ...prev, departureDate: today }))
  }, [])

  const handleLocationSwap = () => {
    setFilters(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }))
  }

  const handleSearch = async () => {
    if (!filters.origin || !filters.destination) {
      setError('Please select both pickup and destination locations')
      return
    }

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      // Mock search - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setRides([]) // Mock empty results for now
    } catch (err) {
      setError('Failed to search for rides. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <Car className="w-12 h-12 text-teal-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">No rides found</h3>
        <p className="text-gray-600 mb-8">
          We couldn't find any rides matching your search. Why not create one?
        </p>
        <div className="space-y-3">
          <Link href="/rides/create">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Offer a Ride
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="w-full">
            <Users className="w-5 h-5 mr-2" />
            Post a Ride Request
          </Button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Ride</h1>
            <p className="text-xl text-teal-100">
              Connect with verified students heading your way
            </p>
          </motion.div>

          {/* Search Form */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-6">
              {/* Trip Type Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="px-4 py-2">
                    <Car className="w-4 h-4 mr-2" />
                    Rideshare
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <Label htmlFor="round-trip" className="text-sm font-medium">
                    Round trip
                  </Label>
                  <Switch
                    id="round-trip"
                    checked={filters.isRoundTrip}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, isRoundTrip: checked }))
                    }
                  />
                </div>
              </div>

              {/* Location Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                <div className="md:col-span-5">
                  <LocationAutocomplete
                    label="From"
                    placeholder="Pickup location"
                    value={filters.origin}
                    onChange={(location) => 
                      setFilters(prev => ({ ...prev, origin: location }))
                    }
                  />
                </div>
                
                <div className="md:col-span-2 flex items-end justify-center pb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLocationSwap}
                    className="rounded-full p-2 hover:bg-gray-100"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="md:col-span-5">
                  <LocationAutocomplete
                    label="To"
                    placeholder="Destination"
                    value={filters.destination}
                    onChange={(location) => 
                      setFilters(prev => ({ ...prev, destination: location }))
                    }
                  />
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-4 mb-6">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Departure Date
                </Label>
                <div className="flex flex-wrap gap-2">
                  {getDateChips().map((chip) => (
                    <Button
                      key={chip.date}
                      variant={filters.departureDate === chip.date ? "default" : "outline"}
                      size="sm"
                      onClick={() => 
                        setFilters(prev => ({ ...prev, departureDate: chip.date }))
                      }
                      className={cn(
                        "transition-all duration-200",
                        filters.departureDate === chip.date 
                          ? "bg-teal-600 hover:bg-teal-700" 
                          : "hover:bg-teal-50 hover:border-teal-300"
                      )}
                    >
                      {chip.label}
                    </Button>
                  ))}
                </div>

                {filters.isRoundTrip && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium mb-2 block">Return Date</Label>
                    <div className="flex flex-wrap gap-2">
                      {getDateChips().map((chip) => (
                        <Button
                          key={`return-${chip.date}`}
                          variant={filters.returnDate === chip.date ? "default" : "outline"}
                          size="sm"
                          onClick={() => 
                            setFilters(prev => ({ ...prev, returnDate: chip.date }))
                          }
                          className={cn(
                            "transition-all duration-200",
                            filters.returnDate === chip.date 
                              ? "bg-teal-600 hover:bg-teal-700" 
                              : "hover:bg-teal-50 hover:border-teal-300"
                          )}
                        >
                          {chip.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Passengers */}
              <div className="flex items-center justify-between mb-6">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Passengers
                </Label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => 
                      setFilters(prev => ({ 
                        ...prev, 
                        passengers: Math.max(1, prev.passengers - 1) 
                      }))
                    }
                    disabled={filters.passengers <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-medium">{filters.passengers}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => 
                      setFilters(prev => ({ 
                        ...prev, 
                        passengers: Math.min(8, prev.passengers + 1) 
                      }))
                    }
                    disabled={filters.passengers >= 8}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                disabled={isLoading || !filters.origin || !filters.destination}
                size="lg"
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search Rides
                  </>
                )}
              </Button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
              <p className="text-gray-600">Finding the best rides for you...</p>
            </motion.div>
          ) : hasSearched && rides.length === 0 ? (
            <EmptyState key="empty" />
          ) : rides.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {rides.length} ride{rides.length !== 1 ? 's' : ''} found
                </h2>
                <Button variant="outline" size="sm">
                  <Clock className="w-4 h-4 mr-2" />
                  Sort by time
                </Button>
              </div>
              {rides.map((ride) => (
                <RideResultCard key={ride.id} ride={ride} userEduVerified={userEduVerified} />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}