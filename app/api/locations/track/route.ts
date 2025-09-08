import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

const TrackLocationSchema = z.object({
  location: z.string().min(1),
  placeName: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  searchType: z.enum(['origin', 'destination'])
})

export async function POST(request: NextRequest) {
  try {
    console.log('📍 [TRACK LOCATION] Request received')
    
    const body = await request.json()
    console.log('📍 [TRACK LOCATION] Request body:', body)
    
    const validatedData = TrackLocationSchema.parse(body)
    console.log('✅ [TRACK LOCATION] Data validated successfully')
    
    const { location, placeName, lat, lng, searchType } = validatedData
    
    // Try to find existing location search
    const existingSearch = await prisma.locationSearch.findUnique({
      where: {
        location_searchType: {
          location: location,
          searchType: searchType
        }
      }
    })
    
    if (existingSearch) {
      // Update existing search count and timestamp
      const updatedSearch = await prisma.locationSearch.update({
        where: {
          id: existingSearch.id
        },
        data: {
          searchCount: existingSearch.searchCount + 1,
          lastSearched: new Date(),
          placeName: placeName || existingSearch.placeName,
          lat: lat || existingSearch.lat,
          lng: lng || existingSearch.lng
        }
      })
      
      console.log(`✅ [TRACK LOCATION] Updated search count for "${location}" (${searchType}): ${updatedSearch.searchCount}`)
      
      return NextResponse.json({
        success: true,
        message: 'Location search tracked',
        searchCount: updatedSearch.searchCount
      })
    } else {
      // Create new location search entry
      const newSearch = await prisma.locationSearch.create({
        data: {
          location,
          placeName,
          lat,
          lng,
          searchType,
          searchCount: 1,
          lastSearched: new Date()
        }
      })
      
      console.log(`✅ [TRACK LOCATION] Created new search entry for "${location}" (${searchType})`)
      
      return NextResponse.json({
        success: true,
        message: 'Location search tracked',
        searchCount: newSearch.searchCount
      })
    }
    
  } catch (error) {
    console.error('❌ [TRACK LOCATION] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to track location search' },
      { status: 500 }
    )
  }
}
