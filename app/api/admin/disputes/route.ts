import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user and verify admin access
    const session = await requireAuth()
    
    // TODO: Add proper admin role check
    // For now, we'll assume any authenticated user can access admin features
    // In production, you should check for admin role/permissions
    
    const disputes = await prisma.dispute.findMany({
      include: {
        booking: {
          include: {
            ride: {
              include: {
                driver: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        email: true,
                      }
                    }
                  }
                }
              }
            },
            rider: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        openedBy: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // Open disputes first
        { createdAt: 'desc' }, // Most recent first
      ]
    })

    return NextResponse.json({
      success: true,
      disputes,
    })

  } catch (error) {
    console.error('Failed to fetch disputes:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch disputes' 
      },
      { status: 500 }
    )
  }
}