import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'origin' or 'destination'
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('🔍 [POPULAR LOCATIONS] Request received')
    console.log('🔍 [POPULAR LOCATIONS] Type:', type)
    console.log('🔍 [POPULAR LOCATIONS] Limit:', limit)

    // Build query conditions
    const where: any = {}
    if (type && (type === 'origin' || type === 'destination')) {
      where.searchType = type
    }

    // Get popular locations ordered by search count and recency
    const popularLocations = await prisma.locationSearch.findMany({
      where,
      orderBy: [
        { searchCount: 'desc' },
        { lastSearched: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        location: true,
        placeName: true,
        lat: true,
        lng: true,
        searchType: true,
        searchCount: true,
        lastSearched: true
      }
    })

    console.log(`✅ [POPULAR LOCATIONS] Found ${popularLocations.length} popular locations`)

    return NextResponse.json({
      success: true,
      locations: popularLocations,
      total: popularLocations.length
    })

  } catch (error) {
    console.error('❌ [POPULAR LOCATIONS] Error:', error)
    console.error('❌ [POPULAR LOCATIONS] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch popular locations', details: error.message },
      { status: 500 }
    )
  }
}
