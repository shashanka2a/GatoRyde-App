/**
 * Pricing calculation utilities for ride sharing
 * Handles rounding, rider counts, and edge cases
 */

export class PricingUtils {
  /**
   * Calculate individual rider share based on total cost and number of riders
   * Handles rounding to ensure total adds up correctly
   */
  static calculateRiderShares(totalCostCents: number, riderCount: number): number[] {
    if (riderCount <= 0) throw new Error('Rider count must be positive')
    if (totalCostCents < 0) throw new Error('Total cost cannot be negative')
    
    const baseShare = Math.floor(totalCostCents / riderCount)
    const remainder = totalCostCents % riderCount
    
    const shares: number[] = []
    for (let i = 0; i < riderCount; i++) {
      // Distribute remainder among first few riders
      shares.push(baseShare + (i < remainder ? 1 : 0))
    }
    
    return shares
  }

  /**
   * Calculate estimated share for a new booking before trip completion
   */
  static calculateEstimatedShare(totalCostCents: number, currentRiders: number, newSeats: number): number {
    const totalRiders = currentRiders + newSeats
    return Math.ceil(totalCostCents / totalRiders)
  }

  /**
   * Calculate final shares after trip completion with proper rounding
   */
  static calculateFinalShares(totalCostCents: number, bookings: Array<{ seats: number }>): Array<{ share: number }> {
    const totalSeats = bookings.reduce((sum, booking) => sum + booking.seats, 0)
    if (totalSeats === 0) return []
    
    const baseSharePerSeat = Math.floor(totalCostCents / totalSeats)
    const remainder = totalCostCents % totalSeats
    
    let remainderDistributed = 0
    return bookings.map((booking) => {
      let share = baseSharePerSeat * booking.seats
      
      // Distribute remainder across bookings proportionally
      const extraCents = Math.min(remainder - remainderDistributed, booking.seats)
      share += extraCents
      remainderDistributed += extraCents
      
      return { share }
    })
  }

  /**
   * Validate pricing constraints
   */
  static validatePricing(totalCostCents: number, riderCount: number): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (totalCostCents < 100) errors.push('Minimum cost is $1.00')
    if (totalCostCents > 50000) errors.push('Maximum cost is $500.00')
    if (riderCount < 1) errors.push('Must have at least 1 rider')
    if (riderCount > 8) errors.push('Maximum 8 riders allowed')
    
    return { valid: errors.length === 0, errors }
  }

  /**
   * Format cents to currency string
   */
  static formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  /**
   * Calculate cost per mile if distance is provided
   */
  static calculateCostPerMile(totalCostCents: number, distanceMiles: number): number {
    if (distanceMiles <= 0) return 0
    return totalCostCents / distanceMiles / 100 // Return dollars per mile
  }

  /**
   * Suggest fair pricing based on distance and base rate
   */
  static suggestPricing(distanceMiles: number, baseRatePerMile: number = 0.50): number {
    const baseCost = Math.max(distanceMiles * baseRatePerMile * 100, 500) // Minimum $5.00
    const maxCost = 50000 // Maximum $500.00
    
    return Math.min(Math.round(baseCost), maxCost)
  }
}