const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearMockData() {
  try {
    console.log('🧹 Starting to clear ALL dummy data...')

    // Delete in order to respect foreign key constraints
    console.log('🗑️  Deleting ride request offers...')
    const deletedOffers = await prisma.rideRequestOffer.deleteMany({})
    console.log(`   Deleted ${deletedOffers.count} ride request offers`)
    
    console.log('🗑️  Deleting ride requests...')
    const deletedRequests = await prisma.rideRequest.deleteMany({})
    console.log(`   Deleted ${deletedRequests.count} ride requests`)
    
    console.log('🗑️  Deleting bookings...')
    const deletedBookings = await prisma.booking.deleteMany({})
    console.log(`   Deleted ${deletedBookings.count} bookings`)
    
    console.log('🗑️  Deleting contact logs...')
    const deletedContacts = await prisma.contactLog.deleteMany({})
    console.log(`   Deleted ${deletedContacts.count} contact logs`)
    
    console.log('🗑️  Deleting rides...')
    const deletedRides = await prisma.ride.deleteMany({})
    console.log(`   Deleted ${deletedRides.count} rides`)
    
    console.log('🗑️  Deleting drivers...')
    const deletedDrivers = await prisma.driver.deleteMany({})
    console.log(`   Deleted ${deletedDrivers.count} drivers`)
    
    console.log('🗑️  Deleting OTPs...')
    const deletedOTPs = await prisma.oTP.deleteMany({})
    console.log(`   Deleted ${deletedOTPs.count} OTPs`)
    
    console.log('🗑️  Deleting users...')
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`   Deleted ${deletedUsers.count} users`)

    console.log('\n✅ ALL dummy data cleared successfully!')
    console.log('📊 Summary:')
    console.log(`   - Users: ${deletedUsers.count}`)
    console.log(`   - Drivers: ${deletedDrivers.count}`)
    console.log(`   - Rides: ${deletedRides.count}`)
    console.log(`   - Ride Requests: ${deletedRequests.count}`)
    console.log(`   - Bookings: ${deletedBookings.count}`)
    console.log(`   - Contact Logs: ${deletedContacts.count}`)
    console.log(`   - OTPs: ${deletedOTPs.count}`)
    console.log(`   - Ride Request Offers: ${deletedOffers.count}`)

  } catch (error) {
    console.error('❌ Error clearing data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the clearing function
clearMockData()
