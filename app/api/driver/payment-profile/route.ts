import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth/jwt-edge'
import { prisma } from '@/lib/db/client'
import { z } from 'zod'

const PaymentProfileSchema = z.object({
  zelleHandle: z.string().email('Invalid Zelle email address'),
  cashAppHandle: z.string().regex(/^\$[a-zA-Z0-9_]+$/, 'Cash App handle must start with $ and contain only letters, numbers, and underscores')
})

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const tokenData = await getTokenFromRequest(request)
    
    if (!tokenData || !tokenData.eduVerified) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { zelleHandle, cashAppHandle } = PaymentProfileSchema.parse(body)
    
    // Check if user has a driver profile
    let driver = await prisma.driver.findUnique({
      where: { userId: tokenData.id }
    })

    // Create driver profile if it doesn't exist
    if (!driver) {
      driver = await prisma.driver.create({
        data: {
          userId: tokenData.id,
          zelleHandle,
          cashAppHandle,
          isLocalRidesOnly: false,
          licenseUploaded: false,
          licenseVerified: false
        }
      })
    } else {
      // Update existing driver profile
      driver = await prisma.driver.update({
        where: { id: driver.id },
        data: {
          zelleHandle,
          cashAppHandle
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Payment profile updated successfully',
      driver: {
        id: driver.id,
        zelleHandle: driver.zelleHandle,
        cashAppHandle: driver.cashAppHandle
      }
    })
    
  } catch (error) {
    console.error('Payment profile update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update payment profile'
      },
      { status: 500 }
    )
  }
}