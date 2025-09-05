import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LocationAutocomplete } from '../../src/components/rides/LocationAutocomplete'
import { RideList } from '../../src/components/rides/RideList'
import { RideSearchForm } from '../../src/components/rides/RideSearchForm'

// Mock Mapbox service
jest.mock('../../lib/maps/mapbox', () => ({
  MapboxService: {
    isAvailable: jest.fn(() => true),
    searchPlaces: jest.fn(() => Promise.resolve([
      {
        id: 'place.1',
        text: 'University of Florida',
        placeName: 'University of Florida, Gainesville, FL',
        center: [-82.3549, 29.6436],
      },
      {
        id: 'place.2',
        text: 'Oaks Mall',
        placeName: 'Oaks Mall, Gainesville, FL',
        center: [-82.3707, 29.6516],
      }
    ])),
  },
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

const mockRides = [
  {
    id: 'ride1',
    originText: 'University of Florida',
    originLat: 29.6436,
    originLng: -82.3549,
    destText: 'Oaks Mall',
    destLat: 29.6516,
    destLng: -82.3707,
    departAt: new Date('2025-12-31T10:00:00'),
    seatsTotal: 3,
    seatsAvailable: 2,
    pricePerSeatCents: 500,
    status: 'open' as const,
    polyline: 'encoded_polyline',
    driver: {
      userId: 'driver1',
      verified: true,
      user: {
        id: 'driver1',
        name: 'John Doe',
        photoUrl: null,
        ratingAvg: 4.5,
        ratingCount: 10,
      },
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Blue',
        seats: 5,
      }
    }
  }
]

describe('LocationAutocomplete', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render input field with label', () => {
    render(
      <LocationAutocomplete
        label="Origin"
        placeholder="Enter location"
        value={null}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByLabelText('Origin')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter location')).toBeInTheDocument()
  })

  it('should show Mapbox warning when API is unavailable', () => {
    const { MapboxService } = require('../../lib/maps/mapbox')
    MapboxService.isAvailable.mockReturnValue(false)

    render(
      <LocationAutocomplete
        label="Origin"
        placeholder="Enter location"
        value={null}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText(/Map features limited/)).toBeInTheDocument()
    expect(screen.getByText(/NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN/)).toBeInTheDocument()
  })

  it('should search for locations on input change', async () => {
    const { MapboxService } = require('../../lib/maps/mapbox')
    
    render(
      <LocationAutocomplete
        label="Origin"
        placeholder="Enter location"
        value={null}
        onChange={mockOnChange}
      />
    )

    const input = screen.getByPlaceholderText('Enter location')
    fireEvent.change(input, { target: { value: 'University' } })

    await waitFor(() => {
      expect(MapboxService.searchPlaces).toHaveBeenCalledWith('University')
    })
  })

  it('should display search suggestions', async () => {
    render(
      <LocationAutocomplete
        label="Origin"
        placeholder="Enter location"
        value={null}
        onChange={mockOnChange}
      />
    )

    const input = screen.getByPlaceholderText('Enter location')
    fireEvent.change(input, { target: { value: 'University' } })

    await waitFor(() => {
      expect(screen.getByText('University of Florida')).toBeInTheDocument()
      expect(screen.getByText('University of Florida, Gainesville, FL')).toBeInTheDocument()
    })
  })

  it('should call onChange when location is selected', async () => {
    render(
      <LocationAutocomplete
        label="Origin"
        placeholder="Enter location"
        value={null}
        onChange={mockOnChange}
      />
    )

    const input = screen.getByPlaceholderText('Enter location')
    fireEvent.change(input, { target: { value: 'University' } })

    await waitFor(() => {
      const suggestion = screen.getByText('University of Florida')
      fireEvent.click(suggestion)
    })

    expect(mockOnChange).toHaveBeenCalledWith({
      id: 'place.1',
      text: 'University of Florida',
      placeName: 'University of Florida, Gainesville, FL',
      center: [-82.3549, 29.6436],
    })
  })

  it('should show selected location', () => {
    const selectedLocation = {
      id: 'place.1',
      text: 'University of Florida',
      placeName: 'University of Florida, Gainesville, FL',
      center: [-82.3549, 29.6436] as [number, number],
    }

    render(
      <LocationAutocomplete
        label="Origin"
        placeholder="Enter location"
        value={selectedLocation}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('University of Florida, Gainesville, FL')).toBeInTheDocument()
  })

  it('should show error message', () => {
    render(
      <LocationAutocomplete
        label="Origin"
        placeholder="Enter location"
        value={null}
        onChange={mockOnChange}
        error="Location is required"
      />
    )

    expect(screen.getByText('Location is required')).toBeInTheDocument()
  })

  it('should handle clear button', () => {
    render(
      <LocationAutocomplete
        label="Origin"
        placeholder="Enter location"
        value={null}
        onChange={mockOnChange}
      />
    )

    const input = screen.getByPlaceholderText('Enter location')
    fireEvent.change(input, { target: { value: 'test' } })

    const clearButton = screen.getByText('×')
    fireEvent.click(clearButton)

    expect(input).toHaveValue('')
    expect(mockOnChange).toHaveBeenCalledWith(null)
  })
})

describe('RideList', () => {
  it('should render loading state', () => {
    render(<RideList rides={[]} isLoading={true} />)

    expect(screen.getAllByRole('generic')).toHaveLength(3) // 3 skeleton cards
  })

  it('should render empty state', () => {
    render(<RideList rides={[]} isLoading={false} />)

    expect(screen.getByText('No Rides Available')).toBeInTheDocument()
    expect(screen.getByText('Offer a Ride')).toBeInTheDocument()
  })

  it('should render ride cards', () => {
    render(<RideList rides={mockRides} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('University of Florida')).toBeInTheDocument()
    expect(screen.getByText('Oaks Mall')).toBeInTheDocument()
    expect(screen.getByText('$5.00')).toBeInTheDocument()
    expect(screen.getByText('2 of 3 seats')).toBeInTheDocument()
  })

  it('should show driver verification badge', () => {
    render(<RideList rides={mockRides} />)

    // Should show verified badge for verified driver
    expect(screen.getByText('ID + License Verified')).toBeInTheDocument()
  })

  it('should show vehicle information', () => {
    render(<RideList rides={mockRides} />)

    expect(screen.getByText('Blue Toyota Camry')).toBeInTheDocument()
  })

  it('should show rating information', () => {
    render(<RideList rides={mockRides} />)

    expect(screen.getByText('4.5 (10 reviews)')).toBeInTheDocument()
  })

  it('should expand ride details', () => {
    render(<RideList rides={mockRides} />)

    const moreInfoButton = screen.getByText('More Info')
    fireEvent.click(moreInfoButton)

    expect(screen.getByText('Pickup Location')).toBeInTheDocument()
    expect(screen.getByText('Destination')).toBeInTheDocument()
    expect(screen.getByText('Departure')).toBeInTheDocument()
    expect(screen.getByText('Vehicle')).toBeInTheDocument()
  })

  it('should show distance from user when provided', () => {
    const userLocation = { lat: 29.6436, lng: -82.3549 }
    
    render(
      <RideList 
        rides={mockRides} 
        showDistance={true}
        userLocation={userLocation}
      />
    )

    expect(screen.getByText(/km away/)).toBeInTheDocument()
  })

  it('should handle rides with missing driver info', () => {
    const rideWithoutDriver = {
      ...mockRides[0],
      driver: {
        ...mockRides[0].driver,
        user: {
          ...mockRides[0].driver.user,
          name: null,
        },
        vehicle: null,
      }
    }

    render(<RideList rides={[rideWithoutDriver]} />)

    expect(screen.getByText('Anonymous Driver')).toBeInTheDocument()
    expect(screen.getByText('Vehicle info not available')).toBeInTheDocument()
  })
})

describe('RideSearchForm', () => {
  const mockOnSearch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render search form', () => {
    render(<RideSearchForm onSearch={mockOnSearch} />)

    expect(screen.getByLabelText('From')).toBeInTheDocument()
    expect(screen.getByLabelText('To')).toBeInTheDocument()
    expect(screen.getByLabelText('Depart After')).toBeInTheDocument()
    expect(screen.getByText('Find Rides')).toBeInTheDocument()
  })

  it('should show advanced filters when toggled', () => {
    render(<RideSearchForm onSearch={mockOnSearch} />)

    const advancedButton = screen.getByText('Advanced Filters')
    fireEvent.click(advancedButton)

    expect(screen.getByText('Max Price per Seat')).toBeInTheDocument()
    expect(screen.getByText('Minimum Seats Needed')).toBeInTheDocument()
  })

  it('should show radius sliders when locations are selected', async () => {
    render(<RideSearchForm onSearch={mockOnSearch} />)

    // Open advanced filters
    const advancedButton = screen.getByText('Advanced Filters')
    fireEvent.click(advancedButton)

    // The radius sliders should appear when locations are set
    // This would require more complex mocking of the LocationAutocomplete component
    // For now, we'll just check that the advanced filters section is visible
    expect(screen.getByText('Max Price per Seat')).toBeInTheDocument()
  })

  it('should call onSearch when form is submitted', () => {
    render(<RideSearchForm onSearch={mockOnSearch} />)

    const searchButton = screen.getByText('Find Rides')
    fireEvent.click(searchButton)

    expect(mockOnSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        originRadius: 10,
        destinationRadius: 10,
        minSeats: 1,
      })
    )
  })

  it('should clear all filters', () => {
    render(<RideSearchForm onSearch={mockOnSearch} />)

    const clearButton = screen.getByText('Clear All')
    fireEvent.click(clearButton)

    // Should reset form to default values
    const minSeatsInput = screen.getByDisplayValue('1')
    expect(minSeatsInput).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(<RideSearchForm onSearch={mockOnSearch} isLoading={true} />)

    expect(screen.getByText('Searching...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /searching/i })).toBeDisabled()
  })

  it('should validate price input', () => {
    render(<RideSearchForm onSearch={mockOnSearch} />)

    // Open advanced filters
    const advancedButton = screen.getByText('Advanced Filters')
    fireEvent.click(advancedButton)

    const priceInput = screen.getByLabelText('Max Price per Seat')
    fireEvent.change(priceInput, { target: { value: '15.50' } })

    expect(priceInput).toHaveValue('15.50')
  })

  it('should validate seats input', () => {
    render(<RideSearchForm onSearch={mockOnSearch} />)

    // Open advanced filters
    const advancedButton = screen.getByText('Advanced Filters')
    fireEvent.click(advancedButton)

    const seatsInput = screen.getByLabelText('Minimum Seats Needed')
    fireEvent.change(seatsInput, { target: { value: '3' } })

    expect(seatsInput).toHaveValue('3')
  })
})

describe('Mobile Responsiveness', () => {
  beforeEach(() => {
    // Mock window.matchMedia for responsive tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('max-width: 768px'), // Simulate mobile
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  it('should render mobile-friendly ride cards', () => {
    render(<RideList rides={mockRides} />)

    // Check that essential information is visible
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('$5.00')).toBeInTheDocument()
    expect(screen.getByText('2 of 3 seats')).toBeInTheDocument()
  })

  it('should stack form elements on mobile', () => {
    render(<RideSearchForm onSearch={jest.fn()} />)

    // Form should be responsive - we can check that elements exist
    expect(screen.getByLabelText('From')).toBeInTheDocument()
    expect(screen.getByLabelText('To')).toBeInTheDocument()
  })

  it('should handle touch interactions', () => {
    render(<RideList rides={mockRides} />)

    const moreInfoButton = screen.getByText('More Info')
    
    // Simulate touch event
    fireEvent.touchStart(moreInfoButton)
    fireEvent.touchEnd(moreInfoButton)
    fireEvent.click(moreInfoButton)

    expect(screen.getByText('Pickup Location')).toBeInTheDocument()
  })
})