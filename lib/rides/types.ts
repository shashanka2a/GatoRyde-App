import { z } from 'zod'

// Location schema
export const LocationSchema = z.object({
  text: z.string().min(1, 'Location is required'),
  placeName: z.string().min(1, 'Place name is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

// Ride creation schema
export const CreateRideSchema = z.object({
  origin: LocationSchema,
  destination: LocationSchema,
  departAt: z.string().refine((date) => {
    const departDate = new Date(date)
    const now = new Date()
    const maxFuture = new Date()
    maxFuture.setMonth(maxFuture.getMonth() + 3) // Max 3 months in future
    
    return departDate > now && departDate <= maxFuture
  }, 'Departure time must be in the future and within 3 months'),
  seatsTotal: z.number().min(1, 'Must offer at least 1 seat').max(8, 'Cannot offer more than 8 seats'),
  totalTripCostCents: z.number().min(0, 'Trip cost cannot be negative').max(50000, 'Trip cost cannot exceed $500'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
})

// Ride search schema
export const SearchRidesSchema = z.object({
  origin: LocationSchema.optional(),
  destination: LocationSchema.optional(),
  originRadius: z.number().min(1).max(50).default(10), // km
  destinationRadius: z.number().min(1).max(50).default(10), // km
  departAfter: z.string().optional(),
  departBefore: z.string().optional(),
  maxCostPerPerson: z.number().min(0).optional(), // Max cost per person (total/riders)
  minSeats: z.number().min(1).max(8).default(1),
})

// Ride with driver info for display
export const RideWithDriverSchema = z.object({
  id: z.string(),
  originText: z.string(),
  originLat: z.number(),
  originLng: z.number(),
  destText: z.string(),
  destLat: z.number(),
  destLng: z.number(),
  departAt: z.date(),
  seatsTotal: z.number(),
  seatsAvailable: z.number(),
  totalTripCostCents: z.number(),
  status: z.enum(['open', 'full', 'in_progress', 'completed', 'cancelled']),
  polyline: z.string().nullable(),
  notes: z.string().nullable(),
  driver: z.object({
    userId: z.string(),
    verified: z.boolean(),
    offeredSeats: z.number(),
    zelleHandle: z.string().nullable(),
    cashAppHandle: z.string().nullable(),
    venmoHandle: z.string().nullable(),
    paymentQrUrl: z.string().nullable(),
    user: z.object({
      id: z.string(),
      name: z.string().nullable(),
      photoUrl: z.string().nullable(),
      ratingAvg: z.number().nullable(),
      ratingCount: z.number(),
    }),
    vehicle: z.object({
      make: z.string(),
      model: z.string(),
      year: z.number(),
      color: z.string(),
      seats: z.number(),
    }).nullable(),
  }),
})

// Type exports
export type LocationData = z.infer<typeof LocationSchema>
export type CreateRideRequest = z.infer<typeof CreateRideSchema>
export type SearchRidesRequest = z.infer<typeof SearchRidesSchema>
export type RideWithDriver = z.infer<typeof RideWithDriverSchema>

// Utility interfaces
export interface RideFormData {
  origin: LocationData | null
  destination: LocationData | null
  departAt: string
  seatsTotal: number
  totalTripCostCents: number
  notes?: string
}

export interface SearchFilters {
  origin?: LocationData
  destination?: LocationData
  originRadius: number
  destinationRadius: number
  departAfter?: string
  departBefore?: string
  maxCostPerPerson?: number
  minSeats: number
}

// Contact tracking
export interface ContactRideRequest {
  rideId: string
  method: 'sms' | 'email'
  seatsRequested: number
}

export interface RideSearchResult {
  rides: RideWithDriver[]
  total: number
  hasMore: boolean
}

// Distance calculation utilities
export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Price formatting
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// Calculate cost per person based on current riders
export function calculateCostPerPerson(totalCostCents: number, seatsTotal: number, seatsAvailable: number): number {
  const ridersCount = seatsTotal - seatsAvailable + 1 // +1 for driver
  return Math.ceil(totalCostCents / ridersCount)
}

// Validate seat constraints
export function validateSeatConstraints(
  requestedSeats: number,
  vehicleSeats: number,
  driverOfferedSeats: number
): { isValid: boolean; maxAllowed: number; error?: string } {
  const maxAllowed = Math.min(vehicleSeats - 1, driverOfferedSeats) // -1 for driver seat
  
  if (requestedSeats > maxAllowed) {
    return {
      isValid: false,
      maxAllowed,
      error: `Cannot offer more than ${maxAllowed} seats (vehicle capacity: ${vehicleSeats}, driver offers: ${driverOfferedSeats})`
    }
  }
  
  return { isValid: true, maxAllowed }
}

// Time formatting
export function formatDepartureTime(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`
  } else if (diffDays === 1) {
    return `Tomorrow at ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }
}

// Ride status utilities
export function getRideStatusColor(status: string): string {
  switch (status) {
    case 'open': return 'green'
    case 'full': return 'yellow'
    case 'in_progress': return 'blue'
    case 'completed': return 'gray'
    case 'cancelled': return 'red'
    default: return 'gray'
  }
}

export function getRideStatusText(status: string): string {
  switch (status) {
    case 'open': return 'Available'
    case 'full': return 'Full'
    case 'in_progress': return 'In Progress'
    case 'completed': return 'Completed'
    case 'cancelled': return 'Cancelled'
    default: return 'Unknown'
  }
}

// Validation helpers
export function isValidTimeZone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

export function convertToUserTimezone(date: Date, timezone: string): Date {
  if (!isValidTimeZone(timezone)) {
    return date
  }
  
  try {
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
    const targetTime = new Date(utcTime + (getTimezoneOffset(timezone) * 60000))
    return targetTime
  } catch {
    return date
  }
}

function getTimezoneOffset(timezone: string): number {
  const now = new Date()
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
  const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
  return (utc.getTime() - target.getTime()) / 60000
}