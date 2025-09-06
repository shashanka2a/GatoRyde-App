import { NextRequest, NextResponse } from 'next/server'
import { RideRepository } from '@/lib/db/repositories/ride.repository'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const rideRepository = new RideRepository()
    const rides = await rideRepository.findAvailable(limit, offset)

    return NextResponse.json({
      success: true,
      data: {
        rides,
        total: rides.length,
        hasMore: rides.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching available rides:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch rides' 
      },
      { status: 500 }
    )
  }
}