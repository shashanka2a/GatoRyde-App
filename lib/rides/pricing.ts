// Pricing utilities for ride cost calculations

export function computeAuthEstimate(totalCostCents: number, currentRiders: number, newSeats: number): number {
  // Calculate estimated cost per person after booking
  const ridersAfterBooking = currentRiders + newSeats
  return Math.ceil(totalCostCents / ridersAfterBooking) * newSeats
}

export function computeFinalShare(totalCostCents: number, finalRiders: number): number {
  // Calculate final cost per person based on actual riders who completed the trip
  return Math.ceil(totalCostCents / finalRiders)
}

export function getRidersAfterBooking(seatsTotal: number, seatsAvailable: number, newSeats: number): number {
  // Calculate total riders after booking (including driver)
  const currentRiders = seatsTotal - seatsAvailable + 1 // +1 for driver
  return currentRiders + newSeats
}

export function getCurrentRiders(seatsTotal: number, seatsAvailable: number): number {
  // Calculate current riders (including driver)
  return seatsTotal - seatsAvailable + 1 // +1 for driver
}