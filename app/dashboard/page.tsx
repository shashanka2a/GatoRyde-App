'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { VerificationPromptManager, useDriverStatus } from '@/src/components/driver/VerificationPromptManager'
import { DetailedTrustStatus } from '@/src/components/driver/TrustBadge'
import { 
  Car, 
  Users, 
  Star, 
  TrendingUp,
  MapPin,
  Calendar,
  Shield
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { driverStatus, loading } = useDriverStatus()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Driver Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage your rides and track your performance
          </p>
        </div>

        {/* Verification Prompt */}
        <VerificationPromptManager 
          driverStatus={driverStatus}
          className="mb-8"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Rides</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <Car className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Riders</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">$156</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trust Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Trust Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {driverStatus && (
                <DetailedTrustStatus
                  studentVerified={driverStatus.studentVerified}
                  licenseVerified={driverStatus.licenseVerified}
                  idVerified={driverStatus.idVerified}
                  trustScore={driverStatus.trustScore}
                />
              )}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href="/driver/onboarding">
                  <Button variant="outline" size="sm" className="w-full">
                    Update Verification
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Rides */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Recent Rides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    route: 'Campus → Airport',
                    date: 'Today, 3:00 PM',
                    riders: 2,
                    status: 'confirmed'
                  },
                  {
                    id: 2,
                    route: 'Dorms → Downtown',
                    date: 'Tomorrow, 10:00 AM',
                    riders: 3,
                    status: 'open'
                  },
                  {
                    id: 3,
                    route: 'Campus → Mall',
                    date: 'Dec 15, 2:00 PM',
                    riders: 1,
                    status: 'completed'
                  }
                ].map((ride) => (
                  <div key={ride.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{ride.route}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {ride.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {ride.riders} riders
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ride.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        ride.status === 'open' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ride.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <Link href="/rides/create" className="flex-1">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700">
                      Create New Ride
                    </Button>
                  </Link>
                  <Link href="/rides">
                    <Button variant="outline">
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}