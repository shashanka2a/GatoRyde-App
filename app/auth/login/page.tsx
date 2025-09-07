import { Suspense } from 'react'
import { OTPLogin } from '@/src/components/auth/OTPLogin'

function LoginPageContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-md border border-gray-200 dark:border-gray-700">
        <OTPLogin />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-md border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}