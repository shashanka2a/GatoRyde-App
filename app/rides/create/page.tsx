'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreateRideForm } from '@/src/components/rides/CreateRideForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Button } from '@/src/components/ui/button'
import { Car, Shield, AlertTriangle, CheckCircle, Users, MapPin, DollarSign, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

import { PageLoading } from '@/src/components/ui/loading'
import Link from 'next/link'

function CreateRideContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSkippedNotice, setShowSkippedNotice] = useState(false)

  useEffect(() => {
    // Check if user skipped onboarding
    const skipped = searchParams.get('skipped')
    if (skipped === 'true') {
      setShowSkippedNotice(true)
    }

    // Check driver status
    const checkDriverStatus = () => {
      const hasDriverProfile = localStorage.getItem('hasDriverProfile')
      const hasCreatedRide = localStorage.getItem('hasCreatedRide')
      
      if (!hasDriverProfile && !hasCreatedRide && !skipped) {
        // First-time driver - redirect to onboarding
        router.push('/driver/onboarding')
        return
      }
      
      // User has profile or skipped - show create form
      setDriver({
        verified: true,
        vehicle: { id: 'mock-vehicle' },
        hasProfile: !!hasDriverProfile
      })
      
      setLoading(false)
    }

    checkDriverStatus()
  }, [router, searchParams])

  if (loading) {
    return <PageLoading text="Setting up your driver profile..." />
  }

  // Check if user needs to complete driver setup
  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-1">
                  <div className="bg-white rounded-lg">
                    <CardHeader className="text-center pb-6">
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, 0, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Car className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                      </motion.div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        Driver Registration Required
                      </CardTitle>
                      <CardDescription className="text-lg text-gray-600 mt-2">
                        Join our community of verified student drivers
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Alert className="border-orange-200 bg-orange-50">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                          <strong>Registration Required:</strong> To offer rides on Rydify, you must complete driver registration and verification.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-900">What you'll need:</h3>
                        <div className="grid gap-3">
                          {[
                            { icon: Shield, text: "Valid driver's license", color: "text-blue-600" },
                            { icon: Car, text: "Vehicle registration and insurance", color: "text-green-600" },
                            { icon: CheckCircle, text: "Identity verification", color: "text-purple-600" }
                          ].map((item, index) => (
                            <motion.div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, x: 5 }}
                            >
                              <item.icon className={`w-5 h-5 ${item.color}`} />
                              <span className="text-gray-700 font-medium">{item.text}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1"
                        >
                          <Button 
                            asChild
                            size="lg"
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <Link href="/dashboard/driver/register">
                              <Zap className="w-5 h-5 mr-2" />
                              Start Driver Registration
                            </Link>
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1"
                        >
                          <Button 
                            variant="outline" 
                            asChild
                            size="lg"
                            className="w-full border-teal-600 text-teal-600 hover:bg-teal-50 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <Link href="/rides">
                              <Users className="w-5 h-5 mr-2" />
                              Browse Rides Instead
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

  // Check if driver is verified
  if (!driver.verified) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Verification Required
              </CardTitle>
              <CardDescription>
                Your driver account needs to be verified before you can offer rides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Your driver verification is currently pending review. 
                  You'll receive an email once it's approved.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h3 className="font-semibold">What happens next:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Our team will review your submitted documents</li>
                  <li>• Verification typically takes 24-48 hours</li>
                  <li>• You'll receive an email notification when approved</li>
                  <li>• Once verified, you can start offering rides</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/dashboard/kyc">
                    Check Verification Status
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/rides">
                    Browse Rides Instead
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Check if driver has a vehicle
  if (!driver.vehicle) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Vehicle Registration Required
              </CardTitle>
              <CardDescription>
                You need to register a vehicle before offering rides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Please register your vehicle to start offering rides to other students.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h3 className="font-semibold">Vehicle requirements:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Must be 2000 model year or newer</li>
                  <li>• Valid registration and insurance</li>
                  <li>• Clean and safe condition</li>
                  <li>• 2-8 passenger capacity</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/dashboard/vehicle/register">
                    Register Vehicle
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/rides">
                    Browse Rides Instead
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // All checks passed - show the create ride form
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* Hero Header */}
      {(
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <motion.div
            className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-10 right-20 w-16 h-16 bg-white/10 rounded-full"
            animate={{
              y: [0, 20, 0],
              rotate: [0, -180, -360]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <div className="container mx-auto py-16 px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.h1 
                  className="text-4xl lg:text-5xl font-bold mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Offer a <span className="text-yellow-300">Ride</span>
                </motion.h1>
                <motion.p 
                  className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Share your journey and earn money while helping fellow students get around campus and beyond.
                </motion.p>
                
                <motion.div 
                  className="flex flex-wrap justify-center gap-4 text-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                    <DollarSign className="h-4 w-4" />
                    <span>Earn Extra Cash</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                    <Users className="h-4 w-4" />
                    <span>Help Fellow Students</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                    <MapPin className="h-4 w-4" />
                    <span>Share Your Route</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <CreateRideForm 
            showSkippedNotice={showSkippedNotice}
          />
        </motion.div>
      </div>
      
    </div>
  )
}

export default function CreateRidePage() {
  return (
    <Suspense fallback={<PageLoading text="Loading ride creation..." />}>
      <CreateRideContent />
    </Suspense>
  )
}