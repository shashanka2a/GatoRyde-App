'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Badge } from '@/src/components/ui/badge'
import { 
  Car, 
  MapPin, 
  Plus, 
  AlertTriangle, 
  Shield, 
  Users, 
  DollarSign, 
  Zap,
  Clock,
  Route,
  CheckCircle,
  Building2
} from 'lucide-react'
import { motion } from 'framer-motion'

import { CreateRideForm } from '@/src/components/rides/CreateRideForm'
import Link from 'next/link'

interface DrivePageClientProps {
  userEduVerified: boolean
}

export function DrivePageClient({ userEduVerified }: DrivePageClientProps) {
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('local')

  useEffect(() => {
    // Mock driver data for MVP - assume user is verified driver with vehicle
    setDriver({
      verified: true,
      vehicle: { id: 'mock-vehicle', seats: 4 },
      kycVerified: true, // For inter-city rides
      licenseVerified: true
    })
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Car className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-600 font-medium">Setting up your driver profile...</p>
        </div>
      </div>
    )
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
                          <Link href="/profile">
                            <Button 
                              size="lg"
                              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Zap className="w-5 h-5 mr-2" />
                              Start Driver Registration
                            </Button>
                          </Link>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1"
                        >
                          <Link href="/rides">
                            <Button 
                              variant="outline" 
                              size="lg"
                              className="w-full border-teal-600 text-teal-600 hover:bg-teal-50 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Users className="w-5 h-5 mr-2" />
                              Find Rides Instead
                            </Button>
                          </Link>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* Enhanced Header to match Find Ride style */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Car className="w-8 h-8 text-yellow-300" />
                <h1 className="text-2xl lg:text-3xl font-bold">Become a Driver</h1>
              </motion.div>
              <div className="hidden md:flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full">
                <Shield className="h-4 w-4" />
                <span>Verified Students Only</span>
              </div>
            </div>
            <motion.p
              className="text-teal-100 max-w-xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Join thousands of students earning money while helping their community get around campus and beyond
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
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
                <span>Campus & Inter-city Routes</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Verification Status */}
          {!userEduVerified && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Alert className="mb-6 border-orange-200 bg-orange-50">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Verification Required:</strong> Complete your student verification to start offering rides.
                  <Link href="/profile" className="ml-2 text-orange-600 hover:text-orange-700 underline font-medium">
                    Verify Now →
                  </Link>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Ride Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-1">
                <div className="bg-white rounded-lg">
                  <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Car className="w-6 h-6" />
                      Choose Ride Type
                    </CardTitle>
                    <CardDescription className="text-teal-100">
                      Select the type of ride you want to offer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                        <TabsTrigger 
                          value="local" 
                          className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white"
                        >
                          <MapPin className="w-4 h-4" />
                          Local Rides
                        </TabsTrigger>
                        <TabsTrigger 
                          value="intercity" 
                          className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white"
                        >
                          <Building2 className="w-4 h-4" />
                          Inter-city Rides
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="local" className="mt-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                              <h3 className="font-semibold text-green-900">Local Campus Rides</h3>
                              <p className="text-sm text-green-700 mt-1">
                                Perfect for campus routes, nearby areas, and short-distance trips. 
                                Basic verification required.
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-teal-600" />
                              <span>Student verification</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-teal-600" />
                              <span>Vehicle registration</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Route className="w-4 h-4 text-teal-600" />
                              <span>Up to 50 miles</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="intercity" className="mt-6">
                        <div className="space-y-4">
                          {driver?.kycVerified && driver?.licenseVerified ? (
                            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                              <div>
                                <h3 className="font-semibold text-green-900">Inter-city Rides Available</h3>
                                <p className="text-sm text-green-700 mt-1">
                                  You're verified for long-distance rides between cities. 
                                  Higher earning potential for longer trips.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                              <div>
                                <h3 className="font-semibold text-orange-900">Additional Verification Required</h3>
                                <p className="text-sm text-orange-700 mt-1">
                                  Inter-city rides require enhanced verification for safety and trust.
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Shield className={`w-4 h-4 ${driver?.kycVerified ? 'text-green-600' : 'text-gray-400'}`} />
                              <span className={driver?.kycVerified ? 'text-gray-700' : 'text-gray-400'}>
                                KYC verification
                              </span>
                              {driver?.kycVerified && <Badge variant="secondary" className="ml-1 text-xs bg-green-100 text-green-800">✓</Badge>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Car className={`w-4 h-4 ${driver?.licenseVerified ? 'text-green-600' : 'text-gray-400'}`} />
                              <span className={driver?.licenseVerified ? 'text-gray-700' : 'text-gray-400'}>
                                License verification
                              </span>
                              {driver?.licenseVerified && <Badge variant="secondary" className="ml-1 text-xs bg-green-100 text-green-800">✓</Badge>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Route className="w-4 h-4 text-teal-600" />
                              <span>50+ miles</span>
                            </div>
                          </div>

                          {(!driver?.kycVerified || !driver?.licenseVerified) && (
                            <div className="pt-4">
                              <Link href="/profile">
                                <Button 
                                  variant="outline"
                                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                                >
                                  <Shield className="w-4 h-4 mr-2" />
                                  Complete Verification
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </div>
              </div>
            </Card>

            {/* Create Ride Form */}
            {(activeTab === 'local' || (activeTab === 'intercity' && driver?.kycVerified && driver?.licenseVerified)) && (
              <CreateRideForm />
            )}
          </motion.div>
        </div>
      </div>
      
    </div>
  )
}