import { OTPLogin } from '@/src/components/auth/OTPLogin'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <OTPLogin />
      </div>
    </div>
  )
}