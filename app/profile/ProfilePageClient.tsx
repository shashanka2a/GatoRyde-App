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



rified]
gth
      return (completed / steps.le 100
    }

    const getNextStep = () => {
      if (!userData.eduVerified) return 0
     

      return -1
    }

    const nextStepIndex = getNextStep()
    const progrs()


      { 
        key: 'eduVerified', 
 
        verified: userData.eduV
        Mail,
        description: 'Verify
        action: 'Check ynk',
        estimatedTime: '2 minutes'
      },
      { 
        key: 'kycVerified', 
        label: 'ID', 
        ,
        
        description: 'UploadID',
        action: 'Take,
        estimatedTime: '5 minutes'
      },
      { 
        key: 'licenseVerified', 
        label: 'License', 
        ed,
         Car,
        description: 'Upload valse',
        action: 'Photo of  back',
        estimatedTime: '3 minutes'
      }
    ]

    return (
      <
     ll">
(
            v>
          )}
          
          <CardHeader className=
            <div className="flex items-start justify-between gap-4">
            >
          2">
                  <div className="bg-teal-100 p-2 rounded-lg fle
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-te
                  </div>
                  <span className="truncate">Verification Status</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Ik-0" />
                    </TooltipTrigger>
                    <Tooltis">
                      <p>Complete al
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                  3-step verification
                </CardDescrion>
              </div>
              {progress === 100 && (
                <Badge className="bg-green-100 text-green-800 border-grek-0">
                  <CheckCircle clamr-1" />
                  Fu
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardC">
            {/* St bar */}
            <div classN">
          
              <div className="absolute top-4 left-8 
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: ` }}
                />
              </div>
              
              {verificationSteps.map((step, index) => {
                cofied
                conspIndex
              
                
                return (
                  <div key={step.key} className="flex fle
                    <div className={cn(
                ",
                      isd 
                        ? "bg-green-500 border-green-500 text-white" 
                        : isCurrent 
                          ? "bg-blue-500 border-blue-500 text-white animate-pulse" 
                          : "bg-gr"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isCurrent ? (
                       4" />
                      ) : (
                        <span className="text-xs font-mediu>
                      )}
                    </div>
                    <div cl">
                      <p className={cn(
                        ",
                        is"
                      )}>
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {'🔒'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* C/}
            {next= -1 && (
              <div>

                  <div className="bg-blu">
                    {React.createEleme
                      className: "w-5 h-5 text-blue-600"
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-blue
                      Nion
                    </h4>
                    <p className="text-sm text-blu
                      {verificationSteps[nextStepIndex].description
                    </p>
                    <div >
                      <Clock className="w-3 h-3" />
                      <span>Estimated time: {verificationSteps[nextSpan>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action */}
            <div claauto">
              
>
                  <Link href="/das
                    <Button className
                      {nextStepIn (
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
                <Alert classN
                  <CheckC" />
                  <Ale
                   tures.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </TooltipPer>
    )
  }

  const PaymentCard = () => {
    ce)
   )
    
    return (
      <TooltipProvider>
        <Card className="bg-white shadow-lg border-0 h-">
    
            4">
              <div clas">
                <CardTitle className="flex items-center gap-2-2">
                  <div className="bg-teal-100 p-2 rounded-lg fle>
                    <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                  </div>
                  <span className="truncate">Payment Settings</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <I>
                    </TooltipTrigger>
                    <Toolti
                      <p>Riders can p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                  Rydify doesn't procly
                </CardDescri
              </div>
              <Button variant="outline" size="sm" className="border>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          
          <CardContent 6">
            {/* En*/}
            <div classN">
          p>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "105",
                      qrEnlarged && "sca
                    )}
                    onMouseEnter={d(true)}
                    onMouseLeave={() => setQrHovered(false)}
                    onClick={() => setQrEnlarged(!qr}
                  >
                    <QrCode className="w-20 h-20 sm:w-28 sm" />
                    {qrHovered && (
                      <div className="absolute inset-0 bg-blac">
                   ded">
                          Tap to enlarge
                        </span>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rp>
                </Toolti
              </Tooltip>
              
              <div className="mt-4 space-y-2">
                <p className="texe</p>
                <p classp>
                
                <div className="flex flex-wrap">
                  <div className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                
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

            {/* Enhancs */}
            <div cla">
              <div">
l>
                <Badge variant="outline" className="tex>
                  2 methods active
                </Badge>
              </div>
              
              <div className="spac">
                {/* Zell
                <div
              n mb-3">
                    <div className="flex 
                      {/* Zelle Logo Pl
                      <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-sm">
                        Z
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-blue-900 flex items-center>
                         
                          <B-2 py-0">
                           Primary
                          </Badge>
                        </Label
                        <p className="text-xs text-blue-700">Bank-to-bank transfer</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class>
                    <Input 
                      pl
                  0"
                      defaultValue="john.doe@ufl.edu"
                      readO
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      ors"
                      onClice")}
                    >
                      {copySucc? (
                        <>
                          <Check className="w-4 h-4 mr-1 text-green-600" />
                     
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          C
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Cash App }
                <div cla">
                  <div>
                ">
                      {/* Cash App Logo Pl/}
                      <div className="bg-green-600 text-white p-2 rounded-lg font-bold text-sm">
                        $
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-green-900 flex items-centerap-2">
                         
                          <B0">
                           
                          </Badge>
                        </Label>
                        <p className="text-xs text-green-700">Mobile payments</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class
                    <Input 
                      plshApp" 
                  
                      defaultValue="$JohnDoe23"
                      readOnly
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      
                      onClic
                    >
                      {copySucc? (
                        <>
                          <Check className="w-4 h-4 mr-1 text-green-600" >
                     
                        </>
                      ) : 
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

            {/* Quick k */}
            <div cla3">
              <Label>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start h-auto p-3 
                  onClic}
                >
                  <div class>
                    <div className="bg-blue-600 text-white p-1 rounded text-xs font-bold"/div>
                    <div className="text-left flex-1">
                 t</p>
                      <p className="text-xs text-gray-500">Templat
                    </div>
                    {copySuccess === 'zelle-template' ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="w-4 h-4" />
                        <span>
                      </div>
                    ) : (
                      <Copy className="w-4 h-4 text-g" />
                    )}
                  </div>
                </Button>
                
                <Button 
                  varianne" 
                  size="s
                rs"
                  onClic
                >
                  <div classll">
                    <div className="bg-green-600 text-white p-1 rounded text-xs font-bold">$</div>
                    <div className="text-left flex-1">
                 st</p>
                      <p className="text-xs text-gray-500">Templat>
                    </div>
                    {copySuccess === 'cashapp-template
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="w-4 h-4" />
                        <sspan>
                      </div>
                    ) : (
                      <Copy className="w-4 h-4 text-g>
                    )}
                  </div>
                </Button>
              </div>
            </div>

            {/* Positive 
            <Alert c0">
              <Che" />
800">
                <strong>✅ All transactions ar>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 ml-1 cursor-he
                  </TooltipTrigger>
                  <Toolti
                    <p>Rydify doesn't proc
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
    <
   ">
>
          <div className="bg-
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-g
          </div>
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardConte">
        <div className="space
          <div classlors">
            <div clk-0">
              <Mail className="w-4 h-4 text-blue
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userData.em>
              <p className="text-xs text-gray-500 flex i-1">
                📧l
              </p>
            </div>
          </div>

          <div clas">
            <div c>
              <P>
/div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{userData.phone}</p>
              <p className="text-xs text-gray-500 flex itep-1">
                📱e
              </p>
            </div>
          </div>
        </div>

        <div class
          <Butto>
            <E
Info
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const RideHistoryC{
    return (
   0">
-4">
          <div className="flex fl>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl>
              <div className="bg-gray-100 p-2 rounded-lg">
    " />
            /div>
              Ride History
            </CardTitle>
            <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 ho
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent clap-6">
          {/* Enhanced Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variantoutline'}
              sism"
              onClick')}
              classNae={cn(
                "transition-all duratio",
                historyFilter === 'all' 
                  ?" 
                  : "hover:bg-gray-50"
              )}
            >
              All ({rideHist)
            </Button>
            <Button
              variant={historyFilter === 'driver' ? 'default' : 'outline'}
              size="sm"
              onriver')}
             n(
                "flex items-center gap-1
                historiver' 
                  ?
                  : "hover:bg-blue-50"
              )}
            >
              🚗 Driver ({ri
            </Button>
            <Button
              variant={historyFilter === 'passenger' ? 'default' : 'outline'}
              size="sm"
              on)}
             (
                "flex items-center gap-1 transition-all duration-200",
                histoger' 
                  ? 
                  : "hover:bg-green-50"
              )}
            >
              🧑‍🤝‍🧑 Passe)
            </Button>
          </div>

          {/* Ride List */}
          <div c-4">
            { ? (
              filteredHistory.map((ride) => (
                <div
                {ride.id}
s"
                >
                  <div className="fl-0">
                    {/* Status Ic/}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
              -100"
             )}>
                      {ride.type === 'd(
                        <Car className="w-5 h-5 tex00" />
                   (
                        <User>
                      )}
               iv>

                    {/* Ride Details */}
                
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          className={cn(
                            "",
                            ride.type === 'driver' 
                              ? "bg-blue-100 text-blu
                       
                          )}
                        >
                          {ri'}
                        </Badge>
                        <Badge classNa
                          ✅ Completed
                        </Badge>
                      </div>
                      
                      <p className="font-medium text-sm text-gray-900 mb-1">
                        {ride.
                      </p>
                      
                      <p className="text-xs text-gray-500">
                        {ride.date.toLocaleDateString('en { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                       
                        
                        person` 
                          : ` Driver: ${ride.dd`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Am
                  <div className="text-right flex-shrink->
                    <p className={cn(
                      "f",
                      ride.type === '00"
                    )}>
                      {ride.type === 'driver' ? '+' : '-'}${ride.amount.toFixed(2)}
                    </p>
                    <p class">
                      'paid'}
                    </p>
                    {rting && (
                    d">
               
                  
                iv>
 )}
                  </div>
                </div>
              ))
            ) : (
              /* E*/
              <div className="text-center py-12">
                {historyFilter === 'all' ? (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex item">
                      <Car className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-g
                    <p className="text-sm text-gray-500 mb-6">Start your Rydify jo/p>
                    <div className="fl
                      <Link hredes">
                        <Bu0">
                          🔍 Find a ride
                        </Button>
                      </Link>
                      <Link hre">
                        <Bu-50">
                        ride
                   ton>
                      </Link>
                  >
                  </>
                ) : historyFilter === 'driver' ? (
                  <>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center
                      <Car className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-gray-600 mb-2 font-medium">No rides offer/p>
                    <p className="text-sm text
                    <Link hre
                      <Bu
                   
                   >
                  Link>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-cen
                      <User className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-gray-600 mb-2 font-medium">No rides taken y
                    <p className="te>
                    <Link hre">
                      <Bu00">
                   e
                >
                  nk>
            >
                )}
             iv>
     
   </div>
t>
d>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Enhanced User Info Card - Hero Sec*/}
          <Card className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-0 shadow-xl mb-8">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:sp>
                <div className="relative flex-shrink-0">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white/30 shadow-lg">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={`${u`} />
                    <AvatarFallback c">
                      {user
                    </AvatarFallback>
                  </Avatar>
                  {userData.eduVerified && (
                    <div c">
                    ite" />
                    </div>
                
                </div>
                
                <div className="flex-1 min-w-0 w-full lg:w-auto">
                  <div className="mb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2"</h1>
                    <p className="text-teal-100 text-base sm:text-lg">
                      Member since {userData.joinedAt)} • 
                      <span className="ml-2 inline-flex it>
                        <User-4" />
                        leted
                      </span>
                  /p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center space-x-1 bg-white/20 px-3 py-2 rounde">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <spa1)}</span>
                    
                    </div>
                    
                    {userData.eduVerified && (
                      <Badge className=">
                        <Shiel
                      d
                    
                    )}
                    
                    {getVerificationProgress() === 100 && (
                      <Badge className0">
                        <Spark>
                      ified
                      </ge>
      )}
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <divv>
                      <div className="text-xs tex>
                    </div>
                    <div className="text-center">
                      <div)}</div>
                      <div className="text-xs tex</div>
                    </div>
                    <div className="text-center">
                      <divv>
                      <div className="text-xs tex
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span>
                        <Star className="w-4 h-4 fill-yellow-400 text-yel" />
                      </div>
                      <d</div>
                    </div>
                >
                </div>
                
                <div className="flex items-cd">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                       s"
                        aria-label="Notifications"
                      >
                        <Bell classNa />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Not
                  
                  </Toolti
                  
                  <Button 
                    variant="secondary" 
                   ="sm" 
                    className="hover:shadow-md transiion-200"
                  >
                    <Edit c>
                    Edile
                  </>
                </div>
              </d>
ntent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-c-8">
            {/* Left Column - Primary Actions */}
            <div className="space->
              mary */}
              <VerificationCard />
              
              {/* ondary */}

            </div>

            {/* Right Column - Payment & Setting
            <div className="se-y-8">
              {/* 
              <P

          </div>

          {/* Full Width Ride Hn */}
          <div c"mt-8">
            <R />

        </div>

        {/* Toast Notification */}
        {copySuccess && (
          <div className="fixed bottom-4 ri>
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow2">
              <Che
              <s
          
          </v>
        )}
   
   )
}r>
ipProvideolt   </To