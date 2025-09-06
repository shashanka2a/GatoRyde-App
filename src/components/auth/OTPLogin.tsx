'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/useAuth'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { toast } from 'sonner'

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
        <h2 className="text-2xl font-bold mb-4">Welcome back!</h2>
        <p className="text-gray-600 mb-4">
          Logged in as {user.email}
          {user.university && ` (${user.university})`}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Sign in to Rydify</h1>
        <p className="text-gray-600 mt-2">
          {step === 'email' 
            ? 'Enter your .edu email to get started'
            : 'Enter the verification code sent to your email'
          }
        </p>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <Label htmlFor="email">University Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@university.edu"
              required
              disabled={loading}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Verification Code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              required
              disabled={loading}
              className="text-center text-lg tracking-widest"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify & Sign In'}
          </Button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => setStep('email')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Change email address
            </button>
            
            <div>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || loading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
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