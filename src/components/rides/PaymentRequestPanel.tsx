'use client'

import { useState } from 'react'
import { PaymentUtils } from '@/lib/utils/payment'
import { FeatureFlagManager } from '@/lib/utils/feature-flags'

interface Driver {
  userId: string
  user: {
    name: string | null
    email: string
    phone: string | null
  }
  zelleHandle?: string | null
  cashAppHandle?: string | null
  zelleQrUrl?: string | null
  cashAppQrUrl?: string | null
}

interface Booking {
  id: string
  finalShareCents: number | null
  paidByRider: boolean
  confirmedByDriver: boolean
  proofOfPaymentUrl?: string | null
  ride: {
    originText: string
    destText: string
    departAt: Date
  }
}

interface PaymentRequestPanelProps {
  userId: string
  booking: Booking
  driver: Driver
  onMarkAsPaid: (bookingId: string, proofUrl?: string) => Promise<void>
}

export function PaymentRequestPanel({ 
  userId,
  booking, 
  driver, 
  onMarkAsPaid
}: PaymentRequestPanelProps) {
  const [showProofUpload, setShowProofUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  if (!booking.finalShareCents) {
    return null
  }

  // Check if off-platform payments are enabled
  if (!FeatureFlagManager.isOffPlatformPaymentsEnabled()) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Processing</h3>
          <p className="text-gray-600">
            Payment processing is currently unavailable. Please contact support for assistance.
          </p>
        </div>
      </div>
    )
  }

  const formattedAmount = PaymentUtils.formatCurrency(booking.finalShareCents)
  const amountInDollars = PaymentUtils.formatAmountForUrl(booking.finalShareCents)

  const paymentOptions = {
    amount: booking.finalShareCents,
    originText: booking.ride.originText,
    destText: booking.ride.destText,
    date: booking.ride.departAt
  }

  const generateCashAppLink = () => {
    if (!driver.cashAppHandle) return ''
    return PaymentUtils.generateCashAppLink(driver.cashAppHandle, paymentOptions)
  }

  const generateEmailLink = () => {
    return PaymentUtils.generateEmailLink(driver.user.email, driver.user.name, paymentOptions)
  }

  const generateSMSLink = () => {
    if (!driver.user.phone) return ''
    return PaymentUtils.generateSMSLink(driver.user.phone, paymentOptions)
  }

  const handleProofUpload = async (file: File) => {
    setUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)
      formData.append('bookingId', booking.id)

      const response = await fetch('/api/upload/proof-of-payment', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      await onMarkAsPaid(booking.id, result.url)
      setShowProofUpload(false)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (booking.paidByRider && booking.confirmedByDriver) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Payment Completed
            </h3>
            <p className="text-sm text-green-700">
              Payment of {formattedAmount} has been confirmed by both parties.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 max-w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Pay Driver</h3>
        <div className="text-2xl font-bold text-green-600">{formattedAmount}</div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong>Off-platform payments.</strong> Rydify doesn't process funds. 
              Report issues via Disputes.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Payment Options</h4>

        {/* Cash App */}
        {driver.cashAppHandle && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">Cash App</h5>
              <span className="text-sm text-gray-500">${driver.cashAppHandle}</span>
            </div>
            
            {driver.cashAppQrUrl && (
              <div className="mb-3">
                <img 
                  src={driver.cashAppQrUrl} 
                  alt="Cash App QR Code" 
                  className="w-32 h-32 object-cover rounded border mx-auto"
                />
                <div className="text-center mt-2">
                  <a 
                    href={driver.cashAppQrUrl} 
                    download="cashapp-qr.png"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Download QR Code
                  </a>
                </div>
              </div>
            )}
            
            <a
              href={generateCashAppLink()}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-center block"
            >
              Pay ${amountInDollars} via Cash App
            </a>
          </div>
        )}

        {/* Zelle */}
        {driver.zelleHandle && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">Zelle</h5>
              <span className="text-sm text-gray-500">{driver.zelleHandle}</span>
            </div>
            
            {driver.zelleQrUrl && (
              <div className="mb-3">
                <img 
                  src={driver.zelleQrUrl} 
                  alt="Zelle QR Code" 
                  className="w-32 h-32 object-cover rounded border mx-auto"
                />
                <div className="text-center mt-2">
                  <a 
                    href={driver.zelleQrUrl} 
                    download="zelle-qr.png"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Download QR Code
                  </a>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Send to:</span>
                <span className="font-mono text-sm">{driver.zelleHandle}</span>
                <button
                  onClick={() => PaymentUtils.copyToClipboard(driver.zelleHandle!)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Copy
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-mono text-sm">{amountInDollars}</span>
                <button
                  onClick={() => PaymentUtils.copyToClipboard(amountInDollars)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Options */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Contact Driver</h4>
        <div className="flex space-x-3">
          <a
            href={generateEmailLink()}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center text-sm"
          >
            Email Payment Reminder
          </a>
          {driver.user.phone && (
            <a
              href={generateSMSLink()}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-center text-sm"
            >
              SMS Payment Reminder
            </a>
          )}
        </div>
      </div>

      {/* Mark as Paid */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={booking.paidByRider}
                onChange={(e) => {
                  if (e.target.checked) {
                    if (showProofUpload) {
                      // Handle through proof upload
                    } else {
                      onMarkAsPaid(booking.id)
                    }
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Mark as Paid (self-report)
              </span>
            </label>
            {booking.paidByRider && !booking.confirmedByDriver && (
              <p className="text-xs text-yellow-600 mt-1">
                Waiting for driver confirmation
              </p>
            )}
          </div>
          
          <button
            onClick={() => setShowProofUpload(!showProofUpload)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showProofUpload ? 'Cancel' : 'Upload Proof'}
          </button>
        </div>

        {showProofUpload && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Proof of Payment (Optional)
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleProofUpload(file)
                }
              }}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {uploading && (
              <p className="mt-1 text-sm text-blue-600">Uploading...</p>
            )}
            {uploadError && (
              <p className="mt-1 text-sm text-red-600">{uploadError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}