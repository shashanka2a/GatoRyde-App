import { DrivePageClient } from './DrivePageClient'

export default async function DrivePage() {
  // Simplified for MVP - assume user is verified
  const userEduVerified = true

  return <DrivePageClient userEduVerified={userEduVerified} />
}