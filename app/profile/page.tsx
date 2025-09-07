import { ProfilePageClient } from './ProfilePageClient'
import { getCurrentUser } from '@/lib/auth/server-auth'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  // Get actual user data from authentication
  const user = await getCurrentUser()
  
  if (!user) {
    // This should not happen due to middleware protection, but handle gracefully
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  // Convert user data to the format expected by ProfilePageClient
  const userData = {
    id: user.id,
    name: user.name || '',
    email: user.email,
    phone: user.phone || '',
    eduVerified: user.eduVerified,
    kycVerified: false, // TODO: Add KYC verification status
    licenseVerified: false, // TODO: Add license verification status
    joinedAt: new Date(), // TODO: Get actual join date from user record
    ratingAvg: 0, // TODO: Calculate from ride history
    ratingCount: 0 // TODO: Calculate from ride history
  }

  return <ProfilePageClient userData={userData} />
}