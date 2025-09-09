// Safe analytics wrapper that handles missing Vercel Analytics
const safeTrack = (event: string, properties?: Record<string, any>) => {
  try {
    // Only import and use analytics in browser environment
    if (typeof window !== 'undefined') {
      import('@vercel/analytics').then(({ track }) => {
        track(event, properties)
      }).catch(() => {
        // Silently fail if analytics is not available
        console.debug('Analytics not available:', event, properties)
      })
    }
  } catch (error) {
    // Silently fail if analytics fails
    console.debug('Analytics error:', error)
  }
}

// Custom analytics events for GatoRyde app
export const analytics = {
  // Authentication events
  loginAttempt: (method: 'email' | 'otp') => {
    safeTrack('login_attempt', { method })
  },
  
  loginSuccess: (method: 'email' | 'otp') => {
    safeTrack('login_success', { method })
  },
  
  logout: () => {
    safeTrack('logout')
  },

  // Ride-related events
  searchRides: (filters: {
    origin?: string
    destination?: string
    date?: string
    seats?: number
    universityScope?: string
  }) => {
    safeTrack('search_rides', filters)
  },

  createRide: (rideData: {
    origin: string
    destination: string
    seats: number
    cost: number
  }) => {
    safeTrack('create_ride', rideData)
  },

  bookRide: (rideId: string, seats: number) => {
    safeTrack('book_ride', { rideId, seats })
  },

  // Ride request events
  createRideRequest: (requestData: {
    origin: string
    destination: string
    seats: number
    maxCost: number
  }) => {
    safeTrack('create_ride_request', requestData)
  },

  searchRideRequests: (filters: {
    origin?: string
    destination?: string
    date?: string
  }) => {
    safeTrack('search_ride_requests', filters)
  },

  // Location events
  useLocationSuggestion: (location: string, type: 'origin' | 'destination') => {
    safeTrack('use_location_suggestion', { location, type })
  },

  searchLocation: (query: string, type: 'origin' | 'destination') => {
    safeTrack('search_location', { query, type })
  },

  // Driver events
  becomeDriver: () => {
    safeTrack('become_driver')
  },

  completeDriverVerification: () => {
    safeTrack('complete_driver_verification')
  },

  // Contact events
  contactDriver: (rideId: string, method: 'message' | 'call') => {
    safeTrack('contact_driver', { rideId, method })
  },

  contactRider: (requestId: string, method: 'message' | 'call') => {
    safeTrack('contact_rider', { requestId, method })
  },

  // Navigation events
  pageView: (page: string) => {
    safeTrack('page_view', { page })
  },

  // Error events
  error: (error: string, context?: string) => {
    safeTrack('error', { error, context })
  },

  // Feature usage
  useFeature: (feature: string, context?: Record<string, any>) => {
    safeTrack('use_feature', { feature, ...context })
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
