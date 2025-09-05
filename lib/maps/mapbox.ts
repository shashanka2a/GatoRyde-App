// Mapbox integration with fallback handling
export interface Location {
  id: string
  text: string
  placeName: string
  center: [number, number] // [lng, lat]
  bbox?: [number, number, number, number]
}

export interface RouteResponse {
  polyline: string
  distance: number // meters
  duration: number // seconds
}

export class MapboxService {
  private static readonly BASE_URL = 'https://api.mapbox.com'
  private static readonly ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  static isAvailable(): boolean {
    return !!this.ACCESS_TOKEN
  }

  static async searchPlaces(query: string, proximity?: [number, number]): Promise<Location[]> {
    if (!this.ACCESS_TOKEN) {
      return this.getFallbackLocations(query)
    }

    try {
      const params = new URLSearchParams({
        access_token: this.ACCESS_TOKEN,
        q: query,
        limit: '5',
        types: 'place,poi,address',
        country: 'US',
      })

      if (proximity) {
        params.append('proximity', `${proximity[0]},${proximity[1]}`)
      }

      const response = await fetch(
        `${this.BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`
      )

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`)
      }

      const data = await response.json()
      
      return data.features.map((feature: any) => ({
        id: feature.id,
        text: feature.text,
        placeName: feature.place_name,
        center: feature.center,
        bbox: feature.bbox,
      }))
    } catch (error) {
      console.error('Mapbox search error:', error)
      return this.getFallbackLocations(query)
    }
  }

  static async getRoute(
    origin: [number, number], 
    destination: [number, number]
  ): Promise<RouteResponse | null> {
    if (!this.ACCESS_TOKEN) {
      return this.getFallbackRoute(origin, destination)
    }

    try {
      const coordinates = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`
      const params = new URLSearchParams({
        access_token: this.ACCESS_TOKEN,
        geometries: 'polyline',
        overview: 'full',
      })

      const response = await fetch(
        `${this.BASE_URL}/directions/v5/mapbox/driving/${coordinates}?${params}`
      )

      if (!response.ok) {
        throw new Error(`Mapbox Directions API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.routes || data.routes.length === 0) {
        return null
      }

      const route = data.routes[0]
      return {
        polyline: route.geometry,
        distance: route.distance,
        duration: route.duration,
      }
    } catch (error) {
      console.error('Mapbox route error:', error)
      return this.getFallbackRoute(origin, destination)
    }
  }

  static async geocodeLocation(placeName: string): Promise<Location | null> {
    if (!this.ACCESS_TOKEN) {
      return this.getFallbackGeocode(placeName)
    }

    try {
      const params = new URLSearchParams({
        access_token: this.ACCESS_TOKEN,
        limit: '1',
      })

      const response = await fetch(
        `${this.BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(placeName)}.json?${params}`
      )

      if (!response.ok) {
        throw new Error(`Mapbox Geocoding API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.features || data.features.length === 0) {
        return null
      }

      const feature = data.features[0]
      return {
        id: feature.id,
        text: feature.text,
        placeName: feature.place_name,
        center: feature.center,
        bbox: feature.bbox,
      }
    } catch (error) {
      console.error('Mapbox geocode error:', error)
      return this.getFallbackGeocode(placeName)
    }
  }

  // Fallback methods when Mapbox is not available
  private static getFallbackLocations(query: string): Location[] {
    const commonLocations: Location[] = [
      {
        id: 'uf-campus',
        text: 'University of Florida',
        placeName: 'University of Florida, Gainesville, FL',
        center: [-82.3549, 29.6436],
      },
      {
        id: 'gainesville-mall',
        text: 'Oaks Mall',
        placeName: 'Oaks Mall, Gainesville, FL',
        center: [-82.3707, 29.6516],
      },
      {
        id: 'downtown-gainesville',
        text: 'Downtown Gainesville',
        placeName: 'Downtown Gainesville, FL',
        center: [-82.3248, 29.6516],
      },
      {
        id: 'shands-hospital',
        text: 'UF Health Shands Hospital',
        placeName: 'UF Health Shands Hospital, Gainesville, FL',
        center: [-82.3440, 29.6436],
      },
      {
        id: 'gainesville-airport',
        text: 'Gainesville Regional Airport',
        placeName: 'Gainesville Regional Airport, Gainesville, FL',
        center: [-82.2719, 29.6900],
      },
      {
        id: 'butler-plaza',
        text: 'Butler Plaza',
        placeName: 'Butler Plaza, Gainesville, FL',
        center: [-82.4126, 29.6219],
      },
      {
        id: 'midtown-gainesville',
        text: 'Midtown Gainesville',
        placeName: 'Midtown, Gainesville, FL',
        center: [-82.3440, 29.6516],
      },
      {
        id: 'santa-fe-college',
        text: 'Santa Fe College',
        placeName: 'Santa Fe College, Gainesville, FL',
        center: [-82.4126, 29.6436],
      },
    ]

    const lowerQuery = query.toLowerCase()
    return commonLocations.filter(location => 
      location.text.toLowerCase().includes(lowerQuery) ||
      location.placeName.toLowerCase().includes(lowerQuery)
    )
  }

  private static getFallbackRoute(
    origin: [number, number], 
    destination: [number, number]
  ): RouteResponse {
    // Simple straight-line distance calculation
    const distance = this.calculateDistance(origin, destination)
    const duration = Math.round(distance / 1000 * 60) // Rough estimate: 1 km per minute
    
    // Simple polyline encoding (just the two points)
    const polyline = this.encodePolyline([
      [origin[1], origin[0]], // polyline expects [lat, lng]
      [destination[1], destination[0]]
    ])

    return {
      polyline,
      distance: Math.round(distance),
      duration,
    }
  }

  private static getFallbackGeocode(placeName: string): Location | null {
    const fallbackLocations = this.getFallbackLocations(placeName)
    return fallbackLocations.length > 0 ? fallbackLocations[0] : null
  }

  private static calculateDistance(
    coord1: [number, number], 
    coord2: [number, number]
  ): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = coord1[1] * Math.PI / 180
    const φ2 = coord2[1] * Math.PI / 180
    const Δφ = (coord2[1] - coord1[1]) * Math.PI / 180
    const Δλ = (coord2[0] - coord1[0]) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  private static encodePolyline(coordinates: [number, number][]): string {
    // Simple polyline encoding implementation
    let encoded = ''
    let prevLat = 0
    let prevLng = 0

    for (const [lat, lng] of coordinates) {
      const lat5 = Math.round(lat * 1e5)
      const lng5 = Math.round(lng * 1e5)
      
      const dLat = lat5 - prevLat
      const dLng = lng5 - prevLng
      
      encoded += this.encodeSignedNumber(dLat)
      encoded += this.encodeSignedNumber(dLng)
      
      prevLat = lat5
      prevLng = lng5
    }

    return encoded
  }

  private static encodeSignedNumber(num: number): string {
    let sgn_num = num << 1
    if (num < 0) {
      sgn_num = ~sgn_num
    }
    return this.encodeNumber(sgn_num)
  }

  private static encodeNumber(num: number): string {
    let encoded = ''
    while (num >= 0x20) {
      encoded += String.fromCharCode((0x20 | (num & 0x1f)) + 63)
      num >>= 5
    }
    encoded += String.fromCharCode(num + 63)
    return encoded
  }
}