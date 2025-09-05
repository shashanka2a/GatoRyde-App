'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitKYCVerification } from '@/lib/kyc/actions'
import { LicenseVerificationSchema, maskLicenseNumber } from '@/lib/kyc/types'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Loader2, Upload, Eye, EyeOff, Shield } from 'lucide-react'
import { z } from 'zod'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

interface FilePreview {
  file: File
  preview: string
}

export function LicenseVerificationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [showLicenseNumber, setShowLicenseNumber] = useState(false)

  // Form data
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseState, setLicenseState] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [licensePhoto, setLicensePhoto] = useState<FilePreview | null>(null)
  const [selfiePhoto, setSelfiePhoto] = useState<FilePreview | null>(null)

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (file: FilePreview | null) => void
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [event.target.name]: 'File must be less than 10MB' }))
        return
      }

      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrors(prev => ({ ...prev, [event.target.name]: 'File must be an image (JPEG, PNG, WebP)' }))
        return
      }

      const preview = URL.createObjectURL(file)
      setter({ file, preview })
      setErrors(prev => ({ ...prev, [event.target.name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    setMessage('')

    try {
      // Validate form data
      const formData = {
        licenseNumber: licenseNumber.toUpperCase(),
        licenseState,
        expirationDate,
      }

      LicenseVerificationSchema.parse(formData)

      // Check required files
      if (!licensePhoto) {
        setErrors(prev => ({ ...prev, licensePhoto: 'License photo is required' }))
        return
      }
      if (!selfiePhoto) {
        setErrors(prev => ({ ...prev, selfiePhoto: 'Selfie photo is required' }))
        return
      }

      // Create FormData for submission
      const submitData = new FormData()
      submitData.append('type', 'license')
      submitData.append('data', JSON.stringify(formData))
      submitData.append('licensePhoto', licensePhoto.file)
      submitData.append('selfiePhoto', selfiePhoto.file)

      const result = await submitKYCVerification(submitData)

      if (result.success) {
        setMessage(result.message)
        setTimeout(() => {
          router.push('/dashboard/kyc')
        }, 2000)
      } else {
        setMessage(result.message)
        if (result.errors) {
          setErrors(result.errors)
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const field = err.path[0] as string
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
      } else {
        setMessage('Failed to submit verification. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Driver License Verification
        </CardTitle>
        <CardDescription>
          Upload your driver license and a selfie to verify your identity. 
          Your license number will be masked for security.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* License Number */}
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Driver License Number</Label>
            <div className="relative">
              <Input
                id="licenseNumber"
                type={showLicenseNumber ? 'text' : 'password'}
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                placeholder="Enter your license number"
                className={errors.licenseNumber ? 'border-red-500' : ''}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowLicenseNumber(!showLicenseNumber)}
              >
                {showLicenseNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {licenseNumber && (
              <p className="text-sm text-gray-600">
                Preview: {maskLicenseNumber(licenseNumber)}
              </p>
            )}
            {errors.licenseNumber && (
              <p className="text-sm text-red-600">{errors.licenseNumber}</p>
            )}
          </div>

          {/* License State */}
          <div className="space-y-2">
            <Label htmlFor="licenseState">Issuing State</Label>
            <Select value={licenseState} onValueChange={setLicenseState} required>
              <SelectTrigger className={errors.licenseState ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.licenseState && (
              <p className="text-sm text-red-600">{errors.licenseState}</p>
            )}
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expirationDate">Expiration Date</Label>
            <Input
              id="expirationDate"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className={errors.expirationDate ? 'border-red-500' : ''}
              required
            />
            {errors.expirationDate && (
              <p className="text-sm text-red-600">{errors.expirationDate}</p>
            )}
          </div>

          {/* License Photo */}
          <div className="space-y-2">
            <Label htmlFor="licensePhoto">Driver License Photo</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {licensePhoto ? (
                <div className="space-y-2">
                  <img
                    src={licensePhoto.preview}
                    alt="License preview"
                    className="max-w-full h-48 object-contain mx-auto rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLicensePhoto(null)
                      const input = document.getElementById('licensePhoto') as HTMLInputElement
                      if (input) input.value = ''
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a clear photo of your driver license
                  </p>
                  <Input
                    id="licensePhoto"
                    name="licensePhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setLicensePhoto)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('licensePhoto')?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              )}
            </div>
            {errors.licensePhoto && (
              <p className="text-sm text-red-600">{errors.licensePhoto}</p>
            )}
          </div>

          {/* Selfie Photo */}
          <div className="space-y-2">
            <Label htmlFor="selfiePhoto">Selfie Photo</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {selfiePhoto ? (
                <div className="space-y-2">
                  <img
                    src={selfiePhoto.preview}
                    alt="Selfie preview"
                    className="max-w-full h-48 object-contain mx-auto rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelfiePhoto(null)
                      const input = document.getElementById('selfiePhoto') as HTMLInputElement
                      if (input) input.value = ''
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Take a clear selfie holding your license next to your face
                  </p>
                  <Input
                    id="selfiePhoto"
                    name="selfiePhoto"
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => handleFileChange(e, setSelfiePhoto)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('selfiePhoto')?.click()}
                  >
                    Take Selfie
                  </Button>
                </div>
              )}
            </div>
            {errors.selfiePhoto && (
              <p className="text-sm text-red-600">{errors.selfiePhoto}</p>
            )}
          </div>

          {/* Message */}
          {message && (
            <Alert variant={message.includes('success') ? 'default' : 'destructive'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !licenseNumber || !licenseState || !expirationDate || !licensePhoto || !selfiePhoto}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Verification...
              </>
            ) : (
              'Submit License Verification'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}