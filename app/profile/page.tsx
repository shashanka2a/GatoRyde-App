import { ProfilePageClient } from './ProfilePageClient'

export default async function ProfilePage() {
  // Simplified for MVP - assume user data
  const userData = {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex.johnson@ufl.edu',
    phone: '+1 (555) 123-4567',
    eduVerified: true,
    kycVerified: false,
    licenseVerified: false,
    joinedAt: new Date('2024-01-15'),
    ratingAvg: 4.8,
    ratingCount: 23
  }

  return <ProfilePageClient userData={userData} />
}