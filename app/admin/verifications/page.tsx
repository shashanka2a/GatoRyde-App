import { requireAuth } from '@/lib/auth/session'
import { VerificationManager } from '@/src/components/admin/VerificationManager'
import { redirect } from 'next/navigation'

export default async function AdminVerificationsPage() {
  const session = await requireAuth()
  
  // TODO: Add proper admin role check
  // For now, you might want to check if user email is in admin list
  // or add an isAdmin field to your User model
  
  return (
    <div className="container mx-auto py-8 px-4">
      <VerificationManager />
    </div>
  )
}