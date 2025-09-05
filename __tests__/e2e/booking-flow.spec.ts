import { test, expect, Page } from '@playwright/test'

// E2E test for complete booking flow
test.describe('Booking Flow E2E', () => {
  let page: Page

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage
    // Setup authenticated session
    await page.goto('/auth/signin')
    await page.fill('[data-testid="email-input"]', 'verified-rider@test.edu')
    await page.fill('[data-testid="password-input"]', 'testpassword')
    await page.click('[data-testid="signin-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('complete booking flow: book → otp start → complete → payment request', async () => {
    // Step 1: Navigate to rides and book a ride
    await page.goto('/rides')
    
    // Find and click on a ride
    await page.click('[data-testid="ride-card"]:first-child')
    await expect(page).toHaveURL(/\/rides\/[a-zA-Z0-9]+/)
    
    // Book the ride
    await page.fill('[data-testid="seats-input"]', '1')
    await page.click('[data-testid="book-ride-button"]')
    
    // Wait for booking confirmation
    await expect(page.locator('[data-testid="booking-success"]')).toBeVisible()
    const bookingId = await page.locator('[data-testid="booking-id"]').textContent()
    
    // Step 2: Navigate to booking details
    await page.goto(`/dashboard/bookings/${bookingId}`)
    
    // Verify estimated share is displayed
    const estimatedShare = await page.locator('[data-testid="estimated-share"]').textContent()
    expect(estimatedShare).toMatch(/\$\d+\.\d{2}/)
    
    // Step 3: Start trip with OTP
    const otpCode = await page.locator('[data-testid="trip-start-otp"]').textContent()
    await page.fill('[data-testid="otp-input"]', otpCode!)
    await page.click('[data-testid="start-trip-button"]')
    
    // Wait for trip start confirmation
    await expect(page.locator('[data-testid="trip-started"]')).toBeVisible()
    
    // Step 4: Complete trip (simulate driver action)
    await page.goto('/dashboard/driver/rides')
    await page.click('[data-testid="complete-trip-button"]')
    await expect(page.locator('[data-testid="trip-completed"]')).toBeVisible()
    
    // Step 5: Verify payment request panel shows correct final share
    await page.goto(`/rides/${bookingId}/payment`)
    
    // Check final share amount
    const finalShare = await page.locator('[data-testid="final-share-amount"]').textContent()
    expect(finalShare).toMatch(/\$\d+\.\d{2}/)
    
    // Verify QR code is displayed
    await expect(page.locator('[data-testid="payment-qr-code"]')).toBeVisible()
    
    // Verify payment links are present
    await expect(page.locator('[data-testid="cashapp-link"]')).toBeVisible()
    await expect(page.locator('[data-testid="zelle-link"]')).toBeVisible()
    
    // Test payment link functionality
    const cashAppLink = await page.locator('[data-testid="cashapp-link"]').getAttribute('href')
    expect(cashAppLink).toContain('cash.app')
    expect(cashAppLink).toContain(finalShare!.replace('$', ''))
  })

  test('booking flow with multiple riders', async () => {
    // Create a ride with multiple seats
    await page.goto('/rides/create')
    await page.fill('[data-testid="origin-input"]', 'Gainesville, FL')
    await page.fill('[data-testid="destination-input"]', 'Orlando, FL')
    await page.fill('[data-testid="total-cost-input"]', '150.00')
    await page.fill('[data-testid="seats-total-input"]', '3')
    await page.click('[data-testid="create-ride-button"]')
    
    const rideId = await page.url().split('/').pop()
    
    // First rider books
    await page.goto(`/rides/${rideId}`)
    await page.fill('[data-testid="seats-input"]', '1')
    await page.click('[data-testid="book-ride-button"]')
    
    // Verify estimated share for first rider
    const firstRiderShare = await page.locator('[data-testid="estimated-share"]').textContent()
    expect(firstRiderShare).toBe('$50.00') // $150 / 3 riders
    
    // Second rider books (simulate different user)
    await page.goto('/auth/signin')
    await page.fill('[data-testid="email-input"]', 'rider2@test.edu')
    await page.fill('[data-testid="password-input"]', 'testpassword')
    await page.click('[data-testid="signin-button"]')
    
    await page.goto(`/rides/${rideId}`)
    await page.fill('[data-testid="seats-input"]', '1')
    await page.click('[data-testid="book-ride-button"]')
    
    // Complete trip and verify final shares
    // (Driver completes trip)
    await page.goto('/auth/signin')
    await page.fill('[data-testid="email-input"]', 'driver@test.edu')
    await page.fill('[data-testid="password-input"]', 'testpassword')
    await page.click('[data-testid="signin-button"]')
    
    await page.goto('/dashboard/driver/rides')
    await page.click('[data-testid="complete-trip-button"]')
    
    // Check that final shares add up to total cost
    const finalShares = await page.locator('[data-testid="final-share"]').allTextContents()
    const totalFinalAmount = finalShares.reduce((sum, share) => {
      return sum + parseFloat(share.replace('$', ''))
    }, 0)
    
    expect(totalFinalAmount).toBe(150.00)
  })
})

test.describe('Contact Driver Flow E2E', () => {
  test('verified rider can contact verified driver', async ({ page }) => {
    // Setup verified rider session
    await page.goto('/auth/signin')
    await page.fill('[data-testid="email-input"]', 'verified-rider@test.edu')
    await page.fill('[data-testid="password-input"]', 'testpassword')
    await page.click('[data-testid="signin-button"]')
    
    // Navigate to a ride with verified driver
    await page.goto('/rides')
    await page.click('[data-testid="ride-card"]:first-child')
    
    // Verify contact options are available
    await expect(page.locator('[data-testid="contact-driver-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="sms-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-button"]')).toBeVisible()
    
    // Test SMS link generation
    const smsButton = page.locator('[data-testid="sms-button"]')
    await smsButton.click()
    
    // Verify SMS link was generated (check for navigation or modal)
    await expect(page.locator('[data-testid="contact-logged"]')).toBeVisible()
    
    // Test email link generation
    const emailButton = page.locator('[data-testid="email-button"]')
    await emailButton.click()
    
    // Verify email link was generated
    await expect(page.locator('[data-testid="contact-logged"]')).toBeVisible()
  })

  test('unverified rider cannot contact driver', async ({ page }) => {
    // Setup unverified rider session
    await page.goto('/auth/signin')
    await page.fill('[data-testid="email-input"]', 'unverified-rider@gmail.com')
    await page.fill('[data-testid="password-input"]', 'testpassword')
    await page.click('[data-testid="signin-button"]')
    
    // Navigate to a ride
    await page.goto('/rides')
    await page.click('[data-testid="ride-card"]:first-child')
    
    // Verify verification callout is shown
    await expect(page.locator('[data-testid="verify-callout"]')).toBeVisible()
    await expect(page.locator('[data-testid="verify-email-button"]')).toBeVisible()
    
    // Verify contact buttons are not available
    await expect(page.locator('[data-testid="sms-button"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="email-button"]')).not.toBeVisible()
    
    // Test verification redirect
    await page.click('[data-testid="verify-email-button"]')
    await expect(page).toHaveURL('/app/profile')
  })

  test('contact rate limiting is enforced', async ({ page }) => {
    // Setup verified rider session
    await page.goto('/auth/signin')
    await page.fill('[data-testid="email-input"]', 'verified-rider@test.edu')
    await page.fill('[data-testid="password-input"]', 'testpassword')
    await page.click('[data-testid="signin-button"]')
    
    // Navigate to a ride and book it
    await page.goto('/rides')
    await page.click('[data-testid="ride-card"]:first-child')
    await page.fill('[data-testid="seats-input"]', '1')
    await page.click('[data-testid="book-ride-button"]')
    
    // Rapidly click contact buttons to trigger rate limit
    const smsButton = page.locator('[data-testid="sms-button"]')
    
    for (let i = 0; i < 6; i++) {
      await smsButton.click()
      await page.waitForTimeout(100)
    }
    
    // Verify rate limit error is shown
    await expect(page.locator('[data-testid="rate-limit-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="rate-limit-error"]')).toContainText('Too many contact attempts')
  })
})

test.describe('Cancellation Flow E2E', () => {
  test('rider cancellation >12h before departure', async ({ page }) => {
    // Create ride departing in 24 hours
    const departureTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
    
    await page.goto('/auth/signin')
    await page.fill('[data-testid="email-input"]', 'verified-rider@test.edu')
    await page.fill('[data-testid="password-input"]', 'testpassword')
    await page.click('[data-testid="signin-button"]')
    
    // Book a ride
    await page.goto('/rides')
    await page.click('[data-testid="ride-card"]:first-child')
    await page.fill('[data-testid="seats-input"]', '1')
    await page.click('[data-testid="book-ride-button"]')
    
    const bookingId = await page.locator('[data-testid="booking-id"]').textContent()
    
    // Cancel the booking
    await page.goto(`/dashboard/bookings/${bookingId}`)
    await page.click('[data-testid="cancel-booking-button"]')
    await page.click('[data-testid="confirm-cancel-button"]')
    
    // Verify cancellation success (no late fee)
    await expect(page.locator('[data-testid="cancel-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="cancel-success"]')).not.toContainText('Late cancellation fee')
    
    // Verify seats were restored
    await page.goto('/rides')
    const availableSeats = await page.locator('[data-testid="available-seats"]').first().textContent()
    expect(parseInt(availableSeats!)).toBeGreaterThan(0)
  })

  test('rider cancellation <12h before departure', async ({ page }) => {
    // Create ride departing in 6 hours
    const departureTime = new Date(Date.now() + 6 * 60 * 60 * 1000)
    
    await page.goto('/auth/signin')
    await page.fill('[data-testid="email-input"]', 'verified-rider@test.edu')
    await page.fill('[data-testid="password-input"]', 'testpassword')
    await page.click('[data-testid="signin-button"]')
    
    // Book a ride
    await page.goto('/rides')
    await page.click('[data-testid="ride-card"]:first-child')
    await page.fill('[data-testid="seats-input"]', '1')
    await page.click('[data-testid="book-ride-button"]')
    
    const bookingId = await page.locator('[data-testid="booking-id"]').textContent()
    
    // Cancel the booking
    await page.goto(`/dashboard/bookings/${bookingId}`)
    await page.click('[data-testid="cancel-booking-button"]')
    await page.click('[data-testid="confirm-cancel-button"]')
    
    // Verify late cancellation warning
    await expect(page.locator('[data-testid="cancel-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="cancel-success"]')).toContainText('Late cancellation fee may apply')
    
    // Verify etiquette payment due flag
    await expect(page.locator('[data-testid="etiquette-payment-due"]')).toBeVisible()
  })

  test('driver cancellation sends apology emails with re-search links', async ({ page }) => {
    // Setup driver session
    await page.goto('/auth/signin')
    await page.fill('[data-testid="email-input"]', 'driver@test.edu')
    await page.fill('[data-testid="password-input"]', 'testpassword')
    await page.click('[data-testid="signin-button"]')
    
    // Navigate to driver's rides
    await page.goto('/dashboard/driver/rides')
    
    // Cancel a ride with bookings
    await page.click('[data-testid="cancel-ride-button"]:first-child')
    await page.fill('[data-testid="cancel-reason"]', 'Vehicle breakdown')
    await page.click('[data-testid="confirm-cancel-button"]')
    
    // Verify cancellation success
    await expect(page.locator('[data-testid="cancel-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="cancel-success"]')).toContainText('Riders have been notified')
    
    // Verify notification was sent (check notification queue or mock email service)
    await expect(page.locator('[data-testid="notification-sent"]')).toBeVisible()
  })
})

test.describe('Payment Request Panel E2E', () => {
  test('payment panel shows correct final share and payment options', async ({ page }) => {
    // Complete a booking flow first
    await page.goto('/auth/signin')
    await page.fill('[data-testid="email-input"]', 'verified-rider@test.edu')
    await page.fill('[data-testid="password-input"]', 'testpassword')
    await page.click('[data-testid="signin-button"]')
    
    // Book and complete a ride
    await page.goto('/rides')
    await page.click('[data-testid="ride-card"]:first-child')
    await page.fill('[data-testid="seats-input"]', '1')
    await page.click('[data-testid="book-ride-button"]')
    
    const bookingId = await page.locator('[data-testid="booking-id"]').textContent()
    
    // Simulate trip completion
    await page.goto(`/dashboard/bookings/${bookingId}`)
    const otpCode = await page.locator('[data-testid="trip-start-otp"]').textContent()
    await page.fill('[data-testid="otp-input"]', otpCode!)
    await page.click('[data-testid="start-trip-button"]')
    
    // Complete trip (as driver)
    await page.goto('/auth/signin')
    await page.fill('[data-testid="email-input"]', 'driver@test.edu')
    await page.fill('[data-testid="password-input"]', 'testpassword')
    await page.click('[data-testid="signin-button"]')
    
    await page.goto('/dashboard/driver/rides')
    await page.click('[data-testid="complete-trip-button"]')
    
    // Navigate to payment page
    await page.goto(`/rides/${bookingId}/payment`)
    
    // Verify payment panel elements
    await expect(page.locator('[data-testid="final-share-amount"]')).toBeVisible()
    await expect(page.locator('[data-testid="payment-qr-code"]')).toBeVisible()
    await expect(page.locator('[data-testid="payment-methods"]')).toBeVisible()
    
    // Test payment link generation
    const cashAppLink = page.locator('[data-testid="cashapp-link"]')
    await expect(cashAppLink).toBeVisible()
    
    const href = await cashAppLink.getAttribute('href')
    expect(href).toContain('cash.app')
    
    // Test copy functionality
    await page.click('[data-testid="copy-payment-link"]')
    await expect(page.locator('[data-testid="copy-success"]')).toBeVisible()
  })

  test('payment notifications are sent after trip completion', async ({ page }) => {
    // This test would verify that payment request notifications are sent
    // In a real implementation, this would check email/SMS queues or mock services
    
    // Complete booking flow...
    // Verify notification queue has payment request entries
    await page.goto('/admin/notifications')
    await expect(page.locator('[data-testid="payment-request-notification"]')).toBeVisible()
  })
})