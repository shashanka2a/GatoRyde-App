'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Shield, Upload, X, Star, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

interface VerificationPromptProps {
  licenseVerified: boolean
  idVerified: boolean
  trustScore: number
  onDismiss: () => void
  className?: string
}

export function VerificationPrompt({ 
  licenseVerified, 
  idVerified, 
  trustScore,
  onDismiss,
  className 
}: VerificationPromptProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || (licenseVerified && idVerified)) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss()
  }

  const missingDocs = []
  if (!licenseVerified) missingDocs.push('Driver\'s License')
  if (!idVerified) missingDocs.push('Student ID')

  const potentialTrustScore = Math.min(100, trustScore + (missingDocs.length * 25))

  return (
    <Card className={`bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-teal-200 dark:border-teal-800 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-teal-900 dark:text-teal-100">
                Boost Your Trust Score
              </CardTitle>
              <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">
                Upload documents to increase rider confidence
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-teal-600 hover:text-teal-700 hover:bg-teal-100 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/30"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current vs Potential Trust Score */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trust Score</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(trustScore)}%</span>
              </div>
              <TrendingUp className="w-4 h-4 text-teal-500" />
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-teal-500" />
                <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                  {Math.round(potentialTrustScore)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-teal-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${potentialTrustScore}%` }}
            />
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-teal-900 dark:text-teal-100">
            Benefits of verification:
          </h4>
          <ul className="space-y-1 text-sm text-teal-700 dark:text-teal-300">
            <li className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              More riders will trust and book your rides
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Higher visibility in search results
            </li>
            <li className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Enhanced safety reputation
            </li>
          </ul>
        </div>

        {/* Missing Documents */}
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Missing documents:</strong> {missingDocs.join(', ')}
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link href="/driver/verify" className="flex-1">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
              <Upload className="w-4 h-4 mr-2" />
              Verify Documents
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            className="border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:hover:bg-teal-900/30"
          >
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}