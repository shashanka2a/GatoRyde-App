import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/client'
import { getTokenFromRequest } from '@/lib/auth/jwt-edge'

const CreateRideRequestSchema = z.object({
  origin: z.object({
    text: z.string(),
    placeName: z.string(),
    lat: z.number(),
    lng: z.number(),
  }),
  destination: z.object({
    text: z.string(),
    placeName: z.string(),
    lat: z.number(),
    lng: z.number(),
  }),
  departAt: z.string().datetime(),
  seatsNeeded: z.number().int().min(1).max(4),
  maxCostCents: z.number().int().min(0),
  notes: z.string().max(500).optional(),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚗 [CREATE RIDE REQUEST] Request received')
    console.log('🔍 [CREATE RIDE REQUEST] Request headers:', Object.fromEntries(request.headers.entries()))
    
    // Check authentication using JWT
    const tokenData = await getTokenFromRequest(request)
    console.log('🔍 [CREATE RIDE REQUEST] Token data:', tokenData)
    
    if (!tokenData || !tokenData.eduVerified) {
      console.log('❌ [CREATE RIDE REQUEST] Authentication failed')
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    console.log('🔍 [CREATE RIDE REQUEST] User authenticated:', tokenData.email)
    
    // Parse and validate request body
    const body = await request.json()
    console.log('🔍 [CREATE RIDE REQUEST] Request body:', body)
    
    const validatedData = CreateRideRequestSchema.parse(body)
    console.log('✅ [CREATE RIDE REQUEST] Data validated successfully')
    
    // Create the ride request
    const rideRequest = await prisma.rideRequest.create({
      data: {
        riderId: tokenData.id,
        originText: validatedData.origin.text,
        originLat: validatedData.origin.lat,
        originLng: validatedData.origin.lng,
        destText: validatedData.destination.text,
        destLat: validatedData.destination.lat,
        destLng: validatedData.destination.lng,
        departAt: new Date(validatedData.departAt),
        seatsNeeded: validatedData.seatsNeeded,
        maxCostCents: validatedData.maxCostCents,
        notes: validatedData.notes,
        status: 'open', // Default status
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
          }
        }
      }
    })

    console.log('✅ [CREATE RIDE REQUEST] Ride request created successfully:', rideRequest.id)
    return NextResponse.json({ success: true, rideRequest })

  } catch (error) {
    console.error('❌ [CREATE RIDE REQUEST] Error creating ride request:', error)
    console.error('❌ [CREATE RIDE REQUEST] Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create ride request. Please try again.',
        details: error.message 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
