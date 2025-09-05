// Example usage of ContactDriverCard component

import { ContactDriverCard } from './ContactDriverCard'

// Example 1: Basic usage with verified users
export function ExampleVerifiedUsers() {
  const driver = {
    name: 'Sarah Johnson',
    phone: '5551234567',
    email: 'sarah.johnson@ufl.edu',
    verified: true,
    zelleHandle: 'sarah.johnson@ufl.edu',
    cashAppHandle: '$sarahj',
  }

  const ride = {
    destText: 'Tampa International Airport',
    departAt: new Date('2024-12-25T14:30:00Z'),
  }

  const currentUser = {
    eduVerified: true,
  }

  return (
    <ContactDriverCard
      driver={driver}
      ride={ride}
      currentUser={currentUser}
      bookingId="booking_abc123"
      className="max-w-md"
    />
  )
}

// Example 2: Unverified user scenario
export function ExampleUnverifiedUser() {
  const driver = {
    name: 'Mike Chen',
    phone: '5559876543',
    email: 'mike.chen@ufl.edu',
    verified: true,
    zelleHandle: null,
    cashAppHandle: '$mikechen',
  }

  const ride = {
    destText: 'Orlando Premium Outlets',
    departAt: new Date('2024-12-26T10:00:00Z'),
  }

  const currentUser = {
    eduVerified: false, // User not verified
  }

  return (
    <ContactDriverCard
      driver={driver}
      ride={ride}
      currentUser={currentUser}
      bookingId="booking_def456"
      className="max-w-md"
    />
  )
}

// Example 3: Driver not verified scenario
export function ExampleUnverifiedDriver() {
  const driver = {
    name: 'Alex Rodriguez',
    phone: '5555551234',
    email: 'alex.rodriguez@ufl.edu',
    verified: false, // Driver not verified
    zelleHandle: 'alex.rodriguez@ufl.edu',
    cashAppHandle: null,
  }

  const ride = {
    destText: 'Jacksonville Beach',
    departAt: new Date('2024-12-27T09:15:00Z'),
  }

  const currentUser = {
    eduVerified: true,
  }

  return (
    <ContactDriverCard
      driver={driver}
      ride={ride}
      currentUser={currentUser}
      bookingId="booking_ghi789"
      className="max-w-md"
    />
  )
}

// Example 4: No payment methods
export function ExampleNoPaymentMethods() {
  const driver = {
    name: 'Emma Wilson',
    phone: '5554443333',
    email: 'emma.wilson@ufl.edu',
    verified: true,
    zelleHandle: null,
    cashAppHandle: null,
  }

  const ride = {
    destText: 'Gainesville Regional Airport',
    departAt: new Date('2024-12-28T16:45:00Z'),
  }

  const currentUser = {
    eduVerified: true,
  }

  return (
    <ContactDriverCard
      driver={driver}
      ride={ride}
      currentUser={currentUser}
      bookingId="booking_jkl012"
      className="max-w-md"
    />
  )
}

// Example 5: Integration in a ride details page
export function RideDetailsPageExample() {
  // This would typically come from your API/database
  const rideData = {
    id: 'ride_123',
    driver: {
      name: 'Jessica Martinez',
      phone: '5556667777',
      email: 'jessica.martinez@ufl.edu',
      verified: true,
      zelleHandle: 'jessica.martinez@ufl.edu',
      cashAppHandle: '$jessicam',
    },
    ride: {
      destText: 'Miami International Airport',
      departAt: new Date('2024-12-29T11:30:00Z'),
    },
    booking: {
      id: 'booking_xyz789',
    },
  }

  const currentUser = {
    eduVerified: true,
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ride Details</h1>
      
      {/* Other ride information components would go here */}
      
      <ContactDriverCard
        driver={rideData.driver}
        ride={rideData.ride}
        currentUser={currentUser}
        bookingId={rideData.booking.id}
        className="w-full"
      />
    </div>
  )
}

// Example 6: Mobile-optimized layout
export function MobileOptimizedExample() {
  const driver = {
    name: 'David Kim',
    phone: '5558889999',
    email: 'david.kim@ufl.edu',
    verified: true,
    zelleHandle: 'david.kim@ufl.edu',
    cashAppHandle: '$davidkim',
  }

  const ride = {
    destText: 'Universal Studios Orlando',
    departAt: new Date('2024-12-30T08:00:00Z'),
  }

  const currentUser = {
    eduVerified: true,
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-sm mx-auto">
        <ContactDriverCard
          driver={driver}
          ride={ride}
          currentUser={currentUser}
          bookingId="booking_mobile123"
          className="w-full"
        />
      </div>
    </div>
  )
}