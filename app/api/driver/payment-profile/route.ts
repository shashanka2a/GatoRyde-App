import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { UpdateDriverSchema } from '@/lib/db/types'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...updateData } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate the update data
    const validatedData = UpdateDriverSchema.parse(updateData)

    // Update driver payment profile
    const updatedDriver = await prisma.driver.update({
      where: { userId },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      driver: updatedDriver
    })

  } catch (error) {
    console.error('Payment profile update error:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update payment profile' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // For static generation, return empty profile
    return NextResponse.json({
      success: true,
      driver: null
    })

  } catch (error) {
    console.error('Payment profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment profile' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-static'