'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Badge } from '@/src/components/ui/badge'
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  CreditCard
} from 'lucide-react'

interface Driver {
  name: string
  phone: string
  email: string
  verified: boolean
  zelleHandle?: string | null
  cashAppHandle?: string | null
}

interface Ride {
  destText: string
  departAt: Date
}

interface CurrentUser {
  eduVerified: boolean
}

interface ContactDriverCardProps {
  driver: Driver
  ride: Ride
  currentUser: CurrentUser
  bookingId?: string
  className?: string
}

interface VerifyCalloutProps {
  className?: string
}

function VerifyCallout({ className }: VerifyCalloutProps) {
  return (
    <Alert className={className}>
      <AlertTriangle className="w-4 h-4" />
      <AlertDescription>
        Only verified students can contact drivers. 
        <Button 
          variant="link" 
          className="p-0 h-auto font-medium text-primary hover:underline ml-1"
          onClick={() => window.location.href = '/app/profile'}
        >
          Verify your student email
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export function ContactDriverCard({ 
  driver, 
  ride, 
  currentUser, 
  bookingId,
  className 
}: ContactDriverCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if both user and driver are verified
  const canContact = currentUser.eduVerified && driver.verified

  // Generate message content
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const messageTemplate = `Hi, I'm interested in your ride to ${ride.destText} on ${formatDate(ride.departAt)}. Can I book a seat?`
  const encodedMessage = encodeURIComponent(messageTemplate)
  const emailSubject = encodeURIComponent(`Ride Request - ${ride.destText}`)

  // Detect platform for SMS links
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
  const smsLink = isIOS 
    ? `sms:+1${driver.phone}&body=${encodedMessage}`
    : `sms:+1${driver.phone}?body=${encodedMessage}`

  const emailLink = `mailto:${driver.email}?subject=${emailSubject}&body=${encodedMessage}`

  const logContact = async (method: 'sms' | 'email') => {
    if (!bookingId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/contacts/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          method,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to log contact')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log contact')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSMSClick = async () => {
    await logContact('sms')
    if (!error) {
      window.location.href = smsLink
    }
  }

  const handleEmailClick = async () => {
    await logContact('email')
    if (!error) {
      window.location.href = emailLink
    }
  }

  if (!canContact) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5" />
            Contact Driver
          </CardTitle>
          <CardDescription>
            Connect with your driver to coordinate pickup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyCallout />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Contact Driver
        </CardTitle>
        <CardDescription>
          Both you and the driver are verified students
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Contact Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={handleSMSClick}
            disabled={isLoading}
            variant="outline"
            className="w-full justify-start h-12 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={`Send SMS to ${driver.name}`}
          >
            <Phone className="w-4 h-4 mr-2" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Text Driver</span>
              <span className="text-xs text-muted-foreground">Opens SMS app</span>
            </div>
            <ExternalLink className="w-4 h-4 ml-auto" />
          </Button>

          <Button
            onClick={handleEmailClick}
            disabled={isLoading}
            variant="outline"
            className="w-full justify-start h-12 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={`Send email to ${driver.name}`}
          >
            <Mail className="w-4 h-4 mr-2" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Email Driver</span>
              <span className="text-xs text-muted-foreground">Opens email app</span>
            </div>
            <ExternalLink className="w-4 h-4 ml-auto" />
          </Button>
        </div>

        {/* Payment Methods */}
        {(driver.zelleHandle || driver.cashAppHandle) && (
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {driver.zelleHandle && (
                <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                  <span className="text-sm font-medium">Zelle:</span>
                  <Badge variant="secondary">{driver.zelleHandle}</Badge>
                </div>
              )}
              
              {driver.cashAppHandle && (
                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                  <span className="text-sm font-medium">Cash App:</span>
                  <Badge variant="secondary">{driver.cashAppHandle}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-xs">
            Payment is handled off-platform. Coordinate with the driver for pickup details and payment after the ride.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}