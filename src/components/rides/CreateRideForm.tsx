'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createRide } from '@/lib/rides/actions'
import { MapboxService } from '@/lib/maps/mapbox'
import { LocationAutocomplete } from './LocationAutocomplete'
import { FirstTimeDriverOnboarding } from './FirstTimeDriverOnboarding'
import SmartLocationSuggestions from '../location/SmartLocationSuggestions'
import { analytics } from '@/lib/analytics'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Badge } from '@/src/components/ui/badge'
import { Progress } from '@/src/components/ui/progress'
import { Loader2, Car, Clock, Users, DollarSign, Route, Shield, AlertTriangle, CheckCircle, XCircle, Plus, Minus } from 'lucide-react'
import { motion } from 'framer-motion'

import type { Location } from '@/lib/maps/mapbox'
import type { RideFormData, LocationData } from '@/lib/rides/types'

interface RoutePreview {
  polyline: string
  distance: number
  duration: number
}

interface VerificationStatus {
  license: 'pending' | 'approved' | 'rejected' | 'none'
  vehicle: 'pending' | 'approved' | 'rejected' | 'none'
  student: 'pending' | 'approved' | 'rejected' | 'none'
}

interface VehicleInfo {
  make: string
  model: string
  year: number
  seats: number
  verified: boolean
}

interface CreateRideFormProps {
  showSkippedNotice?: boolean
}

export function CreateRideForm({ showSkippedNotice = false }: CreateRideFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [routePreview, setRoutePreview] = useState<RoutePreview | null>(null)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)

  // Check if user has completed onboarding
  const [hasDriverProfile, setHasDriverProfile] = useState(false)
  const [driverData, setDriverData] = useState<any>(null)

  useEffect(() => {
    const checkDriverProfile = () => {
      const hasProfile = localStorage.getItem('hasDriverProfile')
      const profileData = localStorage.getItem('driverOnboardingData')
      
      if (hasProfile && profileData) {
        setHasDriverProfile(true)
        setDriverData(JSON.parse(profileData))
      }
    }
    
    checkDriverProfile()
  }, [])

  // Mock verification and vehicle data - replace with real data
  const [verificationStatus] = useState<VerificationStatus>({
    license: driverData?.licenseUploaded ? 'pending' : (driverData?.isLocalRidesOnly ? 'none' : 'approved'),
    vehicle: hasDriverProfile ? 'pending' : 'approved',
    student: 'approved'
  })

  const [vehicleInfo] = useState<VehicleInfo>({
    make: driverData?.vehicleInfo?.make || 'Honda',
    model: driverData?.vehicleInfo?.model || 'Civic',
    year: driverData?.vehicleInfo?.year || 2020,
    seats: driverData?.vehicleInfo?.seats || 5,
    verified: false
  })

  // Form state - using Location type for compatibility with LocationAutocomplete
  const [formData, setFormData] = useState<{
    origin: Location | null
    destination: Location | null
    departAt: string
    seatsTotal: number
    totalTripCostCents: number
    notes: string
  }>({
    origin: null,
    destination: null,
    departAt: '',
    seatsTotal: 1,
    totalTripCostCents: 2000,
    notes: '',
  })

  // Set default departure time (1 hour from now)
  useEffect(() => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    now.setMinutes(0, 0, 0)
    
    const isoString = now.toISOString().slice(0, 16)
    setFormData(prev => ({ ...prev, departAt: isoString }))
  }, [])

  // Generate route preview when both locations are selected
  useEffect(() => {
    if (formData.origin && formData.destination) {
      generateRoutePreview()
    } else {
      setRoutePreview(null)
    }
  }, [formData.origin, formData.destination])

  const generateRoutePreview = async () => {
    if (!formData.origin || !formData.destination) return

    setIsLoadingRoute(true)
    try {
      const route = await MapboxService.getRoute(
        [formData.origin.center[0], formData.origin.center[1]],
        [formData.destination.center[0], formData.destination.center[1]]
      )

      if (route) {
        setRoutePreview(route)
      }
    } catch (error) {
      console.error('Route preview error:', error)
    } finally {
      setIsLoadingRoute(false)
    }
  }

  const handleLocationChange = (field: 'origin' | 'destination') => (location: Location | null) => {
    setFormData(prev => ({ ...prev, [field]: location }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleInputChange = (field: keyof RideFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleTripCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dollars = parseFloat(e.target.value) || 0
    const cents = Math.round(dollars * 100)
    setFormData(prev => ({ ...prev, totalTripCostCents: cents }))
    setErrors(prev => ({ ...prev, totalTripCostCents: '' }))
  }



  const getVerificationProgress = () => {
    const statuses = Object.values(verificationStatus)
    const approved = statuses.filter(s => s === 'approved').length
    return (approved / statuses.length) * 100
  }

  const canCreateRide = () => {
    return verificationStatus.license === 'approved' && verificationStatus.student === 'approved'
  }

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.origin) {
      newErrors.origin = 'Origin is required'
    }

    if (!formData.destination) {
      newErrors.destination = 'Destination is required'
    }

    if (!formData.departAt) {
      newErrors.departAt = 'Departure time is required'
    } else {
      const departDate = new Date(formData.departAt)
      const now = new Date()
      if (departDate <= now) {
        newErrors.departAt = 'Departure time must be in the future'
      }
    }

    const maxSeats = vehicleInfo.verified ? vehicleInfo.seats - 1 : 4
    if (formData.seatsTotal < 1 || formData.seatsTotal > maxSeats) {
      newErrors.seatsTotal = `Seats must be between 1 and ${maxSeats}`
    }

    if (formData.totalTripCostCents < 0 || formData.totalTripCostCents > 50000) {
      newErrors.totalTripCostCents = 'Total trip cost must be between $0 and $500'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canCreateRide()) {
      setMessage('Please complete your verification to create rides')
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      // Convert Location to LocationData for API
      const submitData = {
        origin: {
          text: formData.origin!.text,
          placeName: formData.origin!.placeName,
          lat: formData.origin!.center[1],
          lng: formData.origin!.center[0],
        },
        destination: {
          text: formData.destination!.text,
          placeName: formData.destination!.placeName,
          lat: formData.destination!.center[1],
          lng: formData.destination!.center[0],
        },
        departAt: formData.departAt,
        seatsTotal: formData.seatsTotal,
        totalTripCostCents: formData.totalTripCostCents,
        notes: formData.notes,
      }

      const result = await createRide(submitData)

      if (result.success) {
        // Track ride creation analytics
        analytics.createRide({
          origin: formData.origin!.text,
          destination: formData.destination!.text,
          seats: formData.seatsTotal,
          cost: formData.totalTripCostCents / 100 // Convert cents to dollars
        })
        
        setMessage(result.message)
        setTimeout(() => {
          router.push(`/rides/${result.rideId}`)
        }, 2000)
      } else {
        setMessage(result.message)
        if (result.errors) {
          setErrors(result.errors)
        }
      }
    } catch (error) {
      setMessage('Failed to create ride. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDistance = (meters: number): string => {
    const km = meters / 1000
    return `${km.toFixed(1)} km`
  }



  return (
    <div id="ride-form" className="space-y-6">
      {/* Setup Reminder for users who skipped or haven't completed onboarding */}
      {(showSkippedNotice || !hasDriverProfile) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Complete your driver setup</strong> to unlock all features and start earning money!
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/driver/onboarding')}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100 ml-4"
                >
                  Complete Setup
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Main Form - Streamlined */}
      <Card className="shadow-xl border-0 bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Car className="w-5 h-5" />
            Create Your Ride
          </CardTitle>
          <CardDescription className="text-teal-100">
            Set your route, time, and pricing to start earning
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Origin */}
            <div className="space-y-3">
              <LocationAutocomplete
                label="Pickup Location"
                placeholder="Where are you starting from?"
                value={formData.origin}
                onChange={handleLocationChange('origin')}
                error={errors.origin}
                required
              />
              {!formData.origin && (
                <SmartLocationSuggestions
                  type="origin"
                  onLocationSelect={(location) => {
                    setFormData(prev => ({
                      ...prev,
                      origin: {
                        text: location.text,
                        placeName: location.placeName,
                        lat: location.lat,
                        lng: location.lng
                      }
                    }))
                  }}
                />
              )}
            </div>

            {/* Destination */}
            <div className="space-y-3">
              <LocationAutocomplete
                label="Drop-off Location"
                placeholder="Where are you going?"
                value={formData.destination}
                onChange={handleLocationChange('destination')}
                error={errors.destination}
                required
              />
              {!formData.destination && (
                <SmartLocationSuggestions
                  type="destination"
                  onLocationSelect={(location) => {
                    setFormData(prev => ({
                      ...prev,
                      destination: {
                        text: location.text,
                        placeName: location.placeName,
                        lat: location.lat,
                        lng: location.lng
                      }
                    }))
                  }}
                />
              )}
            </div>

            {/* Route Preview */}
            {(formData.origin && formData.destination) && (
              <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Route className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold text-teal-900 text-lg">Route Preview</span>
                    {isLoadingRoute && (
                      <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                    )}
                  </div>
                  
                  {routePreview ? (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/70 p-4 rounded-lg">
                        <span className="text-teal-700 font-medium">Distance:</span>
                        <div className="text-xl font-bold text-teal-900">{formatDistance(routePreview.distance)}</div>
                      </div>
                      <div className="bg-white/70 p-4 rounded-lg">
                        <span className="text-teal-700 font-medium">Duration:</span>
                        <div className="text-xl font-bold text-teal-900">{formatDuration(routePreview.duration)}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-teal-700">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Calculating optimal route...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}



            {/* Trip Details - Simplified */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Departure Time */}
              <div className="space-y-2">
                <Label htmlFor="departAt" className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  Departure Time
                  <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  <Input
                    id="departAt"
                    type="datetime-local"
                    value={formData.departAt}
                    onChange={handleInputChange('departAt')}
                    className={`${errors.departAt ? 'border-red-500' : ''}`}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date()
                      const isoString = now.toISOString().slice(0, 16)
                      setFormData(prev => ({ ...prev, departAt: isoString }))
                    }}
                    className="w-full text-xs"
                  >
                    Set to current time
                  </Button>
                </div>
                {errors.departAt && (
                  <p className="text-sm text-red-600">{errors.departAt}</p>
                )}
              </div>

              {/* Available Seats */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Users className="w-4 h-4" />
                  Available Seats
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, seatsTotal: Math.max(1, prev.seatsTotal - 1) }))}
                    disabled={formData.seatsTotal <= 1}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  
                  <div className="flex-1 text-center">
                    <div className="text-2xl font-bold text-teal-600">{formData.seatsTotal}</div>
                    <div className="text-xs text-gray-500">passenger{formData.seatsTotal !== 1 ? 's' : ''}</div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const maxSeats = vehicleInfo.verified ? vehicleInfo.seats - 1 : 4
                      setFormData(prev => ({ ...prev, seatsTotal: Math.min(maxSeats, prev.seatsTotal + 1) }))
                    }}
                    disabled={formData.seatsTotal >= (vehicleInfo.verified ? vehicleInfo.seats - 1 : 4)}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Cost Section - Simplified */}
            <div className="space-y-4">
              <Label htmlFor="totalCost" className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="w-4 h-4" />
                Total Trip Cost
                <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 font-normal ml-2">
                  Split between all riders
                </span>
              </Label>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <Input
                  id="totalCost"
                  type="number"
                  min="0"
                  max="500"
                  step="1.00"
                  value={(formData.totalTripCostCents / 100).toFixed(2)}
                  onChange={handleTripCostChange}
                  className={`pl-8 text-lg py-3 ${errors.totalTripCostCents ? 'border-red-500' : ''}`}
                  placeholder="20.00"
                  required
                />
              </div>
              
              {errors.totalTripCostCents && (
                <p className="text-sm text-red-600">{errors.totalTripCostCents}</p>
              )}
              
              {/* Quick Cost Preview */}
              {formData.totalTripCostCents > 0 && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Cost per rider:</strong> ${(formData.totalTripCostCents / ((formData.seatsTotal + 1) * 100)).toFixed(2)} 
                    {formData.seatsTotal > 1 && ` (with ${formData.seatsTotal} riders)`}
                  </p>
                </div>
              )}
            </div>

            {/* Notes Section - Simplified */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="w-4 h-4" />
                Notes for Riders (Optional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={handleInputChange('notes')}
                placeholder="Add pickup instructions, music preferences, or other details..."
                rows={3}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                {formData.notes?.length || 0}/500 characters
              </p>
            </div>

            {/* Message */}
            {message && (
              <Alert variant={message.includes('success') ? 'default' : 'destructive'}>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 py-4 text-lg font-semibold"
                disabled={isSubmitting || !formData.origin || !formData.destination || !canCreateRide()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Publishing Your Ride...
                  </>
                ) : !canCreateRide() ? (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Complete Verification to Publish Ride
                  </>
                ) : (
                  <>
                    <Car className="w-5 h-5 mr-2" />
                    Publish Ride
                  </>
                )}
              </Button>
              
              {!canCreateRide() && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Complete your verification in the sidebar to publish rides
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}