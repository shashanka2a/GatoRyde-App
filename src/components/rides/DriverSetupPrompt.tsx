'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Badge } from '@/src/components/ui/badge'
import { 
  Car, 
  Shield, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Star,
  MapPin,
  Zap,
  ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion'


interface DriverSetupPromptProps {
  onStartSetup: () => void
  userEduVerified: boolean
}

export function DriverSetupPrompt({ onStartSetup, userEduVerified }: DriverSetupPromptProps) {
  const [selectedBenefit, setSelectedBenefit] = useState<number | null>(null)

  const benefits = [
    {
      icon: DollarSign,
      title: "Earn Extra Cash",
      description: "Make money while helping fellow students get around campus",
      highlight: "Up to $50+ per trip",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200"
    },
    {
      icon: Users,
      title: "Help Your Community",
      description: "Connect with fellow students and build campus relationships",
      highlight: "Safe, verified riders",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: MapPin,
      title: "Share Your Route",
      description: "Going somewhere anyway? Share the ride and split costs",
      highlight: "Reduce travel expenses",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      icon: Shield,
      title: "Verified & Safe",
      description: "All riders are verified UF students for your safety",
      highlight: "Student-only platform",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ]

  const setupSteps = [
    {
      step: 1,
      title: "Choose Your Ride Type",
      description: "Local campus rides or long-distance trips",
      time: "30 seconds",
      icon: MapPin
    },
    {
      step: 2,
      title: "Vehicle Information",
      description: "Tell us about your car for rider safety",
      time: "2 minutes",
      icon: Car
    },
    {
      step: 3,
      title: "License Upload",
      description: "Optional for local rides, required for long trips",
      time: "1 minute",
      icon: Shield
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Static Background Elements for better performance */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute bottom-20 right-32 w-24 h-24 bg-white/10 rounded-full" />
        
        <div className="container mx-auto py-20 px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Car className="w-12 h-12 text-yellow-300" />
                <h1 className="text-3xl lg:text-4xl font-bold">
                  Become a <span className="text-yellow-300">Driver</span>
                </h1>
              </div>
              
              <p className="text-xl text-teal-100 mb-8 max-w-3xl mx-auto">
                Join thousands of UF students earning money while helping their community get around campus and beyond.
              </p>

              {userEduVerified && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Student Verification Complete ✓
                  </Badge>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Drive with Rydify?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                More than just ridesharing - it's about building community while earning money
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedBenefit === index 
                      ? `${benefit.bgColor} ${benefit.borderColor} shadow-lg scale-105` 
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedBenefit(selectedBenefit === index ? null : index)}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <benefit.icon className={`w-8 h-8 ${benefit.color} mb-4`} />
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{benefit.description}</p>
                  <Badge variant="secondary" className={`${benefit.bgColor} ${benefit.color} text-xs`}>
                    {benefit.highlight}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Setup Process */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Quick & Easy Setup Process
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Get started in under 5 minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                  {setupSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      className="text-center relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    >
                      <div className="relative mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                          <step.icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-900">{step.step}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                      <Badge variant="outline" className="text-xs font-bold bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Clock className="w-3 h-3 mr-1" />
                        {step.time}
                      </Badge>
                      
                      {/* Vertical Divider */}
                      {index < setupSteps.length - 1 && (
                        <div className="hidden md:block absolute top-8 -right-3 w-0.5 h-16 bg-gradient-to-b from-teal-300 to-emerald-300"></div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call to Action - Redesigned */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="shadow-2xl border-0 bg-white overflow-hidden relative">
              {/* Gradient accent border */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 p-1 rounded-lg">
                <div className="bg-white rounded-lg h-full w-full"></div>
              </div>
              
              <CardContent className="relative p-8 lg:p-12">
                <div className="text-center space-y-8">
                  {/* Header with better visual hierarchy */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-3 rounded-full">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                      Start Earning <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Today</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                      Join 10,000+ verified UF students earning money while building community connections
                    </p>
                  </div>

                  {/* Enhanced value proposition */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
                    <div className="text-center">
                      <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Earn $15-50+ per trip</h3>
                      <p className="text-sm text-gray-600">Cover gas costs and make extra money</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">5-minute setup</h3>
                      <p className="text-sm text-gray-600">Quick verification, start immediately</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">100% safe rides</h3>
                      <p className="text-sm text-gray-600">Verified students only platform</p>
                    </div>
                  </div>

                  {/* Improved CTA buttons */}
                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={onStartSetup}
                        size="lg"
                        className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-12 py-6 text-xl font-bold rounded-2xl w-full sm:w-auto min-w-[300px]"
                      >
                        <Car className="w-6 h-6 mr-3" />
                        Start Earning Now
                        <ArrowRight className="w-6 h-6 ml-3" />
                      </Button>
                    </motion.div>
                  </div>

                  {/* Trust indicators */}
                  <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>No upfront costs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Flexible schedule</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Student-verified riders</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>


        </div>
      </div>
    </div>
  )
}