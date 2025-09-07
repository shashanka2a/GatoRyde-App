'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Shield, Mail, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

function VerifyEduContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; otp?: string }>({})
  const [countdown, setCountdown] = useState(0)

  const nextUrl = searchParams.get('next') || '/rides'

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setStep('otp')
        setCountdown(60)
        toast.success('Verification code sent to your email!')
      } else {
        setErrors({ email: data.error || 'Failed to send verification code' })
        toast.error(data.error || 'Failed to send verification code')
      }
    } catch (error) {
      setErrors({ email: 'Network error. Please try again.' })
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(), 
          otp 
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Email verified successfully!')
        // Redirect to the intended page
        router.push(nextUrl)
      } else {
        setErrors({ otp: data.error || 'Invalid verification code' })
        toast.error(data.error || 'Invalid verification code')
      }
    } catch (error) {
      setErrors({ otp: 'Network error. Please try again.' })
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      const data = await response.json()
      if (data.success) {
        setCountdown(60)
        toast.success('New verification code sent!')
      } else {
        toast.error(data.error || 'Failed to resend code')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Countdown timer
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {step === 'email' ? 'Verify Student Email' : 'Enter Verification Code'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {step === 'email' 
                ? 'Enter your .edu email address to verify your student status'
                : `We sent a 6-digit code to ${email}`
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 'email' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">University Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.name@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    Only .edu email addresses from verified universities are accepted.
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                  {errors.otp && (
                    <p className="text-sm text-red-600">{errors.otp}</p>
                  )}
                </div>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || isLoading}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </Button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </Button>
              </form>
            )}

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => step === 'otp' ? setStep('email') : router.back()}
                className="text-gray-600 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {step === 'otp' ? 'Back to Email' : 'Go Back'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Having trouble?{' '}
            <Link href="/contact" className="text-teal-600 hover:text-teal-700">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEduPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    }>
      <VerifyEduContent />
    </Suspense>
  )
}
