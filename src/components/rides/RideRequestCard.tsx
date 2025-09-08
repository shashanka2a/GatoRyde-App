'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Star, 
  MessageSquare,
  ArrowRight,
  Calendar,
  Route,
  User
} from 'lucide-react'
import { 
  formatPrice, 
  formatDepartureTime, 
  calculateDistance,
  type RideWithDriver 
} from '@/lib/rides/types'
import { UniversityBadge } from './UniversityBadge'
import { cn } from '@/lib/utils'

interface RideRequestCardProps {
  request: {
    id: string
    type: 'request'
    originText: string
    originLat: number
    originLng: number
    destText: string
    destLat: number
    destLng: number
    departAt: string | Date
    seatsNeeded: number
    maxCostCents: number
    status: string
    notes?: string | null
    createdAt: string | Date
    rider: {
      userId: string
      user: {
        id: string
        name?: string | null
        email: string
        photoUrl?: string | null
        ratingAvg?: number | null
        ratingCount: number
        university?: string | null
      }
    }
  }
  showDistance?: boolean
  userLocation?: { lat: number; lng: number }
  userEduVerified?: boolean
  className?: string
}

export function RideRequestCard({ 
  request, 
  showDistance = false,
  userLocation,
  userEduVerified = false,
  className 
}: RideRequestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const distance = userLocation && showDistance 
    ? calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        request.originLat, 
        request.originLng
      )
    : null

  const riderName = request.rider.user.name || request.rider.user.email.split('@')[0]
  const riderInitials = riderName.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <Card className={cn(
      "w-full transition-all duration-200 hover:shadow-md border-l-4 border-l-blue-500",
      className
    )}>
      <CardContent className="p-4">
        {/* Header with type badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              <MessageSquare className="w-3 h-3 mr-1" />
              Ride Request
            </Badge>
            <Badge variant="outline" className="text-xs">
              {request.status}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? 'Less' : 'More'}
          </Button>
        </div>

        {/* Route Information */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="font-medium">{request.originText}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-red-600" />
              <span className="font-medium">{request.destText}</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* Rider Information */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={request.rider.user.photoUrl || undefined} />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {riderInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{riderName}</span>
              <UniversityBadge university={request.rider.user.university} />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User className="w-3 h-3" />
              <span>Needs {request.seatsNeeded} seat{request.seatsNeeded !== 1 ? 's' : ''}</span>
            </div>
          </div>
          {request.rider.user.ratingAvg && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-medium">{request.rider.user.ratingAvg.toFixed(1)}</span>
              <span className="text-gray-500">({request.rider.user.ratingCount})</span>
            </div>
          )}
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">
              {formatDepartureTime(request.departAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">
              Max {formatPrice(request.maxCostCents)}
            </span>
          </div>
        </div>

        {/* Distance (if available) */}
        {distance && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Route className="w-4 h-4" />
            <span>{distance.toFixed(1)} miles away</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!userEduVerified}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {userEduVerified ? 'Respond to Request' : 'Verify to Respond'}
          </Button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3">
              {/* Notes */}
              {request.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                  <p className="text-sm text-gray-600">{request.notes}</p>
                </div>
              )}

              {/* Request Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Request Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Seats Needed:</span>
                    <span className="ml-2 font-medium">{request.seatsNeeded}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Budget:</span>
                    <span className="ml-2 font-medium">{formatPrice(request.maxCostCents)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Posted:</span>
                    <span className="ml-2 font-medium">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 font-medium capitalize">{request.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
