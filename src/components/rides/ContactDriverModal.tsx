'use client'

import { useState } from 'react'
import { contactDriver } from '@/lib/contact/actions'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Badge } from '@/src/components/ui/badge'
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Users, 
  DollarSign, 
  Loader2,
  ExternalLink,
  QrCode,
  CreditCard,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { calculateCostPerPerson, formatPrice } from '@/lib/rides/types'
import type { RideWithDriver } from '@/lib/rides/types'

interface ContactDriverModalProps {
  ride: RideWithDriver
  userEduVerified: boolean
  className?: string
}

export function ContactDriverModal({ ride, userEduVerified, className }: ContactDriverModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [seatsRequested, setSeatsRequested] = useState(1)
  const [isContacting, setIsContacting] = useState(false)
  const [contactResult, setContactResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const costPerPerson = calculateCostPerPerson(
    ride.totalTripCostCents, 
    ride.seatsTotal, 
    ride.seatsAvailable - seatsRequested
  )
  const totalCostForRider = costPerPerson * seatsRequested

  const handleContact = async (method: 'sms' | 'email') => {
    if (!userEduVerified) {
      setError('Only edu-verified students can contact drivers')
      return
    }

    setIsContacting(true)
    setError(null)

    try {
      const result = await contactDriver({
        rideId: ride.id,
        method,
        seatsRequested,
      })

      if (result.success) {
        setContactResult(result)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to contact driver. Please try again.')
    } finally {
      setIsContacting(false)
    }
  }

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank')
    setIsOpen(false)
  }

  if (contactResult?.success) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className={className}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Driver
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Contact Information
            </DialogTitle>
            <DialogDescription>
              Choose how to contact the driver
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Contact Methods */}
            <div className="space-y-3">
              {contactResult.contactInfo?.smsLink && (
                <Button
                  onClick={() => handleExternalLink(contactResult.contactInfo.smsLink)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Send SMS
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
              )}

              {contactResult.contactInfo?.emailLink && (
                <Button
                  onClick={() => handleExternalLink(contactResult.contactInfo.emailLink)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
              )}
            </div>

            {/* Payment Methods */}
            {contactResult.contactInfo?.paymentMethods && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {contactResult.contactInfo.paymentMethods.zelle && (
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <span className="text-sm font-medium">Zelle:</span>
                      <Badge variant="secondary">{contactResult.contactInfo.paymentMethods.zelle}</Badge>
                    </div>
                  )}
                  
                  {contactResult.contactInfo.paymentMethods.cashApp && (
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium">Cash App:</span>
                      <Badge variant="secondary">{contactResult.contactInfo.paymentMethods.cashApp}</Badge>
                    </div>
                  )}
                  
                  {contactResult.contactInfo.paymentMethods.venmo && (
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="text-sm font-medium">Venmo:</span>
                      <Badge variant="secondary">{contactResult.contactInfo.paymentMethods.venmo}</Badge>
                    </div>
                  )}

                  {contactResult.contactInfo.paymentMethods.qrCodeUrl && (
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <QrCode className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs text-gray-600">QR Code available</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-xs">
                Payment is handled off-platform. Pay the driver after the ride is completed.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className} disabled={ride.seatsAvailable === 0}>
          <MessageSquare className="w-4 h-4 mr-2" />
          {ride.seatsAvailable === 0 ? 'Ride Full' : 'Contact Driver'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Driver</DialogTitle>
          <DialogDescription>
            Request to join this ride
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Edu Verification Check */}
          {!userEduVerified && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Only edu-verified students can contact drivers. 
                Please complete your student verification first.
              </AlertDescription>
            </Alert>
          )}

          {/* Seats Selection */}
          <div className="space-y-2">
            <Label htmlFor="seats" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Seats Needed
            </Label>
            <Input
              id="seats"
              type="number"
              min="1"
              max={ride.seatsAvailable}
              value={seatsRequested}
              onChange={(e) => setSeatsRequested(Number(e.target.value))}
              disabled={!userEduVerified}
            />
            <p className="text-xs text-gray-600">
              {ride.seatsAvailable} seats available
            </p>
          </div>

          {/* Cost Breakdown */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total trip cost:</span>
                  <span className="font-medium">{formatPrice(ride.totalTripCostCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost per person:</span>
                  <span className="font-medium">{formatPrice(costPerPerson)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Your share ({seatsRequested} seat{seatsRequested > 1 ? 's' : ''}):</span>
                  <span className="font-bold text-blue-700">{formatPrice(totalCostForRider)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Contact Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleContact('sms')}
              disabled={!userEduVerified || isContacting || seatsRequested > ride.seatsAvailable}
              variant="outline"
            >
              {isContacting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Phone className="w-4 h-4 mr-2" />
              )}
              SMS
            </Button>

            <Button
              onClick={() => handleContact('email')}
              disabled={!userEduVerified || isContacting || seatsRequested > ride.seatsAvailable}
              variant="outline"
            >
              {isContacting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Email
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-xs">
              This will open your SMS/email app with a pre-written message to the driver.
              Payment is handled off-platform after the ride.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  )
}