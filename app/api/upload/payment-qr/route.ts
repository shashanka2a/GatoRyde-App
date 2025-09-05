import { NextRequest, NextResponse } from 'next/server'
import { PaymentStorageManager } from '@/lib/storage/payment-storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const paymentType = formData.get('paymentType') as 'zelle' | 'cashapp' | 'venmo'

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

    if (!paymentType || !['zelle', 'cashapp', 'venmo'].includes(paymentType)) {
      return NextResponse.json(
        { error: 'Valid payment type is required' },
        { status: 400 }
      )
    }

    const result = await PaymentStorageManager.uploadQrCode(file, userId, paymentType)

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
      size: result.size,
      type: result.type
    })

  } catch (error) {
    console.error('QR code upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('filePath')

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    await PaymentStorageManager.deleteFile(filePath)

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('File deletion error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deletion failed' },
      { status: 500 }
    )
  }
}