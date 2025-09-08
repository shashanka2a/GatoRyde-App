'use client'

import { useState, useEffect } from 'react'
import { MapPin, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { analytics } from '@/lib/analytics'

interface LocationSuggestion {
  id: string
  location: string
  placeName?: string
  lat?: number
  lng?: number
  searchType: 'origin' | 'destination'
  searchCount: number
  lastSearched: string
}

interface SmartLocationSuggestionsProps {
  type: 'origin' | 'destination'
  onLocationSelect: (location: {
    text: string
    placeName: string
    lat: number
    lng: number
  }) => void
  className?: string
}

export default function SmartLocationSuggestions({
  type,
  onLocationSelect,
  className = ''
}: SmartLocationSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPopularLocations()
  }, [type])

  const fetchPopularLocations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/locations/popular?type=${type}&limit=8`)
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(data.locations)
      } else {
        setError('Failed to load suggestions')
      }
    } catch (err) {
      console.error('Error fetching popular locations:', err)
      setError('Failed to load suggestions')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationClick = async (suggestion: LocationSuggestion) => {
    // Track analytics
    analytics.useLocationSuggestion(suggestion.location, type)
    
    // Track this location search
    try {
      await fetch('/api/locations/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: suggestion.location,
          placeName: suggestion.placeName,
          lat: suggestion.lat,
          lng: suggestion.lng,
          searchType: type
        })
      })
    } catch (error) {
      console.error('Error tracking location:', error)
    }

    // Call the parent callback
    if (suggestion.lat && suggestion.lng) {
      onLocationSelect({
        text: suggestion.location,
        placeName: suggestion.placeName || suggestion.location,
        lat: suggestion.lat,
        lng: suggestion.lng
      })
    }
  }

  const formatLastSearched = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Loading popular {type}s...</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error || suggestions.length === 0) {
    return null // Don't show anything if there are no suggestions
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <TrendingUp className="h-4 w-4" />
        <span>Popular {type}s</span>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {suggestions.map((suggestion) => (
          <Card 
            key={suggestion.id}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleLocationClick(suggestion)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {suggestion.placeName || suggestion.location}
                    </p>
                    {suggestion.placeName && suggestion.placeName !== suggestion.location && (
                      <p className="text-xs text-muted-foreground truncate">
                        {suggestion.location}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Badge variant="secondary" className="text-xs">
                    {suggestion.searchCount}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatLastSearched(suggestion.lastSearched)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
