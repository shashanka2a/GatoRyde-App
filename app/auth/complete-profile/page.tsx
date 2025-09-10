import { Suspense } from 'react'
import { CompleteProfileForm } from '@/src/components/auth/CompleteProfileForm'
import { getCurrentUser } from '@/lib/auth/server-auth'
import { checkProfileCompletion } from '@/lib/auth/profile-completion'
import { redirect } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function CompleteProfilePage() {
  // Get current user
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Check current profile completion status
  const profileStatus = await checkProfileCompletion(user.id)
  
  // If profile is already complete, redirect to intended destination
  if (profileStatus.isComplete) {
    redirect('/profile')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-2xl border border-gray-200 dark:border-gray-700">
        <Suspense fallback={
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        }>
          <CompleteProfileForm 
            user={user} 
            profileStatus={profileStatus}
          />
        </Suspense>
      </div>
    </div>
  )
}
