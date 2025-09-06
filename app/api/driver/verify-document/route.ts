import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const verifyDocumentSchema = z.object({
  userId: z.string(),
  documentType: z.enum(['license', 'id']),
  imageData: z.string(), // base64 encoded image
  metadata: z.object({
    timestamp: z.string(),
    deviceInfo: z.string().optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = verifyDocumentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: validation.error.errors[0]?.message || 'Invalid input' 
        },
        { status: 400 }
      )
    }

    const { userId, documentType, imageData, metadata } = validation.data

    // In a real implementation, you would:
    // 1. Upload image to cloud storage (S3, Cloudinary, etc.)
    // 2. Queue for admin review or use AI verification
    // 3. Update driver verification status
    // 4. Send notification to user about review status

    // Mock implementation - simulate document processing
    const imageUrl = await uploadToCloudStorage(imageData, documentType, userId)
    
    // Update driver verification status
    const updateData = documentType === 'license' 
      ? { 
          licensePhotoUrl: imageUrl,
          licenseVerified: false, // Will be true after admin approval
          trustScore: 65.0 // Intermediate score while pending review
        }
      : { 
          idPhotoUrl: imageUrl,
          idVerified: false, // Will be true after admin approval
          trustScore: 65.0 // Intermediate score while pending review
        }

    const driver = await prisma.driver.update({
      where: { userId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    // Create verification record for admin review
    await prisma.verification.create({
      data: {
        userId,
        type: documentType === 'license' ? 'license' : 'student',
        status: 'pending',
        files: {
          imageUrl,
          originalName: `${documentType}_${userId}_${Date.now()}.jpg`,
          uploadedAt: new Date().toISOString()
        },
        data: {
          documentType,
          captureMethod: 'camera',
          metadata
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `${documentType === 'license' ? 'License' : 'ID'} submitted successfully for review`,
      data: {
        verificationId: `verify_${Date.now()}`,
        status: 'pending',
        estimatedReviewTime: '24 hours',
        trustScore: updateData.trustScore
      }
    })

  } catch (error) {
    console.error('Document verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit document for verification' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Mock function to simulate cloud storage upload
async function uploadToCloudStorage(imageData: string, documentType: string, userId: string): Promise<string> {
  // In real implementation, upload to S3, Cloudinary, etc.
  // For now, return a mock URL
  const timestamp = Date.now()
  return `https://storage.rydify.com/documents/${userId}/${documentType}_${timestamp}.jpg`
}

// GET endpoint to check verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    const driver = await prisma.driver.findUnique({
      where: { userId },
      select: {
        studentVerified: true,
        licenseVerified: true,
        idVerified: true,
        trustScore: true,
        lastPromptedAt: true
      }
    })

    if (!driver) {
      return NextResponse.json(
        { success: false, message: 'Driver not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: driver
    })

  } catch (error) {
    console.error('Get verification status error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get verification status' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}