'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Label } from '@/src/components/ui/label'
import { Input } from '@/src/components/ui/input'
import { 
  User, 
  Shield, 
  Car, 
  Clock, 
  Star, 
  CheckCircle, 
  Users,
  Phone,
  Mail,
  Edit,
  QrCode,
  History,
  Download,
  Bell,
  Info,
  ArrowRight,
  Smartphone,
  Zap,
  Copy,
  Check,
  FileText,
  Sparkles
} from 'lucide-react'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip'
import { Alert, AlertDescription } from '@/src/components/ui/alert'

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

  const getVerificationProgress = () => {
    const steps = [userData.eduVerified, userData.kycVerified, userData.licenseVerified]
    const completed = steps.filter(Boolean).length
    return (completed / steps.length) * 100
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

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* User Info Card */}
          <Card className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0 shadow-xl mb-8">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                <div className="relative flex-shrink-0">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white/30 shadow-lg">
                    <AvatarFallback className="bg-white/20 text-white text-xl sm:text-2xl font-bold">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {userData.eduVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 w-full lg:w-auto">
                  <div className="mb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {userData.name.split(' ')[0]}!</h1>
                    <p className="text-teal-100 text-base sm:text-lg">
                      Member since {userData.joinedAt.getFullYear()} • 
                      <span className="ml-2 inline-flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {stats.totalRides} rides completed
                      </span>
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center space-x-1 bg-white/20 px-3 py-2 rounded-full">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{userData.ratingAvg.toFixed(1)}</span>
                      <span className="text-teal-100 text-sm">({userData.ratingCount})</span>
                    </div>
                    
                    {userData.eduVerified && (
                      <Badge className="bg-white/20 text-white border-white/30">
                        <Shield className="w-3 h-3 mr-1" />
                        Student verified
                      </Badge>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalRides}</div>
                      <div className="text-xs text-teal-100">Total Rides</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-green-300">${stats.totalEarned.toFixed(0)}</div>
                      <div className="text-xs text-teal-100">Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-blue-300">${stats.totalSpent.toFixed(0)}</div>
                      <div className="text-xs text-teal-100">Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xl sm:text-2xl font-bold text-yellow-300">{stats.avgRating.toFixed(1)}</span>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="text-xs text-teal-100">Rating</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="hover:shadow-md transition-all duration-200"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="space-y-6 lg:space-y-8">
              {/* Verification Status */}
              <Card className="bg-white shadow-lg border-0 h-full">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900">
                    <div className="bg-teal-100 p-2 rounded-lg">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                    </div>
                    Verification Status
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    3-step verification process • Review time: 24-48 hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {Math.round(getVerificationProgress())}%
                    </div>
                    <p className="text-gray-600 mb-4">Complete</p>
                    <Link href="/dashboard/kyc">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Continue Verification
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              {/* Contact Information */}
              <Card className="bg-white shadow-lg border-0 h-full">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{userData.email}</p>
                        <p className="text-xs text-gray-500">📧 Email</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Phone className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{userData.phone}</p>
                        <p className="text-xs text-gray-500">📱 Phone</p>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Update Contact Info
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6 lg:space-y-8">
              {/* Payment Settings */}
              <Card className="bg-white shadow-lg border-0 h-full">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        <div className="bg-teal-100 p-2 rounded-lg">
                          <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                        </div>
                        Payment Settings
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm">
                        Rydify doesn't process payments; riders pay you directly
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="border-teal-200 text-teal-600">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* QR Code Section */}
                  <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200">
                    <div className="bg-white p-6 rounded-xl inline-block shadow-sm border-2 border-white">
                      <QrCode className="w-28 h-28 text-teal-600 mx-auto" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-teal-900">Your Payment QR Code</p>
                      <p className="text-xs text-teal-700">Riders scan this to access your payment info</p>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Payment Methods</Label>
                    
                    <div className="space-y-3">
                      {/* Zelle */}
                      <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-sm">Z</div>
                          <div>
                            <Label className="text-sm font-semibold text-blue-900">Zelle</Label>
                            <p className="text-xs text-blue-700">Bank-to-bank transfer</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Input 
                            className="flex-1 bg-white border-blue-200"
                            defaultValue="john.doe@ufl.edu"
                            readOnly
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-blue-200 text-blue-700"
                            onClick={() => handleCopy("john.doe@ufl.edu", "zelle")}
                          >
                            {copySuccess === 'zelle' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Cash App */}
                      <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-green-600 text-white p-2 rounded-lg font-bold text-sm">$</div>
                          <div>
                            <Label className="text-sm font-semibold text-green-900">Cash App</Label>
                            <p className="text-xs text-green-700">Mobile payments</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Input 
                            className="flex-1 bg-white border-green-200"
                            defaultValue="$JohnDoe23"
                            readOnly
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-green-200 text-green-700"
                            onClick={() => handleCopy("$JohnDoe23", "cashapp")}
                          >
                            {copySuccess === 'cashapp' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Ride History */}
          <div className="mt-8">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <History className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    Ride History
                  </CardTitle>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-600">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button
                    variant={historyFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHistoryFilter('all')}
                    className={historyFilter === 'all' ? "bg-gray-900 text-white" : ""}
                  >
                    All ({rideHistory.length})
                  </Button>
                  <Button
                    variant={historyFilter === 'driver' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHistoryFilter('driver')}
                    className={historyFilter === 'driver' ? "bg-blue-600 text-white" : ""}
                  >
                    🚗 Driver ({rideHistory.filter(r => r.type === 'driver').length})
                  </Button>
                  <Button
                    variant={historyFilter === 'passenger' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHistoryFilter('passenger')}
                    className={historyFilter === 'passenger' ? "bg-green-600 text-white" : ""}
                  >
                    🧑‍🤝‍🧑 Passenger ({rideHistory.filter(r => r.type === 'passenger').length})
                  </Button>
                </div>

                {/* Ride List */}
                <div className="space-y-4">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((ride) => (
                      <div
                        key={ride.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {/* Status Icon */}
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            ride.type === 'driver' ? "bg-blue-100" : "bg-green-100"
                          )}>
                            {ride.type === 'driver' ? (
                              <Car className="w-5 h-5 text-blue-600" />
                            ) : (
                              <User className="w-5 h-5 text-green-600" />
                            )}
                          </div>

                          {/* Ride Details */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={cn(
                                "text-xs",
                                ride.type === 'driver' 
                                  ? "bg-blue-100 text-blue-800" 
                                  : "bg-green-100 text-green-800"
                              )}>
                                {ride.type === 'driver' ? 'Driver' : 'Passenger'}
                              </Badge>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                ✅ Completed
                              </Badge>
                            </div>
                            
                            <p className="font-medium text-sm text-gray-900 mb-1">
                              {ride.from} → {ride.to}
                            </p>
                            
                            <p className="text-xs text-gray-500">
                              {ride.date.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })} • 
                              {ride.type === 'driver' 
                                ? ` ${ride.passengers} passengers • $${ride.amount.toFixed(2)} per person` 
                                : ` Driver: ${ride.driver} • $${ride.amount.toFixed(2)} paid`
                              }
                            </p>
                          </div>
                        </div>

                        {/* Amount and Rating */}
                        <div className="text-right">
                          <p className={cn(
                            "font-bold text-lg",
                            ride.type === 'driver' ? "text-green-600" : "text-blue-600"
                          )}>
                            {ride.type === 'driver' ? '+' : '-'}${ride.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mb-1">
                            {ride.type === 'driver' ? 'earned' : 'paid'}
                          </p>
                          {ride.rating && (
                            <div className="flex items-center gap-1 justify-end">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{ride.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Car className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-2 font-medium">No rides yet</p>
                      <p className="text-sm text-gray-500 mb-6">Start your Rydify journey today</p>
                      <div className="flex gap-3 justify-center">
                        <Link href="/rides">
                          <Button size="sm" className="bg-gray-900 hover:bg-gray-800">
                            🔍 Find a ride
                          </Button>
                        </Link>
                        <Link href="/rides/create">
                          <Button variant="outline" size="sm">
                            🚗 Offer your first ride
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Toast Notification */}
        {copySuccess && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Copied to clipboard!</span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}