'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Label } from '@/src/components/ui/label'
import { Input } from '@/src/components/ui/input'
import { 
  User, 
  Shield, 
  Car, 
  Clock, 
  Star, 
  CheckCircle, 
  DollarSign,
  Users,
  Phone,
  Mail,
  Edit,
  QrCode,
  TrendingUp,
  Award,
  History,
  Download,
  Bell,
  Settings
} from 'lucide-react'

import { cn } from '@/lib/utils'
import Link from 'next/link'

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  eduVerified: boolean
  kycVerified: boolean
  licenseVerified: boolean
  joinedAt: Date
  ratingAvg: number
  ratingCount: number
}

interface ProfilePageClientProps {
  userData: UserData
}

interface RideHistory {
  id: string
  date: Date
  from: string
  to: string
  type: 'driver' | 'passenger'
  amount: number
  status: 'completed' | 'cancelled' | 'pending'
  rating?: number
  passengers?: number
  driver?: string
}

export function ProfilePageClient({ userData }: ProfilePageClientProps) {
  const [rideHistory, setRideHistory] = useState<RideHistory[]>([])
  const [historyFilter, setHistoryFilter] = useState<'all' | 'driver' | 'passenger'>('all')
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  // Mock data
  useEffect(() => {
    setRideHistory([
      {
        id: '1',
        date: new Date('2024-12-01'),
        from: 'Campus Library',
        to: 'Downtown Gainesville',
        type: 'passenger',
        amount: 8.50,
        status: 'completed',
        rating: 5,
        driver: 'Sarah Chen'
      },
      {
        id: '2',
        date: new Date('2024-11-30'),
        from: 'Campus',
        to: 'Airport',
        type: 'driver',
        amount: 45.00,
        status: 'completed',
        rating: 4.8,
        passengers: 3
      },
      {
        id: '3',
        date: new Date('2024-11-28'),
        from: 'Dorms',
        to: 'Walmart',
        type: 'passenger',
        amount: 6.25,
        status: 'completed',
        rating: 4,
        driver: 'Marcus Johnson'
      }
    ])

  }, [])

  const filteredHistory = rideHistory.filter(ride => 
    historyFilter === 'all' || ride.type === historyFilter
  )

  const stats = {
    totalRides: rideHistory.length,
    totalEarned: rideHistory.filter(r => r.type === 'driver').reduce((sum, r) => sum + r.amount, 0),
    totalSpent: rideHistory.filter(r => r.type === 'passenger').reduce((sum, r) => sum + r.amount, 0),
    avgRating: userData.ratingAvg || 0
  }

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const ProfileHeader = () => (
    <Card className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20 border-4 border-white/20">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
              {userData.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{userData.name}</h1>
            <p className="text-teal-100 mb-2">Member since {userData.joinedAt.getFullYear()}</p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{userData.ratingAvg.toFixed(1)}</span>
                <span className="text-teal-100">({userData.ratingCount} reviews)</span>
              </div>
              {userData.eduVerified && (
                <Badge className="bg-white/20 text-white border-white/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Student verified
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/20"
            >
              <Bell className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/20"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Rides</p>
              <p className="text-2xl font-bold">{stats.totalRides}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Earned</p>
              <p className="text-2xl font-bold">${stats.totalEarned.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Spent</p>
              <p className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const VerificationCard = () => {
    const getVerificationProgress = () => {
      const steps = [userData.eduVerified, userData.kycVerified, userData.licenseVerified]
      const completed = steps.filter(Boolean).length
      return (completed / steps.length) * 100
    }

    const getStepStatus = (verified: boolean) => {
      if (verified) return { icon: CheckCircle, color: "text-green-600", text: "Verified" }
      return { icon: Clock, color: "text-yellow-600", text: "Pending" }
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verification Status
          </CardTitle>
          <CardDescription>
            3-step verification process • Estimated review time: 24-48 hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(getVerificationProgress())}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-teal-600 to-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getVerificationProgress()}%` }}
              />
            </div>
          </div>

          {/* Verification Steps */}
          <div className="space-y-3">
            {[
              { key: 'eduVerified', label: 'Student Email', verified: userData.eduVerified },
              { key: 'kycVerified', label: 'ID (KYC)', verified: userData.kycVerified },
              { key: 'licenseVerified', label: 'Driver License', verified: userData.licenseVerified }
            ].map((step, index) => {
              const status = getStepStatus(step.verified)
              return (
                <div key={step.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 border-gray-300">
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>
                    <status.icon className={cn("w-5 h-5", status.color)} />
                    <span className="font-medium">{step.label}</span>
                  </div>
                  <Badge variant={step.verified ? "default" : "secondary"}>
                    {status.text}
                  </Badge>
                </div>
              )
            })}
          </div>

          {getVerificationProgress() < 100 && (
            <Link href="/dashboard/kyc" className="w-full">
              <Button className="w-full">
                Complete Verification
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  const PaymentCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Driver Payment QR
        </CardTitle>
        <CardDescription>
          Rydify doesn't process payments; settle directly with the driver
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Section */}
        <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border border-teal-200">
          <div className="bg-white p-4 rounded-lg inline-block shadow-sm border">
            <QrCode className="w-24 h-24 text-teal-600 mx-auto" />
          </div>
          <p className="text-sm font-medium text-teal-900 mt-3">Your Payment QR Code</p>
          <p className="text-xs text-teal-600">Riders scan this to pay you directly</p>
        </div>

        {/* Payment Handles */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Zelle Handle</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="your-email@ufl.edu" 
                className="flex-1"
                defaultValue="john.doe@ufl.edu"
                readOnly
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCopy("john.doe@ufl.edu", "zelle")}
              >
                {copySuccess === 'zelle' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cash App Handle</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="$YourCashApp" 
                className="flex-1"
                defaultValue="$JohnDoe23"
                readOnly
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCopy("$JohnDoe23", "cashapp")}
              >
                {copySuccess === 'cashapp' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Copy Templates */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Payment Templates</Label>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-left text-xs"
              onClick={() => handleCopy("Please send $X.XX to john.doe@ufl.edu", "zelle-template")}
            >
              {copySuccess === 'zelle-template' ? 'Copied!' : 'Copy Zelle Request Template'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-left text-xs"
              onClick={() => handleCopy("Please send $X.XX to $JohnDoe23", "cashapp-template")}
            >
              {copySuccess === 'cashapp-template' ? 'Copied!' : 'Copy Cash App Request Template'}
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-600 bg-amber-50 p-3 rounded border border-amber-200">
          <strong>Note:</strong> Rydify doesn't process payments. All transactions are handled directly between drivers and riders using the payment methods above.
        </div>
      </CardContent>
    </Card>
  )

  const ContactCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-4 h-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium">{userData.email}</p>
              <p className="text-xs text-gray-500">Email</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-4 h-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium">{userData.phone}</p>
              <p className="text-xs text-gray-500">Phone</p>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          <Edit className="w-4 h-4 mr-2" />
          Update Contact Info
        </Button>
      </CardContent>
    </Card>
  )

  const RideHistoryCard = () => {
    const upcomingRides = rideHistory.filter(ride => ride.date > new Date())
    const pastRides = rideHistory.filter(ride => ride.date <= new Date())
    
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Ride History
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <Tabs value={historyFilter} onValueChange={(value: any) => setHistoryFilter(value)} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All ({rideHistory.length})
              </TabsTrigger>
              <TabsTrigger value="driver" className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                Driver ({rideHistory.filter(r => r.type === 'driver').length})
              </TabsTrigger>
              <TabsTrigger value="passenger" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Passenger ({rideHistory.filter(r => r.type === 'passenger').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Upcoming vs Past Pills */}
          <div className="flex gap-2 mb-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Upcoming: {upcomingRides.length}
            </Badge>
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              Past: {pastRides.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {filteredHistory.map((ride) => (
              <div
                key={ride.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <Badge variant={ride.type === 'driver' ? 'default' : 'secondary'}>
                        {ride.type === 'driver' ? 'Driver' : 'Passenger'}
                      </Badge>
                      <Badge variant={ride.status === 'completed' ? 'default' : 'secondary'}>
                        {ride.status}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm truncate">{ride.from} → {ride.to}</p>
                    <p className="text-xs text-gray-500">
                      {ride.date.toLocaleDateString()} • 
                      {ride.type === 'driver' 
                        ? ` ${ride.passengers} seats • $${ride.amount.toFixed(2)} per person` 
                        : ` Driver: ${ride.driver} • $${ride.amount.toFixed(2)} paid`
                      }
                    </p>
                  </div>
                  <div className="text-right sm:ml-4">
                    <p className="font-bold text-lg">
                      {ride.type === 'driver' ? '+' : '-'}${ride.amount.toFixed(2)}
                    </p>
                    {ride.rating && (
                      <div className="flex items-center space-x-1 justify-end">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{ride.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty States */}
          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              {historyFilter === 'all' ? (
                <>
                  <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No rides yet</p>
                  <p className="text-sm text-gray-500 mb-4">Start your Rydify journey</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Link href="/rides">
                      <Button size="sm">Find a ride</Button>
                    </Link>
                    <Link href="/rides/create">
                      <Button variant="outline" size="sm">Offer your first ride</Button>
                    </Link>
                  </div>
                </>
              ) : historyFilter === 'driver' ? (
                <>
                  <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No rides offered yet</p>
                  <p className="text-sm text-gray-500 mb-4">Start earning by helping fellow students</p>
                  <Link href="/rides/create">
                    <Button size="sm">Offer your first ride</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No rides taken yet</p>
                  <p className="text-sm text-gray-500 mb-4">Find your first ride</p>
                  <Link href="/rides">
                    <Button size="sm">Find a ride</Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header to match other pages */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-yellow-300" />
                <h1 className="text-2xl lg:text-3xl font-bold">Profile</h1>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full">
                <Shield className="h-4 w-4" />
                <span>Verified Students Only</span>
              </div>
            </div>
            <p className="text-teal-100 max-w-xl mb-6">
              Manage your account, verification, and ride history
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Shield className="h-4 w-4" />
                <span>Verification Status</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <History className="h-4 w-4" />
                <span>Ride History</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <QrCode className="h-4 w-4" />
                <span>Payment Settings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header */}
        <ProfileHeader />

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <VerificationCard />
            <ContactCard />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <PaymentCard />
          </div>
        </div>

        {/* Full Width Ride History */}
        <RideHistoryCard />
      </div>
    </div>
  )
}