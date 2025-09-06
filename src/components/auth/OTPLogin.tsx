'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/useAuth'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/src/components/ui/input-otp'
import { toast } from 'sonner'
import { Mail, ArrowLeft, Shield, CheckCircle } from 'lucide-react'

export function OTPLogin() {
  const [email, setEmail] = useState('')
  const [otp, setOTP] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const { sendOTP, verifyOTP, user } = useAuth()

  // Countdown timer for resend
  useState(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  })

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await sendOTP(email)
      setStep('otp')
      setCountdown(60) // 60 second cooldown
      toast.success('Verification code sent to your email!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await verifyOTP(email, otp)
      toast.success(result.isNewUser ? 'Account created successfully!' : 'Logged in successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    
    setLoading(true)
    try {
      await sendOTP(email)
      setCountdown(60)
      toast.success('New verification code sent!')
    } catch (error) {
      toast.error('Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@university.edu"
                required
                disabled={loading}
                className="pl-10 h-12 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Only .edu email addresses are accepted for student verification
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg dark:disabled:bg-gray-600" 
            disabled={loading}
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
                onChange={(value) => setOTP(value)}
                disabled={loading}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot 
                    index={0} 
                    className="w-12 h-12 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200" 
                  />
                  <InputOTPSlot 
                    index={1} 
                    className="w-12 h-12 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200" 
                  />
                  <InputOTPSlot 
                    index={2} 
                    className="w-12 h-12 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200" 
                  />
                  <InputOTPSlot 
                    index={3} 
                    className="w-12 h-12 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200" 
                  />
                  <InputOTPSlot 
                    index={4} 
                    className="w-12 h-12 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200" 
                  />
                  <InputOTPSlot 
                    index={5} 
                    className="w-12 h-12 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200" 
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
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