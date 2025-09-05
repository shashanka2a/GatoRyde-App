'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { CreateRideForm } from './CreateRideForm'
import { Car, RotateCcw, Play } from 'lucide-react'

export function DriverFlowDemo() {
  const [demoState, setDemoState] = useState<'setup' | 'running'>('setup')
  const [isFirstTimeDriver, setIsFirstTimeDriver] = useState(true)
  const [userEduVerified, setUserEduVerified] = useState(true)

  const startDemo = () => {
    // Clear any existing driver data
    localStorage.removeItem('hasDriverProfile')
    localStorage.removeItem('driverOnboardingData')
    localStorage.removeItem('hasCreatedRide')
    
    setDemoState('running')
  }

  const resetDemo = () => {
    localStorage.removeItem('hasDriverProfile')
    localStorage.removeItem('driverOnboardingData')
    localStorage.removeItem('hasCreatedRide')
    
    setDemoState('setup')
    setIsFirstTimeDriver(true)
  }

  if (demoState === 'running') {
    return (
      <div className="space-y-4">
        {/* Demo Controls */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Demo Mode
                </Badge>
                <span className="text-sm text-blue-700">
                  First-Time Driver Flow Active
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetDemo}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* The actual flow */}
        <CreateRideForm 
          isFirstTimeDriver={isFirstTimeDriver}
          userEduVerified={userEduVerified}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-6 h-6 text-teal-600" />
            First-Time Driver Flow Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              This demo shows the complete first-time driver experience when a verified student selects "Drive" for the first time.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Demo Flow:</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                  <span><strong>Driver Setup Prompt:</strong> Engaging welcome screen with benefits and setup overview</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                  <span><strong>Ride Type Selection:</strong> Choose between local campus rides or all rides</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                  <span><strong>License Upload:</strong> Optional for local rides, required for long-distance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                  <span><strong>Vehicle Information:</strong> Complete vehicle details and seat capacity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">5</span>
                  <span><strong>Ride Creation:</strong> Access to the enhanced ride creation form</span>
                </li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">User Status</label>
                <div className="flex gap-2">
                  <Button
                    variant={userEduVerified ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUserEduVerified(true)}
                    className="text-xs"
                  >
                    Verified Student
                  </Button>
                  <Button
                    variant={!userEduVerified ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUserEduVerified(false)}
                    className="text-xs"
                  >
                    Unverified
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Driver Status</label>
                <div className="flex gap-2">
                  <Button
                    variant={isFirstTimeDriver ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsFirstTimeDriver(true)}
                    className="text-xs"
                  >
                    First-Time
                  </Button>
                  <Button
                    variant={!isFirstTimeDriver ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsFirstTimeDriver(false)}
                    className="text-xs"
                  >
                    Existing
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={startDemo}
            size="lg"
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Demo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}