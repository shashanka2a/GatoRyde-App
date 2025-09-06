import { PublicRideList } from '@/src/components/rides/PublicRideList'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { MapPin, Search, Plus, Users } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Browse Available Rides - Rydify',
  description: 'Browse available rides from verified university students. Safe, affordable transportation.',
}

export default function BrowseRidesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Available Rides
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Browse rides from verified university students
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link href="/ride">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Search className="w-4 h-4 mr-2" />
                  Advanced Search
                </Button>
              </Link>
              <Link href="/rides/create">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Offer a Ride
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/ride" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="w-4 h-4 mr-2" />
                    Search by Route
                  </Button>
                </Link>
                
                <Link href="/rides/create" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Offer a Ride
                  </Button>
                </Link>
                
                <Link href="/ride-requests" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Browse Requests
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">How it Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <p>Browse available rides or search by your route</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <p>Login with your .edu email to contact drivers</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <p>Book your ride and travel safely with verified students</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rides List */}
          <div className="lg:col-span-2">
            <PublicRideList />
          </div>
        </div>
      </div>
    </div>
  )
}