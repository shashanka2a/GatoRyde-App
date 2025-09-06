'use client'

import { useEffect, useState } from 'react'
import { VerificationPrompt } from './VerificationPrompt'
import { useVerificationPrompts } from '@/src/hooks/useVerificationPrompts'

interface DriverVerificationStatus {
  studentVerified: boolean
  licenseVerified: boolean
  idVerified: boolean
  trustScore: number
  lastPromptedAt?: string
}

interface VerificationPromptManagerProps {
  driverStatus: DriverVerificationStatus | null
  className?: string
}

export function VerificationPromptManager({ 
  driverStatus, 
  className 
}: VerificationPromptManagerProps) {
  const [mounted, setMounted] = useState(false)
  
  const {
    shouldShowPrompt,
    dismissPrompt,
    recordPromptShown,
    getPromptPriority
  } = useVerificationPrompts(driverStatus)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render on server or if not mounted
  if (!mounted || !driverStatus || !shouldShowPrompt) {
    return null
  }

  const priority = getPromptPriority()

  // Only show high priority prompts immediately
  // Medium and low priority prompts can be shown less frequently
  if (priority === 'low') {
    // Show low priority prompts only 20% of the time
    if (Math.random() > 0.2) return null
  } else if (priority === 'medium') {
    // Show medium priority prompts 60% of the time
    if (Math.random() > 0.6) return null
  }

  const handleDismiss = () => {
    dismissPrompt()
  }

  const handleUploadClick = () => {
    recordPromptShown()
    // Navigation will be handled by the VerificationPrompt component
  }

  return (
    <div className={className}>
      <VerificationPrompt
        licenseVerified={driverStatus.licenseVerified}
        idVerified={driverStatus.idVerified}
        trustScore={driverStatus.trustScore}
        onDismiss={handleDismiss}
      />
    </div>
  )
}

// Hook to get mock driver status (replace with real API call)
export function useDriverStatus() {
  const [driverStatus, setDriverStatus] = useState<DriverVerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock API call - replace with real implementation
    const fetchDriverStatus = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data - replace with real API call
        const mockStatus: DriverVerificationStatus = {
          studentVerified: true,
          licenseVerified: Math.random() > 0.5, // Random for demo
          idVerified: Math.random() > 0.5, // Random for demo
          trustScore: Math.floor(Math.random() * 50) + 50, // 50-100
          lastPromptedAt: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
        }
        
        setDriverStatus(mockStatus)
      } catch (error) {
        console.error('Failed to fetch driver status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDriverStatus()
  }, [])

  return { driverStatus, loading }
}