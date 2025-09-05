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
  Settings,
  Info,
  HelpCircle,
  ArrowRight,
  AlertCircle,
  Smartphone,
  CreditCard,
  Zap,
  Target,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Upload,
  Camera,
  FileText,
  AlertTriangle,
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
      setIsLoading(true)
      await navigator.clipboard.writeText(text)
      setCopySuccess(type)
      
      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
      
      setTimeout(() => setCopySuccess(null), 3000)
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
      setTimeout(() => setCopySuccess(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const ProfileHeader = () => (
    <Card className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
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
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 truncate">{userData.name}</h1>
            <p className="text-teal-100 mb-3 text-sm sm:text-base">
              Member since {userData.joinedAt.getFullYear()} • 
              <span className="ml-2 inline-flex items-center gap-1">
                <Users className="w-4 h-4" />
                {stats.totalRides} rides completed
              </span>
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full">
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
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
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
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Account Settings</p>
              </TooltipContent>
            </Tooltip>
            
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1 sm:flex-none hover:shadow-md transition-all duration-200"
            >
              <Edit className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Edit Profile</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <TooltipProvider>
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    Total Rides
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Combined rides as driver and passenger</p>
                      </TooltipContent>
                    </Tooltip>
                  </p>
                  <p className="text-2xl font-bold">{stats.totalRides}</p>
                </div>
              </div>
              {stats.totalRides > 0 && (
                <div className="text-green-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    Earned
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total earnings from driving rides</p>
                      </TooltipContent>
                    </Tooltip>
                  </p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalEarned.toFixed(2)}</p>
                </div>
              </div>
              {stats.totalEarned > 0 && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  +{Math.round((stats.totalEarned / Math.max(stats.totalSpent, 1)) * 100)}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    Spent
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total spent on rides as passenger</p>
                      </TooltipContent>
                    </Tooltip>
                  </p>
                  <p className="text-2xl font-bold text-purple-600">${stats.totalSpent.toFixed(2)}</p>
                </div>
              </div>
              {stats.totalSpent > 0 && (
                <div className="text-purple-600">
                  <Target className="w-4 h-4" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    Rating
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Average rating from {userData.ratingCount} reviews</p>
                      </TooltipContent>
                    </Tooltip>
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-4 h-4",
                            star <= stats.avgRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {stats.avgRating >= 4.5 && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Excellent
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    </div>
  )

  const VerificationCard = () => {
    const getVerificationProgress = () => {
      const steps = [userData.eduVerified, userData.kycVerified, userData.licenseVerified]
      const completed = steps.filter(Boolean).length
      return (completed / steps.length) * 100
    }

    const getStepStatus = (verified: boolean, isNext: boolean = false) => {
      if (verified) return { 
        icon: CheckCircle, 
        color: "text-green-600", 
        bgColor: "bg-green-100",
        text: "Verified",
        description: "✓ Complete"
      }
      if (isNext) return { 
        icon: AlertCircle, 
        color: "text-blue-600", 
        bgColor: "bg-blue-100",
        text: "Next Step",
        description: "Action required"
      }
      return { 
        icon: Clock, 
        color: "text-gray-400", 
        bgColor: "bg-gray-100",
        text: "Pending",
        description: "Complete previous steps first"
      }
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
        label: 'Student Email', 
        verified: userData.eduVerified,
        icon: Mail,
        description: 'Verify your .edu email address',
        action: 'Check your email for verification link',
        estimatedTime: '2 minutes'
      },
      { 
        key: 'kycVerified', 
        label: 'ID Verification', 
        verified: userData.kycVerified,
        icon: FileText,
        description: 'Upload government-issued ID',
        action: 'Take a photo of your ID',
        estimatedTime: '5 minutes'
      },
      { 
        key: 'licenseVerified', 
        label: 'Driver License', 
        verified: userData.licenseVerified,
        icon: Car,
        description: 'Upload valid driver\'s license',
        action: 'Photo of front and back',
        estimatedTime: '3 minutes'
      }
    ]

    return (
      <TooltipProvider>
        <Card className="relative overflow-hidden">
          {progress === 100 && (
            <div className="absolute top-0 right-0 bg-gradient-to-l from-green-500 to-transparent w-32 h-1"></div>
          )}
          
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Verification Status
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-gray-400" />
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
            <CardDescription>
              3-step verification process • Review time: 24-48 hours
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Enhanced Progress Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Progress</span>
                <span className="text-teal-600 font-semibold">{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-3" />
              
              {progress < 100 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {nextStepIndex !== -1 
                      ? `Next: ${verificationSteps[nextStepIndex].label} (${verificationSteps[nextStepIndex].estimatedTime})`
                      : 'All steps completed!'
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced Verification Steps */}
            <div className="space-y-3">
              {verificationSteps.map((step, index) => {
                const isNext = index === nextStepIndex
                const status = getStepStatus(step.verified, isNext)
                const StepIcon = step.icon
                
                return (
                  <div 
                    key={step.key} 
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200",
                      step.verified 
                        ? "bg-green-50 border-green-200" 
                        : isNext 
                          ? "bg-blue-50 border-blue-200 shadow-sm" 
                          : "bg-gray-50 border-gray-200"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-current">
                          {step.verified ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <StepIcon className={cn("w-4 h-4", status.color)} />
                            <span className="font-medium text-gray-900">{step.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                          
                          {!step.verified && isNext && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <ArrowRight className="w-3 h-3" />
                              <span>{step.action}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant={step.verified ? "default" : isNext ? "secondary" : "outline"}
                          className={cn(
                            step.verified && "bg-green-100 text-green-800 border-green-200",
                            isNext && "bg-blue-100 text-blue-800 border-blue-200"
                          )}
                        >
                          {status.text}
                        </Badge>
                        
                        {!step.verified && isNext && (
                          <Button size="sm" className="text-xs">
                            Start Now
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Action Buttons */}
            {progress < 100 ? (
              <div className="space-y-3">
                <Link href="/dashboard/kyc" className="w-full">
                  <Button className="w-full" size="lg">
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
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Why verify?</strong> Verified users can offer rides, access premium features, and build trust with the community.
                  </AlertDescription>
                </Alert>
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

  const PaymentCard = () => (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Payment Settings
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Set up your payment methods so riders can easily pay you after rides. QR codes make payments quick and contactless.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>
                Rydify doesn't process payments; riders pay you directly
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* QR Code Section with Better Context */}
          <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-teal-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show this QR code to riders for quick payment</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="bg-white p-6 rounded-xl inline-block shadow-sm border-2 border-white">
              <QrCode className="w-28 h-28 text-teal-600 mx-auto" />
            </div>
            
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

          {/* Enhanced Payment Methods */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Payment Methods</Label>
              <Badge variant="outline" className="text-xs">
                2 methods active
              </Badge>
            </div>
            
            <div className="space-y-3">
              {/* Zelle */}
              <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-blue-900">Zelle</Label>
                      <p className="text-xs text-blue-700">Bank-to-bank transfer</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Primary
                  </Badge>
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
                    className="border-blue-200 text-blue-700 hover:bg-blue-100"
                    onClick={() => handleCopy("john.doe@ufl.edu", "zelle")}
                  >
                    {copySuccess === 'zelle' ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied!
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
              
              {/* Cash App */}
              <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Smartphone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-green-900">Cash App</Label>
                      <p className="text-xs text-green-700">Mobile payments</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Active
                  </Badge>
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
                    className="border-green-200 text-green-700 hover:bg-green-100"
                    onClick={() => handleCopy("$JohnDoe23", "cashapp")}
                  >
                    {copySuccess === 'cashapp' ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied!
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

          {/* Quick Actions */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Quick Actions</Label>
            <div className="grid grid-cols-1 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start h-auto p-3"
                onClick={() => handleCopy("Hi! Please send $[AMOUNT] via Zelle to john.doe@ufl.edu for our ride. Thanks!", "zelle-template")}
              >
                <div className="flex items-center gap-3 w-full">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium">Copy Zelle Request</p>
                    <p className="text-xs text-gray-500">Template message for riders</p>
                  </div>
                  {copySuccess === 'zelle-template' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start h-auto p-3"
                onClick={() => handleCopy("Hi! Please send $[AMOUNT] to $JohnDoe23 on Cash App for our ride. Thanks!", "cashapp-template")}
              >
                <div className="flex items-center gap-3 w-full">
                  <Smartphone className="w-4 h-4 text-green-600" />
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium">Copy Cash App Request</p>
                    <p className="text-xs text-gray-500">Template message for riders</p>
                  </div>
                  {copySuccess === 'cashapp-template' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </Button>
            </div>
          </div>

          {/* Enhanced Info Alert */}
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Payment Security:</strong> Rydify doesn't process payments. All transactions happen directly between you and riders using your preferred payment methods. Always confirm payment before starting the ride.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </TooltipProvider>
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
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header with Breadcrumbs */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
          <div className="container mx-auto py-8 px-4">
            <div className="max-w-6xl mx-auto">
              {/* Breadcrumb Navigation */}
              <nav className="flex items-center gap-2 text-sm text-teal-100 mb-4">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white font-medium">Profile</span>
              </nav>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <User className="w-8 h-8 text-yellow-300" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">Profile</h1>
                    <p className="text-teal-100 text-sm">Welcome back, {userData.name.split(' ')[0]}!</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm bg-white/20 px-4 py-2 rounded-full border border-white/30">
                  <Shield className="h-4 w-4" />
                  <span>Verified Students Only</span>
                </div>
              </div>
              
              <p className="text-teal-100 max-w-xl mb-6">
                Manage your account, verification, and ride history. Keep your profile updated for the best experience.
              </p>
              
              {/* Enhanced Navigation Pills */}
              <div className="flex flex-wrap gap-3 text-sm">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-colors cursor-pointer">
                      <Shield className="h-4 w-4" />
                      <span>Verification</span>
                      {getVerificationProgress() < 100 && (
                        <Badge className="bg-yellow-500 text-yellow-900 text-xs px-2 py-0">
                          {Math.round(getVerificationProgress())}%
                        </Badge>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Complete verification to unlock all features</p>
                  </TooltipContent>
                </Tooltip>
                
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <History className="h-4 w-4" />
                  <span>Ride History</span>
                  <Badge className="bg-white/30 text-white text-xs px-2 py-0">
                    {stats.totalRides}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <QrCode className="h-4 w-4" />
                  <span>Payment Settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* Profile Header */}
          <ProfileHeader />

          {/* Stats Cards */}
          <StatsCards />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
    </TooltipProvider>
  )
}