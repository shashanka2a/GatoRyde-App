'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Card, CardContent } from '@/src/components/ui/card'
import { LocationAutocomplete } from '@/src/components/rides/LocationAutocomplete'
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Loader2,
  ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { Location } from '@/lib/maps/mapbox'

export interface RideSearchParams {
  origin: Location | null
  destination: Location | null
  dateFrom: string
  dateTo: string
  seatsNeeded: number
}

interface RideSearchFormProps {
  onSearch: (params: RideSearchParams) => void
  isLoading?: boolean
  initialParams?: Partial<RideSearchParams>
}

export function RideSearchForm({ onSearch, isLoading = false, initialParams }: RideSearchFormProps) {
  const [searchParams, setSearchParams] = useState<RideSearchParams>({
    origin: null,
    destination: null,
    dateFrom: '',
    dateTo: '',
    seatsNeeded: 1,
    ...initialParams
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Set default date range (today to 7 days from now)
  useEffect(() => {
    if (!searchParams.dateFrom && !searchParams.dateTo) {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      setSearchParams(prev => ({
        ...prev,
        dateFrom: today.toISOString().slice(0, 16),
        dateTo: nextWeek.toISOString().slice(0, 16)
      }))
    }
  }, [searchParams.dateFrom, searchParams.dateTo])

  const handleLocationChange = (field: 'origin' | 'destination') => (location: Location | null) => {
    setSearchParams(prev => ({ ...prev, [field]: location }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleInputChange = (field: keyof RideSearchParams) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setSearchParams(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!searchParams.origin) {
      newErrors.origin = 'Origin is required'
    }

    if (!searchParams.destination) {
      newErrors.destination = 'Destination is required'
    }

    if (searchParams.dateFrom && searchParams.dateTo) {
      const fromDate = new Date(searchParams.dateFrom)
      const toDate = new Date(searchParams.dateTo)
      const now = new Date()

      if (fromDate < now) {
        newErrors.dateFrom = 'Start date cannot be in the past'
      }

      if (toDate <= fromDate) {
        newErrors.dateTo = 'End date must be after start date'
      }
    }

    if (searchParams.seatsNeeded < 1 || searchParams.seatsNeeded > 8) {
      newErrors.seatsNeeded = 'Seats needed must be between 1 and 8'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onSearch(searchParams)
  }

  const handleSwapLocations = () => {
    setSearchParams(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }))
  }

  return (
    <div className="bg-white rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Fields */}
        <div className="space-y-3">
          <div className="relative">
            <LocationAutocomplete
              label="From"
              placeholder="Where are you starting from?"
              value={searchParams.origin}
              onChange={handleLocationChange('origin')}
              error={errors.origin}
              required
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <motion.button
              type="button"
              onClick={handleSwapLocations}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowRight className="w-4 h-4 text-gray-600 rotate-90" />
            </motion.button>
          </div>

          <div className="relative">
            <LocationAutocomplete
              label="To"
              placeholder="Where do you want to go?"
              value={searchParams.destination}
              onChange={handleLocationChange('destination')}
              error={errors.destination}
              required
            />
          </div>
        </div>

        {/* Date Range - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateFrom" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Earliest Departure
            </Label>
            <Input
              id="dateFrom"
              type="datetime-local"
              value={searchParams.dateFrom}
              onChange={handleInputChange('dateFrom')}
              className={errors.dateFrom ? 'border-red-500' : ''}
            />
            {errors.dateFrom && (
              <p className="text-sm text-red-600">{errors.dateFrom}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateTo" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Latest Departure
            </Label>
            <Input
              id="dateTo"
              type="datetime-local"
              value={searchParams.dateTo}
              onChange={handleInputChange('dateTo')}
              className={errors.dateTo ? 'border-red-500' : ''}
            />
            {errors.dateTo && (
              <p className="text-sm text-red-600">{errors.dateTo}</p>
            )}
          </div>
        </div>

        {/* Seats Needed */}
        <div className="space-y-2">
          <Label htmlFor="seatsNeeded" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Seats Needed
          </Label>
          <Input
            id="seatsNeeded"
            type="number"
            min="1"
            max="8"
            value={searchParams.seatsNeeded}
            onChange={handleInputChange('seatsNeeded')}
            className={errors.seatsNeeded ? 'border-red-500' : ''}
          />
          {errors.seatsNeeded && (
            <p className="text-sm text-red-600">{errors.seatsNeeded}</p>
          )}
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={isLoading || !searchParams.origin || !searchParams.destination}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search Rides
            </>
          )}
        </Button>
      </form>
    </div>
  )
}