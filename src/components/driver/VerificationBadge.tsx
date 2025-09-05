'use client'

import { Badge } from '@/src/components/ui/badge'
import { Shield, CheckCircle, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerificationBadgeProps {
  isVerified: boolean
  hasLicense?: boolean
  hasVehicle?: boolean
  hasStudent?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function VerificationBadge({ 
  isVerified, 
  hasLicense = false,
  hasVehicle = false,
  hasStudent = false,
  className,
  size = 'md'
}: VerificationBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  }

  if (isVerified) {
    return (
      <Badge 
        variant="default"
        className={cn(
          'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
          sizeClasses[size],
          className
        )}
      >
        <CheckCircle className={cn(iconSizes[size], 'mr-1')} />
        ID + License Verified
      </Badge>
    )
  }

  // Show pending or unverified status
  const verificationTypes = []
  if (hasLicense) verificationTypes.push('License')
  if (hasVehicle) verificationTypes.push('Vehicle')
  if (hasStudent) verificationTypes.push('Student ID')

  if (verificationTypes.length > 0) {
    return (
      <Badge 
        variant="secondary"
        className={cn(
          'bg-yellow-100 text-yellow-800 border-yellow-200',
          sizeClasses[size],
          className
        )}
      >
        <Clock className={cn(iconSizes[size], 'mr-1')} />
        Verification Pending
      </Badge>
    )
  }

  return (
    <Badge 
      variant="outline"
      className={cn(
        'bg-gray-100 text-gray-600 border-gray-300',
        sizeClasses[size],
        className
      )}
    >
      <Shield className={cn(iconSizes[size], 'mr-1')} />
      Not Verified
    </Badge>
  )
}

interface DriverCardBadgeProps {
  driver: {
    verified: boolean
    user: {
      verifications?: Array<{
        type: 'license' | 'vehicle' | 'student'
        status: 'pending' | 'approved' | 'rejected'
      }>
    }
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function DriverCardBadge({ driver, className, size = 'md' }: DriverCardBadgeProps) {
  const verifications = driver.user.verifications || []
  
  const hasLicense = verifications.some(v => v.type === 'license' && v.status === 'pending')
  const hasVehicle = verifications.some(v => v.type === 'vehicle' && v.status === 'pending')
  const hasStudent = verifications.some(v => v.type === 'student' && v.status === 'pending')

  return (
    <VerificationBadge
      isVerified={driver.verified}
      hasLicense={hasLicense}
      hasVehicle={hasVehicle}
      hasStudent={hasStudent}
      className={className}
      size={size}
    />
  )
}

// Detailed verification status component
interface VerificationStatusProps {
  verifications: Array<{
    type: 'license' | 'vehicle' | 'student'
    status: 'pending' | 'approved' | 'rejected'
    createdAt: Date
    notes?: string | null
  }>
  className?: string
}

export function VerificationStatus({ verifications, className }: VerificationStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      default: return <Shield className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-800 bg-green-100 border-green-200'
      case 'rejected': return 'text-red-800 bg-red-100 border-red-200'
      case 'pending': return 'text-yellow-800 bg-yellow-100 border-yellow-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'license': return 'Driver License'
      case 'vehicle': return 'Vehicle Registration'
      case 'student': return 'Student ID'
      default: return type
    }
  }

  if (verifications.length === 0) {
    return (
      <div className={cn('text-center py-4', className)}>
        <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">No verifications submitted</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {verifications.map((verification, index) => (
        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(verification.status)}
            <div>
              <p className="font-medium">{getTypeDisplayName(verification.type)}</p>
              <p className="text-sm text-gray-600">
                Submitted {verification.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(verification.status)}>
            {verification.status}
          </Badge>
        </div>
      ))}
    </div>
  )
}