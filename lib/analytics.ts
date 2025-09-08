import { track } from '@vercel/analytics'

// Custom analytics events for GatoRyde app
export const analytics = {
  // Authentication events
  loginAttempt: (method: 'email' | 'otp') => {
    track('login_attempt', { method })
  },
  
  loginSuccess: (method: 'email' | 'otp') => {
    track('login_success', { method })
  },
  
  logout: () => {
    track('logout')
  },

  // Ride-related events
  searchRides: (filters: {
    origin?: string
    destination?: string
    date?: string
    seats?: number
    universityScope?: string
  }) => {
    track('search_rides', filters)
  },

  createRide: (rideData: {
    origin: string
    destination: string
    seats: number
    cost: number
  }) => {
    track('create_ride', rideData)
  },

  bookRide: (rideId: string, seats: number) => {
    track('book_ride', { rideId, seats })
  },

  // Ride request events
  createRideRequest: (requestData: {
    origin: string
    destination: string
    seats: number
    maxCost: number
  }) => {
    track('create_ride_request', requestData)
  },

  searchRideRequests: (filters: {
    origin?: string
    destination?: string
    date?: string
  }) => {
    track('search_ride_requests', filters)
  },

  // Location events
  useLocationSuggestion: (location: string, type: 'origin' | 'destination') => {
    track('use_location_suggestion', { location, type })
  },

  searchLocation: (query: string, type: 'origin' | 'destination') => {
    track('search_location', { query, type })
  },

  // Driver events
  becomeDriver: () => {
    track('become_driver')
  },

  completeDriverVerification: () => {
    track('complete_driver_verification')
  },

  // Contact events
  contactDriver: (rideId: string, method: 'message' | 'call') => {
    track('contact_driver', { rideId, method })
  },

  contactRider: (requestId: string, method: 'message' | 'call') => {
    track('contact_rider', { requestId, method })
  },

  // Navigation events
  pageView: (page: string) => {
    track('page_view', { page })
  },

  // Error events
  error: (error: string, context?: string) => {
    track('error', { error, context })
  },

  // Feature usage
  useFeature: (feature: string, context?: Record<string, any>) => {
    track('use_feature', { feature, ...context })
  }
}

// Helper function to track page views
export const trackPageView = (pageName: string) => {
  if (typeof window !== 'undefined') {
    analytics.pageView(pageName)
  }
}

// Helper function to track errors
export const trackError = (error: Error, context?: string) => {
  analytics.error(error.message, context)
}
