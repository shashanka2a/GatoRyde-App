import { prisma } from '@/lib/db/client'

export interface ProfileCompletionStatus {
  isComplete: boolean
  missingFields: string[]
  completionPercentage: number
  canAccessApp: boolean
}

export interface MandatoryFields {
  name: boolean
  phone: boolean
  zelleHandle?: boolean
  cashAppHandle?: boolean
  kycVerified?: boolean
  licenseVerified?: boolean
}

/**
 * Check if a user's profile is complete with all mandatory fields
 */
export async function checkProfileCompletion(userId: string): Promise<ProfileCompletionStatus> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        driver: true,
        kycVerification: true
      }
    })

    if (!user) {
      return {
        isComplete: false,
        missingFields: ['user_not_found'],
        completionPercentage: 0,
        canAccessApp: false
      }
    }

    const mandatoryFields: MandatoryFields = {
      name: !!user.name?.trim(),
      phone: !!user.phone?.trim(),
      zelleHandle: !!user.driver?.zelleHandle?.trim(),
      cashAppHandle: !!user.driver?.cashAppHandle?.trim(),
      kycVerified: user.kycVerified || false,
      licenseVerified: user.driver?.licenseVerified || false
    }

    const missingFields: string[] = []
    
    // Core profile fields (always required for ALL users)
    if (!mandatoryFields.name) missingFields.push('name')
    if (!mandatoryFields.phone) missingFields.push('phone')
    
    // Driver-specific payment fields (required for drivers to post rides)
    if (user.driver) {
      if (!mandatoryFields.zelleHandle) missingFields.push('zelle_handle')
      if (!mandatoryFields.cashAppHandle) missingFields.push('cashapp_handle')
      // KYC and license are OPTIONAL for drivers (not in missingFields)
    }
    
    console.log('🔍 [PROFILE COMPLETION] User:', user.email)
    console.log('🔍 [PROFILE COMPLETION] Has driver profile:', !!user.driver)
    console.log('🔍 [PROFILE COMPLETION] Mandatory fields:', mandatoryFields)
    console.log('🔍 [PROFILE COMPLETION] Missing fields:', missingFields)

    // Calculate completion percentage based on mandatory fields only
    const mandatoryFieldCount = user.driver ? 4 : 2 // name, phone for all; + zelle, cashapp for drivers
    const completedMandatoryFields = mandatoryFieldCount - missingFields.length
    const completionPercentage = Math.round((completedMandatoryFields / mandatoryFieldCount) * 100)

    // User can access app if they have at least name and phone
    const canAccessApp = mandatoryFields.name && mandatoryFields.phone

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      completionPercentage,
      canAccessApp
    }
  } catch (error) {
    console.error('Error checking profile completion:', error)
    return {
      isComplete: false,
      missingFields: ['error_checking_profile'],
      completionPercentage: 0,
      canAccessApp: false
    }
  }
}

/**
 * Get user-friendly field names for missing fields
 */
export function getFieldDisplayName(field: string): string {
  const fieldNames: Record<string, string> = {
    name: 'Full Name',
    phone: 'Phone Number',
    zelle_handle: 'Zelle Handle',
    cashapp_handle: 'Cash App Handle',
    kyc_verification: 'Identity Verification (KYC)',
    license_verification: 'Driver\'s License Verification',
    user_not_found: 'User Account',
    error_checking_profile: 'Profile Information'
  }
  
  return fieldNames[field] || field
}

/**
 * Check if user needs to complete profile before accessing certain features
 */
export async function requiresProfileCompletion(userId: string, feature: 'basic' | 'driver' | 'full'): Promise<boolean> {
  const status = await checkProfileCompletion(userId)
  
  switch (feature) {
    case 'basic':
      return !status.canAccessApp
    case 'driver':
      return !status.canAccessApp || status.missingFields.some(field => 
        ['zelle_handle', 'cashapp_handle', 'kyc_verification', 'license_verification'].includes(field)
      )
    case 'full':
      return !status.isComplete
    default:
      return !status.canAccessApp
  }
}
