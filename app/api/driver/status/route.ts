import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth/jwt-edge'
import { prisma } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const tokenData = await getTokenFromRequest(request)
    
    if (!tokenData || !tokenData.eduVerified) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has a driver profile
    const driver = await prisma.driver.findUnique({
      where: { userId: tokenData.id }
    })

    return NextResponse.json({
      success: true,
      isDriver: !!driver,
      driverId: driver?.id || null
    })
    
  } catch (error) {
    console.error('Driver status check error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check driver status'
      },
      { status: 500 }
    )
  }
}
