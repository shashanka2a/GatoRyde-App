import { PublicRideList } from '@/src/components/rides/PublicRideList'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { 
  MapPin, 
  Search, 
  Plus, 
  Users, 
  Shield, 
  Star,
  Clock,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Rydify - Safe University Ridesharing',
  description: 'Connect with verified university students for safe, affordable rides.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Safe Rides with Fellow Students
            </h1>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              Connect with verified university students for affordable, safe transportation. 
              Browse rides freely, login to book.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/ride">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4">
                  <Search className="w-5 h-5 mr-2" />
                  Find a Ride
                </Button>
              </Link>
              <Link href="/rides/create">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600 px-8 py-4">
                  <Plus className="w-5 h-5 mr-2" />
                  Offer a Ride
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Rydify?
          </h2>
          <p className="text-lg text-gray-600">
            Built specifically for university students with safety and affordability in mind
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Students</h3>
              <p className="text-gray-600">
                All users verify with .edu emails. Only authenticated students can contact drivers.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rated Drivers</h3>
              <p className="text-gray-600">
                Driver ratings and reviews help you choose the safest, most reliable rides.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Get instant notifications about ride confirmations, changes, and updates.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Rides Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Available Rides
              </h2>
              <p className="text-lg text-gray-600">
                Browse current ride offerings from verified students
              </p>
            </div>
            <Link href="/browse-rides">
              <Button variant="outline" className="flex items-center gap-2">
                View All Rides
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <PublicRideList className="max-w-4xl mx-auto" />
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Start Riding?
            </h3>
            <p className="text-teal-100 mb-6 max-w-2xl mx-auto">
              Join thousands of students already using Rydify for safe, affordable transportation. 
              Browse rides now or create your first ride offer.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/login">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                  <Users className="w-5 h-5 mr-2" />
                  Login with .edu Email
                </Button>
              </Link>
              <Link href="/browse-rides">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  Browse All Rides
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}