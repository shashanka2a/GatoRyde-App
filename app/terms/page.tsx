import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { ArrowLeft, Shield, Users, Lock, Mail } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - Rydify',
  description: 'Terms of Service and Privacy Policy for Rydify university ridesharing platform',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/auth/login">
            <Button variant="ghost" className="mb-4 hover:bg-teal-50 dark:hover:bg-teal-900/30">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="text-white font-bold text-2xl">R</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Terms of Service
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Last updated: December 2024
            </p>
          </div>
        </div>

        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                By accessing and using Rydify, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. University Student Verification</h2>
              <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-200 dark:border-teal-800 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-teal-900 dark:text-teal-100 mb-2">Educational Email Requirement</h3>
                    <p className="text-teal-800 dark:text-teal-200 text-sm">
                      Rydify is exclusively for verified university students. You must use a valid .edu email address 
                      to create an account and access our services.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Responsibilities</h2>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
                <li>Provide accurate and truthful information during registration</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the service only for legitimate ridesharing purposes</li>
                <li>Treat all users with respect and courtesy</li>
                <li>Follow all applicable traffic laws and safety regulations</li>
                <li>Report any suspicious or inappropriate behavior</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Safety and Liability</h2>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800 mb-6">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Important Safety Notice</h3>
                    <p className="text-orange-800 dark:text-orange-200 text-sm">
                      Rydify facilitates connections between students but does not provide transportation services directly. 
                      Users participate at their own risk and are responsible for their own safety.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Privacy Policy</h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 mb-6">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Data Protection</h3>
                    <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                      <li>• We collect only necessary information for service operation</li>
                      <li>• Your .edu email is used solely for verification purposes</li>
                      <li>• Personal information is never shared with third parties</li>
                      <li>• All data is encrypted and securely stored</li>
                      <li>• You can request data deletion at any time</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Prohibited Activities</h2>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
                <li>Using the service for commercial transportation purposes</li>
                <li>Creating fake accounts or impersonating others</li>
                <li>Harassment, discrimination, or inappropriate behavior</li>
                <li>Sharing accounts or allowing unauthorized access</li>
                <li>Attempting to circumvent security measures</li>
                <li>Using the platform for illegal activities</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Account Termination</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                We reserve the right to suspend or terminate accounts that violate these terms, 
                engage in fraudulent activity, or pose a safety risk to other users.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Changes to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Rydify reserves the right to modify these terms at any time. Users will be notified 
                of significant changes via email or platform notifications.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Contact Information</h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      For questions about these terms or our service, contact us at:
                    </p>
                    <p className="font-medium text-teal-600 dark:text-teal-400">
                      support@rydify.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Link href="/auth/login">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl px-8 py-3 shadow-md hover:shadow-lg transition-all duration-200">
              I Understand - Continue to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}