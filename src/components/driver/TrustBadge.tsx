'use client'

import { Badge } from '@/src/components/ui/badge'
import { CheckCircle, AlertTriangle, Shield, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustBadgeProps {
  studentVerified: boolean
  licenseVerified: boolean
  idVerified: boolean
  trustScore: number
  className?: string
  showScore?: boolean
}

export function TrustBadge({ 
  studentVerified, 
  licenseVerified, 
  idVerified, 
  trustScore,
  className,
  showScore = false
}: TrustBadgeProps) {
  const getVerificationLevel = () => {
    if (studentVerified && licenseVerified && idVerified) {
      return {
        level: 'fully-verified',
        label: 'Fully Verified',
        icon: Shield,
        color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      }
    } else if (studentVerified && (licenseVerified || idVerified)) {
      return {
        level: 'partially-verified',
        label: 'Partially Verified',
        icon: CheckCircle,
        color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      }
    } else if (studentVerified) {
      return {
        level: 'student-only',
        label: 'Student Verified',
        icon: AlertTriangle,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      }
    } else {
      return {
        level: 'unverified',
        label: 'Unverified',
        icon: AlertTriangle,
        color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      }
    }
  }

  const verification = getVerificationLevel()
  const Icon = verification.icon

  const getDetailedStatus = () => {
    const statuses = []
    
    if (studentVerified) {
      statuses.push('Student Verified ✅')
    } else {
      statuses.push('Student Unverified ❌')
    }
    
    if (licenseVerified) {
      statuses.push('License Verified ✅')
    } else {
      statuses.push('License Unverified ⚠️')
    }
    
    if (idVerified) {
      statuses.push('ID Verified ✅')
    } else {
      statuses.push('ID Unverified ⚠️')
    }
    
    return statuses.join(', ')
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant="outline" 
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 text-xs font-medium border",
          verification.color
        )}
        title={getDetailedStatus()}
      >
        <Icon className="w-3 h-3" />
        {verification.label}
      </Badge>
      
      {showScore && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <Star className="w-3 h-3" />
          {Math.round(trustScore)}%
        </Badge>
      )}
    </div>
  )
}

export function DetailedTrustStatus({ 
  studentVerified, 
  licenseVerified, 
  idVerified, 
  trustScore,
  className 
}: TrustBadgeProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trust Score</span>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-semibold">{Math.round(trustScore)}%</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Student Status</span>
          <div className="flex items-center gap-1">
            {studentVerified ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Verified</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-red-600 dark:text-red-400">Unverified</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">License Status</span>
          <div className="flex items-center gap-1">
            {licenseVerified ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Verified</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-600 dark:text-yellow-400">Unverified</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">ID Status</span>
          <div className="flex items-center gap-1">
            {idVerified ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Verified</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-600 dark:text-yellow-400">Unverified</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}