/**
 * Timezone utilities for Rydify
 * 
 * This module provides utilities for handling dates and times consistently
 * across the application. All dates should be stored in UTC and displayed
 * in the user's local timezone.
 */

/**
 * Get the user's current timezone
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC' // Fallback to UTC
  }
}

/**
 * Check if a timezone string is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

/**
 * Format a date for display in the user's timezone
 */
export function formatDateTimeInTimezone(
  date: Date, 
  timezone?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const tz = timezone || getUserTimezone()
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: tz
  }

  return new Intl.DateTimeFormat('en-US', {
    ...defaultOptions,
    ...options
  }).format(date)
}

/**
 * Format a date for display (date only)
 */
export function formatDateInTimezone(
  date: Date,
  timezone?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const tz = timezone || getUserTimezone()
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: tz
  }

  return new Intl.DateTimeFormat('en-US', {
    ...defaultOptions,
    ...options
  }).format(date)
}

/**
 * Format a time for display (time only)
 */
export function formatTimeInTimezone(
  date: Date,
  timezone?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const tz = timezone || getUserTimezone()
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: tz
  }

  return new Intl.DateTimeFormat('en-US', {
    ...defaultOptions,
    ...options
  }).format(date)
}

/**
 * Format departure time with relative context (Today, Tomorrow, etc.)
 */
export function formatDepartureTime(date: Date, timezone?: string): string {
  const tz = timezone || getUserTimezone()
  const now = new Date()
  
  // Calculate difference in days in the user's timezone
  const nowInTz = new Date(now.toLocaleString('en-US', { timeZone: tz }))
  const dateInTz = new Date(date.toLocaleString('en-US', { timeZone: tz }))
  
  const diffTime = dateInTz.getTime() - nowInTz.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  const timeString = formatTimeInTimezone(date, tz)
  
  if (diffDays === 0) {
    return `Today at ${timeString}`
  } else if (diffDays === 1) {
    return `Tomorrow at ${timeString}`
  } else if (diffDays < 7) {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: tz
    }).format(date)
  } else {
    return formatDateTimeInTimezone(date, tz, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }
}

/**
 * Convert a date string to UTC Date object
 * This should be used when receiving date input from users
 */
export function parseToUTC(dateString: string, timezone?: string): Date {
  const tz = timezone || getUserTimezone()
  
  try {
    // If the date string already has timezone info, use it directly
    if (dateString.includes('T') && (dateString.includes('+') || dateString.includes('Z'))) {
      return new Date(dateString)
    }
    
    // Otherwise, assume it's in the user's timezone and convert to UTC
    const localDate = new Date(dateString)
    const utcTime = localDate.getTime() - (localDate.getTimezoneOffset() * 60000)
    
    return new Date(utcTime)
  } catch {
    return new Date(dateString) // Fallback to basic parsing
  }
}

/**
 * Get timezone offset in minutes for a given timezone
 */
export function getTimezoneOffset(timezone: string): number {
  try {
    const now = new Date()
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
    
    return (utc.getTime() - target.getTime()) / 60000
  } catch {
    return 0
  }
}

/**
 * Check if a date is in the past (in user's timezone)
 */
export function isDateInPast(date: Date, timezone?: string): boolean {
  const tz = timezone || getUserTimezone()
  const now = new Date()
  
  const nowInTz = new Date(now.toLocaleString('en-US', { timeZone: tz }))
  const dateInTz = new Date(date.toLocaleString('en-US', { timeZone: tz }))
  
  return dateInTz < nowInTz
}

/**
 * Get hours until a date (in user's timezone)
 */
export function getHoursUntil(date: Date, timezone?: string): number {
  const tz = timezone || getUserTimezone()
  const now = new Date()
  
  const nowInTz = new Date(now.toLocaleString('en-US', { timeZone: tz }))
  const dateInTz = new Date(date.toLocaleString('en-US', { timeZone: tz }))
  
  return (dateInTz.getTime() - nowInTz.getTime()) / (1000 * 60 * 60)
}