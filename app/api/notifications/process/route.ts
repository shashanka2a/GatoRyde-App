import { NextRequest, NextResponse } from 'next/server'
import { NotificationProcessor } from '@/lib/notifications/processor'
import { NotificationQueue } from '@/lib/notifications/queue'

// Manual trigger for processing notifications
export async function POST(request: NextRequest) {
  try {
    await NotificationProcessor.processNow()
    
    const stats = await NotificationQueue.getQueueStats()
    
    return NextResponse.json({
      success: true,
      message: 'Notifications processed',
      stats
    })
  } catch (error) {
    console.error('Manual notification processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process notifications' },
      { status: 500 }
    )
  }
}

// Get processor status and queue stats
export async function GET(request: NextRequest) {
  try {
    const status = NotificationProcessor.getStatus()
    const stats = await NotificationQueue.getQueueStats()
    
    return NextResponse.json({
      success: true,
      processor: status,
      queue: stats
    })
  } catch (error) {
    console.error('Get notification status error:', error)
    return NextResponse.json(
      { error: 'Failed to get notification status' },
      { status: 500 }
    )
  }
}