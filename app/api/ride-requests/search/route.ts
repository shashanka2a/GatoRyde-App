import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('📝 [SEARCH RIDE REQUESTS] Request received')
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Fetch ride requests
    const rideRequests = await prisma.rideRequest.findMany({
      where: {
        status: 'open',
        departAt: { gte: new Date() } // Only future requests
      },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            email: true,
            photoUrl: true,
            ratingAvg: true,
            ratingCount: true,
            university: true,
          }
        }
      },
      orderBy: [
        { departAt: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    console.log(`✅ [SEARCH RIDE REQUESTS] Found ${rideRequests.length} ride requests`)

    // Transform the data to match the expected format
    const transformedRequests = rideRequests.map(request => ({
      id: request.id,
      type: 'request', // Distinguish from rides
      originText: request.originText,
      originLat: request.originLat,
      originLng: request.originLng,
      destText: request.destText,
      destLat: request.destLat,
      destLng: request.destLng,
      departAt: request.departAt,
      seatsNeeded: request.seatsNeeded,
      maxCostCents: request.maxCostCents,
      status: request.status,
      notes: request.notes,
      createdAt: request.createdAt,
      rider: {
        userId: request.rider.id,
        user: {
          id: request.rider.id,
          name: request.rider.name,
          email: request.rider.email,
          photoUrl: request.rider.photoUrl,
          ratingAvg: request.rider.ratingAvg,
          ratingCount: request.rider.ratingCount,
          university: request.rider.university,
        }
      }
    }))

    return NextResponse.json({
      success: true,
      rideRequests: transformedRequests,
      total: rideRequests.length
    })

  } catch (error) {
    console.error('❌ [SEARCH RIDE REQUESTS] Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to search ride requests'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
