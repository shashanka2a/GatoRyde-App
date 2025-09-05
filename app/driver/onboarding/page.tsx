'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DriverSetupPrompt } from '@/src/components/rides/DriverSetupPrompt'
import { FirstTimeDriverOnboarding } from '@/src/components/rides/FirstTimeDriverOnboarding'
import { PageLoading } from '@/src/components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Button } from '@/src/components/ui/button'
import { CheckCircle, ArrowRight, Car } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

function DriverOnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [userEduVerified, setUserEduVerified] = useState(true)
  const [currentStep, setCurrentStep] = useState<'prompt' | 'onboarding' | 'completed'>('prompt')
  const [onboardingData, setOnboardingData] = useState<any>(null)

  // Check if user should be here
  useEffect(() => {
    const checkUserStatus = () => {
      // Check if user has already completed onboarding
      const hasDriverProfile = localStorage.getItem('hasDriverProfile')
      const completedData = localStorage.getItem('driverOnboardingData')
      
      if (hasDriverProfile && completedData) {
        // User has already completed onboarding
        setOnboardingData(JSON.parse(completedData))
        setCurrentStep('completed')
      } else {
        // Check if they came from a specific step
        const step = searchParams.get('step')
        if (step === 'onboarding') {
          setCurrentStep('onboarding')
        } else {
          setCurrentStep('prompt')
        }
      }
      
      // Mock user verification status - replace with real check
      setUserEduVerified(true)
      setLoading(false)
    }

    checkUserStatus()
  }, [searchParams])

  const handleStartSetup = () => {
    setCurrentStep('onboarding')
    // Update URL without page reload
    window.history.pushState({}, '', '/driver/onboarding?step=onboarding')
  }



  const handleOnboardingComplete = (data: any) => {
    // Save onboarding data
    localStorage.setItem('hasDriverProfile', 'true')
    localStorage.setItem('driverOnboardingData', JSON.stringify(data))
    
    setOnboardingData(data)
    setCurrentStep('completed')
    
    // Update URL
    window.history.pushState({}, '', '/driver/onboarding?completed=true')
  }



  if (loading) {
    return <PageLoading text="Setting up your driver onboarding..." />
  }

  // Completed state
  if (currentStep === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="shadow-2xl border-0 bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1">
                  <div className="bg-white rounded-lg">
                    <CardHeader className="text-center pb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                      </motion.div>
                      <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome to the Driver Community!
                      </CardTitle>
                      <p className="text-lg text-gray-600">
                        Your driver setup is complete. You're ready to start offering rides!
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Onboarding Summary */}
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-900 mb-4">Your Driver Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-green-700 font-medium">Ride Type:</span>
                            <p className="text-green-800">
                              {onboardingData?.isLocalRidesOnly ? 'Local Campus Rides' : 'All Rides (Local + Long Distance)'}
                            </p>
                          </div>
                          <div>
                            <span className="text-green-700 font-medium">License Status:</span>
                            <p className="text-green-800">
                              {onboardingData?.licenseUploaded ? 'Uploaded (Pending Review)' : 'Not Required'}
                            </p>
                          </div>
                          <div>
                            <span className="text-green-700 font-medium">Vehicle:</span>
                            <p className="text-green-800">
                              {onboardingData?.vehicleInfo?.year} {onboardingData?.vehicleInfo?.color} {onboardingData?.vehicleInfo?.make} {onboardingData?.vehicleInfo?.model}
                            </p>
                          </div>
                          <div>
                            <span className="text-green-700 font-medium">Available Seats:</span>
                            <p className="text-green-800">
                              Up to {(onboardingData?.vehicleInfo?.seats || 5) - 1} passengers
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Next Steps */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">What's Next?</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                            <div>
                              <p className="font-medium text-blue-900">Create Your First Ride</p>
                              <p className="text-sm text-blue-700">Start earning by offering rides to fellow Gators</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                            <div>
                              <p className="font-medium text-purple-900">Complete Verification</p>
                              <p className="text-sm text-purple-700">We'll review your documents within 24 hours</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                            <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                            <div>
                              <p className="font-medium text-orange-900">Start Earning</p>
                              <p className="text-sm text-orange-700">Accept ride requests and build your reputation</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1"
                        >
                          <Button
                            asChild
                            size="lg"
                            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <Link href="/rides/create">
                              <Car className="w-5 h-5 mr-2" />
                              Create Your First Ride
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            asChild
                            size="lg"
                            className="border-teal-600 text-teal-600 hover:bg-teal-50"
                          >
                            <Link href="/dashboard/driver">
                              View Driver Dashboard
                            </Link>
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // Onboarding flow
  if (currentStep === 'onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
        <div className="container mx-auto py-8 px-4">
          <FirstTimeDriverOnboarding
            onComplete={handleOnboardingComplete}
          />
        </div>
      </div>
    )
  }

  // Setup prompt (default)
  return (
    <DriverSetupPrompt
      onStartSetup={handleStartSetup}
      userEduVerified={userEduVerified}
    />
  )
}

export default function DriverOnboardingPage() {
  return (
    <Suspense fallback={<PageLoading text="Loading driver onboarding..." />}>
      <DriverOnboardingContent />
    </Suspense>
  )
}