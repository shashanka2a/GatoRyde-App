import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { signJWT } from '@/lib/auth/jwt-edge'
import { setAuthCookies } from '@/lib/auth/cookies'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const profileSchema = z.object({
  email: z.string().email().endsWith('.edu', 'Must be a .edu email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[\+]?[1-9][\d]{9,14}$/, 'Invalid phone number format')
})

export async function POST(request: NextRequest) {
  console.log("🔍 [COMPLETE PROFILE] Request received")
  console.log("🔍 [COMPLETE PROFILE] Request URL:", request.url)
  console.log("🔍 [COMPLETE PROFILE] Request method:", request.method)
  
  try {
    const body = await request.json()
    console.log("🔍 [COMPLETE PROFILE] Request body:", body)
    
    // Validate input
    console.log("🔍 [COMPLETE PROFILE] Validating input...")
    const validation = profileSchema.safeParse(body)
    if (!validation.success) {
      console.log("❌ [COMPLETE PROFILE] Validation failed:", validation.error.errors)
      return NextResponse.json(
        { 
          success: false, 
          message: validation.error.errors[0]?.message || 'Invalid input' 
        },
        { status: 400 }
      )
    }

    const { email, name, phone } = validation.data
    console.log("🔍 [COMPLETE PROFILE] Validation passed")
    console.log("🔍 [COMPLETE PROFILE] Email:", email)
    console.log("🔍 [COMPLETE PROFILE] Name:", name)
    console.log("🔍 [COMPLETE PROFILE] Phone:", phone)

    // Find and update user in database
    console.log("🔍 [COMPLETE PROFILE] Updating user in database...")
    const user = await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        name,
        phone,
        updatedAt: new Date(),
      }
    })
    console.log("✅ [COMPLETE PROFILE] User updated successfully:", user.id)

    // Generate JWT token for session
    console.log("🔍 [COMPLETE PROFILE] Generating JWT token...")
    const token = await signJWT({
      id: user.id,
      email: user.email,
      eduVerified: user.eduVerified,
      university: user.university,
    })
    console.log("✅ [COMPLETE PROFILE] JWT token generated")

    // Create response with secure cookie
    console.log("🔍 [COMPLETE PROFILE] Creating response...")
    const response = NextResponse.json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        eduVerified: user.eduVerified,
        university: user.university,
        photoUrl: user.photoUrl,
      }
    })

    // Set secure HTTP-only cookie
    console.log("🔍 [COMPLETE PROFILE] Setting auth cookie...")
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    // Set authentication cookies for middleware
    console.log("🔍 [COMPLETE PROFILE] Setting auth cookies for middleware...")
    setAuthCookies(user.id, user.eduVerified, response)
    console.log("✅ [COMPLETE PROFILE] Response created successfully")

    return response

  } catch (error) {
    console.error('❌ [COMPLETE PROFILE] Unexpected error:', error)
    console.error('❌ [COMPLETE PROFILE] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to complete profile. Please try again.' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}