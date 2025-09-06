'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Car,
  ArrowRight,
  Shield,
  Phone,
  Mail,
  Eye
} from 'lucide-react'
import { ContactDriverActions } from '@/src/components/auth/ProtectedActions'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Driver {
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

interface RideResult {
  id: string
  originText: string
  destText: string
  departAt: Date
  seatsTotal: number
  seatsAvailable: number
  totalTripCostCents: number
  driver: Driver
  driverVerificationLevel: 'BASIC' | 'ENHANCED' | 'UNVERIFIED'
  originDistance?: number
  destDistance?: number
  overallScore?: number
}

interface RideResultCardProps {
  ride: RideResult
  userEduVerified: boolean
  onContact?: (ride: RideResult) => void
}

export function RideResultCard({ ride, userEduVerified, onContact }: RideResultCardProps) {
  const [showContactOptions, setShowContactOptions] = useState(false)

  const formatPrice = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDepartureTime = (date: Date): string => {
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} from now`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} from now`
    } else {
      return 'Soon'
    }
  }

  const calculateCostPerPerson = (): number => {
    const occupiedSeats = ride.seatsTotal - ride.seatsAvailable
    const totalPeople = occupiedSeats + 1 // +1 for driver
    return ride.totalTripCostCents / totalPeople
  }

  const getRatingDisplay = (): string => {
    if (!ride.driver.user.ratingAvg || ride.driver.user.ratingCount === 0) {
      return 'New driver'
    }
    return `${ride.driver.user.ratingAvg.toFixed(1)} (${ride.driver.user.ratingCount})`
  }

  const getVerificationBadge = () => {
    switch (ride.driverVerificationLevel) {
      case 'ENHANCED':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            Enhanced
          </Badge>
        )
      case 'BASIC':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Shield className="w-3 h-3 mr-1" />
            Basic
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
            Unverified
          </Badge>
        )
    }
  }

  const handleContactDriver = () => {
    if (onContact) {
      onContact(ride)
    } else {
      setShowContactOptions(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -2 }}
    >
      <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-0.5">
          <div className="bg-white rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Driver Avatar */}
                <Avatar className="w-12 h-12 border-2 border-gray-200">
                  <AvatarImage 
                    src={ride.driver.user.photoUrl || undefined} 
                    alt={ride.driver.user.name || 'Driver'} 
                  />
                  <AvatarFallback className="bg-teal-100 text-teal-700 font-semibold">
                    {ride.driver.user.name?.charAt(0) || 'D'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {ride.driver.user.name || 'Anonymous Driver'}
                        </h3>
                        {getVerificationBadge()}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{getRatingDisplay()}</span>
                        {ride.driver.vehicle && (
                          <>
                            <span>•</span>
                            <Car className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {ride.driver.vehicle.color} {ride.driver.vehicle.make} {ride.driver.vehicle.model}
                            </span>
                            <span className="sm:hidden">
                              {ride.driver.vehicle.make} {ride.driver.vehicle.model}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                        <div className="text-xl font-bold text-green-700">
                          ${formatPrice(calculateCostPerPerson())}
                        </div>
                        <div className="text-xs text-green-600 font-medium">per person</div>
                      </div>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-2 mb-3 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {ride.originText}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {ride.destText}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">
                        <span className="hidden sm:inline">
                          {ride.departAt.toLocaleDateString()} at {ride.departAt.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span className="sm:hidden">
                          {ride.departAt.toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">
                        {ride.seatsAvailable} of {ride.seatsTotal} seats left
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {formatDepartureTime(ride.departAt)}
                    </div>

                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <Link href={`/rides/${ride.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">Details</span>
                          </Link>
                        </Button>
                      </motion.div>
                      
                      {ride.seatsAvailable > 0 && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            size="sm"
                            onClick={handleContactDriver}
                            disabled={!userEduVerified}
                            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Contact Driver</span>
                            <span className="sm:hidden">Contact</span>
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Contact Options */}
                  {showContactOptions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <p className="text-sm text-gray-600 mb-3">Choose how to contact the driver:</p>
                      <ContactDriverActions
                        driverEmail={ride.driver.user.email}
                        driverPhone={ride.driver.user.phone || undefined}
                        rideId={ride.id}
                        className="flex gap-3"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}