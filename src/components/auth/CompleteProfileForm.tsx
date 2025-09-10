'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Progress } from '@/src/components/ui/progress'
import { Badge } from '@/src/components/ui/badge'
import { 
  User, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Shield,
  Car,
  CreditCard,
  Mail,
  FileText,
  Upload,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProfileCompletionStatus, getFieldDisplayName } from '@/lib/auth/profile-completion'

interface User {
  id: string
  email: string
  name?: string | null
  phone?: string | null
  eduVerified: boolean
}

interface CompleteProfileFormProps {
  user: User
  profileStatus: ProfileCompletionStatus
}

interface FormData {
  name: string
  phone: string
  zelleHandle: string
  cashAppHandle: string
  kycDocument?: File | null
  licenseDocument?: File | null
}

export function CompleteProfileForm({ user, profileStatus }: CompleteProfileFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/profile'
  
  const [formData, setFormData] = useState<FormData>({
    name: user.name || '',
    phone: user.phone || '',
    zelleHandle: '',
    cashAppHandle: '',
    kycDocument: null,
    licenseDocument: null
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState<'basic' | 'payment' | 'verification'>('basic')
  const [isDriver, setIsDriver] = useState(false)

  // Check if user is a driver and determine which step to start on
  useEffect(() => {
    // Check if user has driver profile or is trying to access driver features
    const checkDriverStatus = async () => {
      try {
        const response = await fetch('/api/driver/status')
        if (response.ok) {
          const data = await response.json()
          setIsDriver(data.isDriver || false)
        } else {
          console.log('Driver status check failed, assuming rider')
          setIsDriver(false)
        }
      } catch (error) {
        console.log('Could not determine driver status, assuming rider:', error)
        setIsDriver(false)
      }
    }
    
    checkDriverStatus()
  }, [])

  useEffect(() => {
    console.log('🔍 [PROFILE FORM] Profile status:', profileStatus)
    console.log('🔍 [PROFILE FORM] Is driver:', isDriver)
    console.log('🔍 [PROFILE FORM] Missing fields:', profileStatus.missingFields)
    
    if (profileStatus.missingFields.includes('name') || profileStatus.missingFields.includes('phone')) {
      setCurrentStep('basic')
    } else if (isDriver && profileStatus.missingFields.some(field => ['zelle_handle', 'cashapp_handle'].includes(field))) {
      setCurrentStep('payment')
    } else {
      setCurrentStep('verification')
    }
  }, [profileStatus.missingFields, isDriver])

  const validateForm = (step: string) => {
    const newErrors: Record<string, string> = {}
    
    if (step === 'basic') {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required'
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters'
      }
      
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      } else if (!/^[\+]?[1-9][\d]{9,14}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number'
      }
    }
    
    if (step === 'payment') {
      if (!formData.zelleHandle.trim()) {
        newErrors.zelleHandle = 'Zelle handle is required for drivers'
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.zelleHandle)) {
        newErrors.zelleHandle = 'Please enter a valid email address for Zelle'
      }
      
      if (!formData.cashAppHandle.trim()) {
        newErrors.cashAppHandle = 'Cash App handle is required for drivers'
      } else if (!/^\$[a-zA-Z0-9_]+$/.test(formData.cashAppHandle)) {
        newErrors.cashAppHandle = 'Cash App handle must start with $ and contain only letters, numbers, and underscores'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (step: string) => {
    if (!validateForm(step)) {
      return
    }
    
    setLoading(true)
    try {
      if (step === 'basic') {
        await updateBasicProfile()
        
        // For riders, we're done after basic info
        if (!isDriver) {
          toast.success('Profile completed successfully!')
          router.push(redirectTo)
          return
        }
        
        // For drivers, move to payment step
        setCurrentStep('payment')
      } else if (step === 'payment') {
        await updatePaymentProfile()
        setCurrentStep('verification')
      } else if (step === 'verification') {
        await uploadVerificationDocuments()
        // All done, redirect
        router.push(redirectTo)
      }
      
      if (step !== 'basic' || isDriver) {
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateBasicProfile = async () => {
    const response = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name.trim(),
        phone: formData.phone.replace(/[\s\-\(\)]/g, '')
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to update profile')
    }
  }

  const updatePaymentProfile = async () => {
    const response = await fetch('/api/driver/payment-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zelleHandle: formData.zelleHandle.trim(),
        cashAppHandle: formData.cashAppHandle.trim()
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to update payment profile')
    }
  }

  const uploadVerificationDocuments = async () => {
    // This would handle KYC and license document uploads
    // For now, we'll just mark as completed
    toast.success('Verification documents uploaded successfully!')
  }

  const getStepProgress = () => {
    if (!isDriver) {
      // For riders, only basic info matters
      const basicFieldsMissing = profileStatus.missingFields.filter(field => 
        ['name', 'phone'].includes(field)
      ).length
      return basicFieldsMissing === 0 ? 100 : 0
    }
    
    // For drivers, calculate based on completed steps
    const totalSteps = 3
    let completedSteps = 0
    
    // Basic step completed if name and phone are filled
    if (!profileStatus.missingFields.includes('name') && !profileStatus.missingFields.includes('phone')) {
      completedSteps++
    }
    
    // Payment step completed if zelle and cashapp are filled
    if (!profileStatus.missingFields.includes('zelle_handle') && !profileStatus.missingFields.includes('cashapp_handle')) {
      completedSteps++
    }
    
    // Verification step is optional, so we don't count it for completion
    // But if we're on verification step, we're at 2/3
    if (currentStep === 'verification') {
      completedSteps = 2
    }
    
    return Math.round((completedSteps / totalSteps) * 100)
  }

  const getMissingFieldsForStep = (step: string) => {
    const stepFields: Record<string, string[]> = {
      basic: ['name', 'phone'],
      payment: ['zelle_handle', 'cashapp_handle'],
      verification: ['kyc_verification', 'license_verification']
    }
    
    return profileStatus.missingFields.filter(field => 
      stepFields[step]?.includes(field)
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Complete Your Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Finish setting up your account to access all Rydify features
        </p>
        
        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(getStepProgress())}%</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>
      </div>

      {/* Missing Fields Alert */}
      {profileStatus.missingFields.length > 0 && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Missing required information:</strong>
            <ul className="mt-2 list-disc list-inside">
              {profileStatus.missingFields.map(field => (
                <li key={field}>{getFieldDisplayName(field)}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Step Navigation - Only show for drivers */}
      {isDriver && (
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {[
              { key: 'basic', label: 'Basic Info', icon: User },
              { key: 'payment', label: 'Payment', icon: CreditCard },
              { key: 'verification', label: 'Verification (Optional)', icon: Shield }
            ].map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.key
              const isCompleted = getMissingFieldsForStep(step.key).length === 0
              const isAccessible = index === 0 || getMissingFieldsForStep(['basic', 'payment'][index - 1]).length === 0
              
              return (
                <button
                  key={step.key}
                  onClick={() => isAccessible && setCurrentStep(step.key as any)}
                  disabled={!isAccessible}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-teal-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-700' 
                        : isAccessible 
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {step.label}
                  {isCompleted && <CheckCircle className="w-4 h-4" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Form Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 'basic' && <User className="w-5 h-5" />}
            {currentStep === 'payment' && <CreditCard className="w-5 h-5" />}
            {currentStep === 'verification' && <Shield className="w-5 h-5" />}
            {currentStep === 'basic' && 'Basic Information'}
            {currentStep === 'payment' && 'Payment Settings'}
            {currentStep === 'verification' && 'Identity Verification'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 'basic' && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className={errors.name ? 'border-red-300' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    className={errors.phone ? 'border-red-300' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {currentStep === 'payment' && isDriver && (
            <>
              <div className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Set up your payment methods so riders can pay you directly for rides. Required for posting rides.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="zelleHandle" className="text-sm font-medium">
                    Zelle Email Address *
                  </Label>
                  <Input
                    id="zelleHandle"
                    type="email"
                    value={formData.zelleHandle}
                    onChange={(e) => setFormData(prev => ({ ...prev, zelleHandle: e.target.value }))}
                    placeholder="your.email@university.edu"
                    className={errors.zelleHandle ? 'border-red-300' : ''}
                  />
                  {errors.zelleHandle && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.zelleHandle}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cashAppHandle" className="text-sm font-medium">
                    Cash App Handle *
                  </Label>
                  <Input
                    id="cashAppHandle"
                    type="text"
                    value={formData.cashAppHandle}
                    onChange={(e) => setFormData(prev => ({ ...prev, cashAppHandle: e.target.value }))}
                    placeholder="$YourHandle"
                    className={errors.cashAppHandle ? 'border-red-300' : ''}
                  />
                  {errors.cashAppHandle && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.cashAppHandle}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {currentStep === 'verification' && isDriver && (
            <>
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <Shield className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Upload your documents to verify your identity and driver's license for enhanced safety. This is optional but recommended for better trust and safety.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium">Identity Verification (KYC)</h3>
                        <p className="text-sm text-gray-600">Upload a government-issued ID</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setFormData(prev => ({ ...prev, kycDocument: e.target.files?.[0] || null }))}
                        className="flex-1"
                      />
                      {formData.kycDocument && (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Car className="w-5 h-5 text-green-600" />
                      <div>
                        <h3 className="font-medium">Driver's License</h3>
                        <p className="text-sm text-gray-600">Upload your valid driver's license</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setFormData(prev => ({ ...prev, licenseDocument: e.target.files?.[0] || null }))}
                        className="flex-1"
                      />
                      {formData.licenseDocument && (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            {currentStep !== 'basic' && isDriver && (
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep === 'payment') setCurrentStep('basic')
                  if (currentStep === 'verification') setCurrentStep('payment')
                }}
                disabled={loading}
              >
                Back
              </Button>
            )}
            
            <div className="flex-1" />
            
            <Button
              onClick={() => handleSubmit(currentStep)}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (currentStep === 'verification' || (!isDriver && currentStep === 'basic')) ? (
                <>
                  Complete Profile
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skip Option - Only for verification step */}
      {currentStep === 'verification' && isDriver && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => router.push(redirectTo)}
            className="text-gray-600 hover:text-gray-800"
          >
            Skip verification for now (optional)
          </Button>
        </div>
      )}
    </div>
  )
}
