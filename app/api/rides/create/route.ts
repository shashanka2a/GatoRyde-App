import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/client'
import { getTokenFromRequest } from '@/lib/auth/jwt-edge'

const CreateRideSchema = z.object({
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
  seatsTotal: z.number().min(1).max(8),
  totalTripCostCents: z.number().min(0).max(50000),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚗 [CREATE RIDE] Request received')
    
    // Check authentication
    const tokenData = await getTokenFromRequest(request)
    console.log('🔍 [CREATE RIDE] Token data:', tokenData)
    
    if (!tokenData || !tokenData.eduVerified) {
      console.log('❌ [CREATE RIDE] Authentication failed')
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    console.log('🔍 [CREATE RIDE] User authenticated:', tokenData.email)
    
    // Parse and validate request body
    const body = await request.json()
    console.log('🔍 [CREATE RIDE] Request body:', body)
    
    const validatedData = CreateRideSchema.parse(body)
    console.log('✅ [CREATE RIDE] Data validated successfully')
    
    // Check if user has a driver profile with payment info
    const driver = await prisma.driver.findUnique({
      where: { userId: tokenData.id }
    })
    
    if (!driver) {
      console.log('❌ [CREATE RIDE] No driver profile found for user')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Driver profile required. Please complete driver setup first.' 
        },
        { status: 400 }
      )
    }

    // Check if driver has payment methods set up
    if (!driver.zelleHandle || !driver.cashAppHandle) {
      console.log('❌ [CREATE RIDE] Driver missing payment methods')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment methods required. Please set up Zelle and Cash App handles in your profile.' 
        },
        { status: 400 }
      )
    }
    
    console.log('✅ [CREATE RIDE] Driver profile found:', driver.userId)
    
    // Create the ride
    const ride = await prisma.ride.create({
      data: {
        driverId: driver.userId,
        originText: validatedData.origin.text,
        originLat: validatedData.origin.lat,
        originLng: validatedData.origin.lng,
        destText: validatedData.destination.text,
        destLat: validatedData.destination.lat,
        destLng: validatedData.destination.lng,
        departAt: new Date(validatedData.departAt),
        seatsTotal: validatedData.seatsTotal,
        seatsAvailable: validatedData.seatsTotal,
        totalCostCents: validatedData.totalTripCostCents,
        notes: validatedData.notes || '',
        status: 'open'
      },
      include: {
        driver: {
          include: {
            user: true
          }
        }
      }
    })
    
    console.log('✅ [CREATE RIDE] Ride created successfully:', ride.id)
    
    return NextResponse.json({
      success: true,
      message: 'Ride created successfully',
      rideId: ride.id,
      ride: {
        id: ride.id,
        originText: ride.originText,
        destText: ride.destText,
        departAt: ride.departAt,
        seatsTotal: ride.seatsTotal,
        seatsAvailable: ride.seatsAvailable,
        totalCostCents: ride.totalCostCents,
        status: ride.status,
        driver: {
          name: ride.driver.user.name,
          email: ride.driver.user.email
        }
      }
    })
    
  } catch (error) {
    console.error('❌ [CREATE RIDE] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create ride. Please try again.' 
      },
      { status: 500 }
    )
  }
}
