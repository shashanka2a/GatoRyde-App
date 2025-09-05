'use client'

import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Plus, MapPin, Calendar, Users, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { RideSearchParams } from './RideSearchForm'

interface PostRideCardProps {
  searchParams: RideSearchParams
}

export function PostRideCard({ searchParams }: PostRideCardProps) {
  // Generate prefilled URL for drive page
  const generateDriveUrl = () => {
    const params = new URLSearchParams()
    
    if (searchParams.origin) {
      params.set('originText', searchParams.origin.text)
      params.set('originLat', searchParams.origin.center[1].toString())
      params.set('originLng', searchParams.origin.center[0].toString())
    }
    
    if (searchParams.destination) {
      params.set('destText', searchParams.destination.text)
      params.set('destLat', searchParams.destination.center[1].toString())
      params.set('destLng', searchParams.destination.center[0].toString())
    }
    
    if (searchParams.dateFrom) {
      params.set('departAt', searchParams.dateFrom)
    }
    
    params.set('seatsTotal', searchParams.seatsNeeded.toString())
    
    return `/drive?${params.toString()}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-1">
          <div className="bg-white rounded-lg">
            <CardContent className="text-center py-12 px-8">
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
                className="mb-6"
              >
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <Plus className="w-10 h-10" />
                </div>
              </motion.div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Didn't find a ride?
              </h3>
              
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                No worries! Post your own ride and let drivers know where you want to go. 
                You might find someone heading the same way.
              </p>

              {/* Search Summary */}
              {(searchParams.origin || searchParams.destination) && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-semibold text-gray-900 mb-3">Your search:</h4>
                  <div className="space-y-2 text-sm">
                    {searchParams.origin && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-teal-600" />
                        <span><strong>From:</strong> {searchParams.origin.text}</span>
                      </div>
                    )}
                    {searchParams.destination && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-teal-600" />
                        <span><strong>To:</strong> {searchParams.destination.text}</span>
                      </div>
                    )}
                    {searchParams.dateFrom && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span><strong>When:</strong> {new Date(searchParams.dateFrom).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span><strong>Seats needed:</strong> {searchParams.seatsNeeded}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-4"
                  >
                    <Link href={generateDriveUrl()}>
                      <Plus className="w-5 h-5 mr-2" />
                      Post This Ride
                    </Link>
                  </Button>
                </motion.div>

                <p className="text-xs text-gray-500">
                  We'll prefill the form with your search details
                </p>
              </div>

              {/* Benefits */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Quick & Easy</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-600">Find Fellow Students</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-600">Share Your Route</span>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}