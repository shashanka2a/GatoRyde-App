'use client'

import { useState, useEffect } from 'react'
import { PaymentProfileForm } from '@/src/components/driver/PaymentProfileForm'

interface PaymentProfileData {
  zelleHandle?: string
  cashAppHandle?: string
  zelleQrUrl?: string
  cashAppQrUrl?: string
}

export default function DriverPaymentPage() {
  const [profileData, setProfileData] = useState<PaymentProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Mock user ID - in real app, get from auth context
  const userId = 'mock-user-id'

  useEffect(() => {
    fetchPaymentProfile()
  }, [])

  const fetchPaymentProfile = async () => {
    try {
      const response = await fetch(`/api/driver/payment-profile?userId=${userId}`)
      const result = await response.json()

      if (response.ok) {
        setProfileData({
          zelleHandle: result.driver.zelleHandle,
          cashAppHandle: result.driver.cashAppHandle,
          zelleQrUrl: result.driver.zelleQrUrl,
          cashAppQrUrl: result.driver.cashAppQrUrl,
        })
      } else {
        setError(result.error || 'Failed to load payment profile')
      }
    } catch (err) {
      setError('Failed to load payment profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: PaymentProfileData) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/driver/payment-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...data
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess('Payment profile updated successfully!')
        setProfileData(data)
      } else {
        setError(result.error || 'Failed to update payment profile')
      }
    } catch (err) {
      setError('Failed to update payment profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Profile</h1>
        <p className="text-gray-600 mt-2">
          Set up your payment information to receive payments from riders after completed trips.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <PaymentProfileForm
        userId={userId}
        initialData={profileData || undefined}
        onSave={handleSave}
        isLoading={saving}
      />
    </div>
  )
}