import { AuthLayout } from '@/src/components/layout/AuthLayout'
import { AuthGuard } from '@/src/components/auth/AuthGuard'
import { OfferRideButton, PostRequestButton, ContactDriverActions } from '@/src/components/auth/ProtectedActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Shield, Lock, Globe } from 'lucide-react'

export default function AuthGatesDemo() {
  return (
    <AuthLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Rydify Access Control Demo</h1>
          <p className="text-gray-600">
            This page demonstrates the gated access system with .edu verification + OTP login
          </p>
        </div>

        {/* Public Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              Public Access (No Login Required)
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Open to Everyone
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Available Pages:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• / (landing page)</li>
                  <li>• /ride (search & browse results)</li>
                  <li>• /ride/[id] (ride details read-only)</li>
                  <li>• /auth/login (authentication)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Available APIs:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• /api/rides/search</li>
                  <li>• /api/rides/public</li>
                  <li>• /api/auth/verify</li>
                  <li>• /api/auth/login-otp</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Protected Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Protected Access (.edu + Session Required)
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Gated Access
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Protected Pages:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• /drive (create/manage rides)</li>
                  <li>• /profile (profile, verification, payments)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Protected APIs:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• /api/rides/create</li>
                  <li>• /api/rides/update</li>
                  <li>• /api/rides/delete</li>
                  <li>• /api/profile</li>
                  <li>• /api/driver</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Protected Actions Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              Protected Actions Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Post/Offer Actions:</h4>
              <div className="flex gap-4">
                <OfferRideButton />
                <PostRequestButton />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                These buttons require .edu verification. Try clicking them!
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Contact Driver Actions:</h4>
              <ContactDriverActions
                driverEmail="driver@ufl.edu"
                driverPhone="+1234567890"
                rideId="demo-ride-123"
              />
              <p className="text-sm text-gray-600 mt-2">
                Contact actions also require .edu verification.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Auth Guard Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Auth Guard Component Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <AuthGuard>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">
                  🎉 You're authenticated!
                </h4>
                <p className="text-green-700">
                  This content is only visible to users with verified .edu emails.
                </p>
              </div>
            </AuthGuard>
          </CardContent>
        </Card>

        {/* Authentication Flow */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Enter .edu Email</p>
                  <p className="text-sm text-gray-600">Only university emails accepted</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Receive OTP via Gmail SMTP</p>
                  <p className="text-sm text-gray-600">6-digit code with 10-minute expiry</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Verify OTP & Create Session</p>
                  <p className="text-sm text-gray-600">JWT token stored in secure HTTP-only cookie</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Access Granted</p>
                  <p className="text-sm text-gray-600">Full access to protected features</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}