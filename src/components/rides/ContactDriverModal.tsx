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
import { cn } from '@/lib/utils'

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
          <Button 
            className={cn(
              "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
              className
            )}
          >
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
        <Button 
          className={cn(
            "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
            ride.seatsAvailable === 0 && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={ride.seatsAvailable === 0}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {ride.seatsAvailable === 0 ? 'Ride Full' : 'Book Ride'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Book This Ride</DialogTitle>
          <DialogDescription>
            Join this ride and connect with your driver
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Top: Departure time, price, seats left */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">
                    {new Date(ride.departAt).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="w-px h-6 bg-blue-300" />
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {ride.seatsAvailable} seats left
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(totalCostForRider)}
                </div>
                <div className="text-xs text-gray-500">total for {seatsRequested} seat{seatsRequested > 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>

          {/* Edu Verification Check */}
          {!userEduVerified && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-sm">
                <strong>Student verification required</strong><br />
                Only .edu verified students can book rides. Complete verification to continue.
              </AlertDescription>
            </Alert>
          )}

          {/* Middle: Driver details with trust indicators */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                {ride.driver.user.name?.charAt(0) || 'D'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    {ride.driver.user.name || 'Anonymous Driver'}
                  </span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    .edu Verified
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{ride.driver.user.ratingAvg?.toFixed(1) || 'New'} ({ride.driver.user.ratingCount || 0} reviews)</span>
                  </div>
                  {ride.driver.vehicle && (
                    <>
                      <div className="w-px h-3 bg-gray-300" />
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        <span>{ride.driver.vehicle.color} {ride.driver.vehicle.make}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>OTP-secured ride</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Student-only platform</span>
              </div>
            </div>
          </div>

          {/* Seats Selection */}
          <div className="space-y-2">
            <Label htmlFor="seats" className="flex items-center gap-2 font-medium">
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
              className="text-center font-semibold"
            />
            <p className="text-xs text-gray-600 text-center">
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

          {/* Primary Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleContact('sms')}
                disabled={!userEduVerified || isContacting || seatsRequested > ride.seatsAvailable}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                {isContacting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Phone className="w-5 h-5 mr-2" />
                )}
                Contact via SMS
              </Button>

              <Button
                onClick={() => handleContact('email')}
                disabled={!userEduVerified || isContacting || seatsRequested > ride.seatsAvailable}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                {isContacting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-5 h-5 mr-2" />
                )}
                Contact via Email
              </Button>
            </div>
            
            {/* Secondary actions */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-200">
              <span>• Secure student-only platform</span>
              <span>• OTP verification required</span>
              <span>• 24/7 support available</span>
            </div>
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