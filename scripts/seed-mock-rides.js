const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const mockRides = [
  {
    id: 'ride-1',
    driverId: 'driver-1',
    originText: 'University of Florida Campus',
    originLat: 29.6436,
    originLng: -82.3549,
    destText: 'Gainesville Airport',
    destLat: 29.6901,
    destLng: -82.2718,
    departAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    totalCostCents: 2500, // $25.00
    seatsAvailable: 3,
    seatsTotal: 4,
    status: 'open',
    notes: 'Heading to the airport for a 3 PM flight. Can pick up from campus or nearby areas.'
  },
  {
    id: 'ride-2',
    driverId: 'driver-2',
    originText: 'UF Campus Library',
    originLat: 29.6436,
    originLng: -82.3549,
    destText: 'Downtown Gainesville',
    destLat: 29.6516,
    destLng: -82.3248,
    departAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
    totalCostCents: 850, // $8.50
    seatsAvailable: 2,
    seatsTotal: 3,
    status: 'open',
    notes: 'Quick trip downtown for lunch. Will be back on campus by 2 PM.'
  },
  {
    id: 'ride-3',
    driverId: 'driver-3',
    originText: 'UF Dorms',
    originLat: 29.6436,
    originLng: -82.3549,
    destText: 'Walmart Supercenter',
    destLat: 29.6789,
    destLng: -82.3456,
    departAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    totalCostCents: 1200, // $12.00
    seatsAvailable: 1,
    seatsTotal: 4,
    status: 'open',
    notes: 'Grocery shopping trip. Will wait 30 minutes at Walmart.'
  },
  {
    id: 'ride-4',
    driverId: 'driver-4',
    originText: 'UF Campus',
    originLat: 29.6436,
    originLng: -82.3549,
    destText: 'Butler Plaza',
    destLat: 29.6789,
    destLng: -82.3456,
    departAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    totalCostCents: 600, // $6.00
    seatsAvailable: 3,
    seatsTotal: 4,
    status: 'open',
    notes: 'Shopping at Butler Plaza. Multiple stops available.'
  },
  {
    id: 'ride-5',
    driverId: 'driver-5',
    originText: 'UF Campus',
    originLat: 29.6436,
    originLng: -82.3549,
    destText: 'Jacksonville Airport',
    destLat: 30.4941,
    destLng: -81.6879,
    departAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    totalCostCents: 4500, // $45.00
    seatsAvailable: 2,
    seatsTotal: 4,
    status: 'open',
    notes: 'Long trip to Jacksonville Airport. Early morning departure.'
  },
  {
    id: 'ride-6',
    driverId: 'driver-6',
    originText: 'UF Campus',
    originLat: 29.6436,
    originLng: -82.3549,
    destText: 'Orlando International Airport',
    destLat: 28.4312,
    destLng: -81.3081,
    departAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
    totalCostCents: 6500, // $65.00
    seatsAvailable: 1,
    seatsTotal: 3,
    status: 'open',
    notes: 'Weekend trip to Orlando. Can drop off at airport or Disney area.'
  }
]

const mockDrivers = [
  {
    id: 'driver-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@ufl.edu',
    phone: '+1 (352) 555-0123',
    university: 'University of Florida',
    eduVerified: true
  },
  {
    id: 'driver-2',
    name: 'Marcus Johnson',
    email: 'marcus.johnson@ufl.edu',
    phone: '+1 (352) 555-0456',
    university: 'University of Florida',
    eduVerified: true
  },
  {
    id: 'driver-3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@ufl.edu',
    phone: '+1 (352) 555-0789',
    university: 'University of Florida',
    eduVerified: true
  },
  {
    id: 'driver-4',
    name: 'David Kim',
    email: 'david.kim@ufl.edu',
    phone: '+1 (352) 555-0234',
    university: 'University of Florida',
    eduVerified: true
  },
  {
    id: 'driver-5',
    name: 'Alex Thompson',
    email: 'alex.thompson@ufl.edu',
    phone: '+1 (352) 555-0567',
    university: 'University of Florida',
    eduVerified: true
  },
  {
    id: 'driver-6',
    name: 'Jessica Lee',
    email: 'jessica.lee@ufl.edu',
    phone: '+1 (352) 555-0890',
    university: 'University of Florida',
    eduVerified: true
  }
]

async function seedMockData() {
  try {
    console.log('🌱 Starting to seed mock rides data...')

    // First, create mock drivers (users)
    console.log('👥 Creating mock drivers...')
    for (const driver of mockDrivers) {
      await prisma.user.upsert({
        where: { email: driver.email },
        update: driver,
        create: driver
      })
    }
    console.log('✅ Mock drivers (users) created successfully')

    // Create Driver records for each user
    console.log('🚗 Creating driver profiles...')
    for (const driver of mockDrivers) {
      await prisma.driver.upsert({
        where: { userId: driver.id },
        update: {
          verified: true,
          studentVerified: true
        },
        create: {
          userId: driver.id,
          verified: true,
          studentVerified: true
        }
      })
    }
    console.log('✅ Driver profiles created successfully')

    // Then create mock rides
    console.log('🚗 Creating mock rides...')
    for (const ride of mockRides) {
      await prisma.ride.upsert({
        where: { id: ride.id },
        update: {
          driverId: ride.driverId,
          originText: ride.originText,
          originLat: ride.originLat,
          originLng: ride.originLng,
          destText: ride.destText,
          destLat: ride.destLat,
          destLng: ride.destLng,
          departAt: ride.departAt,
          totalCostCents: ride.totalCostCents,
          seatsAvailable: ride.seatsAvailable,
          seatsTotal: ride.seatsTotal,
          status: ride.status,
          notes: ride.notes
        },
        create: {
          id: ride.id,
          driverId: ride.driverId,
          originText: ride.originText,
          originLat: ride.originLat,
          originLng: ride.originLng,
          destText: ride.destText,
          destLat: ride.destLat,
          destLng: ride.destLng,
          departAt: ride.departAt,
          totalCostCents: ride.totalCostCents,
          seatsAvailable: ride.seatsAvailable,
          seatsTotal: ride.seatsTotal,
          status: ride.status,
          notes: ride.notes
        }
      })
    }
    console.log('✅ Mock rides created successfully')

    console.log('🎉 Mock data seeding completed!')
    console.log(`📊 Created ${mockDrivers.length} drivers and ${mockRides.length} rides`)

  } catch (error) {
    console.error('❌ Error seeding mock data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding function
seedMockData()
