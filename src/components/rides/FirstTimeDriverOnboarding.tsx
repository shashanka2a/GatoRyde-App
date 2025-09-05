'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Badge } from '@/src/components/ui/badge'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { 
  Car, 
  Shield, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  MapPin,
  Clock
} from 'lucide-react'

interface VehicleData {
  make: string
  model: string
  year: number
  color: string
  seats: number
  licensePlate: string
}

interface OnboardingData {
  isLocalRidesOnly: boolean
  licenseUploaded: boolean
  vehicleInfo: VehicleData
}

interface FirstTimeDriverOnboardingProps {
  onComplete: (data: OnboardingData) => void
}

export function FirstTimeDriverOnboarding({ onComplete }: FirstTimeDriverOnboardingProps) {
  const [step, setStep] = useState(1)
  const [isLocalRidesOnly, setIsLocalRidesOnly] = useState(false)
  const [licenseUploaded, setLicenseUploaded] = useState(false)
  const [vehicleInfo, setVehicleInfo] = useState<VehicleData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    seats: 5,
    licensePlate: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  const validateVehicleInfo = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!vehicleInfo.make.trim()) {
      newErrors.make = 'Vehicle make is required'
    }
    if (!vehicleInfo.model.trim()) {
      newErrors.model = 'Vehicle model is required'
    }
    if (!vehicleInfo.color.trim()) {
      newErrors.color = 'Vehicle color is required'
    }
    if (!vehicleInfo.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required'
    }
    if (vehicleInfo.seats < 2 || vehicleInfo.seats > 8) {
      newErrors.seats = 'Seats must be between 2 and 8'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleVehicleInfoChange = (field: keyof VehicleData, value: string | number) => {
    setVehicleInfo(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleNext = () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2 && !isLocalRidesOnly) {
      setStep(3)
    } else if (step === 2 && isLocalRidesOnly) {
      setStep(4)
    } else if (step === 3) {
      setStep(4)
    } else if (step === 4) {
      if (validateVehicleInfo()) {
        handleComplete()
      }
    }
  }

  const handleComplete = () => {
    onComplete({
      isLocalRidesOnly,
      licenseUploaded,
      vehicleInfo
    })
  }

  const renderStep1 = () => (
    <Card className="shadow-xl border-0 bg-white overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Car className="w-6 h-6" />
          Welcome to Rydify Driver!
        </CardTitle>
        <CardDescription className="text-teal-100">
          Let's get you set up to offer rides to fellow students
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Quick Setup Required
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            To ensure safety for all riders, we need some basic information about you and your vehicle.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">What we'll collect:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Vehicle information (make, model, year, etc.)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Driver's license (optional for local campus rides)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Ride preferences and safety settings
              </li>
            </ul>
          </div>

          <Alert className="border-green-200 bg-green-50">
            <Info className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Already verified student?</strong> Great! We just need driver-specific info to get you started.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
          >
            Get Started
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep2 = () => (
    <Card className="shadow-xl border-0 bg-white overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2 text-xl">
          <MapPin className="w-5 h-5" />
          What type of rides will you offer?
        </CardTitle>
        <CardDescription className="text-teal-100">
          This helps us determine what verification you need
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div 
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              isLocalRidesOnly 
                ? 'border-teal-500 bg-teal-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setIsLocalRidesOnly(true)}
          >
            <div className="flex items-start gap-3">
              <Checkbox 
                checked={isLocalRidesOnly}
                onCheckedChange={() => setIsLocalRidesOnly(true)}
                className="mt-1"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  Local Campus Rides Only
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Short trips around Gainesville and campus area (within 25 miles)
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    License Optional
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                    Quick Setup
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div 
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              !isLocalRidesOnly 
                ? 'border-teal-500 bg-teal-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setIsLocalRidesOnly(false)}
          >
            <div className="flex items-start gap-3">
              <Checkbox 
                checked={!isLocalRidesOnly}
                onCheckedChange={() => setIsLocalRidesOnly(false)}
                className="mt-1"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  All Rides (Local + Long Distance)
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Campus rides plus longer trips (airports, other cities, etc.)
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                    License Required
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                    Full Verification
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Don't worry!</strong> You can always upgrade to offer long-distance rides later by completing license verification.
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button
            onClick={() => setStep(1)}
            variant="outline"
            className="border-gray-300"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep3 = () => (
    <Card className="shadow-xl border-0 bg-white overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="w-5 h-5" />
          Driver's License Verification
        </CardTitle>
        <CardDescription className="text-teal-100">
          Required for long-distance rides and higher rider trust
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Upload Your Driver's License
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We need to verify your license for safety and compliance. This is required for rides over 25 miles.
          </p>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG up to 10MB
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2">📸 Photo Tips:</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Ensure all text is clearly readable</li>
              <li>• Take photo in good lighting</li>
              <li>• Include the entire license in frame</li>
              <li>• Avoid glare and shadows</li>
            </ul>
          </div>

          {licenseUploaded && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                License uploaded successfully! We'll review it within 24 hours.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setStep(2)}
            variant="outline"
            className="border-gray-300"
          >
            Back
          </Button>
          <Button
            onClick={() => {
              setLicenseUploaded(true)
              handleNext()
            }}
            className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
            disabled={!licenseUploaded}
          >
            {licenseUploaded ? 'Continue' : 'Upload License First'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep4 = () => (
    <Card className="shadow-xl border-0 bg-white overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Car className="w-5 h-5" />
          Vehicle Information
        </CardTitle>
        <CardDescription className="text-teal-100">
          Tell us about your vehicle so riders know what to expect
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="make">
              Vehicle Make <span className="text-red-500">*</span>
            </Label>
            <Input
              id="make"
              value={vehicleInfo.make}
              onChange={(e) => handleVehicleInfoChange('make', e.target.value)}
              placeholder="e.g., Honda, Toyota, Ford"
              className={errors.make ? 'border-red-500' : ''}
            />
            {errors.make && (
              <p className="text-sm text-red-600">{errors.make}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">
              Vehicle Model <span className="text-red-500">*</span>
            </Label>
            <Input
              id="model"
              value={vehicleInfo.model}
              onChange={(e) => handleVehicleInfoChange('model', e.target.value)}
              placeholder="e.g., Civic, Camry, Focus"
              className={errors.model ? 'border-red-500' : ''}
            />
            {errors.model && (
              <p className="text-sm text-red-600">{errors.model}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Vehicle Year</Label>
            <Select
              value={vehicleInfo.year.toString()}
              onValueChange={(value) => handleVehicleInfoChange('year', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">
              Vehicle Color <span className="text-red-500">*</span>
            </Label>
            <Input
              id="color"
              value={vehicleInfo.color}
              onChange={(e) => handleVehicleInfoChange('color', e.target.value)}
              placeholder="e.g., White, Black, Silver"
              className={errors.color ? 'border-red-500' : ''}
            />
            {errors.color && (
              <p className="text-sm text-red-600">{errors.color}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="seats">Total Seats</Label>
            <Select
              value={vehicleInfo.seats.toString()}
              onValueChange={(value) => handleVehicleInfoChange('seats', parseInt(value))}
            >
              <SelectTrigger className={errors.seats ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select seats" />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 7, 8].map(seats => (
                  <SelectItem key={seats} value={seats.toString()}>
                    {seats} seats
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.seats && (
              <p className="text-sm text-red-600">{errors.seats}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licensePlate">
              License Plate <span className="text-red-500">*</span>
            </Label>
            <Input
              id="licensePlate"
              value={vehicleInfo.licensePlate}
              onChange={(e) => handleVehicleInfoChange('licensePlate', e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              className={errors.licensePlate ? 'border-red-500' : ''}
            />
            {errors.licensePlate && (
              <p className="text-sm text-red-600">{errors.licensePlate}</p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">🚗 Vehicle Preview:</h4>
          <p className="text-sm text-blue-800">
            {vehicleInfo.year} {vehicleInfo.color} {vehicleInfo.make} {vehicleInfo.model}
            {vehicleInfo.licensePlate && ` • ${vehicleInfo.licensePlate}`}
            {vehicleInfo.seats && ` • ${vehicleInfo.seats} seats (${vehicleInfo.seats - 1} available for passengers)`}
          </p>
        </div>

        <Alert className="border-green-200 bg-green-50">
          <Info className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Privacy Note:</strong> Your license plate will only be shared with confirmed riders for pickup identification.
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button
            onClick={() => setStep(isLocalRidesOnly ? 2 : 3)}
            variant="outline"
            className="border-gray-300"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
          >
            Complete Setup
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {step} of {isLocalRidesOnly ? 3 : 4}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((step / (isLocalRidesOnly ? 3 : 4)) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-teal-600 to-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / (isLocalRidesOnly ? 3 : 4)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  )
}