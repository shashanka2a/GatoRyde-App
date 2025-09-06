import { OTPLogin } from '@/src/components/auth/OTPLogin'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-md border border-gray-200 dark:border-gray-700">
        <OTPLogin />
      </div>
    </div>
  )
}