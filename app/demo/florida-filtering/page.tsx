import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { GraduationCap, MapPin, Users, Clock } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Florida University Filtering Demo - Rydify',
  description: 'See how Rydify connects Florida university students for safe rides',
}

export default function FloridaFilteringDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <GraduationCap className="w-12 h-12 text-yellow-300" />
              <h1 className="text-3xl lg:text-4xl font-bold">Florida University Network</h1>
            </div>
            <p className="text-xl text-teal-100 mb-6 max-w-2xl mx-auto">
              Connect with verified students from your university or across Florida's top schools
            </p>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
              🎓 UF • UCF • USF • FIU • FSU • UM
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* How It Works */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Smart University-Based Filtering
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* My University */}
              <Card className="shadow-lg border-0 bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-0.5">
                  <div className="bg-white rounded-lg">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="w-8 h-8 text-orange-600" />
                      </div>
                      <CardTitle className="text-lg">My University</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">
                        See rides from students at your specific university only
                      </p>
                      <div className="space-y-2">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          🎓 UF Students Only
                        </Badge>
                        <p className="text-xs text-gray-500">
                          Perfect for campus-to-campus trips and local rides
                        </p>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>

              {/* Florida Schools */}
              <Card className="shadow-lg border-0 bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-0.5">
                  <div className="bg-white rounded-lg">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-teal-600" />
                      </div>
                      <CardTitle className="text-lg">Florida Schools</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">
                        Connect with students from all major Florida universities
                      </p>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">UF</Badge>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">UCF</Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">USF</Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">FIU</Badge>
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">FSU</Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          Great for Orlando ↔ Gainesville, Tampa ↔ Miami routes
                        </p>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>

              {/* All Universities */}
              <Card className="shadow-lg border-0 bg-white overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
                  <div className="bg-white rounded-lg">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-purple-600" />
                      </div>
                      <CardTitle className="text-lg">All Universities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">
                        Access rides from verified students nationwide
                      </p>
                      <div className="space-y-2">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          🌎 Nationwide Network
                        </Badge>
                        <p className="text-xs text-gray-500">
                          Perfect for long-distance trips and airport runs
                        </p>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Sample Routes */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Popular Florida Routes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* UF to Orlando */}
              <Card className="shadow-lg border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        🎓 UF
                      </Badge>
                      <span className="text-gray-400">→</span>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        🎓 UCF
                      </Badge>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      $25/person
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>Gainesville → Orlando</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>2 hours • Weekend trips</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Popular for theme parks & events</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FSU to Tampa */}
              <Card className="shadow-lg border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        🎓 FSU
                      </Badge>
                      <span className="text-gray-400">→</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        🎓 USF
                      </Badge>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      $35/person
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>Tallahassee → Tampa</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>4 hours • Airport runs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Spring break & holidays</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Miami Area */}
              <Card className="shadow-lg border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        🎓 FIU
                      </Badge>
                      <span className="text-gray-400">→</span>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        🎓 UM
                      </Badge>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      $15/person
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>Miami → Coral Gables</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>30 minutes • Daily commute</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Cross-campus events</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Airport Runs */}
              <Card className="shadow-lg border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800 border-teal-200">
                        🎓 All FL
                      </Badge>
                      <span className="text-gray-400">→</span>
                      <Badge className="bg-sky-100 text-sky-800 border-sky-200">
                        ✈️ Airports
                      </Badge>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      $20-50
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>MCO, TPA, MIA, FLL</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Varies • Holiday travel</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Split expensive airport rides</span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="shadow-2xl border-0 bg-white overflow-hidden max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-1">
                <div className="bg-white rounded-lg">
                  <CardContent className="p-8 text-center">
                    <GraduationCap className="w-16 h-16 text-teal-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Ready to Connect with Florida Students?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Join thousands of verified university students sharing safe, affordable rides across Florida
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Link href="/rides">
                          <GraduationCap className="w-5 h-5 mr-2" />
                          Find Rides Now
                        </Link>
                      </Button>
                      <Button 
                        asChild
                        variant="outline"
                        size="lg"
                        className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50"
                      >
                        <Link href="/rides/create">
                          <Users className="w-5 h-5 mr-2" />
                          Offer a Ride
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}