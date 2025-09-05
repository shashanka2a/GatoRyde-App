import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals'
import { MapboxService } from '../../lib/maps/mapbox'

// Mock fetch
global.fetch = jest.fn()

describe('MapboxService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('isAvailable', () => {
    it('should return true when access token is available', () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'pk.test123'
      
      expect(MapboxService.isAvailable()).toBe(true)
      
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })

    it('should return false when access token is missing', () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      delete process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      
      expect(MapboxService.isAvailable()).toBe(false)
      
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })
  })

  describe('searchPlaces', () => {
    it('should search places successfully with Mapbox API', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'pk.test123'

      const mockResponse = {
        features: [
          {
            id: 'place.123',
            text: 'University of Florida',
            place_name: 'University of Florida, Gainesville, FL',
            center: [-82.3549, 29.6436],
            bbox: [-82.4, 29.6, -82.3, 29.7]
          }
        ]
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const results = await MapboxService.searchPlaces('University of Florida')

      expect(results).toEqual([
        {
          id: 'place.123',
          text: 'University of Florida',
          placeName: 'University of Florida, Gainesville, FL',
          center: [-82.3549, 29.6436],
          bbox: [-82.4, 29.6, -82.3, 29.7]
        }
      ])

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.mapbox.com/geocoding/v5/mapbox.places/University%20of%20Florida.json')
      )

      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })

    it('should handle API errors gracefully', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'pk.test123'

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401
      })

      const results = await MapboxService.searchPlaces('test')

      // Should fallback to static locations
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThanOrEqual(0)

      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })

    it('should use fallback locations when API is unavailable', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      delete process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

      const results = await MapboxService.searchPlaces('University')

      expect(Array.isArray(results)).toBe(true)
      expect(results.some(r => r.text.includes('University'))).toBe(true)

      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })

    it('should filter fallback locations by query', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      delete process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

      const results = await MapboxService.searchPlaces('Mall')

      expect(results.every(r => 
        r.text.toLowerCase().includes('mall') || 
        r.placeName.toLowerCase().includes('mall')
      )).toBe(true)

      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })
  })

  describe('getRoute', () => {
    it('should get route successfully with Mapbox API', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'pk.test123'

      const mockResponse = {
        routes: [
          {
            geometry: 'encoded_polyline_string',
            distance: 5000,
            duration: 600
          }
        ]
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await MapboxService.getRoute(
        [-82.3549, 29.6436],
        [-82.3707, 29.6516]
      )

      expect(result).toEqual({
        polyline: 'encoded_polyline_string',
        distance: 5000,
        duration: 600
      })

      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })

    it('should handle no routes found', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'pk.test123'

      const mockResponse = { routes: [] }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await MapboxService.getRoute(
        [-82.3549, 29.6436],
        [-82.3707, 29.6516]
      )

      expect(result).toBeNull()

      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })

    it('should use fallback route calculation when API unavailable', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      delete process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

      const result = await MapboxService.getRoute(
        [-82.3549, 29.6436],
        [-82.3707, 29.6516]
      )

      expect(result).toBeDefined()
      expect(result?.polyline).toBeDefined()
      expect(result?.distance).toBeGreaterThan(0)
      expect(result?.duration).toBeGreaterThan(0)

      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })
  })

  describe('geocodeLocation', () => {
    it('should geocode location successfully', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'pk.test123'

      const mockResponse = {
        features: [
          {
            id: 'place.123',
            text: 'Gainesville',
            place_name: 'Gainesville, FL',
            center: [-82.3248, 29.6516]
          }
        ]
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await MapboxService.geocodeLocation('Gainesville, FL')

      expect(result).toEqual({
        id: 'place.123',
        text: 'Gainesville',
        placeName: 'Gainesville, FL',
        center: [-82.3248, 29.6516]
      })

      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })

    it('should return null when location not found', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'pk.test123'

      const mockResponse = { features: [] }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await MapboxService.geocodeLocation('NonexistentPlace')

      expect(result).toBeNull()

      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })

    it('should use fallback geocoding when API unavailable', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      delete process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

      const result = await MapboxService.geocodeLocation('University of Florida')

      expect(result).toBeDefined()
      expect(result?.text).toContain('University')

      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })
  })

  describe('Fallback functionality', () => {
    it('should provide common Gainesville locations', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      delete process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

      const results = await MapboxService.searchPlaces('')

      expect(results.length).toBeGreaterThan(0)
      expect(results.some(r => r.text.includes('University of Florida'))).toBe(true)
      expect(results.some(r => r.text.includes('Gainesville'))).toBe(true)

      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })

    it('should calculate straight-line distance correctly', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      delete process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

      // Test with known coordinates (UF to Oaks Mall)
      const result = await MapboxService.getRoute(
        [-82.3549, 29.6436], // UF
        [-82.3707, 29.6516]  // Oaks Mall
      )

      expect(result?.distance).toBeGreaterThan(1000) // Should be > 1km
      expect(result?.distance).toBeLessThan(5000)    // Should be < 5km
      expect(result?.duration).toBeGreaterThan(0)

      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })
  })

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'pk.test123'

      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const results = await MapboxService.searchPlaces('test')

      // Should fallback to static locations
      expect(Array.isArray(results)).toBe(true)

      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })

    it('should handle malformed API responses', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'pk.test123'

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' })
      })

      const results = await MapboxService.searchPlaces('test')

      // Should handle gracefully and return empty array or fallback
      expect(Array.isArray(results)).toBe(true)

      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = originalEnv
    })
  })
})