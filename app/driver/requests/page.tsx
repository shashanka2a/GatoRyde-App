import { DriverRequestsPanel } from '@/src/components/driver/DriverRequestsPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { 
  MessageSquare, 
  Car, 
  TrendingUp, 
  Users,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Driver Requests - Rydify',
  description: 'Manage incoming ride requests from students',
}

export default function DriverRequestsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/drive">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Drive
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-teal-600" />
                  Ride Requests
                </h1>
                <p className="text-gray-600">Manage incoming requests from riders</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                2 Pending
              </Badge>
              <Link href="/rides/create">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Car className="w-4 h-4 mr-2" />
                  Create New Ride
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4 sticky top-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <span className="font-semibold text-orange-600">2</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">This Week</span>
                    </div>
                    <span className="font-semibold text-green-600">8</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Acceptance Rate</span>
                    </div>
                    <span className="font-semibold text-blue-600">85%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Respond quickly to increase your acceptance rate</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Use contact buttons to coordinate pickup details</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Check rider ratings and university verification</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Requests List */}
          <div className="lg:col-span-3">
            <DriverRequestsPanel />
          </div>
        </div>
      </div>
    </div>
  )
}