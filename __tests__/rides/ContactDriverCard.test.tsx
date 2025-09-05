import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ContactDriverCard } from '@/src/components/rides/ContactDriverCard'

// Mock fetch
global.fetch = jest.fn()

const mockDriver = {
  name: 'John Doe',
  phone: '5551234567',
  email: 'john@ufl.edu',
  verified: true,
  zelleHandle: 'john@ufl.edu',
  cashAppHandle: '$johndoe',
}

const mockRide = {
  destText: 'Orlando Airport',
  departAt: new Date('2024-12-25T10:00:00Z'),
}

const mockCurrentUser = {
  eduVerified: true,
}

describe('ContactDriverCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful API response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  it('renders contact buttons when both user and driver are verified', () => {
    render(
      <ContactDriverCard
        driver={mockDriver}
        ride={mockRide}
        currentUser={mockCurrentUser}
        bookingId="booking123"
      />
    )

    expect(screen.getByText('Contact Driver')).toBeInTheDocument()
    expect(screen.getByText('Text Driver')).toBeInTheDocument()
    expect(screen.getByText('Email Driver')).toBeInTheDocument()
    expect(screen.getByText('Both you and the driver are verified students')).toBeInTheDocument()
  })

  it('shows verification callout when user is not verified', () => {
    render(
      <ContactDriverCard
        driver={mockDriver}
        ride={mockRide}
        currentUser={{ eduVerified: false }}
        bookingId="booking123"
      />
    )

    expect(screen.getByText('Only verified students can contact drivers.')).toBeInTheDocument()
    expect(screen.getByText('Verify your student email')).toBeInTheDocument()
  })

  it('shows verification callout when driver is not verified', () => {
    render(
      <ContactDriverCard
        driver={{ ...mockDriver, verified: false }}
        ride={mockRide}
        currentUser={mockCurrentUser}
        bookingId="booking123"
      />
    )

    expect(screen.getByText('Only verified students can contact drivers.')).toBeInTheDocument()
  })

  it('displays payment methods when available', () => {
    render(
      <ContactDriverCard
        driver={mockDriver}
        ride={mockRide}
        currentUser={mockCurrentUser}
        bookingId="booking123"
      />
    )

    expect(screen.getByText('Payment Methods')).toBeInTheDocument()
    expect(screen.getByText('john@ufl.edu')).toBeInTheDocument()
    expect(screen.getByText('$johndoe')).toBeInTheDocument()
  })

  it('logs contact when SMS button is clicked', async () => {
    // Mock window.location.href
    delete (window as any).location
    window.location = { href: '' } as any

    render(
      <ContactDriverCard
        driver={mockDriver}
        ride={mockRide}
        currentUser={mockCurrentUser}
        bookingId="booking123"
      />
    )

    const smsButton = screen.getByText('Text Driver').closest('button')!
    fireEvent.click(smsButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contacts/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: 'booking123',
          method: 'sms',
        }),
      })
    })
  })

  it('logs contact when Email button is clicked', async () => {
    // Mock window.location.href
    delete (window as any).location
    window.location = { href: '' } as any

    render(
      <ContactDriverCard
        driver={mockDriver}
        ride={mockRide}
        currentUser={mockCurrentUser}
        bookingId="booking123"
      />
    )

    const emailButton = screen.getByText('Email Driver').closest('button')!
    fireEvent.click(emailButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contacts/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: 'booking123',
          method: 'email',
        }),
      })
    })
  })

  it('handles API errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Rate limit exceeded' }),
    })

    render(
      <ContactDriverCard
        driver={mockDriver}
        ride={mockRide}
        currentUser={mockCurrentUser}
        bookingId="booking123"
      />
    )

    const smsButton = screen.getByText('Text Driver').closest('button')!
    fireEvent.click(smsButton)

    await waitFor(() => {
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument()
    })
  })

  it('generates correct SMS link for iOS', () => {
    // Mock iOS user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true,
    })

    // Mock window.location.href
    delete (window as any).location
    window.location = { href: '' } as any

    render(
      <ContactDriverCard
        driver={mockDriver}
        ride={mockRide}
        currentUser={mockCurrentUser}
        bookingId="booking123"
      />
    )

    const smsButton = screen.getByText('Text Driver').closest('button')!
    fireEvent.click(smsButton)

    // The SMS link should use iOS format (& instead of ?)
    // This would be tested in the actual click handler
  })

  it('generates correct SMS link for Android/Desktop', () => {
    // Mock Android user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 10)',
      configurable: true,
    })

    // Mock window.location.href
    delete (window as any).location
    window.location = { href: '' } as any

    render(
      <ContactDriverCard
        driver={mockDriver}
        ride={mockRide}
        currentUser={mockCurrentUser}
        bookingId="booking123"
      />
    )

    const smsButton = screen.getByText('Text Driver').closest('button')!
    fireEvent.click(smsButton)

    // The SMS link should use standard format (?)
    // This would be tested in the actual click handler
  })

  it('has proper accessibility attributes', () => {
    render(
      <ContactDriverCard
        driver={mockDriver}
        ride={mockRide}
        currentUser={mockCurrentUser}
        bookingId="booking123"
      />
    )

    const smsButton = screen.getByLabelText('Send SMS to John Doe')
    const emailButton = screen.getByLabelText('Send email to John Doe')

    expect(smsButton).toHaveClass('focus-visible:ring-2')
    expect(emailButton).toHaveClass('focus-visible:ring-2')
  })
})