import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { signJWT } from '@/lib/auth/jwt-edge'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const profileSchema = z.object({
  email: z.string().email().endsWith('.edu', 'Must be a .edu email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[\+]?[1-9][\d]{9,14}$/, 'Invalid phone number format')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = profileSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: validation.error.errors[0]?.message || 'Invalid input' 
        },
        { status: 400 }
      )
    }

    const { email, name, phone } = validation.data

    // Find and update user in database
    const user = await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        name,
        phone,
        updatedAt: new Date(),
      }
    })

    // Generate JWT token for session
    const token = await signJWT({
      id: user.id,
      email: user.email,
      eduVerified: user.eduVerified,
      university: user.university,
    })

    // Create response with secure cookie
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
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return response

  } catch (error) {
    console.error('Profile completion error:', error)
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