'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Star, 
  Shield, 
  MessageCircle,
  Phone,
  Lock,
  AlertTriangle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/src/hooks/useAuth'
import Link from 'next/link'

interface Ride {
  id: string
  originText: string
  destText: string
  departAt: string
  seatsTotal: number
  seatsAvailable: number
  totalTripCostCents: number
  driverId: string
  status: string
  createdAt: string
}

interface PublicRideListProps {
  className?: string
}

export function PublicRideList({ className }: PublicRideListProps) {
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    fetchRides()
  }, [])

  const fetchRides = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/rides/available?limit=10')
      const data = await response.json()

      if (data.success) {
        setRides(data.data.rides)
      } else {
        setError(data.message || 'Failed to load rides')
      }
    } catch (err) {
      setError('Failed to load rides')
      console.error('Error fetching rides:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const AuthGatedAction = ({ children, action }: { children: React.ReactNode, action: string }) => {
    if (isAuthenticated && user?.eduVerified) {
      return <>{children}</>
    }

    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="text-center p-2">
            <Lock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600 font-medium">
              {!isAuthenticated ? 'Login Required' : 'Verify .edu Email'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 font-medium">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRides}
            className="mt-3"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (rides.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No rides available</h3>
          <p className="text-gray-600 mb-4">
            Be the first to offer a ride! Create a ride posting to help fellow students.
          </p>
          <Link href="/rides/create">
            <Button className="bg-teal-600 hover:bg-teal-700">
              Create Ride
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Auth Status Banner */}
      {!isAuthenticated && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Browse rides freely, but login with your .edu email to contact drivers
                </p>
              </div>
              <Link href="/auth/login">
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {isAuthenticated && !user?.eduVerified && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900">
                  Verify your .edu email to contact drivers and book rides
                </p>
              </div>
              <Link href="/dashboard/kyc">
                <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  Verify Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rides List */}
      {rides.map((ride) => (
        <Card key={ride.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{ride.originText}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium text-gray-900">{ride.destText}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(ride.departAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {ride.seatsAvailable} of {ride.seatsTotal} seats
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {formatPrice(ride.totalTripCostCents)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified Driver
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {ride.status === 'open' ? 'Available' : 'Full'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Posted {formatDistanceToNow(new Date(ride.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 ml-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-teal-100 text-teal-700">
                    D
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <AuthGatedAction action="contact">
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                </AuthGatedAction>
                
                <AuthGatedAction action="call">
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call
                  </Button>
                </AuthGatedAction>
              </div>

              <AuthGatedAction action="book">
                <Button 
                  size="sm" 
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={ride.seatsAvailable === 0}
                >
                  {ride.seatsAvailable === 0 ? 'Full' : 'Book Ride'}
                </Button>
              </AuthGatedAction>
            </div>
          </CardContent>
        </Card>
      ))}

      {rides.length > 0 && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-3">Don't see what you're looking for?</p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/rides/create">
                <Button variant="outline">
                  Create Ride Offer
                </Button>
              </Link>
              <Link href="/ride-requests/create">
                <Button variant="outline">
                  Post Ride Request
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}