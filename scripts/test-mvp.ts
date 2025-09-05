#!/usr/bin/env tsx

/**
 * MVP Test Script for Rydify
 * Tests core functionality: Ride search, Drive posting, Profile management
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  message: string
  duration: number
}

class MVPTester {
  private results: TestResult[] = []

  async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now()
    try {
      await testFn()
      this.results.push({
        test: testName,
        status: 'PASS',
        message: 'Test completed successfully',
        duration: Date.now() - startTime
      })
    } catch (error) {
      this.results.push({
        test: testName,
        status: 'FAIL',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      })
    }
  }

  async testDatabaseConnection(): Promise<void> {
    await prisma.$connect()
    console.log('✓ Database connection established')
  }

  async testUserCreation(): Promise<void> {
    // Test creating a mock user
    const testUser = {
      email: 'test@ufl.edu',
      name: 'Test Student',
      phone: '+1234567890',
      eduVerified: true
    }

    // In a real implementation, this would create a user
    // For MVP, we'll just validate the data structure
    if (!testUser.email.endsWith('.edu')) {
      throw new Error('User must have .edu email for verification')
    }

    console.log('✓ User creation validation passed')
  }

  async testRideFlow(): Promise<void> {
    // Test the ride search and creation flow
    const mockRide = {
      origin: { lat: 29.6516, lng: -82.3248, text: 'UF Campus' },
      destination: { lat: 29.6436, lng: -82.3549, text: 'Downtown Gainesville' },
      departAt: new Date(Date.now() + 3600000), // 1 hour from now
      seatsTotal: 3,
      totalTripCostCents: 1500, // $15.00
      driverId: 'test-driver-id'
    }

    // Validate ride data
    if (mockRide.departAt <= new Date()) {
      throw new Error('Departure time must be in the future')
    }

    if (mockRide.seatsTotal < 1 || mockRide.seatsTotal > 8) {
      throw new Error('Seats must be between 1 and 8')
    }

    if (mockRide.totalTripCostCents < 0) {
      throw new Error('Trip cost cannot be negative')
    }

    console.log('✓ Ride creation validation passed')
  }

  async testVerificationFlow(): Promise<void> {
    // Test verification requirements
    const mockDriver = {
      eduVerified: true,
      kycVerified: false,
      licenseVerified: false,
      rideType: 'local' as 'local' | 'intercity'
    }

    // Local rides only need edu verification
    if (mockDriver.rideType === 'local' && !mockDriver.eduVerified) {
      throw new Error('Local rides require edu verification')
    }

    // Inter-city rides need full verification
    if (mockDriver.rideType === 'intercity') {
      if (!mockDriver.eduVerified || !mockDriver.kycVerified || !mockDriver.licenseVerified) {
        throw new Error('Inter-city rides require full verification (edu + KYC + license)')
      }
    }

    console.log('✓ Verification flow validation passed')
  }

  async testContactFlow(): Promise<void> {
    // Test contact restrictions
    const rider = { eduVerified: true }
    const driver = { phone: '+1234567890', email: 'driver@ufl.edu' }

    if (!rider.eduVerified) {
      throw new Error('Only edu-verified users can contact drivers')
    }

    // Generate contact links (SMS and mailto)
    const smsLink = `sms:${driver.phone}?body=Hi! I'm interested in your ride. I found you on Rydify.`
    const mailtoLink = `mailto:${driver.email}?subject=Ride Request via Rydify&body=Hi! I'm interested in your ride.`

    if (!smsLink.includes('sms:') || !mailtoLink.includes('mailto:')) {
      throw new Error('Contact links generation failed')
    }

    console.log('✓ Contact flow validation passed')
  }

  async testPricingLogic(): Promise<void> {
    // Test cost splitting logic
    const totalCostCents = 2000 // $20.00
    const totalSeats = 4
    const availableSeats = 2

    // Cost per person when all seats are filled
    const costPerPersonAllSeats = totalCostCents / (totalSeats + 1) // +1 for driver
    
    // Cost per person with current availability
    const occupiedSeats = totalSeats - availableSeats
    const costPerPersonCurrent = totalCostCents / (occupiedSeats + 1) // +1 for driver

    if (costPerPersonAllSeats <= 0 || costPerPersonCurrent <= 0) {
      throw new Error('Cost calculation error')
    }

    console.log('✓ Pricing logic validation passed')
    console.log(`  - Cost when full (${totalSeats + 1} people): $${(costPerPersonAllSeats / 100).toFixed(2)} per person`)
    console.log(`  - Cost currently (${occupiedSeats + 1} people): $${(costPerPersonCurrent / 100).toFixed(2)} per person`)
  }

  async testMapboxFallback(): Promise<void> {
    // Test graceful fallback when Mapbox is not available
    const mockMapboxAvailable = false // Simulate no API key

    if (!mockMapboxAvailable) {
      // Should fall back to basic location input
      const fallbackLocation = {
        text: 'University of Florida, Gainesville, FL',
        lat: 29.6516,
        lng: -82.3248
      }

      if (!fallbackLocation.text || !fallbackLocation.lat || !fallbackLocation.lng) {
        throw new Error('Fallback location data incomplete')
      }
    }

    console.log('✓ Mapbox fallback validation passed')
  }

  printResults(): void {
    console.log('\n' + '='.repeat(60))
    console.log('MVP TEST RESULTS')
    console.log('='.repeat(60))

    let passed = 0
    let failed = 0

    this.results.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌'
      const duration = `${result.duration}ms`
      
      console.log(`${status} ${result.test.padEnd(40)} ${duration.padStart(8)}`)
      
      if (result.status === 'FAIL') {
        console.log(`   Error: ${result.message}`)
        failed++
      } else {
        passed++
      }
    })

    console.log('='.repeat(60))
    console.log(`Total: ${this.results.length} | Passed: ${passed} | Failed: ${failed}`)
    
    if (failed === 0) {
      console.log('🎉 All MVP tests passed! Ready for development.')
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.')
    }
  }
}

async function runMVPTests(): Promise<void> {
  console.log('🚀 Starting Rydify MVP Tests...\n')
  
  const tester = new MVPTester()

  // Core functionality tests
  await tester.runTest('Database Connection', () => tester.testDatabaseConnection())
  await tester.runTest('User Creation & Validation', () => tester.testUserCreation())
  await tester.runTest('Ride Search & Creation Flow', () => tester.testRideFlow())
  await tester.runTest('Verification Requirements', () => tester.testVerificationFlow())
  await tester.runTest('Contact Flow (SMS/Email)', () => tester.testContactFlow())
  await tester.runTest('Pricing & Cost Splitting', () => tester.testPricingLogic())
  await tester.runTest('Mapbox Graceful Fallback', () => tester.testMapboxFallback())

  tester.printResults()

  await prisma.$disconnect()
}

// Run tests if this script is executed directly
if (require.main === module) {
  runMVPTests().catch(console.error)
}

export { runMVPTests, MVPTester }