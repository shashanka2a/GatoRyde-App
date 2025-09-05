import { describe, it, expect } from '@jest/globals'

// Pricing calculation utilities
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
}

describe('PricingUtils', () => {
  describe('calculateRiderShares', () => {
    it('should divide evenly when total is divisible by rider count', () => {
      const shares = PricingUtils.calculateRiderShares(1000, 4) // $10.00 / 4 riders
      expect(shares).toEqual([250, 250, 250, 250])
      expect(shares.reduce((sum, share) => sum + share, 0)).toBe(1000)
    })

    it('should handle remainder by distributing extra cents to first riders', () => {
      const shares = PricingUtils.calculateRiderShares(1001, 4) // $10.01 / 4 riders
      expect(shares).toEqual([251, 250, 250, 250])
      expect(shares.reduce((sum, share) => sum + share, 0)).toBe(1001)
    })

    it('should handle large remainder distribution', () => {
      const shares = PricingUtils.calculateRiderShares(1003, 4) // $10.03 / 4 riders
      expect(shares).toEqual([251, 251, 251, 250])
      expect(shares.reduce((sum, share) => sum + share, 0)).toBe(1003)
    })

    it('should handle single rider', () => {
      const shares = PricingUtils.calculateRiderShares(1500, 1)
      expect(shares).toEqual([1500])
    })

    it('should handle edge case with small amounts', () => {
      const shares = PricingUtils.calculateRiderShares(3, 4) // 3 cents / 4 riders
      expect(shares).toEqual([1, 1, 1, 0])
      expect(shares.reduce((sum, share) => sum + share, 0)).toBe(3)
    })

    it('should throw error for invalid inputs', () => {
      expect(() => PricingUtils.calculateRiderShares(1000, 0)).toThrow('Rider count must be positive')
      expect(() => PricingUtils.calculateRiderShares(1000, -1)).toThrow('Rider count must be positive')
      expect(() => PricingUtils.calculateRiderShares(-100, 2)).toThrow('Total cost cannot be negative')
    })
  })

  describe('calculateEstimatedShare', () => {
    it('should calculate estimated share for new booking', () => {
      // $15.00 total, 2 current riders, 1 new seat = $5.00 per person
      const estimate = PricingUtils.calculateEstimatedShare(1500, 2, 1)
      expect(estimate).toBe(500)
    })

    it('should round up for estimates to be conservative', () => {
      // $15.01 total, 2 current riders, 1 new seat = $5.01 per person (rounded up)
      const estimate = PricingUtils.calculateEstimatedShare(1501, 2, 1)
      expect(estimate).toBe(501)
    })

    it('should handle multiple new seats', () => {
      // $20.00 total, 1 current rider, 2 new seats = $6.67 per person (rounded up to $6.67)
      const estimate = PricingUtils.calculateEstimatedShare(2000, 1, 2)
      expect(estimate).toBe(667)
    })
  })

  describe('calculateFinalShares', () => {
    it('should calculate final shares for multiple bookings with different seat counts', () => {
      const bookings = [
        { seats: 1 },
        { seats: 2 },
        { seats: 1 }
      ]
      const shares = PricingUtils.calculateFinalShares(1500, bookings) // $15.00 / 4 seats
      
      expect(shares).toEqual([
        { share: 375 }, // 1 seat
        { share: 750 }, // 2 seats  
        { share: 375 }  // 1 seat
      ])
      
      const total = shares.reduce((sum, { share }) => sum + share, 0)
      expect(total).toBe(1500)
    })

    it('should handle remainder distribution in final shares', () => {
      const bookings = [
        { seats: 1 },
        { seats: 1 },
        { seats: 1 }
      ]
      const shares = PricingUtils.calculateFinalShares(1001, bookings) // $10.01 / 3 seats
      
      expect(shares).toEqual([
        { share: 334 }, // Gets extra cent
        { share: 333 },
        { share: 334 }  // Gets extra cent
      ])
      
      const total = shares.reduce((sum, { share }) => sum + share, 0)
      expect(total).toBe(1001)
    })

    it('should handle empty bookings array', () => {
      const shares = PricingUtils.calculateFinalShares(1000, [])
      expect(shares).toEqual([])
    })
  })

  describe('validatePricing', () => {
    it('should validate correct pricing', () => {
      const result = PricingUtils.validatePricing(1500, 3)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject cost below minimum', () => {
      const result = PricingUtils.validatePricing(50, 2) // $0.50
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Minimum cost is $1.00')
    })

    it('should reject cost above maximum', () => {
      const result = PricingUtils.validatePricing(60000, 2) // $600.00
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Maximum cost is $500.00')
    })

    it('should reject invalid rider counts', () => {
      const resultTooFew = PricingUtils.validatePricing(1500, 0)
      expect(resultTooFew.valid).toBe(false)
      expect(resultTooFew.errors).toContain('Must have at least 1 rider')

      const resultTooMany = PricingUtils.validatePricing(1500, 10)
      expect(resultTooMany.valid).toBe(false)
      expect(resultTooMany.errors).toContain('Maximum 8 riders allowed')
    })

    it('should accumulate multiple errors', () => {
      const result = PricingUtils.validatePricing(50, 0)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors).toContain('Minimum cost is $1.00')
      expect(result.errors).toContain('Must have at least 1 rider')
    })
  })

  describe('edge cases and rounding scenarios', () => {
    it('should handle very small amounts with many riders', () => {
      const shares = PricingUtils.calculateRiderShares(7, 8) // 7 cents / 8 riders
      expect(shares).toEqual([1, 1, 1, 1, 1, 1, 1, 0])
      expect(shares.reduce((sum, share) => sum + share, 0)).toBe(7)
    })

    it('should handle maximum cost scenario', () => {
      const shares = PricingUtils.calculateRiderShares(50000, 8) // $500 / 8 riders
      expect(shares).toEqual([6250, 6250, 6250, 6250, 6250, 6250, 6250, 6250])
      expect(shares.reduce((sum, share) => sum + share, 0)).toBe(50000)
    })

    it('should maintain precision in complex scenarios', () => {
      // Real-world scenario: $47.83 split among 3 riders
      const totalCents = 4783
      const shares = PricingUtils.calculateRiderShares(totalCents, 3)
      
      expect(shares).toEqual([1595, 1594, 1594]) // $15.95, $15.94, $15.94
      expect(shares.reduce((sum, share) => sum + share, 0)).toBe(totalCents)
    })
  })
})