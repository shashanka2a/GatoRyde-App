'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { User, Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileCompletionProps {
  userEmail: string
  onComplete: (data: { name: string; phone: string }) => Promise<void>
}

export function ProfileCompletion({ userEmail, onComplete }: ProfileCompletionProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string } = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\+]?[1-9][\d]{0,14}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    try {
      await onComplete({
        name: formData.name.trim(),
        phone: formData.phone.replace(/[\s\-\(\)]/g, '')
      })
      toast.success('Profile completed successfully!')
    } catch (error) {
      console.error('Profile completion error:', error)
      toast.error('Failed to complete profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneChange = (value: string) => {
    // Format phone number as user types
    const cleaned = value.replace(/\D/g, '')
    let formatted = cleaned
    
    if (cleaned.length >= 6) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    } else if (cleaned.length >= 3) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    }
    
    setFormData(prev => ({ ...prev, phone: formatted }))
    
    // Clear phone error when user starts typing
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }))
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Profile
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome to Rydify! Please provide your details to get started.
          </p>
        </CardHeader>
        
        <CardContent>
          {/* Email Confirmation */}
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Email verified:</strong> {userEmail}
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                    if (errors.name) {
                      setErrors(prev => ({ ...prev, name: undefined }))
                    }
                  }}
                  placeholder="Enter your full name"
                  className={`pl-10 h-12 rounded-xl transition-all duration-200 ${
                    errors.name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                  } dark:bg-gray-700 dark:text-white`}
                  disabled={loading}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                  className={`pl-10 h-12 rounded-xl transition-all duration-200 ${
                    errors.phone 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                  } dark:bg-gray-700 dark:text-white`}
                  disabled={loading}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Used for ride coordination and safety purposes
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg dark:disabled:bg-gray-600" 
              disabled={loading || !formData.name.trim() || !formData.phone.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Completing Profile...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete Profile & Continue
                </>
              )}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Privacy Note:</strong> Your information is kept secure and only shared with 
              riders/drivers you connect with through Rydify.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}