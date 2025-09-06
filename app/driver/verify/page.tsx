'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { CameraCapture } from '@/src/components/driver/CameraCapture'
import { TrustBadge, DetailedTrustStatus } from '@/src/components/driver/TrustBadge'
import { 
  Shield, 
  Camera, 
  CheckCircle, 
  Clock,
  Star,
  ArrowLeft,
  Upload
} from 'lucide-react'
import Link from 'next/link'

export default function DriverVerifyPage() {
  const [activeCapture, setActiveCapture] = useState<'license' | 'id' | null>(null)
  const [verificationStatus, setVerificationStatus] = useState({
    studentVerified: true,
    licenseVerified: false,
    idVerified: false,
    trustScore: 50
  })
  const [submissions, setSubmissions] = useState<{
    license?: { status: 'pending' | 'approved' | 'rejected', submittedAt: string }
    id?: { status: 'pending' | 'approved' | 'rejected', submittedAt: string }
  }>({})

  const handleDocumentCapture = (documentType: 'license' | 'id') => (imageData: string) => {
    setActiveCapture(null)
    setSubmissions(prev => ({
      ...prev,
      [documentType]: {
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    }))
    
    // Update trust score for pending verification
    setVerificationStatus(prev => ({
      ...prev,
      trustScore: prev.trustScore + 15 // Intermediate boost while pending
    }))
  }

  const handleVerificationSuccess = (documentType: 'license' | 'id') => (verificationData: any) => {
    console.log(`${documentType} verification submitted:`, verificationData)
  }

  const handleCaptureCancel = () => {
    setActiveCapture(null)
  }

  if (activeCapture) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <CameraCapture
            documentType={activeCapture}
            onCapture={handleDocumentCapture(activeCapture)}
            onCancel={handleCaptureCancel}
            onSubmitSuccess={handleVerificationSuccess(activeCapture)}
            userId="demo_user_123" // In real implementation, get from auth context
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Driver Verification
            </h1>
            <p className="text-lg text-gray-600">
              Increase your trust score and unlock more ride opportunities
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Status */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TrustBadge
                  studentVerified={verificationStatus.studentVerified}
                  licenseVerified={verificationStatus.licenseVerified}
                  idVerified={verificationStatus.idVerified}
                  trustScore={verificationStatus.trustScore}
                  showScore={true}
                />
                
                <DetailedTrustStatus
                  studentVerified={verificationStatus.studentVerified}
                  licenseVerified={verificationStatus.licenseVerified}
                  idVerified={verificationStatus.idVerified}
                  trustScore={verificationStatus.trustScore}
                />
              </div>
            </CardContent>
          </Card>

          {/* Verification Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Driver's License */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Driver's License Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 mb-4">
                      Verify your driver's license to increase trust and unlock long-distance rides.
                    </p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-gray-600">Trust Score Impact:</span>
                      <span className="text-sm font-semibold text-teal-600">+25%</span>
                    </div>

                    {submissions.license ? (
                      <Alert className="border-blue-200 bg-blue-50">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <strong>Under Review:</strong> Submitted {new Date(submissions.license.submittedAt).toLocaleDateString()}. 
                          We'll notify you within 24 hours.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Button
                        onClick={() => setActiveCapture('license')}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take License Photo
                      </Button>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {verificationStatus.licenseVerified ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : submissions.license ? (
                      <Clock className="w-8 h-8 text-blue-500" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student ID */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Student ID Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 mb-4">
                      Verify your student ID for additional trust and campus ride priority.
                    </p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-gray-600">Trust Score Impact:</span>
                      <span className="text-sm font-semibold text-teal-600">+25%</span>
                    </div>

                    {submissions.id ? (
                      <Alert className="border-blue-200 bg-blue-50">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <strong>Under Review:</strong> Submitted {new Date(submissions.id.submittedAt).toLocaleDateString()}. 
                          We'll notify you within 24 hours.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Button
                        onClick={() => setActiveCapture('id')}
                        variant="outline"
                        className="border-teal-600 text-teal-600 hover:bg-teal-50"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take ID Photo
                      </Button>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {verificationStatus.idVerified ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : submissions.id ? (
                      <Clock className="w-8 h-8 text-blue-500" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-900">Verification Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-teal-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                    Higher visibility in ride search results
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                    More riders will trust and book your rides
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                    Access to long-distance ride opportunities
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                    Enhanced safety reputation in the community
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}