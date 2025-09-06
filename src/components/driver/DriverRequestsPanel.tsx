'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Star, 
  Check, 
  X,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { openSMS, openEmail } from '@/src/utils/platform'

interface RideRequest {
  id: string
  rideId: string
  riderId: string
  seatsRequested: number
  message?: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  rider: {
    id: string
    name: string | null
    email: string
    phone: string | null
    photoUrl: string | null
    ratingAvg: number | null
    ratingCount: number
    eduVerified: boolean
    university: string | null
  }
  ride: {
    id: string
    originText: string
    destText: string
    departAt: string
    totalTripCostCents: number
    seatsTotal: number
    seatsAvailable: number
  }
}

interface DriverRequestsPanelProps {
  className?: string
}

export function DriverRequestsPanel({ className }: DriverRequestsPanelProps) {
  const [requests, setRequests] = useState<RideRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      // Mock data for now - replace with actual API call
      const mockRequests: RideRequest[] = [
        {
          id: 'req_1',
          rideId: 'ride_1',
          riderId: 'user_1',
          seatsRequested: 2,
          message: 'Hi! My friend and I need a ride to campus. We can be flexible with pickup time.',
          status: 'pending',
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
          rider: {
            id: 'user_1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@ufl.edu',
            phone: '+1234567890',
            photoUrl: null,
            ratingAvg: 4.8,
            ratingCount: 12,
            eduVerified: true,
            university: 'University of Florida'
          },
          ride: {
            id: 'ride_1',
            originText: 'Gainesville, FL',
            destText: 'University of Florida Campus',
            departAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours from now
            totalTripCostCents: 1500,
            seatsTotal: 4,
            seatsAvailable: 3
          }
        },
        {
          id: 'req_2',
          rideId: 'ride_2',
          riderId: 'user_2',
          seatsRequested: 1,
          status: 'pending',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          rider: {
            id: 'user_2',
            name: 'Mike Chen',
            email: 'mike.chen@ucf.edu',
            phone: null, // No phone number
            photoUrl: null,
            ratingAvg: null,
            ratingCount: 0,
            eduVerified: true,
            university: 'University of Central Florida'
          },
          ride: {
            id: 'ride_2',
            originText: 'Orlando, FL',
            destText: 'UCF Campus',
            departAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // 4 hours from now
            totalTripCostCents: 1000,
            seatsTotal: 4,
            seatsAvailable: 2
          }
        }
      ]
      
      setRequests(mockRequests)
    } catch (error) {
      console.error('Error fetching ride requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      setProcessingRequest(requestId)
      
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: action === 'accept' ? 'accepted' : 'rejected' }
            : req
        )
      )
    } catch (error) {
      console.error(`Error ${action}ing request:`, error)
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleContactRider = (rider: RideRequest['rider'], method: 'sms' | 'email') => {
    if (method === 'sms' && rider.phone) {
      // Open default SMS app with pre-filled message
      openSMS(rider.phone, 'Confirming your Rydify booking')
    } else if (method === 'email') {
      // Open default mail app with pre-filled subject
      openEmail(rider.email, 'Rydify Ride Confirmation')
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

  const getRatingDisplay = (ratingAvg: number | null, ratingCount: number) => {
    if (!ratingAvg || ratingCount === 0) {
      return 'New rider'
    }
    return `${ratingAvg.toFixed(1)} (${ratingCount})`
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(2)].map((_, i) => (
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

  const pendingRequests = requests.filter(req => req.status === 'pending')
  const processedRequests = requests.filter(req => req.status !== 'pending')

  if (requests.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No ride requests yet</h3>
          <p className="text-gray-600">
            When riders request to join your rides, they'll appear here for you to accept or decline.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Pending Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="border-orange-200 bg-orange-50/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {/* Route Info */}
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{request.ride.originText}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium text-gray-900">{request.ride.destText}</span>
                      </div>
                      
                      {/* Ride Details */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(request.ride.departAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {request.seatsRequested} seat{request.seatsRequested !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatPrice(request.ride.totalTripCostCents)}
                        </div>
                      </div>

                      {/* Rider Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={request.rider.photoUrl || ''} />
                          <AvatarFallback className="bg-teal-100 text-teal-700">
                            {request.rider.name?.charAt(0) || 'R'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{request.rider.name}</span>
                            {request.rider.eduVerified && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{getRatingDisplay(request.rider.ratingAvg, request.rider.ratingCount)}</span>
                            {request.rider.university && (
                              <>
                                <span className="mx-1">•</span>
                                <span>{request.rider.university}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      {request.message && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
                          <p className="text-sm text-gray-700 italic">"{request.message}"</p>
                        </div>
                      )}

                      {/* Request Time */}
                      <p className="text-xs text-gray-500">
                        Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      {/* Contact Rider Buttons */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContactRider(request.rider, 'email')}
                        className="flex items-center gap-1 text-xs px-2 py-1 h-8"
                      >
                        <Mail className="w-3 h-3" />
                      </Button>
                      
                      {request.rider.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContactRider(request.rider, 'sms')}
                          className="flex items-center gap-1 text-xs px-2 py-1 h-8"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequestAction(request.id, 'reject')}
                        disabled={processingRequest === request.id}
                        className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => handleRequestAction(request.id, 'accept')}
                        disabled={processingRequest === request.id}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {processedRequests.map((request) => (
              <Card key={request.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={request.rider.photoUrl || ''} />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                          {request.rider.name?.charAt(0) || 'R'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {request.rider.name} • {request.seatsRequested} seat{request.seatsRequested !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-600">
                          {request.ride.originText} → {request.ride.destText}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {request.status === 'accepted' && (
                        <>
                          {/* Contact buttons for accepted requests */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContactRider(request.rider, 'email')}
                            className="flex items-center gap-1 text-xs px-2 py-1 h-7"
                          >
                            <Mail className="w-3 h-3" />
                          </Button>
                          
                          {request.rider.phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleContactRider(request.rider, 'sms')}
                              className="flex items-center gap-1 text-xs px-2 py-1 h-7"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </Button>
                          )}
                        </>
                      )}
                      
                      <Badge 
                        variant={request.status === 'accepted' ? 'default' : 'secondary'}
                        className={`text-xs ${
                          request.status === 'accepted' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {request.status === 'accepted' ? 'Accepted' : 'Rejected'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}