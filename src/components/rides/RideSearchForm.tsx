'use client'

import { useState, useEffect } from 'react'
import { lazy, Suspense, useState as useLocationState } from 'react'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Card, CardContent } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Search, MapPin, Clock, DollarSign, Users, Filter, Car, MessageSquare, Plus, Minus, Calendar, GraduationCap } from 'lucide-react'

// Lazy load heavy components
const LocationAutocomplete = lazy(() => import('./LocationAutocomplete').then(m => ({ default: m.LocationAutocomplete })))
const Slider = lazy(() => import('@/src/components/ui/slider').then(m => ({ default: m.Slider })))
const DatePicker = lazy(() => import('@/src/components/ui/date-picker').then(m => ({ default: m.DatePicker })))
import type { Location } from '@/lib/maps/mapbox'
import type { SearchFilters, UniversityScope } from '@/lib/rides/types'
import { getAvailableScopeOptions, getDefaultUniversityScope, getFilterScopeDescription } from '@/lib/rides/university-filter'

interface RideSearchFormProps {
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
  className?: string
  searchType?: 'drivers' | 'requests'
  onSearchTypeChange?: (type: 'drivers' | 'requests') => void
  userEmail?: string // For university filtering
}

export function RideSearchForm({ 
  onSearch, 
  isLoading = false, 
  className,
  searchType = 'drivers',
  onSearchTypeChange,
  userEmail = 'user@ufl.edu' // Default for demo
}: RideSearchFormProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    origin: undefined,
    destination: undefined,
    originRadius: 10,
    destinationRadius: 10,
    departAfter: '',
    departBefore: '',
    maxCostPerPerson: undefined,
    minSeats: 1,
    universityScope: getDefaultUniversityScope(userEmail),
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isRoundTrip, setIsRoundTrip] = useState(false)



  // Set default departure time (now)
  useEffect(() => {
    const now = new Date()
    const isoString = now.toISOString().slice(0, 16)
    setFilters(prev => ({ ...prev, departAfter: isoString }))
  }, [])

  // Get date chips for quick selection
  const getDateChips = () => {
    const today = new Date()
    const chips = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      chips.push({
        date: date.toISOString().slice(0, 16),
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        shortLabel: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
      })
    }
    return chips
  }

  const handleLocationChange = (field: 'origin' | 'destination') => (location: Location | null) => {
    setFilters(prev => ({
      ...prev,
      [field]: location ? {
        text: location.text,
        placeName: location.placeName,
        lat: location.center[1],
        lng: location.center[0],
      } : undefined
    }))
  }

  const handleInputChange = (field: keyof SearchFilters) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setFilters(prev => ({ ...prev, [field]: value || undefined }))
  }

  const handleSliderChange = (field: keyof SearchFilters) => (value: number[]) => {
    setFilters(prev => ({ ...prev, [field]: value[0] }))
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dollars = parseFloat(e.target.value) || undefined
    const cents = dollars ? Math.round(dollars * 100) : undefined
    setFilters(prev => ({ ...prev, maxCostPerPerson: cents }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const searchFilters = { ...filters }
    
    onSearch(searchFilters)
  }

  const handleClearFilters = () => {
    const now = new Date()
    const isoString = now.toISOString().slice(0, 16)
    
    setFilters({
      origin: undefined,
      destination: undefined,
      originRadius: 10,
      destinationRadius: 10,
      departAfter: isoString,
      departBefore: '',
      maxCostPerPerson: undefined,
      minSeats: 1,
      universityScope: getDefaultUniversityScope(userEmail),
    })
  }

  const getActiveFiltersCount = (): number => {
    let count = 0
    if (filters.origin) count++
    if (filters.destination) count++
    if (filters.maxCostPerPerson) count++
    if (filters.minSeats > 1) count++
    if (filters.departBefore) count++
    if (filters.originRadius !== 10) count++
    if (filters.destinationRadius !== 10) count++
    return count
  }

  return (
    <Card className={`shadow-lg border-0 bg-white ${className}`}>
      <CardContent className="p-6">
        {/* Search Type Toggle */}
        <Tabs 
          value={searchType} 
          onValueChange={(value) => onSearchTypeChange?.(value as 'drivers' | 'requests')}
          className="mb-6"
        >
          <TabsList 
            className="grid w-full grid-cols-2 bg-gray-100"
            role="tablist"
            aria-label="Search type selection"
          >
            <TabsTrigger 
              value="drivers" 
              className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              role="tab"
              aria-selected={searchType === 'drivers'}
            >
              <Car className="w-4 h-4" />
              Drivers
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="flex items-center gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              role="tab"
              aria-selected={searchType === 'requests'}
            >
              <MessageSquare className="w-4 h-4" />
              Requests
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSearch} className="space-y-8">
          {/* University Scope Selector */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-teal-600" />
              Who can you ride with?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {getAvailableScopeOptions(userEmail).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, universityScope: option.value }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    filters.universityScope === option.value
                      ? 'border-teal-500 bg-teal-50 text-teal-900'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/50'
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Basic Search */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              Where are you going?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useSimpleInputs ? (
              <>
                <SimpleLocationInput
                  label="From"
                  placeholder="Pickup location (optional)"
                  value={simpleOrigin}
                  onChange={setSimpleOrigin}
                />
                <SimpleLocationInput
                  label="To"
                  placeholder="Destination (optional)"
                  value={simpleDestination}
                  onChange={setSimpleDestination}
                />
              </>
            ) : (
              <>
                <Suspense fallback={
                  <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
                }>
                  <LocationAutocomplete
                    label="From"
                    placeholder="Pickup location (optional)"
                    value={filters.origin ? {
                      id: '',
                      text: filters.origin.text,
                      placeName: filters.origin.placeName,
                      center: [filters.origin.lng, filters.origin.lat],
                    } : null}
                    onChange={handleLocationChange('origin')}
                  />
                </Suspense>

                <Suspense fallback={
                  <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
                }>
                  <LocationAutocomplete
                    label="To"
                    placeholder="Destination (optional)"
                    value={filters.destination ? {
                      id: '',
                      text: filters.destination.text,
                      placeName: filters.destination.placeName,
                      center: [filters.destination.lng, filters.destination.lat],
                    } : null}
                    onChange={handleLocationChange('destination')}
                  />
                </Suspense>
              </>
            )}
            

          </div>
          </div>

          {/* Travel Date */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4" />
                Travel date
                <span className="text-xs text-gray-500 font-normal">(Times in local TZ)</span>
              </Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="round-trip" className="text-sm">Round trip</Label>
                <input
                  id="round-trip"
                  type="checkbox"
                  checked={isRoundTrip}
                  onChange={(e) => setIsRoundTrip(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
              </div>
            </div>
            
            {/* Enhanced Date Chips */}
            <div className="space-y-3">
              <div className="relative overflow-hidden">
                <div className="flex gap-3 overflow-x-auto pb-2 px-2 scrollbar-hide">
                  <div className="flex gap-3 min-w-max">
                  {getDateChips().map((chip) => (
                    <Button
                      key={chip.date}
                      type="button"
                      variant={filters.departAfter.startsWith(chip.date.split('T')[0]) ? "default" : "outline"}
                      size="lg"
                      onClick={() => setFilters(prev => ({ ...prev, departAfter: chip.date }))}
                      className={`min-w-[100px] h-16 flex flex-col items-center justify-center gap-1 transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                        filters.departAfter.startsWith(chip.date.split('T')[0])
                          ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg scale-105" 
                          : "hover:bg-teal-50 hover:border-teal-300 hover:shadow-md"
                      }`}
                    >
                      <span className="text-xs font-medium opacity-90">
                        {chip.date.split('T')[0] === new Date().toISOString().split('T')[0] ? 'Today' : 
                         chip.date.split('T')[0] === new Date(Date.now() + 86400000).toISOString().split('T')[0] ? 'Tomorrow' :
                         new Date(chip.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-sm font-semibold">
                        {new Date(chip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </Button>
                  ))}
                  </div>
                </div>
                {/* Subtle gradient fades that don't cut off content */}
                <div className="absolute left-0 top-0 bottom-2 w-4 bg-gradient-to-r from-white/60 to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-2 w-4 bg-gradient-to-l from-white/60 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Enhanced Custom Date & Time Picker */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Custom Date
                  </Label>
                  <Suspense fallback={
                    <Button variant="outline" className="w-full justify-start text-left font-normal text-muted-foreground h-12">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Pick a date</span>
                    </Button>
                  }>
                    <DatePicker
                      date={filters.departAfter ? new Date(filters.departAfter) : undefined}
                      onDateChange={(date) => {
                        if (date) {
                          const isoString = date.toISOString().slice(0, 16)
                          setFilters(prev => ({ ...prev, departAfter: isoString }))
                        }
                      }}
                      placeholder="Select departure date"
                      className="w-full h-12"
                    />
                  </Suspense>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="departTime" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Departure Time
                  </Label>
                  <Input
                    id="departTime"
                    type="time"
                    value={filters.departAfter ? filters.departAfter.slice(11, 16) : ''}
                    onChange={(e) => {
                      const time = e.target.value
                      if (time && filters.departAfter) {
                        const date = filters.departAfter.slice(0, 10)
                        setFilters(prev => ({ ...prev, departAfter: `${date}T${time}` }))
                      }
                    }}
                    className="w-full h-12 text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Return Date (Progressive Disclosure) */}
            {isRoundTrip && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                <Label htmlFor="returnDate" className="text-sm font-medium">Return date</Label>
                <div className="relative overflow-hidden">
                  <div className="flex gap-2 overflow-x-auto pb-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="flex gap-2 min-w-max">
                      {getDateChips().map((chip) => (
                        <Button
                          key={`return-${chip.date}`}
                          type="button"
                          variant={filters.departBefore?.startsWith(chip.date.split('T')[0]) ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilters(prev => ({ ...prev, departBefore: chip.date }))}
                          className={`whitespace-nowrap transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                            filters.departBefore?.startsWith(chip.date.split('T')[0])
                              ? "bg-teal-600 hover:bg-teal-700 text-white" 
                              : "hover:bg-teal-50 hover:border-teal-300"
                          }`}
                        >
                          <span className="hidden sm:inline">{chip.label}</span>
                          <span className="sm:hidden">{chip.shortLabel}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  {/* Subtle gradient fades that don't cut off content */}
                  <div className="absolute left-0 top-0 bottom-2 w-3 bg-gradient-to-r from-white/50 to-transparent pointer-events-none sm:hidden" />
                  <div className="absolute right-0 top-0 bottom-2 w-3 bg-gradient-to-l from-white/50 to-transparent pointer-events-none sm:hidden" />
                </div>

                {/* Custom Return Date Picker */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Or pick a specific return date</Label>
                    <Suspense fallback={
                      <Button variant="outline" className="w-full justify-start text-left font-normal text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Pick return date</span>
                      </Button>
                    }>
                      <DatePicker
                        date={filters.departBefore ? new Date(filters.departBefore) : undefined}
                        onDateChange={(date) => {
                          if (date) {
                            const isoString = date.toISOString().slice(0, 16)
                            setFilters(prev => ({ ...prev, departBefore: isoString }))
                          }
                        }}
                        placeholder="Select return date"
                        className="w-full"
                      />
                    </Suspense>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="returnTime" className="text-sm font-medium">Return time</Label>
                    <Input
                      id="returnTime"
                      type="time"
                      value={filters.departBefore ? filters.departBefore.slice(11, 16) : ''}
                      onChange={(e) => {
                        const time = e.target.value
                        if (time && filters.departBefore) {
                          const date = filters.departBefore.slice(0, 10)
                          setFilters(prev => ({ ...prev, departBefore: `${date}T${time}` }))
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Advanced Filters Toggle */}
          <div className="flex items-center justify-between py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-3 px-6 py-3 rounded-xl border-2 hover:border-teal-300 transition-all duration-200"
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">More Filters</span>
              {getActiveFiltersCount() > 2 && (
                <Badge variant="secondary" className="bg-teal-100 text-teal-700 font-semibold">
                  {getActiveFiltersCount() - 2}
                </Badge>
              )}
              <div className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </Button>

            {getActiveFiltersCount() > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleClearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Clear All ({getActiveFiltersCount()})
              </Button>
            )}
          </div>

          {/* Enhanced Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-8 p-8 bg-gradient-to-br from-teal-50/50 to-emerald-50/50 rounded-2xl border-2 border-teal-100 animate-in slide-in-from-top-4 duration-300">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-teal-600" />
                Refine Your Search
              </h4>
              {/* Search Radius */}
              {filters.origin && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Pickup Radius: {filters.originRadius} km
                  </Label>
                  <Suspense fallback={<div className="h-6 bg-gray-200 rounded animate-pulse" />}>
                    <Slider
                      value={[filters.originRadius]}
                      onValueChange={handleSliderChange('originRadius')}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </Suspense>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              )}

              {filters.destination && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Destination Radius: {filters.destinationRadius} km
                  </Label>
                  <Suspense fallback={<div className="h-6 bg-gray-200 rounded animate-pulse" />}>
                    <Slider
                      value={[filters.destinationRadius]}
                      onValueChange={handleSliderChange('destinationRadius')}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </Suspense>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              )}

              {/* Price and Seats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxCostPerPerson" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Max Cost per Person
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="maxCostPerPerson"
                      type="number"
                      min="0"
                      max="100"
                      step="0.50"
                      value={filters.maxCostPerPerson ? (filters.maxCostPerPerson / 100).toFixed(2) : ''}
                      onChange={handlePriceChange}
                      className="pl-8"
                      placeholder="No limit"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Passengers
                    <span className="text-xs text-gray-500 font-normal">(1–6)</span>
                  </Label>
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, minSeats: Math.max(1, prev.minSeats - 1) }))}
                      disabled={filters.minSeats <= 1}
                      aria-disabled={filters.minSeats <= 1}
                      className="w-10 h-10 p-0 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      aria-label="Decrease passenger count"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium" aria-live="polite">
                      {filters.minSeats}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, minSeats: Math.min(6, prev.minSeats + 1) }))}
                      disabled={filters.minSeats >= 6}
                      className="w-10 h-10 p-0 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      aria-label="Increase passenger count"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Search Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 py-8 text-xl focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-2xl font-bold relative overflow-hidden group"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                  <span>Searching for rides...</span>
                </>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <Search className="w-6 h-6" />
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold">
                      {searchType === 'drivers' ? 'Find Rides' : 'Post Request'}
                    </span>
                    {filters.departAfter && (
                      <span className="text-sm opacity-90 font-normal">
                        {new Date(filters.departAfter).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}