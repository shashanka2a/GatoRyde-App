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
  Building2,
  MessageSquare
} from 'lucide-react'
import { motion } from 'framer-motion'

import { CreateRideForm } from '@/src/components/rides/CreateRideForm'
import Link from 'next/link'

interface DrivePageClientProps {
  userEduVerified: boolean
}

export default function DrivePageClient({ userEduVerified }: DrivePageClientProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Streamlined Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
        </div>
        
        <div className="container mx-auto py-12 px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Car className="w-8 h-8 text-yellow-300" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold">Start Driving</h1>
              </div>
              
              <p className="text-xl lg:text-2xl text-teal-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Turn your car into cash. Help fellow students while earning money on your daily commute.
              </p>
              
              {/* Key Benefits - Simplified */}
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-medium">Earn $15-30/hour</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Help Students</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Verified Community</span>
                </div>
              </div>
              
              {/* Primary CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Button 
                  size="lg"
                  className="bg-white text-teal-600 hover:bg-teal-50 shadow-2xl hover:shadow-3xl transition-all duration-300 px-8 py-4 text-lg font-semibold"
                  onClick={() => document.getElementById('ride-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Car className="w-5 h-5 mr-2" />
                  Create Your First Ride
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Verification Status - Prominent */}
          {!userEduVerified && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Student Verification Required</strong>
                      <p className="text-sm mt-1">Complete your .edu verification to start offering rides</p>
                    </div>
                    <Link href="/profile">
                      <Button 
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        Verify Now
                      </Button>
                    </Link>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="text-center p-6 bg-white shadow-lg border-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Average Earnings</h3>
              <p className="text-2xl font-bold text-green-600">$25/hour</p>
              <p className="text-sm text-gray-500">Based on local rides</p>
            </Card>
            
            <Card className="text-center p-6 bg-white shadow-lg border-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Active Drivers</h3>
              <p className="text-2xl font-bold text-blue-600">2,500+</p>
              <p className="text-sm text-gray-500">Students earning</p>
            </Card>
            
            <Card className="text-center p-6 bg-white shadow-lg border-0">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Safety Rating</h3>
              <p className="text-2xl font-bold text-purple-600">4.9/5</p>
              <p className="text-sm text-gray-500">Verified community</p>
            </Card>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Ride Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <CreateRideForm />
              </motion.div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Verification Status */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="w-5 h-5 text-teal-600" />
                      Verification Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">Student ID</p>
                            <p className="text-xs text-green-700">Verified</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-amber-600" />
                          <div>
                            <p className="font-medium text-amber-900">Driver License</p>
                            <p className="text-xs text-amber-700">Pending</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">⏳</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Car className="w-5 h-5 text-amber-600" />
                          <div>
                            <p className="font-medium text-amber-900">Vehicle Info</p>
                            <p className="text-xs text-amber-700">Pending</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">⏳</Badge>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-teal-600 text-teal-600 hover:bg-teal-50"
                      onClick={() => window.location.href = '/profile'}
                    >
                      Complete Verification
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Vehicle Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Car className="w-5 h-5 text-teal-600" />
                      Your Vehicle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">2020 Honda Civic</p>
                          <p className="text-sm text-gray-600">5 seats • Up to 4 passengers</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                        Pending Verification
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tips Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      Pro Tips
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Set competitive prices to get more bookings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Add pickup instructions for better experience</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Verify your vehicle to offer more seats</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}