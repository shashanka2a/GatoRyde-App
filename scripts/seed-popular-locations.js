const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedPopularLocations() {
  try {
    console.log('🌍 Seeding popular locations...')

    // Popular origins (Gainesville Pickup Hotspots - Apartments & Campus)
    const popularOrigins = [
      { location: 'Reitz Union, Gainesville, FL', placeName: 'Reitz Union (UF main landmark)', lat: 29.6436, lng: -82.3549, searchCount: 65 },
      { location: 'University Terrace, Gainesville, FL', placeName: 'University Terrace', lat: 29.6436, lng: -82.3549, searchCount: 58 },
      { location: 'The Quarters, Gainesville, FL', placeName: 'The Quarters', lat: 29.6436, lng: -82.3549, searchCount: 52 },
      { location: 'Stone Ridge, Gainesville, FL', placeName: 'Stone Ridge', lat: 29.6436, lng: -82.3549, searchCount: 48 },
      { location: 'The Standard, Gainesville, FL', placeName: 'The Standard', lat: 29.6436, lng: -82.3549, searchCount: 45 },
      { location: 'The Nine, Gainesville, FL', placeName: 'The Nine', lat: 29.6436, lng: -82.3549, searchCount: 42 },
      { location: 'Hub on Campus, Gainesville, FL', placeName: 'Hub on Campus', lat: 29.6436, lng: -82.3549, searchCount: 38 },
      { location: 'Campus Circle, Gainesville, FL', placeName: 'Campus Circle', lat: 29.6436, lng: -82.3549, searchCount: 35 },
      { location: 'The Retreat, Gainesville, FL', placeName: 'The Retreat', lat: 29.6436, lng: -82.3549, searchCount: 32 },
      { location: 'UF Campus, Gainesville, FL', placeName: 'UF Campus', lat: 29.6436, lng: -82.3549, searchCount: 28 }
    ]

    // Popular destinations (Common Drop-off / Travel Destinations)
    const popularDestinations = [
      { location: 'Orlando International Airport, Orlando, FL', placeName: 'Orlando International Airport (MCO)', lat: 28.4312, lng: -81.3081, searchCount: 85 },
      { location: 'Tampa International Airport, Tampa, FL', placeName: 'Tampa International Airport (TPA)', lat: 27.9755, lng: -82.5332, searchCount: 78 },
      { location: 'Jacksonville International Airport, Jacksonville, FL', placeName: 'Jacksonville International Airport (JAX)', lat: 30.4941, lng: -81.6879, searchCount: 65 },
      { location: 'Downtown Orlando, Orlando, FL', placeName: 'Downtown Orlando', lat: 28.5383, lng: -81.3792, searchCount: 58 },
      { location: 'Ybor City, Tampa, FL', placeName: 'Tampa (Ybor City)', lat: 27.9681, lng: -82.4334, searchCount: 52 },
      { location: 'Channelside, Tampa, FL', placeName: 'Tampa (Channelside)', lat: 27.9425, lng: -82.4512, searchCount: 48 },
      { location: 'Butler Plaza, Gainesville, FL', placeName: 'Butler Plaza', lat: 29.6516, lng: -82.3248, searchCount: 42 },
      { location: 'Gainesville Mall, Gainesville, FL', placeName: 'Gainesville Mall', lat: 29.6516, lng: -82.3248, searchCount: 35 },
      { location: 'Walmart Supercenter, Gainesville, FL', placeName: 'Walmart Supercenter', lat: 29.6516, lng: -82.3248, searchCount: 30 },
      { location: 'Target, Gainesville, FL', placeName: 'Target', lat: 29.6516, lng: -82.3248, searchCount: 28 }
    ]

    // Clear existing data
    await prisma.locationSearch.deleteMany({})
    console.log('🗑️ Cleared existing location data')

    // Insert popular origins
    for (const origin of popularOrigins) {
      await prisma.locationSearch.create({
        data: {
          ...origin,
          searchType: 'origin',
          lastSearched: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last week
        }
      })
    }
    console.log(`✅ Seeded ${popularOrigins.length} popular origins`)

    // Insert popular destinations
    for (const destination of popularDestinations) {
      await prisma.locationSearch.create({
        data: {
          ...destination,
          searchType: 'destination',
          lastSearched: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last week
        }
      })
    }
    console.log(`✅ Seeded ${popularDestinations.length} popular destinations`)

    console.log('🎉 Popular locations seeded successfully!')

  } catch (error) {
    console.error('❌ Error seeding popular locations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPopularLocations()
