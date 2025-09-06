'use client'

import { useState, useEffect } from 'react'

interface DriverVerificationStatus {
  studentVerified: boolean
  licenseVerified: boolean
  idVerified: boolean
  trustScore: number
  lastPromptedAt?: string
}

interface VerificationPromptConfig {
  minDaysBetweenPrompts: number
  maxPromptsPerWeek: number
  trustScoreThreshold: number
}

const DEFAULT_CONFIG: VerificationPromptConfig = {
  minDaysBetweenPrompts: 3,
  maxPromptsPerWeek: 2,
  trustScoreThreshold: 75
}

export function useVerificationPrompts(
  driverStatus: DriverVerificationStatus | null,
  config: Partial<VerificationPromptConfig> = {}
) {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false)
  const [promptCount, setPromptCount] = useState(0)
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  useEffect(() => {
    if (!driverStatus) return

    const checkShouldPrompt = () => {
      // Don't prompt if already fully verified
      if (driverStatus.studentVerified && driverStatus.licenseVerified && driverStatus.idVerified) {
        return false
      }

      // Don't prompt if trust score is already high enough
      if (driverStatus.trustScore >= finalConfig.trustScoreThreshold) {
        return false
      }

      // Check if enough time has passed since last prompt
      if (driverStatus.lastPromptedAt) {
        const lastPrompted = new Date(driverStatus.lastPromptedAt)
        const daysSinceLastPrompt = (Date.now() - lastPrompted.getTime()) / (1000 * 60 * 60 * 24)
        
        if (daysSinceLastPrompt < finalConfig.minDaysBetweenPrompts) {
          return false
        }
      }

      // Check weekly prompt limit
      const weeklyPrompts = getWeeklyPromptCount()
      if (weeklyPrompts >= finalConfig.maxPromptsPerWeek) {
        return false
      }

      return true
    }

    setShouldShowPrompt(checkShouldPrompt())
  }, [driverStatus, finalConfig])

  const getWeeklyPromptCount = (): number => {
    const stored = localStorage.getItem('verification_prompts_this_week')
    if (!stored) return 0

    try {
      const data = JSON.parse(stored)
      const weekStart = getWeekStart()
      
      if (data.weekStart !== weekStart.toISOString()) {
        // New week, reset count
        localStorage.setItem('verification_prompts_this_week', JSON.stringify({
          weekStart: weekStart.toISOString(),
          count: 0
        }))
        return 0
      }
      
      return data.count || 0
    } catch {
      return 0
    }
  }

  const getWeekStart = (): Date => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek
    return new Date(now.setDate(diff))
  }

  const recordPromptShown = () => {
    const weeklyPrompts = getWeeklyPromptCount()
    const weekStart = getWeekStart()
    
    localStorage.setItem('verification_prompts_this_week', JSON.stringify({
      weekStart: weekStart.toISOString(),
      count: weeklyPrompts + 1
    }))
    
    setPromptCount(weeklyPrompts + 1)
    setShouldShowPrompt(false)

    // Record last prompted time (in real app, this would be saved to backend)
    localStorage.setItem('last_verification_prompt', new Date().toISOString())
  }

  const dismissPrompt = () => {
    recordPromptShown()
  }

  const getPromptPriority = (): 'high' | 'medium' | 'low' => {
    if (!driverStatus) return 'low'

    if (driverStatus.trustScore < 50) return 'high'
    if (driverStatus.trustScore < 65) return 'medium'
    return 'low'
  }

  const getMissingVerifications = (): string[] => {
    if (!driverStatus) return []

    const missing = []
    if (!driverStatus.licenseVerified) missing.push('license')
    if (!driverStatus.idVerified) missing.push('id')
    return missing
  }

  const getPotentialTrustScore = (): number => {
    if (!driverStatus) return 0

    let potential = driverStatus.trustScore
    if (!driverStatus.licenseVerified) potential += 25
    if (!driverStatus.idVerified) potential += 25
    
    return Math.min(100, potential)
  }

  return {
    shouldShowPrompt,
    promptCount,
    recordPromptShown,
    dismissPrompt,
    getPromptPriority,
    getMissingVerifications,
    getPotentialTrustScore,
    weeklyPromptsRemaining: Math.max(0, finalConfig.maxPromptsPerWeek - promptCount)
  }
}