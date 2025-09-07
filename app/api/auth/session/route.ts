import { NextRequest, NextResponse } from "next/server"
import { getTokenFromRequest } from "@/lib/auth/jwt-edge"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Mark as dynamic to prevent static generation
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  console.log("🔍 [SESSION] Session check request received")
  try {
    const tokenData = await getTokenFromRequest(request)
    console.log("🔍 [SESSION] Token data:", tokenData)
    
    if (!tokenData) {
      console.log("❌ [SESSION] No token data found")
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
      console.log("❌ [SESSION] User not found in database")
      return NextResponse.json({
        success: false,
        user: null
      })
    }

    console.log("✅ [SESSION] User found:", user.email)
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