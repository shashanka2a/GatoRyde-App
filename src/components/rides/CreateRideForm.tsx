'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createRide } from '@/lib/rides/actions'
import { MapboxService } from '@/lib/maps/mapbox'
import { LocationAutocomplete } from './LocationAutocomplete'
import { FirstTimeDriverOnboarding } from './FirstTimeDriverOnboarding'
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
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Setup Reminder for users who skipped or haven't completed onboarding */}
      {(showSkippedNotice || !hasDriverProfile) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Complete your driver setup</strong> to unlock all features and start earning money!
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/driver/onboarding')}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100 ml-4"
                >
                  Complete Setup
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Main Form - Moved Higher */}
      <Card className="shadow-xl border-0 bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Car className="w-6 h-6" />
            Offer your ride to fellow students
          </CardTitle>
          <CardDescription className="text-teal-100">
            Fill in the details below to help fellow Gators while earning some extra cash
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Origin */}
            <LocationAutocomplete
              label="Pickup Location"
              placeholder="Where are you starting from?"
              value={formData.origin}
              onChange={handleLocationChange('origin')}
              error={errors.origin}
              required
            />

            {/* Destination */}
            <LocationAutocomplete
              label="Drop-off Location"
              placeholder="Where are you going?"
              value={formData.destination}
              onChange={handleLocationChange('destination')}
              error={errors.destination}
              required
            />

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



            {/* Trip Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Trip Details
              </h3>
              
              {/* Departure Time */}
              <div className="space-y-2">
                <Label htmlFor="departAt" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Departure Time
                  <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    When do you plan to leave?
                  </span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="departAt"
                    type="datetime-local"
                    value={formData.departAt}
                    onChange={handleInputChange('departAt')}
                    className={`flex-1 ${errors.departAt ? 'border-red-500' : ''}`}
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
                    className="whitespace-nowrap"
                    title="Set departure time to current time"
                  >
                    Set current time
                  </Button>
                </div>
                {errors.departAt && (
                  <p className="text-sm text-red-600">{errors.departAt}</p>
                )}
                <p className="text-xs text-gray-500">
                  💡 Riders can see your departure time and plan accordingly
                </p>
              </div>
            </div>

            {/* Seats & Cost Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Seats & Cost
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="seatsTotal" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Available Seats for Passengers
                    <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      How many riders can join?
                    </span>
                  </Label>
                  
                  {/* Seat Counter with Visual Feedback */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border border-teal-200">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, seatsTotal: Math.max(1, prev.seatsTotal - 1) }))}
                        disabled={formData.seatsTotal <= 1}
                        className="w-10 h-10 p-0 border-teal-300 hover:bg-teal-100"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1">
                          {/* Visual seat representation */}
                          {Array.from({ length: Math.max(vehicleInfo.verified ? vehicleInfo.seats - 1 : 4, 5) }, (_, i) => (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs font-bold transition-all ${
                                i < formData.seatsTotal
                                  ? 'bg-teal-500 border-teal-600 text-white'
                                  : 'bg-gray-100 border-gray-300 text-gray-400'
                              }`}
                            >
                              {i < formData.seatsTotal ? '👤' : '○'}
                            </div>
                          ))}
                        </div>
                        <span className="text-2xl font-bold text-teal-700">{formData.seatsTotal}</span>
                        <span className="text-xs text-teal-600">passenger{formData.seatsTotal !== 1 ? 's' : ''}</span>
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
                        className="w-10 h-10 p-0 border-teal-300 hover:bg-teal-100"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Seat Validation Info */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Car className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800">
                            Your {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            {vehicleInfo.seats} total seats → 1 for you + up to {vehicleInfo.verified ? vehicleInfo.seats - 1 : 4} passengers
                          </p>
                          {!vehicleInfo.verified && (
                            <p className="text-xs text-amber-700 mt-1 font-medium">
                              ⚠️ Verify your vehicle to offer up to {vehicleInfo.seats - 1} seats
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {errors.seatsTotal && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription className="text-red-800">
                        {errors.seatsTotal}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="totalCost" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Total Trip Cost (Gas + Expenses)
                    <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      Split between all riders
                    </span>
                  </Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="totalCost"
                        type="number"
                        min="0"
                        max="500"
                        step="1.00"
                        value={(formData.totalTripCostCents / 100).toFixed(2)}
                        onChange={handleTripCostChange}
                        className={`pl-8 ${errors.totalTripCostCents ? 'border-red-500' : ''}`}
                        placeholder="20.00"
                        required
                        title="Enter the total cost for gas, tolls, and other trip expenses"
                      />
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-800 font-medium">💡 Cost Calculation Tips:</p>
                      <ul className="text-xs text-amber-700 mt-1 space-y-1">
                        <li>• Include gas, tolls, parking fees</li>
                        <li>• Consider wear & tear (~$0.50/mile)</li>
                        <li>• Keep it fair - riders split the total cost</li>
                        <li>• Higher costs may reduce booking interest</li>
                      </ul>
                    </div>
                  </div>
                  {errors.totalTripCostCents && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription className="text-red-800">
                        {errors.totalTripCostCents}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Live Cost Breakdown */}
            {formData.seatsTotal > 0 && formData.totalTripCostCents > 0 && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-green-900 mb-4 text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Cost Per Rider Calculator
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      Live Preview
                    </Badge>
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Visual Cost Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Minimum scenario (1 rider) */}
                      <div className="bg-white/80 p-4 rounded-lg border border-green-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-800">With 1 Rider</span>
                          <div className="flex gap-1">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <div className="w-4 h-4 bg-green-300 rounded-full"></div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                          ${(formData.totalTripCostCents / 200).toFixed(2)}
                        </div>
                        <p className="text-xs text-green-600">per person (2 people total)</p>
                      </div>

                      {/* Maximum scenario (all seats) */}
                      {formData.seatsTotal > 1 && (
                        <div className="bg-white/80 p-4 rounded-lg border border-green-200 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-800">All Seats Full</span>
                            <div className="flex gap-1">
                              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                              {Array.from({ length: formData.seatsTotal }, (_, i) => (
                                <div key={i} className="w-4 h-4 bg-green-300 rounded-full"></div>
                              ))}
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-900">
                            ${(formData.totalTripCostCents / ((formData.seatsTotal + 1) * 100)).toFixed(2)}
                          </div>
                          <p className="text-xs text-green-600">per person ({formData.seatsTotal + 1} people total)</p>
                        </div>
                      )}
                    </div>

                    {/* Cost Breakdown Table */}
                    <div className="bg-white/60 p-4 rounded-lg border border-green-200">
                      <h5 className="text-sm font-medium text-green-800 mb-3">Complete Cost Breakdown</h5>
                      <div className="space-y-2">
                        {Array.from({ length: formData.seatsTotal }, (_, i) => {
                          const totalPeople = i + 2; // driver + (i+1) riders
                          const costPerPerson = formData.totalTripCostCents / (totalPeople * 100);
                          return (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-green-700">
                                {i + 1} rider{i > 0 ? 's' : ''} join{i === 0 ? 's' : ''}:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-green-900">
                                  ${costPerPerson.toFixed(2)} each
                                </span>
                                <div className="flex gap-1">
                                  <div className="w-3 h-3 bg-green-500 rounded-full" title="You (driver)"></div>
                                  {Array.from({ length: i + 1 }, (_, j) => (
                                    <div key={j} className="w-3 h-3 bg-green-300 rounded-full" title={`Rider ${j + 1}`}></div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-green-100 p-3 rounded-lg border border-green-300">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 text-sm">💡</span>
                        <div className="text-xs text-green-700">
                          <p className="font-medium">Smart Pricing Tips:</p>
                          <p className="mt-1">More riders = lower cost per person = higher booking likelihood</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Additional Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes for Riders (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={handleInputChange('notes')}
                  placeholder="Any additional information for riders (e.g., pickup instructions, music preferences, etc.)"
                  rows={3}
                  maxLength={500}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {formData.notes?.length || 0}/500 characters
                  </p>
                  <div className="text-xs text-gray-500">
                    💡 Clear instructions help riders find you easily
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <Alert variant={message.includes('success') ? 'default' : 'destructive'}>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-lg"
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
          </form>
        </CardContent>
      </Card>

      {/* Verification Status Card - Moved Below Form */}
      <Card className="border-l-4 border-l-teal-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-teal-600" />
              Driver Verification Status
              <span className="text-sm text-gray-500 font-normal ml-2">
                (Required to publish rides)
              </span>
            </CardTitle>
            <Badge variant={canCreateRide() ? "default" : "secondary"} className="bg-teal-100 text-teal-800">
              {Math.round(getVerificationProgress())}% Complete
            </Badge>
          </div>
          <Progress value={getVerificationProgress()} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Driver License</span>
                <span className="text-xs text-gray-500">Upload & verify your license</span>
              </div>
              <div className="flex items-center gap-2">
                {getVerificationIcon(verificationStatus.license)}
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                  {verificationStatus.license === 'approved' ? 'View' : 'Upload'}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Vehicle Info</span>
                <span className="text-xs text-gray-500">Add your vehicle details</span>
              </div>
              <div className="flex items-center gap-2">
                {getVerificationIcon(verificationStatus.vehicle)}
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                  {verificationStatus.vehicle === 'approved' ? 'Edit' : 'Add'}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Student ID</span>
                <span className="text-xs text-gray-500">Verify your student status</span>
              </div>
              <div className="flex items-center gap-2">
                {getVerificationIcon(verificationStatus.student)}
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                  {verificationStatus.student === 'approved' ? 'View' : 'Verify'}
                </Button>
              </div>
            </div>
          </div>
          
          {!canCreateRide() && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Complete your driver license and student ID verification to publish rides.
                <Button variant="link" className="p-0 h-auto ml-2 text-yellow-800 underline">
                  Start verification process →
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Info Card - Enhanced with Editable Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Vehicle Information
            <span className="text-sm text-gray-500 font-normal ml-2">
              (Affects available seats)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-medium">{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</p>
              <p className="text-sm text-gray-600">{vehicleInfo.seats} seats total • Up to {vehicleInfo.seats - 1} passengers</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={vehicleInfo.verified ? "default" : "secondary"} className="text-xs">
                  {vehicleInfo.verified ? 'Verified' : 'Pending Verification'}
                </Badge>
                {!vehicleInfo.verified && (
                  <span className="text-xs text-amber-600">⚠️ Limited to 4 seats until verified</span>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              Edit Vehicle
            </Button>
          </div>
          {!vehicleInfo.verified && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">💡 Verification Benefits:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Offer up to {vehicleInfo.seats - 1} seats (currently limited to 4)</li>
                <li>• Higher rider trust and booking rates</li>
                <li>• Priority in search results</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}