import { NextRequest, NextResponse } from "next/server"
import { getTokenFromRequest } from "@/lib/auth/jwt-edge"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Mark as dynamic to prevent static generation
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const tokenData = await getTokenFromRequest(request)
    
    if (!tokenData) {
      return NextResponse.json({
        success: false,
        user: null
      })
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: tokenData.id },
      select: {
        id: true,
        email: true,
        name: true,
        eduVerified: true,
        university: true,
        photoUrl: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        user: null
      })
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error("Session error:", error)
    
    return NextResponse.json({
      success: false,
      user: null
    })
  } finally {
    await prisma.$disconnect()
  }
}