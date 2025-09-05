'use client'

import { useState } from 'react'
import { PaymentStorageManager } from '@/lib/storage/payment-storage'
import { PaymentUtils } from '@/lib/utils/payment'

interface PaymentProfileData {
  zelleHandle?: string
  cashAppHandle?: string
  zelleQrUrl?: string
  cashAppQrUrl?: string
}

interface PaymentProfileFormProps {
  userId: string
  initialData?: PaymentProfileData
  onSave: (data: PaymentProfileData) => Promise<void>
  isLoading?: boolean
}

export function PaymentProfileForm({ userId, initialData, onSave, isLoading }: PaymentProfileFormProps) {
  const [formData, setFormData] = useState<PaymentProfileData>(initialData || {})
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof PaymentProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileUpload = async (
    file: File, 
    paymentType: 'zelle' | 'cashapp'
  ) => {
    const uploadKey = `${paymentType}QrUrl`
    setUploading(prev => ({ ...prev, [uploadKey]: true }))
    setErrors(prev => ({ ...prev, [uploadKey]: '' }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)
      formData.append('paymentType', paymentType)

      const response = await fetch('/api/upload/payment-qr', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setFormData(prev => ({ ...prev, [uploadKey]: result.url }))
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        [uploadKey]: error instanceof Error ? error.message : 'Upload failed' 
      }))
    } finally {
      setUploading(prev => ({ ...prev, [uploadKey]: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors: Record<string, string> = {}
    
    if (formData.zelleHandle) {
      const zelleError = PaymentUtils.validatePaymentHandle(formData.zelleHandle, 'zelle')
      if (zelleError) {
        newErrors.zelleHandle = zelleError
      }
    }
    
    if (formData.cashAppHandle) {
      const cashAppError = PaymentUtils.validatePaymentHandle(formData.cashAppHandle, 'cashapp')
      if (cashAppError) {
        newErrors.cashAppHandle = cashAppError
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await onSave(formData)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Payment Information</h3>
        <p className="text-sm text-blue-700">
          Add your payment handles and QR codes to make it easier for riders to pay you after completed trips.
        </p>
      </div>

      {/* Zelle Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Zelle</h4>
        
        <div>
          <label htmlFor="zelleHandle" className="block text-sm font-medium text-gray-700 mb-1">
            Zelle Email Address
          </label>
          <input
            type="email"
            id="zelleHandle"
            value={formData.zelleHandle || ''}
            onChange={(e) => handleInputChange('zelleHandle', e.target.value)}
            placeholder="your-email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.zelleHandle && (
            <p className="mt-1 text-sm text-red-600">{errors.zelleHandle}</p>
          )}
        </div>

        <div>
          <label htmlFor="zelleQr" className="block text-sm font-medium text-gray-700 mb-1">
            Zelle QR Code (PNG/JPG, max 2MB)
          </label>
          <input
            type="file"
            id="zelleQr"
            accept="image/png,image/jpeg,image/jpg"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFileUpload(file, 'zelle')
              }
            }}
            disabled={uploading.zelleQrUrl}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {uploading.zelleQrUrl && (
            <p className="mt-1 text-sm text-blue-600">Uploading...</p>
          )}
          {errors.zelleQrUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.zelleQrUrl}</p>
          )}
          {formData.zelleQrUrl && (
            <div className="mt-2">
              <img 
                src={formData.zelleQrUrl} 
                alt="Zelle QR Code" 
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>
      </div>

      {/* Cash App Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Cash App</h4>
        
        <div>
          <label htmlFor="cashAppHandle" className="block text-sm font-medium text-gray-700 mb-1">
            Cash App Handle (without $)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="text"
              id="cashAppHandle"
              value={formData.cashAppHandle || ''}
              onChange={(e) => handleInputChange('cashAppHandle', e.target.value)}
              placeholder="YourHandle"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.cashAppHandle && (
            <p className="mt-1 text-sm text-red-600">{errors.cashAppHandle}</p>
          )}
        </div>

        <div>
          <label htmlFor="cashAppQr" className="block text-sm font-medium text-gray-700 mb-1">
            Cash App QR Code (PNG/JPG, max 2MB)
          </label>
          <input
            type="file"
            id="cashAppQr"
            accept="image/png,image/jpeg,image/jpg"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFileUpload(file, 'cashapp')
              }
            }}
            disabled={uploading.cashAppQrUrl}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {uploading.cashAppQrUrl && (
            <p className="mt-1 text-sm text-blue-600">Uploading...</p>
          )}
          {errors.cashAppQrUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.cashAppQrUrl}</p>
          )}
          {formData.cashAppQrUrl && (
            <div className="mt-2">
              <img 
                src={formData.cashAppQrUrl} 
                alt="Cash App QR Code" 
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || Object.values(uploading).some(Boolean)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Payment Info'}
        </button>
      </div>
    </form>
  )
}