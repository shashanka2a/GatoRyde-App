'use client'

import { useState, useEffect, useRef } from 'react'
import { MapboxService, type Location } from '@/lib/maps/mapbox'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { MapPin, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LocationAutocompleteProps {
  label: string
  placeholder: string
  value: Location | null
  onChange: (location: Location | null) => void
  error?: string
  required?: boolean
  className?: string
}

export function LocationAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value?.placeName || '')
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle input changes with debouncing
  useEffect(() => {
    if (!query.trim() || query === value?.placeName) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await MapboxService.searchPlaces(query)
        setSuggestions(results)
        setIsOpen(results.length > 0)
      } catch (error) {
        console.error('Location search error:', error)
        setSuggestions([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, value?.placeName])

  // Handle clicks outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    
    // Clear selection if user is typing something different
    if (value && newQuery !== value.placeName) {
      onChange(null)
    }
  }

  const handleSelectLocation = (location: Location) => {
    setQuery(location.placeName)
    onChange({
      id: location.id,
      text: location.text,
      placeName: location.placeName,
      center: location.center,
      bbox: location.bbox,
    })
    setIsOpen(false)
    setSuggestions([])
  }

  const handleClear = () => {
    setQuery('')
    onChange(null)
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className={cn('space-y-2', className)} ref={containerRef}>
      <Label htmlFor={`location-${label}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            ref={inputRef}
            id={`location-${label}`}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setIsOpen(true)
              }
            }}
            placeholder={placeholder}
            className={cn(
              'pl-10 pr-10',
              error ? 'border-red-500' : '',
              value ? 'border-green-500' : ''
            )}
            required={required}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              ×
            </Button>
          )}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Suggestions dropdown */}
        {isOpen && suggestions.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
            <CardContent className="p-0">
              {suggestions.map((location, index) => (
                <button
                  key={`${location.id}-${index}`}
                  type="button"
                  onClick={() => handleSelectLocation(location)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">
                        {location.text}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {location.placeName}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* No results message */}
        {isOpen && !isLoading && suggestions.length === 0 && query.trim() && (
          <Card className="absolute z-50 w-full mt-1 shadow-lg">
            <CardContent className="p-4 text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No locations found</p>
              <p className="text-sm">Try a different search term</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected location display */}
      {value && (
        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm">
          <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-green-800 truncate">{value.placeName}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}