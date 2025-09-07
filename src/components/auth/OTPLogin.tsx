'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth/useAuth'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/src/components/ui/input-otp'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { ProfileCompletion } from './ProfileCompletion'
import { toast } from 'sonner'
import { Mail, ArrowLeft, Shield, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export function OTPLogin() {
  const [step, setStep] = useState<'email' | 'otp' | 'profile'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOTP] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; otp?: string; terms?: string }>({})
  const { user, login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/rides'

  // Countdown timer for resend
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    // Validate email
    if (!email.trim()) {
      setErrors({ email: 'Email is required' })
      return
    }
    
    if (!email.endsWith('.edu')) {
      setErrors({ email: 'Please use a valid .edu email address' })
      return
    }
    
    // Validate terms acceptance
    if (!acceptedTerms) {
      setErrors({ terms: 'You must accept the Terms of Service to continue' })
      return
    }
    
    setLoading(true)
    
    try {
      console.log('🔍 [FRONTEND] Sending OTP request for email:', email)
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      console.log('🔍 [FRONTEND] Response status:', response.status)
      console.log('🔍 [FRONTEND] Response headers:', Object.fromEntries(response.headers.entries()))
      
      const data = await response.json()
      console.log('🔍 [FRONTEND] Response data:', data)
      
      if (data.success) {
        console.log('✅ [FRONTEND] OTP request successful')
        setStep('otp')
        setCountdown(60)
        toast.success('Verification code sent to your email')
      } else {
        console.log('❌ [FRONTEND] OTP request failed:', data.error)
        setErrors({ email: data.error || 'Failed to send verification code' })
        toast.error(data.error || 'Failed to send verification code')
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Send OTP error:', error)
      setErrors({ email: 'Failed to send verification code' })
      toast.error('Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    if (otp.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' })
      return
    }
    
    setLoading(true)
    
    try {
      console.log('🔍 [FRONTEND] Sending OTP verification request')
      console.log('🔍 [FRONTEND] Email:', email)
      console.log('🔍 [FRONTEND] OTP:', otp)
      
      const response = await fetch('/api/auth/login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      
      console.log('🔍 [FRONTEND] OTP verification response status:', response.status)
      console.log('🔍 [FRONTEND] OTP verification response headers:', Object.fromEntries(response.headers.entries()))
      
      const data = await response.json()
      console.log('🔍 [FRONTEND] OTP verification response data:', data)
      
      if (data.success) {
        // Check if this is a first-time user (no name/phone)
        if (!data.user.name || !data.user.phone) {
          setStep('profile')
          toast.success('Email verified! Please complete your profile.')
        } else {
          await login(data.user)
          toast.success('Successfully signed in!')
          // Redirect to the intended page
          router.push(redirectTo)
        }
      } else {
        setErrors({ otp: data.error || 'Invalid verification code' })
        toast.error(data.error || 'Invalid verification code')
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      setErrors({ otp: 'Failed to verify code' })
      toast.error('Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileCompletion = async (profileData: { name: string; phone: string }) => {
    try {
      console.log('🔍 [FRONTEND] Starting profile completion...')
      console.log('🔍 [FRONTEND] Email:', email)
      console.log('🔍 [FRONTEND] Profile data:', profileData)
      
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...profileData })
      })
      
      console.log('🔍 [FRONTEND] Profile completion response status:', response.status)
      console.log('🔍 [FRONTEND] Profile completion response headers:', Object.fromEntries(response.headers.entries()))
      
      const data = await response.json()
      console.log('🔍 [FRONTEND] Profile completion response data:', data)
      
      if (data.success) {
        console.log('✅ [FRONTEND] Profile completion successful, logging in user...')
        await login(data.user)
        toast.success('Profile completed! Welcome to Rydify!')
        // Redirect to the intended page
        router.push(redirectTo)
      } else {
        console.log('❌ [FRONTEND] Profile completion failed:', data.message)
        throw new Error(data.message || 'Failed to complete profile')
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Profile completion error:', error)
      throw error
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCountdown(60)
        toast.success('New verification code sent')
      } else {
        toast.error(data.error || 'Failed to resend code')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      toast.error('Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  // Show profile completion step
  if (step === 'profile') {
    return <ProfileCompletion userEmail={email} onComplete={handleProfileCompletion} />
  }

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      console.log('🔍 [FRONTEND] User already logged in, redirecting to:', redirectTo)
      router.push(redirectTo)
    }
  }, [user, router, redirectTo])

  if (user) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome back!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Logged in as {user.email}
          {user.university && ` (${user.university})`}
        </p>
        <p className="text-sm text-gray-500">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        {/* Logo */}
        <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="text-white font-bold text-2xl">R</div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {step === 'email' ? 'Sign in to Rydify' : 'Verify your email'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {step === 'email' 
            ? 'Enter your .edu email to get started'
            : `Enter the 6-digit code sent to ${email}`
          }
        </p>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleSendOTP} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              University Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: undefined }))
                  }
                }}
                placeholder="your.email@university.edu"
                required
                disabled={loading}
                className={`pl-10 h-12 rounded-xl transition-all duration-200 ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                } dark:bg-gray-700 dark:text-white`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Only .edu email addresses are accepted for student verification
            </p>
          </div>

          {/* Terms & Services Checkbox */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => {
                  setAcceptedTerms(checked as boolean)
                  if (errors.terms) {
                    setErrors(prev => ({ ...prev, terms: undefined }))
                  }
                }}
                disabled={loading}
                className={`mt-1 flex-shrink-0 ${
                  errors.terms ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <div className="flex-1 min-w-0">
                <Label 
                  htmlFor="terms" 
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer leading-relaxed block"
                >
                  I agree to the{' '}
                  <Link 
                    href="/terms" 
                    target="_blank"
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 underline font-medium"
                  >
                    Terms of Service
                    <ExternalLink className="w-3 h-3 inline ml-1" />
                  </Link>
                  {' '}and understand that Rydify is for verified university students only.
                </Label>
              </div>
            </div>
            {errors.terms && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {errors.terms}
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg dark:disabled:bg-gray-600" 
            disabled={loading || !email.trim() || !acceptedTerms}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5 mr-2" />
                Send Verification Code
              </>
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="otp" className="text-sm font-medium text-gray-700 dark:text-gray-300 block text-center">
              Verification Code
            </Label>
            
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => {
                  setOTP(value)
                  if (errors.otp) {
                    setErrors(prev => ({ ...prev, otp: undefined }))
                  }
                }}
                disabled={loading}
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot 
                      key={index}
                      index={index} 
                      className={`w-12 h-12 text-lg font-semibold border-2 rounded-xl transition-all duration-200 ${
                        errors.otp 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                          : 'border-gray-300 dark:border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                      } dark:bg-gray-700 dark:text-white`}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            {errors.otp && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {errors.otp}
                </AlertDescription>
              </Alert>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Check your email for the 6-digit verification code
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg dark:disabled:bg-gray-600" 
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Verify & Sign In
              </>
            )}
          </Button>

          <div className="text-center space-y-3">
            <button
              type="button"
              onClick={() => setStep('email')}
              className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Change email address
            </button>
            
            <div>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || loading}
                className="text-sm text-teal-600 hover:text-teal-700 disabled:text-gray-400 dark:text-teal-400 dark:hover:text-teal-300 dark:disabled:text-gray-500 transition-colors duration-200"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}