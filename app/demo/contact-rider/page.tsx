'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Smartphone,
  Monitor,
  Check,
  X,
  Info,
  ExternalLink
} from 'lucide-react'
import { openSMS, openEmail, getPlatformName, isMobile } from '@/src/utils/platform'

export default function ContactRiderDemoPage() {
  const [lastAction, setLastAction] = useState<string | null>(null)

  const mockRider = {
    id: 'user_1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@ufl.edu',
    phone: '+1234567890',
    photoUrl: null,
    ratingAvg: 4.8,
    ratingCount: 12,
    eduVerified: true,
    university: 'University of Florida'
  }

  const handleContactDemo = (method: 'sms' | 'email') => {
    if (method === 'sms' && mockRider.phone) {
      openSMS(mockRider.phone, 'Confirming your Rydify booking')
      setLastAction(`SMS sent to ${mockRider.phone}`)
    } else if (method === 'email') {
      openEmail(mockRider.email, 'Rydify Ride Confirmation')
      setLastAction(`Email sent to ${mockRider.email}`)
    }
  }

  const platformName = getPlatformName()
  const isMobileDevice = isMobile()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Rider Demo</h1>
          <p className="text-lg text-gray-600">
            Test the contact rider functionality for drivers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Card */}
          <div>
            <Card className="border-orange-200 bg-orange-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                  Ride Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rider Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={mockRider.photoUrl || ''} />
                    <AvatarFallback className="bg-teal-100 text-teal-700">
                      {mockRider.name?.charAt(0) || 'R'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{mockRider.name}</span>
                      {mockRider.eduVerified && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {mockRider.university}
                    </div>
                    <div className="text-xs text-gray-500">
                      ⭐ {mockRider.ratingAvg} ({mockRider.ratingCount} rides)
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{mockRider.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{mockRider.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContactDemo('email')}
                      className="flex items-center gap-1 text-xs px-3 py-2"
                    >
                      <Mail className="w-3 h-3" />
                      Email
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContactDemo('sms')}
                      className="flex items-center gap-1 text-xs px-3 py-2"
                    >
                      <MessageSquare className="w-3 h-3" />
                      SMS
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                    
                    <Button
                      size="sm"
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </Button>
                  </div>
                </div>

                {/* Last Action */}
                {lastAction && (
                  <Alert className="border-green-200 bg-green-50">
                    <Check className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Action performed:</strong> {lastAction}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Platform Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {isMobileDevice ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                  Platform: {platformName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">SMS Contact</h4>
                      <p className="text-sm text-gray-600">
                        Opens default SMS app with pre-filled message: "Confirming your Rydify booking"
                      </p>
                      {isMobileDevice && (
                        <Badge variant="secondary" className="mt-1 text-xs bg-green-100 text-green-800">
                          Native SMS app
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Email Contact</h4>
                      <p className="text-sm text-gray-600">
                        Opens default mail app with subject: "Rydify Ride Confirmation"
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs bg-blue-100 text-blue-800">
                        Default mail client
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Implementation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5" />
                  Implementation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">SMS Integration</h4>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      {isMobileDevice 
                        ? 'sms:+1234567890?body=Confirming%20your%20Rydify%20booking'
                        : 'sms:+1234567890?body=Confirming%20your%20Rydify%20booking'
                      }
                    </code>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Email Integration</h4>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      mailto:sarah.johnson@ufl.edu?subject=Rydify%20Ride%20Confirmation
                    </code>
                  </div>
                </div>

                <Alert>
                  <ExternalLink className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    Contact buttons use native URL schemes to open default apps. 
                    This works across iOS, Android, and desktop platforms.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Test</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                    <span>Click the Email or SMS button above</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                    <span>Your default mail/SMS app should open</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                    <span>The message will be pre-filled with confirmation text</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                    <span>Driver can customize the message before sending</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}