'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/src/components/ui/input-otp'
import { Badge } from '@/src/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { 
  Mail, 
  Shield, 
  CheckCircle, 
  ArrowLeft, 
  Sun, 
  Moon,
  Palette,
  Eye,
  EyeOff
} from 'lucide-react'

export default function AuthThemeDemoPage() {
  const [email, setEmail] = useState('student@ufl.edu')
  const [otp, setOTP] = useState('123456')
  const [isDark, setIsDark] = useState(false)
  const [showStates, setShowStates] = useState(false)

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center">
                <div className="text-white font-bold text-xl">R</div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Rydify Auth Theme Demo
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Showcasing the complete auth flow with Rydify's design system
            </p>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                onClick={toggleDarkMode}
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600 rounded-xl"
              >
                {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </Button>
              
              <Button
                onClick={() => setShowStates(!showStates)}
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600 rounded-xl"
              >
                {showStates ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showStates ? 'Hide States' : 'Show States'}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-xl"
              >
                Login Flow
              </TabsTrigger>
              <TabsTrigger 
                value="components" 
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-xl"
              >
                Components
              </TabsTrigger>
              <TabsTrigger 
                value="states" 
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-xl"
              >
                Button States
              </TabsTrigger>
              <TabsTrigger 
                value="colors" 
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white rounded-xl"
              >
                Color Palette
              </TabsTrigger>
            </TabsList>

            {/* Login Flow Tab */}
            <TabsContent value="login" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Email Step */}
                <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <CardHeader className="text-center pb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="text-white font-bold text-2xl">R</div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      Sign in to Rydify
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">
                      Enter your .edu email to get started
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        University Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@university.edu"
                          className="pl-10 h-12 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Only .edu email addresses are accepted for student verification
                      </p>
                    </div>
                    
                    <Button className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg">
                      <Mail className="w-5 h-5 mr-2" />
                      Send Verification Code
                    </Button>
                  </CardContent>
                </Card>

                {/* OTP Step */}
                <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <CardHeader className="text-center pb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="text-white font-bold text-2xl">R</div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      Verify your email
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">
                      Enter the 6-digit code sent to {email}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block text-center">
                        Verification Code
                      </Label>
                      
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={(value) => setOTP(value)}
                        >
                          <InputOTPGroup className="gap-2">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                              <InputOTPSlot 
                                key={index}
                                index={index} 
                                className="w-12 h-12 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:bg-gray-700 dark:text-white transition-all duration-200" 
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Check your email for the 6-digit verification code
                      </p>
                    </div>

                    <Button className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg">
                      <Shield className="w-5 h-5 mr-2" />
                      Verify & Sign In
                    </Button>

                    <div className="text-center space-y-3">
                      <button className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 mx-auto">
                        <ArrowLeft className="w-4 h-4" />
                        Change email address
                      </button>
                      
                      <button className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors duration-200">
                        Resend code
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Components Tab */}
            <TabsContent value="components" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Auth Guard - Success */}
                <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Auth Guard - Success</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Logged in as student@ufl.edu
                    </p>
                  </CardContent>
                </Card>

                {/* Auth Guard - Login Required */}
                <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Auth Guard - Login</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      You need to verify your .edu email to access this feature.
                    </p>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl px-4 py-2 text-sm shadow-md hover:shadow-lg transition-all duration-200">
                      <Mail className="h-3 w-3 mr-2" />
                      Sign in with .edu Email
                    </Button>
                  </CardContent>
                </Card>

                {/* Auth Guard - Verification Required */}
                <Card className="bg-orange-50 dark:bg-orange-900/20 rounded-xl shadow-md border border-orange-200 dark:border-orange-800">
                  <CardHeader>
                    <CardTitle className="text-lg">Auth Guard - Verification</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Email Verification Required</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      Please verify your .edu email address to access this feature.
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/30 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
                    >
                      Complete Verification
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Button States Tab */}
            <TabsContent value="states" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Primary Buttons</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl h-12 shadow-md hover:shadow-lg transition-all duration-200">
                      Normal State
                    </Button>
                    <Button className="w-full bg-teal-700 text-white font-medium rounded-xl h-12 shadow-lg">
                      Hover State
                    </Button>
                    <Button disabled className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-medium rounded-xl h-12 cursor-not-allowed">
                      Disabled State
                    </Button>
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl h-12 shadow-md hover:shadow-lg transition-all duration-200">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Loading State
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Outline Buttons</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-600 dark:text-teal-400 dark:hover:bg-teal-900/30 rounded-xl h-12 transition-all duration-200">
                      Normal State
                    </Button>
                    <Button variant="outline" className="w-full border-teal-300 text-teal-700 bg-teal-50 dark:border-teal-600 dark:text-teal-400 dark:bg-teal-900/30 rounded-xl h-12">
                      Hover State
                    </Button>
                    <Button variant="outline" disabled className="w-full border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500 rounded-xl h-12 cursor-not-allowed">
                      Disabled State
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Input Fields</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input 
                      placeholder="Normal state" 
                      className="border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white h-12"
                    />
                    <Input 
                      placeholder="Focused state" 
                      className="border-teal-500 ring-2 ring-teal-500/20 rounded-xl dark:bg-gray-700 dark:text-white h-12"
                    />
                    <Input 
                      placeholder="Disabled state" 
                      disabled
                      className="border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 h-12 cursor-not-allowed"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Color Palette Tab */}
            <TabsContent value="colors" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Primary Colors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="w-full h-16 bg-teal-600 rounded-xl flex items-center justify-center text-white font-medium">
                          Teal 600
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">#0D9488 - Primary</p>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-16 bg-teal-700 rounded-xl flex items-center justify-center text-white font-medium">
                          Teal 700
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">#0F766E - Hover</p>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-16 bg-teal-500 rounded-xl flex items-center justify-center text-white font-medium">
                          Teal 500
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">#14B8A6 - Light</p>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-16 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-medium">
                          Emerald 500
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">#10B981 - Accent</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle>Design Tokens</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <span className="font-medium">Border Radius</span>
                        <Badge variant="secondary">rounded-xl (12px)</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <span className="font-medium">Shadow</span>
                        <Badge variant="secondary">shadow-md</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <span className="font-medium">Button Height</span>
                        <Badge variant="secondary">h-12 (48px)</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <span className="font-medium">Transition</span>
                        <Badge variant="secondary">duration-200</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <span className="font-medium">Focus Ring</span>
                        <Badge variant="secondary">ring-teal-500</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}