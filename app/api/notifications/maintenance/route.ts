import { NextRequest, NextResponse } from 'next/server'
import { NotificationProcessor } from '@/lib/notifications/processor'

// Run maintenance tasks
export async function POST(request: NextRequest) {
  try {
    await NotificationProcessor.runMaintenance()
    
    return NextResponse.json({
      success: true,
      message: 'Maintenance tasks completed'
    })
  } catch (error) {
    console.error('Notification maintenance error:', error)
    return NextResponse.json(
      { error: 'Failed to run maintenance tasks' },
      { status: 500 }
    )
  }
}