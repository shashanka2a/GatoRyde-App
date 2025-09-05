'use client'

import { useState } from 'react'
import { useOTPAuth } from '@/lib/auth/hooks'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Loader2, Mail, Phone } from 'lucide-react'

interface OTPFormProps {
  onSuccess?: (user: any) => void
  referral?: string
}

export function OTPForm({ onSuccess, referral }: OTPFormProps) {
  const [step, setStep] = useState<'identifier' | 'verify'>('identifier')
  const [identifier, setIdentifier] = useState('')
  const [type, setType] = useState<'email' | 'sms'>('email')
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  
  const { startOTP, verifyOTP, isLoading, error, clearError } = useOTPAuth()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await startOTP({ identifier, type, referral })
      setStep('verify')
      
      // Start countdown
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      const result = await verifyOTP({ identifier, otp, type })
      if (result.success && result.user) {
        onSuccess?.(result.user)
      }
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    
    try {
      await startOTP({ identifier, type, referral })
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const isValidPhone = (phone: string) => {
    return /^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(phone.replace(/\D/g, ''))
  }

  if (step === 'identifier') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Sign in to GatoRyde</CardTitle>
          <CardDescription>
            Enter your email or phone number to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="flex space-x-2 mb-4">
              <Button
                type="button"
                variant={type === 'email' ? 'default' : 'outline'}
                onClick={() => setType('email')}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                type="button"
                variant={type === 'sms' ? 'default' : 'outline'}
                onClick={() => setType('sms')}
                className="flex-1"
              >
                <Phone className="w-4 h-4 mr-2" />
                SMS
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identifier">
                {type === 'email' ? 'Email Address' : 'Phone Number'}
              </Label>
              <Input
                id="identifier"
                type={type === 'email' ? 'email' : 'tel'}
                placeholder={type === 'email' ? 'you@example.com' : '+1 (555) 123-4567'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading ||
                !identifier ||
                (type === 'email' && !isValidEmail(identifier)) ||
                (type === 'sms' && !isValidPhone(identifier))
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                `Send ${type === 'email' ? 'Email' : 'SMS'} Code`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Enter Verification Code</CardTitle>
        <CardDescription>
          We sent a 6-digit code to {identifier}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOTP}
              disabled={countdown > 0 || isLoading}
              className="text-sm"
            >
              {countdown > 0 ? (
                `Resend code in ${countdown}s`
              ) : (
                'Resend code'
              )}
            </Button>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStep('identifier')
                setOtp('')
                clearError()
              }}
              className="text-sm"
            >
              Change {type === 'email' ? 'email' : 'phone number'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}