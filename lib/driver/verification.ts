'use server'

import { prisma } from '@/lib/db/client'
import { requireAuth } from '@/lib/auth/session'

export interface DriverVerificationStatus {
  hasDriverProfile: boolean
  isVerified: boolean
  isLocalOnly: boolean
  verificationPending: boolean
  needsLicenseVerification: boolean
  canCreateRides: boolean
}

export async function getDriverVerificationStatus(): Promise<DriverVerificationStatus> {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    // Check if user has a driver profile
    const driver = await prisma.driver.findUnique({
      where: { userId }
    })

    if (!driver) {
      return {
        hasDriverProfile: false,
        isVerified: false,
        isLocalOnly: false,
        verificationPending: false,
        needsLicenseVerification: false,
        canCreateRides: false
      }
    }

    // Check for pending license verification
    const pendingLicenseVerification = await prisma.verification.findFirst({
      where: {
        userId,
        type: 'license',
        status: 'pending'
      }
    })

    // Check for approved license verification
    const approvedLicenseVerification = await prisma.verification.findFirst({
      where: {
        userId,
        type: 'license',
        status: 'approved'
      }
    })

    const isVerified = driver.verified || !!approvedLicenseVerification
    const verificationPending = !!pendingLicenseVerification
    const hasLicenseVerification = !!approvedLicenseVerification || verificationPending

    // Determine if this is a local-only driver
    // Local-only drivers can create rides without license verification
    const isLocalOnly = !hasLicenseVerification && !verificationPending

    // Driver can create rides if:
    // 1. They are verified (license approved), OR
    // 2. They are local-only (no license verification needed), OR
    // 3. They have pending verification (can create local rides while waiting)
    const canCreateRides = isVerified || isLocalOnly || verificationPending

    return {
      hasDriverProfile: true,
      isVerified,
      isLocalOnly,
      verificationPending,
      needsLicenseVerification: !hasLicenseVerification && !isLocalOnly,
      canCreateRides
    }

  } catch (error) {
    console.error('Error checking driver verification status:', error)
    return {
      hasDriverProfile: false,
      isVerified: false,
      isLocalOnly: false,
      verificationPending: false,
      needsLicenseVerification: false,
      canCreateRides: false
    }
  }
}

export async function createDriverProfile(data: {
  isLocalRidesOnly: boolean
  licenseUploaded: boolean
  vehicleInfo: {
    make: string
    model: string
    year: number
    color: string
    seats: number
    licensePlate: string
  }
}): Promise<{ success: boolean; message: string }> {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    // Check if driver profile already exists
    const existingDriver = await prisma.driver.findUnique({
      where: { userId }
    })

    if (existingDriver) {
      return {
        success: false,
        message: 'Driver profile already exists'
      }
    }

    // Create vehicle record
    const vehicle = await prisma.vehicle.create({
      data: {
        userId,
        make: data.vehicleInfo.make,
        model: data.vehicleInfo.model,
        year: data.vehicleInfo.year,
        color: data.vehicleInfo.color,
        seats: data.vehicleInfo.seats,
        plate: data.vehicleInfo.licensePlate
      }
    })

    // Create driver profile
    await prisma.driver.create({
      data: {
        userId,
        licenseNumber: '', // Will be updated when license verification is submitted
        verified: data.isLocalRidesOnly && !data.licenseUploaded, // Local-only drivers are auto-verified
        offeredSeats: data.vehicleInfo.seats - 1, // Driver takes one seat
        vehicleId: vehicle.id
      }
    })

    return {
      success: true,
      message: 'Driver profile created successfully'
    }

  } catch (error) {
    console.error('Error creating driver profile:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create driver profile'
    }
  }
}