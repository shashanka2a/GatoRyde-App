# Testing Guide

This document outlines the comprehensive testing strategy for the GatoRyde platform, covering unit tests, integration tests, E2E tests, and CLI testing scripts.

## Test Structure

```
__tests__/
├── utils/
│   └── pricing.test.ts           # Pricing calculations, rounding, edge cases
├── components/
│   └── ContactDriverCard.test.tsx # Auth guards, verification, contact flow
├── kyc/
│   └── file-upload.test.ts       # File validation for QR images
├── e2e/
│   └── booking-flow.spec.ts      # End-to-end booking flows
├── auth/
├── bookings/
├── rides/
└── repositories/

scripts/
└── test-offplatform.ts           # CLI test for complete payment flow
```

## Test Categories

### 1. Unit Tests - Pricing (`__tests__/utils/pricing.test.ts`)

Tests the `PricingUtils` class for:
- **Rounding Logic**: Ensures cents are distributed correctly when total doesn't divide evenly
- **Rider Count Edge Cases**: Handles 1 rider, maximum riders (8), and invalid counts
- **Cost Validation**: Enforces minimum ($1.00) and maximum ($500.00) constraints
- **Share Calculations**: Verifies estimated vs final shares are calculated correctly

**Key Test Cases:**
```typescript
// Even division
PricingUtils.calculateRiderShares(1000, 4) // [250, 250, 250, 250]

// Remainder distribution
PricingUtils.calculateRiderShares(1001, 4) // [251, 250, 250, 250]

// Estimated share (conservative rounding up)
PricingUtils.calculateEstimatedShare(1501, 2, 1) // 501 cents

// Final shares with proper remainder handling
PricingUtils.calculateFinalShares(1001, [{seats: 1}, {seats: 1}, {seats: 1}])
// [{ share: 334 }, { share: 333 }, { share: 334 }]
```

### 2. Component Tests - Contact Driver (`__tests__/components/ContactDriverCard.test.tsx`)

Tests authentication and verification guards:
- **Verification Guards**: Only verified students can contact drivers
- **Platform Detection**: Generates correct SMS links for iOS vs Android
- **Rate Limiting**: Enforces contact attempt limits
- **Link Generation**: Creates proper mailto/SMS links with encoded content
- **Error Handling**: Gracefully handles API failures

**Key Test Cases:**
```typescript
// Unverified user sees callout
expect(screen.getByText('Only verified students can contact drivers.')).toBeInTheDocument()

// Verified users see contact options
expect(screen.getByText('Text Driver')).toBeInTheDocument()
expect(screen.getByText('Email Driver')).toBeInTheDocument()

// Rate limiting enforcement
// After 5+ rapid clicks:
expect(screen.getByText('Too many contact attempts')).toBeInTheDocument()
```

### 3. File Upload Validation (`__tests__/kyc/file-upload.test.ts`)

Tests QR image upload validation:
- **File Type Validation**: Only allows image formats (JPEG, PNG, WebP)
- **Size Constraints**: Enforces 1KB minimum, 10MB maximum
- **Dimension Validation**: Checks image resolution and aspect ratio
- **QR Content Validation**: Verifies QR contains valid payment information
- **Security Checks**: Blocks suspicious file extensions and malicious content

**Key Test Cases:**
```typescript
// Valid QR image passes all checks
const result = await FileUploadValidator.validateQRImage(validFile)
expect(result.valid).toBe(true)
expect(result.metadata.qrData).toBe('https://cash.app/$testuser')

// Invalid file type rejected
const pdfFile = new File(['data'], 'qr.pdf', { type: 'application/pdf' })
const result = FileUploadValidator.validateFile(pdfFile)
expect(result.errors).toContain('Invalid file type')

// Malicious QR content blocked
const maliciousQR = 'javascript:alert("xss")'
expect(result.errors).toContain('suspicious or potentially malicious content')
```

### 4. E2E Tests (`__tests__/e2e/booking-flow.spec.ts`)

Tests complete user flows using Playwright:

#### Complete Booking Flow
1. **Book Ride**: User finds and books available ride
2. **OTP Start**: Trip starts with valid OTP code
3. **Trip Completion**: Driver completes trip
4. **Payment Panel**: Shows correct final share and QR/payment links

#### Contact Driver Flow
- **Verified vs Unverified**: Different UI based on verification status
- **SMS/Email Links**: Proper link generation and platform detection
- **Rate Limiting**: Enforces contact attempt limits

#### Cancellation Paths
- **>12h Cancellation**: No late fee, seats restored
- **<12h Cancellation**: Late fee warning, etiquette payment due
- **Driver Cancellation**: Apology emails with re-search links

**Key E2E Scenarios:**
```typescript
// Complete booking flow
await page.click('[data-testid="book-ride-button"]')
await expect(page.locator('[data-testid="booking-success"]')).toBeVisible()

// Payment panel verification
await page.goto(`/rides/${bookingId}/payment`)
const finalShare = await page.locator('[data-testid="final-share-amount"]').textContent()
expect(finalShare).toMatch(/\$\d+\.\d{2}/)
```

### 5. CLI Testing Script (`scripts/test-offplatform.ts`)

Comprehensive integration test that:
1. **Seeds Data**: Creates driver with QR + ride (totalCostCents=15000, seatsTotal=3)
2. **First Booking**: Creates rider booking, verifies estimated share
3. **Trip Start**: Starts trip, adds second rider booking before departure
4. **Trip Completion**: Completes trip, calculates final shares
5. **Verification**: Asserts final shares sum to total cost
6. **Notifications**: Verifies payment request notifications sent
7. **Event Logging**: Logs all events for debugging

**Usage:**
```bash
# Run with detailed logging
npm run test:offplatform -- --verbose

# Run silently (production mode)
npm run test:offplatform
```

**Sample Output:**
```
🚀 Starting Off-Platform Payment Flow Test...

[2024-01-15T10:30:00.000Z] DRIVER_SEEDED: {
  "userId": "user-123",
  "driverId": "driver-456", 
  "qrCodeUrl": "https://example.com/qr/driver-payment.png"
}

[2024-01-15T10:30:01.000Z] BOOKING_CREATED: {
  "bookingId": "booking-789",
  "estimatedShare": 5000,
  "otp": "123456"
}

[2024-01-15T10:30:05.000Z] FINAL_SHARES_VERIFIED: {
  "totalFinalShares": 15000,
  "totalCostCents": 15000,
  "bookingShares": [
    { "bookingId": "booking-1", "seats": 1, "finalShare": 7500 },
    { "bookingId": "booking-2", "seats": 1, "finalShare": 7500 }
  ]
}

✅ All tests passed!
```

## Running Tests

### Individual Test Suites
```bash
# Pricing calculations
npm run test:pricing

# Contact driver component
npm run test:contact

# File upload validation
npm run test:upload

# E2E tests
npm run test:e2e

# CLI integration test
npm run test:offplatform
```

### All Tests
```bash
# Unit + Integration tests
npm test

# All tests including E2E
npm run test:all
```

### Watch Mode
```bash
# Watch unit tests
npm run test:watch

# Watch E2E tests
npx playwright test --ui
```

## Test Data Management

### Seeding Test Data
The CLI script automatically seeds and cleans up test data:
- Creates temporary users with unique test IDs
- Seeds realistic ride and booking data
- Cleans up all test data after completion

### Mock Services
Tests use mocked external services:
- **Email/SMS**: Mocked notification services
- **QR Reading**: Simulated QR code detection
- **Payment APIs**: Mocked payment link generation

## Continuous Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
      - run: npm run test:offplatform
```

### Test Coverage
- **Unit Tests**: >90% coverage for pricing and validation logic
- **Integration Tests**: All booking and cancellation flows
- **E2E Tests**: Critical user journeys
- **CLI Tests**: Complete off-platform payment flow

## Debugging Tests

### Failed Tests
```bash
# Run specific test file
npx jest __tests__/utils/pricing.test.ts

# Run with verbose output
npx jest --verbose

# Run E2E tests with UI
npx playwright test --ui --project=chromium
```

### Test Artifacts
- **Screenshots**: Captured on E2E test failures
- **Videos**: Recorded for failed E2E tests
- **Logs**: CLI script logs all events with timestamps
- **Coverage Reports**: Generated in `coverage/` directory

## Best Practices

### Writing Tests
1. **Descriptive Names**: Test names should clearly describe the scenario
2. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification
3. **Edge Cases**: Test boundary conditions and error scenarios
4. **Isolation**: Each test should be independent and not rely on others
5. **Realistic Data**: Use realistic test data that matches production scenarios

### Maintaining Tests
1. **Update with Features**: Add tests for new features
2. **Refactor with Code**: Keep tests in sync with code changes
3. **Review Coverage**: Regularly check test coverage reports
4. **Performance**: Keep tests fast and focused
5. **Documentation**: Update this guide when adding new test categories

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure test database is running
2. **Port Conflicts**: Check that test server ports are available
3. **Environment Variables**: Set required env vars for testing
4. **File Permissions**: Ensure test files have proper permissions
5. **Browser Dependencies**: Install Playwright browsers with `npx playwright install`

### Getting Help
- Check test logs for detailed error messages
- Review this documentation for test patterns
- Run tests in verbose mode for more details
- Check GitHub Issues for known testing problems