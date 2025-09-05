import { NextRequest, NextResponse } from 'next/server'
import { PaymentStorageManager } from '@/lib/storage/payment-storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const bookingId = formData.get('bookingId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const result = await PaymentStorageManager.uploadProofOfPayment(file, userId, bookingId)

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
      size: result.size,
      type: result.type
    })

  } catch (error) {
    console.error('Proof of payment upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}