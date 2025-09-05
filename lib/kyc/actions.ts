'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/session'
import { KYCStorageManager } from '@/lib/storage/kyc-storage'
import { 
  KYCSubmissionSchema, 
  AdminReviewSchema,
  type KYCSubmission,
  type VerificationWithUser 
} from './types'
import { z } from 'zod'

export interface KYCSubmissionResult {
  success: boolean
  message: string
  verificationId?: string
  errors?: Record<string, string>
}

export interface AdminReviewResult {
  success: boolean
  message: string
  errors?: Record<string, string>
}

export async function submitKYCVerification(
  formData: FormData
): Promise<KYCSubmissionResult> {
  try {
    // Get authenticated user
    const session = await requireAuth()
    const userId = session.user.id

    // Parse form data
    const type = formData.get('type') as string
    const dataJson = formData.get('data') as string
    
    if (!type || !dataJson) {
      return {
        success: false,
        message: 'Missing required form data',
        errors: { form: 'Invalid form submission' }
      }
    }

    // Parse and validate data
    const data = JSON.parse(dataJson)
    const validatedData = KYCSubmissionSchema.parse({ type, data })

    // Check if user already has a pending verification of this type
    const existingVerification = await prisma.verification.findFirst({
      where: {
        userId,
        type: validatedData.type as any,
        status: 'pending'
      }
    })

    if (existingVerification) {
      return {
        success: false,
        message: `You already have a pending ${validatedData.type} verification`,
        errors: { form: 'Duplicate submission' }
      }
    }

    // Process file uploads
    const files: { file: File; category: any; fieldName: string }[] = []
    const fileFields = getRequiredFileFields(validatedData.type)
    
    for (const fieldName of fileFields) {
      const file = formData.get(fieldName) as File
      if (!file || file.size === 0) {
        return {
          success: false,
          message: `${fieldName} is required`,
          errors: { [fieldName]: 'File is required' }
        }
      }
      files.push({ file, category: validatedData.type as any, fieldName })
    }

    // Upload files
    const uploadedFiles = await KYCStorageManager.uploadMultipleFiles(files, userId)

    // Create verification record
    const verification = await prisma.verification.create({
      data: {
        userId,
        type: validatedData.type as any,
        status: 'pending',
        data: validatedData.data,
        files: uploadedFiles,
      }
    })

    // Update driver verification status if license verification
    if (validatedData.type === 'license') {
      await prisma.driver.upsert({
        where: { userId },
        create: {
          userId,
          licenseNumber: (validatedData.data as any).licenseNumber,
          verified: false,
        },
        update: {
          licenseNumber: (validatedData.data as any).licenseNumber,
        }
      })
    }

    revalidatePath('/dashboard/kyc')
    revalidatePath('/admin/verifications')

    return {
      success: true,
      message: 'Verification submitted successfully. We will review it within 24-48 hours.',
      verificationId: verification.id
    }

  } catch (error) {
    console.error('KYC submission error:', error)

    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return {
        success: false,
        message: 'Please check your form data',
        errors
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit verification',
      errors: { form: 'Submission failed' }
    }
  }
}

export async function reviewKYCVerification(
  verificationId: string,
  status: 'approved' | 'rejected',
  notes?: string
): Promise<AdminReviewResult> {
  try {
    // Get authenticated admin user (you might want to add admin role check here)
    const session = await requireAuth()
    const adminId = session.user.id

    // Validate input
    const validatedData = AdminReviewSchema.parse({
      verificationId,
      status,
      notes
    })

    // Get verification
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: { user: true }
    })

    if (!verification) {
      return {
        success: false,
        message: 'Verification not found',
        errors: { form: 'Invalid verification ID' }
      }
    }

    if (verification.status !== 'pending') {
      return {
        success: false,
        message: 'Verification has already been reviewed',
        errors: { form: 'Already reviewed' }
      }
    }

    // Update verification
    const updatedVerification = await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: validatedData.status as any,
        notes: validatedData.notes,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      }
    })

    // If license verification approved, update driver verification status
    if (verification.type === 'license' && validatedData.status === 'approved') {
      await prisma.driver.upsert({
        where: { userId: verification.userId },
        create: {
          userId: verification.userId,
          licenseNumber: (verification.data as any).licenseNumber,
          verified: true,
        },
        update: {
          verified: true,
        }
      })
    }

    // If rejected, clean up uploaded files
    if (validatedData.status === 'rejected' && verification.files) {
      const files = verification.files as Record<string, any>
      const filePaths = Object.values(files).map((file: any) => file.path)
      await KYCStorageManager.deleteMultipleFiles(filePaths)
    }

    revalidatePath('/admin/verifications')
    revalidatePath('/dashboard/kyc')

    return {
      success: true,
      message: `Verification ${validatedData.status} successfully`
    }

  } catch (error) {
    console.error('KYC review error:', error)

    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return {
        success: false,
        message: 'Invalid review data',
        errors
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to review verification',
      errors: { form: 'Review failed' }
    }
  }
}

export async function getPendingVerifications(): Promise<VerificationWithUser[]> {
  try {
    const verifications = await prisma.verification.findMany({
      where: { status: 'pending' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return verifications as VerificationWithUser[]
  } catch (error) {
    console.error('Error fetching pending verifications:', error)
    return []
  }
}

export async function getUserVerifications(userId: string) {
  try {
    const verifications = await prisma.verification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return verifications
  } catch (error) {
    console.error('Error fetching user verifications:', error)
    return []
  }
}

function getRequiredFileFields(type: string): string[] {
  switch (type) {
    case 'license':
      return ['licensePhoto', 'selfiePhoto']
    case 'vehicle':
      return ['registrationPhoto', 'vehiclePhoto', 'insurancePhoto']
    case 'student':
      return ['studentIdPhoto', 'enrollmentPhoto']
    default:
      return []
  }
}