import { NextRequest, NextResponse } from 'next/server'
import { requireEduVerified } from '@/lib/auth/server-auth'
import { prisma } from '@/lib/db/client'
import { z } from 'zod'

const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number too long')
})

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireEduVerified()
    
    // Parse and validate request body
    const body = await request.json()
    const { name, phone } = UpdateProfileSchema.parse(body)
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        phone: phone.trim()
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        eduVerified: updatedUser.eduVerified,
        university: updatedUser.university,
        photoUrl: updatedUser.photoUrl,
      }
    })
    
  } catch (error) {
    console.error('Profile update error:', error)
    
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
        error: 'Failed to update profile'
      },
      { status: 500 }
    )
  }
}
