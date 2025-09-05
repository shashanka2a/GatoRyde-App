import { NextRequest, NextResponse } from 'next/server'
import { NotificationQueue } from '@/lib/notifications/queue'

// Get dead letter queue items for monitoring
export async function GET() {
  try {
    const limit = 50 // Default limit
    
    const deadLetters = await NotificationQueue.getDeadLetterQueue(limit)
    
    return NextResponse.json({
      success: true,
      deadLetters,
      count: deadLetters.length
    })
  } catch (error) {
    console.error('Get dead letter queue error:', error)
    return NextResponse.json(
      { error: 'Failed to get dead letter queue' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-static'