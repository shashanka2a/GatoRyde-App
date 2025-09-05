'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PaymentRequestPanel } from '@/src/components/rides/PaymentRequestPanel'

interface BookingWithPayment {
  id: string
  status: string
  finalShareCents: number | null
  paidByRider: boolean
  confirmedByDriver: boolean
  proofOfPaymentUrl?: string | null
  ride: {
    originText: string
    destText: string
    departAt: string
    driver: {
      userId: string
      zelleHandle?: string | null
      cashAppHandle?: string | null
      zelleQrUrl?: string | null
      cashAppQrUrl?: string | null
      user: {
        name: string | null
        email: string
        phone: string | null
      }
    }
  }
}

export default function BookingPaymentPage() {
  const params = useParams()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<BookingWithPayment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Mock user ID - in real app, get from auth context
  const userId = 'mock-rider-id'

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails()
    }
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings/payment-status?bookingId=${bookingId}`)
      const result = await response.json()

      if (response.ok) {
        setBooking(result.booking)
      } else {
        setError(result.error || 'Failed to load booking details')
      }
    } catch (err) {
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = async (bookingId: string, proofUrl?: string) => {
    try {
      const response = await fetch('/api/bookings/payment-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          paidByRider: true,
          proofOfPaymentUrl: proofUrl
        })
      })

      const result = await response.json()

      if (response.ok) {
        setBooking(result.booking)
      } else {
        throw new Error(result.error || 'Failed to update payment status')
      }
    } catch (err) {
      console.error('Failed to mark as paid:', err)
      // You might want to show an error toast here
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-gray-600">Booking not found</p>
      </div>
    )
  }

  // Only show payment panel for completed bookings
  if (booking.status !== 'completed') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Payment options will be available after the trip is completed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trip Payment</h1>
        <p className="text-gray-600 mt-2">
          {booking.ride.originText} → {booking.ride.destText}
        </p>
        <p className="text-sm text-gray-500">
          {new Date(booking.ride.departAt).toLocaleDateString()}
        </p>
      </div>

      <PaymentRequestPanel
        userId={userId}
        booking={{
          id: booking.id,
          finalShareCents: booking.finalShareCents,
          paidByRider: booking.paidByRider,
          confirmedByDriver: booking.confirmedByDriver,
          proofOfPaymentUrl: booking.proofOfPaymentUrl,
          ride: {
            originText: booking.ride.originText,
            destText: booking.ride.destText,
            departAt: new Date(booking.ride.departAt)
          }
        }}
        driver={{
          userId: booking.ride.driver.userId,
          user: booking.ride.driver.user,
          zelleHandle: booking.ride.driver.zelleHandle,
          cashAppHandle: booking.ride.driver.cashAppHandle,
          zelleQrUrl: booking.ride.driver.zelleQrUrl,
          cashAppQrUrl: booking.ride.driver.cashAppQrUrl,
        }}
        onMarkAsPaid={handleMarkAsPaid}
      />
    </div>
  )
}