'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
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
  Settings,
  Info,
  ArrowRight,
  Smartphone,
  Zap,
  Target,
  ChevronRight,
  Copy,
  Check,
  FileText,
  Sparkles
} from 'lucide-react'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Progress } from '@/src/components/ui/progress'

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
  const [isLoading, setIsLoading] = useState(false)
  const [showVerificationHelp, setShowVerificationHelp] = useState(false)
  const [qrHovered, setQrHovered] = useState(false)
  const [qrEnlarged, setQrEnlarged] = useState(false)

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
      
      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
      
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(null), 2000)
    }
  }





  const VerificationCard = () => {
    const getVerificationProgress = () => {
      const steps = [userData.eduVerified, userData.kycVerified, userData.licenseVerified]
      const completed = steps.filter(Boolean).length
      return (completed / steps.length) * 100
    }

    const getNextStep = () => {
      if (!userData.eduVerified) return 0
      if (!userData.kycVerified) return 1
      if (!userData.licenseVerified) return 2
      return -1
    }

    const nextStepIndex = getNextStep()
    const progress = getVerificationProgress()

    const verificationSteps = [
      { 
        key: 'eduVerified', 
        label: 'Email', 
        verified: userData.eduVerified,
        icon: Mail,
        description: 'Verify your .edu email address',
        action: 'Check your email for verification link',
        estimatedTime: '2 minutes'
      },
      { 
        key: 'kycVerified', 
        label: 'ID', 
        verified: userData.kycVerified,
        icon: FileText,
        description: 'Upload government-issued ID',
        action: 'Take a photo of your ID',
        estimatedTime: '5 minutes'
      },
      { 
        key: 'licenseVerified', 
        label: 'License', 
        verified: userData.licenseVerified,
        icon: Car,
        description: 'Upload valid driver\'s license',
        action: 'Photo of front and back',
        estimatedTime: '3 minutes'
      }
    ]

    return (
      <TooltipProvider>
        <Card className="bg-white shadow-lg border-0 relative overflow-hidden">
          {progress === 100 && (
            <div className="absolute top-0 right-0 bg-gradient-to-l from-green-500 to-transparent w-32 h-1"></div>
          )}
          
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <div className="bg-teal-100 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-teal-600" />
                </div>
                Verification Status
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Complete all steps to unlock full platform features including driving and enhanced safety features.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              {progress === 100 && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Fully Verified
                </Badge>
              )}
            </div>
            <CardDescription className="text-gray-600">
              3-step verification process • Review time: 24-48 hours
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Stepper UI replacing progress bar */}
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${Math.max(0, (progress - 33.33) / 66.67 * 100)}%` }}
                />
              </div>
              
              {verificationSteps.map((step, index) => {
                const isCompleted = step.verified
                const isCurrent = index === nextStepIndex
                const isLocked = index > nextStepIndex && nextStepIndex !== -1
                
                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      isCompleted 
                        ? "bg-green-500 border-green-500 text-white" 
                        : isCurrent 
                          ? "bg-blue-500 border-blue-500 text-white animate-pulse" 
                          : "bg-gray-200 border-gray-300 text-gray-500"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isCurrent ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-medium">{isLocked ? '🔒' : index + 1}</span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={cn(
                        "text-xs font-medium",
                        isCompleted ? "text-green-600" : isCurrent ? "text-blue-600" : "text-gray-500"
                      )}>
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {isCompleted ? '✅' : isCurrent ? '⏳' : '🔒'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Current step details */}
            {nextStepIndex !== -1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    {React.createElement(verificationSteps[nextStepIndex].icon, {
                      className: "w-5 h-5 text-blue-600"
                    })}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-1">
                      Next: {verificationSteps[nextStepIndex].label} Verification
                    </h4>
                    <p className="text-sm text-blue-700 mb-2">
                      {verificationSteps[nextStepIndex].description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <Clock className="w-3 h-3" />
                      <span>Estimated time: {verificationSteps[nextStepIndex].estimatedTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {progress < 100 ? (
              <div className="space-y-3">
                <Link href="/dashboard/kyc" className="w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white sticky bottom-4 shadow-lg" size="lg">
                    {nextStepIndex !== -1 ? (
                      <>
                        Continue Verification
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      'Complete Verification'
                    )}
                  </Button>
                </Link>
              </div>
            ) : (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Congratulations!</strong> Your account is fully verified. You can now offer rides and access all platform features.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </TooltipProvider>
    )
  }

  const PaymentCard = () => {
    const [qrHovered, setQrHovered] = useState(false)
    const [qrEnlarged, setQrEnlarged] = useState(false)
    
    return (
      <TooltipProvider>
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <QrCode className="w-5 h-5 text-teal-600" />
                  </div>
                  Payment Settings
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Riders can scan this to pay you instantly. Set up your payment methods for quick transfers.</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Rydify doesn't process payments; riders pay you directly
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="border-teal-200 text-teal-600 hover:bg-teal-50">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Enhanced QR Code Section */}
            <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200 relative overflow-hidden">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "bg-white p-6 rounded-xl inline-block shadow-sm border-2 border-white cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105",
                      qrEnlarged && "scale-150 z-50"
                    )}
                    onMouseEnter={() => setQrHovered(true)}
                    onMouseLeave={() => setQrHovered(false)}
                    onClick={() => setQrEnlarged(!qrEnlarged)}
                  >
                    <QrCode className="w-28 h-28 text-teal-600 mx-auto" />
                    {qrHovered && (
                      <div className="absolute inset-0 bg-black/10 rounded-xl flex items-center justify-center">
                        <span className="text-xs text-teal-700 font-medium bg-white/90 px-2 py-1 rounded">
                          Tap to enlarge
                        </span>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Riders can scan this to pay you instantly</p>
                </TooltipContent>
              </Tooltip>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-teal-900">Your Payment QR Code</p>
                <p className="text-xs text-teal-700">Riders scan this to access your payment info</p>
                
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-teal-600">
                  <div className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    <span>Contactless</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Instant</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Secure</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Payment Methods with Logos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Payment Methods</Label>
                <Badge variant="outline" className="text-xs">
                  2 methods active
                </Badge>
              </div>
              
              <div className="space-y-3">
                {/* Zelle with Logo */}
                <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Zelle Logo Placeholder */}
                      <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-sm">
                        Z
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                          Zelle
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-0">
                            Primary
                          </Badge>
                        </Label>
                        <p className="text-xs text-blue-700">Bank-to-bank transfer</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="your-email@ufl.edu" 
                      className="flex-1 bg-white border-blue-200"
                      defaultValue="john.doe@ufl.edu"
                      readOnly
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                      onClick={() => handleCopy("john.doe@ufl.edu", "zelle")}
                    >
                      {copySuccess === 'zelle' ? (
                        <>
                          <Check className="w-4 h-4 mr-1 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Cash App with Logo */}
                <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Cash App Logo Placeholder */}
                      <div className="bg-green-600 text-white p-2 rounded-lg font-bold text-sm">
                        $
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-green-900 flex items-center gap-2">
                          Cash App
                          <Badge variant="outline" className="text-green-600 border-green-200 text-xs px-2 py-0">
                            Active
                          </Badge>
                        </Label>
                        <p className="text-xs text-green-700">Mobile payments</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="$YourCashApp" 
                      className="flex-1 bg-white border-green-200"
                      defaultValue="$JohnDoe23"
                      readOnly
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-green-200 text-green-700 hover:bg-green-100 transition-colors"
                      onClick={() => handleCopy("$JohnDoe23", "cashapp")}
                    >
                      {copySuccess === 'cashapp' ? (
                        <>
                          <Check className="w-4 h-4 mr-1 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions with Success Feedback */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Quick Actions</Label>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start h-auto p-3 hover:bg-blue-50 transition-colors"
                  onClick={() => handleCopy("Hi! Please send $[AMOUNT] via Zelle to john.doe@ufl.edu for our ride. Thanks!", "zelle-template")}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="bg-blue-600 text-white p-1 rounded text-xs font-bold">Z</div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium">Copy Zelle Request</p>
                      <p className="text-xs text-gray-500">Template message for riders</p>
                    </div>
                    {copySuccess === 'zelle-template' ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-xs font-medium">Copied!</span>
                      </div>
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start h-auto p-3 hover:bg-green-50 transition-colors"
                  onClick={() => handleCopy("Hi! Please send $[AMOUNT] to $JohnDoe23 on Cash App for our ride. Thanks!", "cashapp-template")}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="bg-green-600 text-white p-1 rounded text-xs font-bold">$</div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium">Copy Cash App Request</p>
                      <p className="text-xs text-gray-500">Template message for riders</p>
                    </div>
                    {copySuccess === 'cashapp-template' ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-xs font-medium">Copied!</span>
                      </div>
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </Button>
              </div>
            </div>

            {/* Positive Security Message */}
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>✅ All transactions are secured directly via your chosen payment method.</strong>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 ml-1 cursor-help inline" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Rydify doesn't process payments. All transactions happen directly between you and riders. Always confirm payment before starting the ride.</p>
                  </TooltipContent>
                </Tooltip>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </TooltipProvider>
    )
  }

  const ContactCard = () => (
    <Card className="bg-white shadow-md border border-gray-200">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <div className="bg-gray-100 p-2 rounded-lg">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{userData.email}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                📧 Email
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="bg-green-100 p-2 rounded-lg">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{userData.phone}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                📱 Phone
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full hover:bg-gray-50 transition-colors">
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
      <Card className="bg-white shadow-md border border-gray-200">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <div className="bg-gray-100 p-2 rounded-lg">
                <History className="w-4 h-4 text-gray-600" />
              </div>
              Ride History
            </CardTitle>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Enhanced Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={historyFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setHistoryFilter('all')}
              className={cn(
                "transition-all duration-200",
                historyFilter === 'all' 
                  ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md" 
                  : "hover:bg-gray-50"
              )}
            >
              All ({rideHistory.length})
            </Button>
            <Button
              variant={historyFilter === 'driver' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setHistoryFilter('driver')}
              className={cn(
                "flex items-center gap-2 transition-all duration-200",
                historyFilter === 'driver' 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                  : "hover:bg-blue-50"
              )}
            >
              🚗 Driver ({rideHistory.filter(r => r.type === 'driver').length})
            </Button>
            <Button
              variant={historyFilter === 'passenger' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setHistoryFilter('passenger')}
              className={cn(
                "flex items-center gap-2 transition-all duration-200",
                historyFilter === 'passenger' 
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-md" 
                  : "hover:bg-green-50"
              )}
            >
              🧑‍🤝‍🧑 Passenger ({rideHistory.filter(r => r.type === 'passenger').length})
            </Button>
          </div>

          {/* Timeline Style Layout */}
          <div className="relative">
            {/* Timeline line */}
            {filteredHistory.length > 0 && (
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-300 to-gray-200"></div>
            )}
            
            <div className="space-y-3">
            {filteredHistory.map((ride, index) => (
              <div
                key={ride.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors relative"
              >
                {/* Timeline dot */}
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-teal-500 rounded-full z-10 shadow-sm hover:scale-110 transition-transform"></div>
                
                <div className="flex items-center justify-between gap-3 ml-8">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <Badge 
                        variant={ride.type === 'driver' ? 'default' : 'secondary'}
                        className="text-xs px-2 py-0"
                      >
                        {ride.type === 'driver' ? '🚗 Driver' : '🧑‍🤝‍🧑 Passenger'}
                      </Badge>
                      <Badge 
                        variant={ride.status === 'completed' ? 'default' : 'secondary'}
                        className={cn(
                          "text-xs px-2 py-0",
                          ride.status === 'completed' && "bg-green-100 text-green-800 border-green-200"
                        )}
                      >
                        {ride.status === 'completed' ? '✅ Completed' : ride.status}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm truncate mb-1">{ride.from} → {ride.to}</p>
                    <p className="text-xs text-gray-500">
                      {ride.date.toLocaleDateString()} • 
                      {ride.type === 'driver' 
                        ? ` ${ride.passengers} seats • $${ride.amount.toFixed(2)} per person` 
                        : ` Driver: ${ride.driver} • $${ride.amount.toFixed(2)} paid`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold text-base",
                      ride.type === 'driver' ? "text-green-600" : "text-blue-600"
                    )}>
                      {ride.type === 'driver' ? '+' : '-'}${ride.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ride.type === 'driver' ? 'earned' : 'paid'}
                    </p>
                    {ride.rating && (
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{ride.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* Enhanced Empty States */}
          {filteredHistory.length === 0 && (
            <div className="text-center py-12">
              {historyFilter === 'all' ? (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-2 font-medium">No rides yet</p>
                  <p className="text-sm text-gray-500 mb-6">Start your Rydify journey today</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/rides">
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                        🔍 Find a ride
                      </Button>
                    </Link>
                    <Link href="/rides/create">
                      <Button variant="outline" size="sm" className="hover:bg-gray-50">
                        🚗 Offer your first ride
                      </Button>
                    </Link>
                  </div>
                </>
              ) : historyFilter === 'driver' ? (
                <>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚗</span>
                  </div>
                  <p className="text-gray-600 mb-2 font-medium">No rides offered yet</p>
                  <p className="text-sm text-gray-500 mb-6">Start earning by helping fellow students</p>
                  <Link href="/rides/create">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      🚗 Offer your first ride
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🧑‍🤝‍🧑</span>
                  </div>
                  <p className="text-gray-600 mb-2 font-medium">No rides taken yet</p>
                  <p className="text-sm text-gray-500 mb-6">Find your first ride today</p>
                  <Link href="/rides">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      🔍 Find a ride
                    </Button>
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
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* Enhanced User Info Card - Only Teal Container */}
          <Card className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-8">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white/30 shadow-lg">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={`${userData.name}'s profile picture`} />
                    <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {userData.eduVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="mb-4">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {userData.name.split(' ')[0]}!</h1>
                    <p className="text-teal-100 text-lg">
                      Member since {userData.joinedAt.getFullYear()} • 
                      <span className="ml-2 inline-flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {stats.totalRides} rides completed
                      </span>
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center space-x-1 bg-white/20 px-4 py-2 rounded-full">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{userData.ratingAvg.toFixed(1)}</span>
                      <span className="text-teal-100 text-sm">({userData.ratingCount})</span>
                    </div>
                    
                    {userData.eduVerified && (
                      <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
                        <Shield className="w-3 h-3 mr-1" />
                        Student verified
                      </Badge>
                    )}
                    
                    {getVerificationProgress() === 100 && (
                      <Badge className="bg-green-500/20 text-green-100 border-green-300/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Fully verified
                      </Badge>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{stats.totalRides}</div>
                      <div className="text-xs text-teal-100">Total Rides</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-300">${stats.totalEarned.toFixed(0)}</div>
                      <div className="text-xs text-teal-100">Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-300">${stats.totalSpent.toFixed(0)}</div>
                      <div className="text-xs text-teal-100">Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-2xl font-bold text-yellow-300">{stats.avgRating.toFixed(1)}</span>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="text-xs text-teal-100">Rating</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                        aria-label="Notifications"
                      >
                        <Bell className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notifications</p>
                    </TooltipContent>
                  </Tooltip>
                  
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

          {/* Primary Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Verification Status - Primary */}
            <VerificationCard />
            
            {/* Payment Settings - Primary */}
            <PaymentCard />
          </div>

          {/* Secondary Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information - Secondary */}
            <ContactCard />
            
            {/* Placeholder for future secondary section */}
            <div></div>
          </div>

          {/* Full Width Ride History - Secondary */}
          <RideHistoryCard />
        </div>

        {/* Toast Notification */}
        {copySuccess && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-300">
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