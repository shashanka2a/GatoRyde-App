'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { FirstTimeDriverOnboarding } from './FirstTimeDriverOnboarding'

export function FirstTimeDriverDemo() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [completedData, setCompletedData] = useState<any>(null)

  const handleComplete = (data: any) => {
    setCompletedData(data)
    setShowOnboarding(false)
    
    // Simulate saving to localStorage
    localStorage.setItem('hasDriverProfile', 'true')
    localStorage.setItem('driverOnboardingData', JSON.stringify(data))
  }

  const handleSkip = () => {
    setShowOnboarding(false)
  }

  const resetDemo = () => {
    localStorage.removeItem('hasDriverProfile')
    localStorage.removeItem('driverOnboardingData')
    setCompletedData(null)
    setShowOnboarding(false)
  }

  if (showOnboarding) {
    return (
      <FirstTimeDriverOnboarding
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>First-Time Driver Onboarding Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            This demo shows the onboarding flow for verified students who select "Drive" for the first time.
          </p>
          
          <div className="flex gap-4">
            <Button 
              onClick={() => setShowOnboarding(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Start First-Time Driver Onboarding
            </Button>
            <Button 
              variant="outline"
              onClick={resetDemo}
            >
              Reset Demo
            </Button>
          </div>

          {completedData && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Onboarding Completed!</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p><strong>Ride Type:</strong> {completedData.isLocalRidesOnly ? 'Local Campus Rides Only' : 'All Rides (Local + Long Distance)'}</p>
                <p><strong>License Uploaded:</strong> {completedData.licenseUploaded ? 'Yes' : 'No'}</p>
                <p><strong>Vehicle:</strong> {completedData.vehicleInfo.year} {completedData.vehicleInfo.color} {completedData.vehicleInfo.make} {completedData.vehicleInfo.model}</p>
                <p><strong>Seats:</strong> {completedData.vehicleInfo.seats} total ({completedData.vehicleInfo.seats - 1} available for passengers)</p>
                <p><strong>License Plate:</strong> {completedData.vehicleInfo.licensePlate}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}