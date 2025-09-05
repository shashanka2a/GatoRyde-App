'use client'

import { useState, useEffect } from 'react'
import { LicenseVerificationForm } from '@/src/components/kyc/LicenseVerificationForm'
import { VerificationStatus } from '@/src/components/driver/VerificationBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Shield, Car, GraduationCap } from 'lucide-react'

export default function KYCPage() {
  const [verifications, setVerifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock verifications for MVP
    setVerifications([])
    setLoading(false)
  }, [])

  const hasLicenseVerification = verifications.some((v: any) => v.type === 'license')
  const hasVehicleVerification = verifications.some((v: any) => v.type === 'vehicle')
  const hasStudentVerification = verifications.some((v: any) => v.type === 'student')

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Identity Verification</h1>
          <p className="text-gray-600">
            Complete your verification to start driving with GatoRyde. 
            All information is encrypted and securely stored.
          </p>
        </div>

        {/* Current Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>
              Track your verification progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VerificationStatus 
              verifications={verifications.map(v => ({
                type: v.type as 'license' | 'vehicle' | 'student',
                status: v.status as 'pending' | 'approved' | 'rejected',
                createdAt: v.createdAt || new Date(),
                notes: v.notes
              }))}
            />
          </CardContent>
        </Card>

        {/* Verification Forms */}
        <Tabs defaultValue="license" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="license" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Driver License
            </TabsTrigger>
            <TabsTrigger value="vehicle" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Vehicle
            </TabsTrigger>
            <TabsTrigger value="student" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Student ID
            </TabsTrigger>
          </TabsList>

          <TabsContent value="license" className="mt-6">
            {hasLicenseVerification ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">License Verification Submitted</h3>
                  <p className="text-gray-600">
                    Your driver license verification is being reviewed. 
                    You'll receive an email when it's processed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <LicenseVerificationForm />
            )}
          </TabsContent>

          <TabsContent value="vehicle" className="mt-6">
            <Card>
              <CardContent className="text-center py-8">
                <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Vehicle Verification</h3>
                <p className="text-gray-600 mb-4">
                  Vehicle verification form coming soon. 
                  Complete your driver license verification first.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="student" className="mt-6">
            <Card>
              <CardContent className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Student ID Verification</h3>
                <p className="text-gray-600 mb-4">
                  Student verification form coming soon. 
                  This will help you access student-only rides.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}