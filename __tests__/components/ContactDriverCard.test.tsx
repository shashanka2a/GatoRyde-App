import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ContactDriverCard } from '@/src/components/rides/ContactDriverCard'

// Mock fetch globally
global.fetch = jest.fn()

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
})

// Mock navigator for platform detection
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
  writable: true,
})

describe('ContactDriverCard', () => {
  const mockDriver = {
    name: 'John Driver',
    phone: '1234567890',
    email: 'driver@test.com',
    verified: true,
    zelleHandle: 'driver@zelle.com',
    cashAppHandle: 'driverhandle',
  }

  const mockRide = {
    destText: 'University of Florida',
    departAt: new Date('2024-12-15T10:00:00Z'),
  }

  const mockVerifiedUser = {
    eduVerified: true,
  }

  const mockUnverifiedUser = {
    eduVerified: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  describe('Authentication and Verification Guards', () => {
    it('should show verification callout when user is not verified', () => {
      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockUnverifiedUser}
          bookingId="booking123"
        />
      )

      expect(screen.getByText('Only verified students can contact drivers.')).toBeInTheDocument()
      expect(screen.getByText('Verify your student email')).toBeInTheDocument()
      expect(screen.queryByText('Text Driver')).not.toBeInTheDocument()
    })

    it('should show verification callout when driver is not verified', () => {
      const unverifiedDriver = { ...mockDriver, verified: false }
      
      render(
        <ContactDriverCard
          driver={unverifiedDriver}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      expect(screen.getByText('Only verified students can contact drivers.')).toBeInTheDocument()
      expect(screen.queryByText('Text Driver')).not.toBeInTheDocument()
    })

    it('should show contact options when both user and driver are verified', () => {
      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      expect(screen.getByText('Both you and the driver are verified students')).toBeInTheDocument()
      expect(screen.getByText('Text Driver')).toBeInTheDocument()
      expect(screen.getByText('Email Driver')).toBeInTheDocument()
    })

    it('should redirect to profile page when verify button is clicked', () => {
      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockUnverifiedUser}
          bookingId="booking123"
        />
      )

      const verifyButton = screen.getByText('Verify your student email')
      fireEvent.click(verifyButton)

      expect(window.location.href).toBe('/app/profile')
    })
  })

  describe('Contact Methods', () => {
    it('should generate correct SMS link for iOS', () => {
      // Mock iOS user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        writable: true,
      })

      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      const smsButton = screen.getByText('Text Driver')
      fireEvent.click(smsButton)

      // Should use iOS SMS format
      expect(window.location.href).toContain('sms:+11234567890&body=')
    })

    it('should generate correct SMS link for Android', () => {
      // Mock Android user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
        writable: true,
      })

      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      const smsButton = screen.getByText('Text Driver')
      fireEvent.click(smsButton)

      // Should use Android SMS format
      expect(window.location.href).toContain('sms:+11234567890?body=')
    })

    it('should generate correct email link with proper encoding', () => {
      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      const emailButton = screen.getByText('Email Driver')
      fireEvent.click(emailButton)

      expect(window.location.href).toContain('mailto:driver@test.com')
      expect(window.location.href).toContain('subject=Ride%20Request')
      expect(window.location.href).toContain('University%20of%20Florida')
    })

    it('should log contact attempts when bookingId is provided', async () => {
      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      const smsButton = screen.getByText('Text Driver')
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

    it('should not log contact attempts when bookingId is not provided', async () => {
      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockVerifiedUser}
        />
      )

      const smsButton = screen.getByText('Text Driver')
      fireEvent.click(smsButton)

      // Should not make API call without bookingId
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should handle contact logging errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Rate limit exceeded' }),
      })

      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      const smsButton = screen.getByText('Text Driver')
      fireEvent.click(smsButton)

      await waitFor(() => {
        expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument()
      })

      // Should not redirect on error
      expect(window.location.href).toBe('')
    })
  })

  describe('Payment Methods Display', () => {
    it('should display Zelle handle when provided', () => {
      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      expect(screen.getByText('Payment Methods')).toBeInTheDocument()
      expect(screen.getByText('Zelle:')).toBeInTheDocument()
      expect(screen.getByText('driver@zelle.com')).toBeInTheDocument()
    })

    it('should display Cash App handle when provided', () => {
      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      expect(screen.getByText('Cash App:')).toBeInTheDocument()
      expect(screen.getByText('driverhandle')).toBeInTheDocument()
    })

    it('should not display payment methods section when no handles provided', () => {
      const driverWithoutPayment = {
        ...mockDriver,
        zelleHandle: null,
        cashAppHandle: null,
      }

      render(
        <ContactDriverCard
          driver={driverWithoutPayment}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      expect(screen.queryByText('Payment Methods')).not.toBeInTheDocument()
    })

    it('should display only available payment methods', () => {
      const driverWithOnlyZelle = {
        ...mockDriver,
        cashAppHandle: null,
      }

      render(
        <ContactDriverCard
          driver={driverWithOnlyZelle}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      expect(screen.getByText('Zelle:')).toBeInTheDocument()
      expect(screen.queryByText('Cash App:')).not.toBeInTheDocument()
    })
  })

  describe('Message Template Generation', () => {
    it('should generate proper message template with ride details', () => {
      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      const smsButton = screen.getByText('Text Driver')
      fireEvent.click(smsButton)

      const expectedMessage = encodeURIComponent(
        "Hi, I'm interested in your ride to University of Florida on Sunday, December 15, 2024. Can I book a seat?"
      )
      expect(window.location.href).toContain(expectedMessage)
    })

    it('should handle different date formats correctly', () => {
      const rideWithDifferentDate = {
        ...mockRide,
        departAt: new Date('2024-01-01T15:30:00Z'),
      }

      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={rideWithDifferentDate}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      const smsButton = screen.getByText('Text Driver')
      fireEvent.click(smsButton)

      expect(window.location.href).toContain('Monday%2C%20January%201%2C%202024')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for contact buttons', () => {
      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      const smsButton = screen.getByLabelText('Send SMS to John Driver')
      const emailButton = screen.getByLabelText('Send email to John Driver')

      expect(smsButton).toBeInTheDocument()
      expect(emailButton).toBeInTheDocument()
    })

    it('should have proper focus management', () => {
      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      const smsButton = screen.getByText('Text Driver')
      smsButton.focus()

      expect(smsButton).toHaveFocus()
      expect(smsButton).toHaveClass('focus-visible:ring-2')
    })
  })

  describe('Loading States', () => {
    it('should disable buttons during contact logging', async () => {
      // Mock slow API response
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: () => ({}) }), 100))
      )

      render(
        <ContactDriverCard
          driver={mockDriver}
          ride={mockRide}
          currentUser={mockVerifiedUser}
          bookingId="booking123"
        />
      )

      const smsButton = screen.getByText('Text Driver')
      const emailButton = screen.getByText('Email Driver')

      fireEvent.click(smsButton)

      // Buttons should be disabled during loading
      expect(smsButton).toBeDisabled()
      expect(emailButton).toBeDisabled()
    })
  })
})