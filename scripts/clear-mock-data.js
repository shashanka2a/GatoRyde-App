const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearMockData() {
  try {
    console.log('🧹 Starting to clear mock data...')

    // Delete mock rides first (due to foreign key constraints)
    console.log('🚗 Deleting mock rides...')
    const deletedRides = await prisma.ride.deleteMany({
      where: {
        id: {
          startsWith: 'ride-'
        }
      }
    })
    console.log(`✅ Deleted ${deletedRides.count} mock rides`)

    // Delete mock drivers
    console.log('👥 Deleting mock drivers...')
    const deletedDrivers = await prisma.driver.deleteMany({
      where: {
        userId: {
          startsWith: 'driver-'
        }
      }
    })
    console.log(`✅ Deleted ${deletedDrivers.count} mock drivers`)

    // Delete mock users
    console.log('👤 Deleting mock users...')
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: {
          startsWith: 'driver-'
        }
      }
    })
    console.log(`✅ Deleted ${deletedUsers.count} mock users`)

    console.log('🎉 Mock data cleared successfully!')

  } catch (error) {
    console.error('❌ Error clearing mock data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the clearing function
clearMockData()
