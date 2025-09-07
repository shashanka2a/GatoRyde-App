'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { MessageSquare, Mail, Phone, Shield, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/lib/auth/useAuth'
import Link from 'next/link'

interface ContactDriverButtonProps {
  driver: {
    id: string
    name: string
    phone?: string
    email?: string
  }
  rideId: string
}

export function ContactDriverButton({ driver, rideId }: ContactDriverButtonProps) {
  const { user } = useAuth()
  const [showContactInfo, setShowContactInfo] = useState(false)

  const isVerified = user?.eduVerified

  if (!isVerified) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <Alert className="border-orange-200 bg-orange-50">
            <Shield className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Student Verification Required</strong>
              <p className="mt-2 text-sm">
                Verify your .edu email to contact drivers and join rides safely.
              </p>
              <div className="mt-3">
                <Link href="/auth/login?redirect=/ride">
                  <Button 
                    size="sm" 
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Student Email
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-teal-600" />
            <h3 className="font-semibold text-gray-900">Contact Driver</h3>
          </div>
          
          <p className="text-sm text-gray-600">
            Reach out to {driver.name} about this ride
          </p>

          {!showContactInfo ? (
            <Button 
              onClick={() => setShowContactInfo(true)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Show Contact Info
            </Button>
          ) : (
            <div className="space-y-3">
              {driver.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <a 
                      href={`tel:${driver.phone}`}
                      className="text-sm text-teal-600 hover:text-teal-700"
                    >
                      {driver.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {driver.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a 
                      href={`mailto:${driver.email}?subject=Question about ride ${rideId}`}
                      className="text-sm text-teal-600 hover:text-teal-700"
                    >
                      {driver.email}
                    </a>
                  </div>
                </div>
              )}

              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Safety Tip:</strong> Always meet in public places and verify the driver's identity before getting in the car.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
