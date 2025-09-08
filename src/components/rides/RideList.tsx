'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { DriverCardBadge } from '@/src/components/driver/VerificationBadge'
import { 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Star, 
  Car,
  ArrowRight,
  Calendar,
  Route
} from 'lucide-react'
import { 
  formatPrice, 
  formatDepartureTime, 
  getRideStatusColor,
  getRideStatusText,
  calculateDistance,
  calculateCostPerPerson,
  type RideWithDriver 
} from '@/lib/rides/types'
import { ContactDriverModal } from './ContactDriverModal'
import { UniversityBadge } from './UniversityBadge'
import { RideRequestCard } from './RideRequestCard'
import { cn } from '@/lib/utils'

interface RideListProps {
  rides: RideWithDriver[]
  rideRequests?: any[] // Ride requests from API
  allItems?: any[] // Combined rides and requests
  isLoading?: boolean
  emptyMessage?: string
  showDistance?: boolean
  userLocation?: { lat: number; lng: number }
  userEduVerified?: boolean
  className?: string
  driverEmails?: Record<string, string> // Map of driverId to email for university badges
}

export function RideList({ 
  rides, 
  rideRequests = [],
  allItems = [],
  isLoading = false, 
  emptyMessage = "No rides found",
  showDistance = false,
  userLocation,
  userEduVerified = false,
  className,
  driverEmails = {}
}: RideListProps) {
  const [expandedRide, setExpandedRide] = useState<string | null>(null)

  const getDistanceFromUser = (ride: RideWithDriver): string | null => {
    if (!showDistance || !userLocation) return null
    
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      ride.originLat,
      ride.originLng
    )
    
    return `${distance.toFixed(1)} km away`
  }

  const getRatingDisplay = (rating: number | null, count: number): string => {
    if (!rating || count === 0) return 'New driver'
    return `${rating.toFixed(1)} (${count} reviews)`
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-0.5">
              <div className="bg-white rounded-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (rides.length === 0) {
    return (
      <Card className={cn('shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden', className)}>
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-1">
          <div className="bg-white rounded-lg">
            <CardContent className="text-center py-16">
              <Car className="w-16 h-16 text-teal-500 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Rides Available</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">{emptyMessage}</p>
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/rides/create">
                  <Car className="w-5 h-5 mr-2" />
                  Offer a Ride
                </Link>
              </Button>
            </CardContent>
          </div>
        </div>
      </Card>
    )
  }

  // Combine rides and ride requests for display
  const displayItems = allItems.length > 0 ? allItems : rides

  return (
    <div className={cn('space-y-6', className)}>
      {displayItems.map((item) => {
        // Handle ride requests
        if (item.type === 'request') {
          return (
            <RideRequestCard
              key={item.id}
              request={item}
              showDistance={showDistance}
              userLocation={userLocation}
              userEduVerified={userEduVerified}
            />
          )
        }

        // Handle regular rides
        const ride = item as RideWithDriver
        const isExpanded = expandedRide === ride.id
        const distanceFromUser = getDistanceFromUser(ride)
        
        return (
          <Card key={ride.id} className="hover:shadow-xl transition-all duration-300 max-w-full min-w-0 overflow-hidden border-0 bg-white shadow-md hover:shadow-lg">
            <CardContent className="p-4">
              {/* Primary Info Row - Departure Time & Price */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-lg font-bold text-gray-900">
                      {formatDepartureTime(ride.departAt)}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gray-200" />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {ride.seatsAvailable}/{ride.seatsTotal}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(calculateCostPerPerson(ride.totalTripCostCents, ride.seatsTotal, ride.seatsAvailable))}
                  </div>
                  <div className="text-xs text-gray-500">per person</div>
                </div>
              </div>

              {/* Route Info */}
              <div className="flex items-center gap-2 mb-3 py-2 px-3 bg-gray-50 rounded-lg">
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate flex-1">
                  {ride.originText}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate flex-1">
                  {ride.destText}
                </span>
              </div>

              {/* Driver Info - Secondary */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={ride.driver.user.photoUrl || undefined} 
                    alt={ride.driver.user.name || 'Driver'} 
                  />
                  <AvatarFallback className="text-sm">
                    {ride.driver.user.name?.charAt(0) || 'D'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {ride.driver.user.name || 'Anonymous Driver'}
                    </span>
                    <DriverCardBadge 
                      driver={ride.driver} 
                      size="sm"
                    />
                    <UniversityBadge 
                      driverEmail={driverEmails[ride.driver.userId]}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>{getRatingDisplay(ride.driver.user.ratingAvg, ride.driver.user.ratingCount)}</span>
                    </div>
                    {ride.driver.vehicle && (
                      <>
                        <div className="w-px h-3 bg-gray-300" />
                        <div className="flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          <span className="truncate">
                            {ride.driver.vehicle.color} {ride.driver.vehicle.make}
                          </span>
                        </div>
                      </>
                    )}
                    {distanceFromUser && (
                      <>
                        <div className="w-px h-3 bg-gray-300" />
                        <div className="flex items-center gap-1">
                          <Route className="w-3 h-3" />
                          <span>{distanceFromUser}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedRide(isExpanded ? null : ride.id)}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {isExpanded ? 'Less Info' : 'More Info'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Link href={`/rides/${ride.id}`}>
                    View Details
                  </Link>
                </Button>
                
                {ride.seatsAvailable > 0 && ride.status === 'open' && (
                  <div className="flex-1">
                    <ContactDriverModal 
                      ride={ride}
                      userEduVerified={userEduVerified}
                    />
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Pickup Location</h4>
                      <p className="text-gray-600">{ride.originText}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Destination</h4>
                      <p className="text-gray-600">{ride.destText}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Departure</h4>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(ride.departAt).toLocaleDateString()}</span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span>{new Date(ride.departAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Trip Cost</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Total: {formatPrice(ride.totalTripCostCents)}</p>
                        <p>Per person: {formatPrice(calculateCostPerPerson(ride.totalTripCostCents, ride.seatsTotal, ride.seatsAvailable))}</p>
                        <p className="text-xs text-gray-500">Cost decreases as more riders join</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Vehicle</h4>
                      {ride.driver.vehicle ? (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Car className="w-4 h-4" />
                          <span>
                            {ride.driver.vehicle.year} {ride.driver.vehicle.make} {ride.driver.vehicle.model}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Vehicle info not available</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}