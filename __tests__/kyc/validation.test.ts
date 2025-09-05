import { describe, it, expect } from '@jest/globals'
import { 
  LicenseVerificationSchema,
  VehicleVerificationSchema,
  StudentVerificationSchema,
  KYCSubmissionSchema,
  AdminReviewSchema,
  maskLicenseNumber,
  getVerificationDisplayName,
  getStatusColor
} from '../../lib/kyc/types'
import { z } from 'zod'

describe('KYC Validation', () => {
  describe('LicenseVerificationSchema', () => {
    it('should validate valid license data', () => {
      const validData = {
        licenseNumber: 'DL123456789',
        licenseState: 'FL',
        expirationDate: '2025-12-31'
      }

      expect(() => LicenseVerificationSchema.parse(validData)).not.toThrow()
    })

    it('should reject invalid license number', () => {
      const invalidData = {
        licenseNumber: 'abc', // Too short
        licenseState: 'FL',
        expirationDate: '2025-12-31'
      }

      expect(() => LicenseVerificationSchema.parse(invalidData)).toThrow()
    })

    it('should reject invalid state code', () => {
      const invalidData = {
        licenseNumber: 'DL123456789',
        licenseState: 'FLA', // Too long
        expirationDate: '2025-12-31'
      }

      expect(() => LicenseVerificationSchema.parse(invalidData)).toThrow()
    })

    it('should reject expired license', () => {
      const expiredData = {
        licenseNumber: 'DL123456789',
        licenseState: 'FL',
        expirationDate: '2020-01-01' // Expired
      }

      expect(() => LicenseVerificationSchema.parse(expiredData)).toThrow()
    })

    it('should accept special characters in license number', () => {
      const validData = {
        licenseNumber: 'DL-123-456',
        licenseState: 'CA',
        expirationDate: '2025-12-31'
      }

      expect(() => LicenseVerificationSchema.parse(validData)).not.toThrow()
    })
  })

  describe('VehicleVerificationSchema', () => {
    it('should validate valid vehicle data', () => {
      const validData = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Blue',
        licensePlate: 'ABC123',
        vin: '1HGBH41JXMN109186',
        seats: 5
      }

      expect(() => VehicleVerificationSchema.parse(validData)).not.toThrow()
    })

    it('should reject old vehicles', () => {
      const oldVehicle = {
        make: 'Toyota',
        model: 'Camry',
        year: 1999, // Too old
        color: 'Blue',
        licensePlate: 'ABC123',
        vin: '1HGBH41JXMN109186',
        seats: 5
      }

      expect(() => VehicleVerificationSchema.parse(oldVehicle)).toThrow()
    })

    it('should reject invalid VIN', () => {
      const invalidVin = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Blue',
        licensePlate: 'ABC123',
        vin: '123', // Too short
        seats: 5
      }

      expect(() => VehicleVerificationSchema.parse(invalidVin)).toThrow()
    })

    it('should reject invalid seat count', () => {
      const invalidSeats = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Blue',
        licensePlate: 'ABC123',
        vin: '1HGBH41JXMN109186',
        seats: 1 // Too few
      }

      expect(() => VehicleVerificationSchema.parse(invalidSeats)).toThrow()
    })

    it('should accept valid VIN format', () => {
      const validVins = [
        '1HGBH41JXMN109186',
        'JH4KA8260MC000000',
        'WVWZZZ1JZ3W386752'
      ]

      validVins.forEach(vin => {
        const data = {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'Blue',
          licensePlate: 'ABC123',
          vin,
          seats: 5
        }

        expect(() => VehicleVerificationSchema.parse(data)).not.toThrow()
      })
    })
  })

  describe('StudentVerificationSchema', () => {
    it('should validate valid student data', () => {
      const currentYear = new Date().getFullYear()
      const validData = {
        studentId: 'STU123456',
        university: 'University of Florida',
        graduationYear: currentYear + 2,
        major: 'Computer Science'
      }

      expect(() => StudentVerificationSchema.parse(validData)).not.toThrow()
    })

    it('should reject past graduation year', () => {
      const currentYear = new Date().getFullYear()
      const pastGraduation = {
        studentId: 'STU123456',
        university: 'University of Florida',
        graduationYear: currentYear - 1, // Past year
        major: 'Computer Science'
      }

      expect(() => StudentVerificationSchema.parse(pastGraduation)).toThrow()
    })

    it('should reject far future graduation year', () => {
      const currentYear = new Date().getFullYear()
      const farFuture = {
        studentId: 'STU123456',
        university: 'University of Florida',
        graduationYear: currentYear + 15, // Too far in future
        major: 'Computer Science'
      }

      expect(() => StudentVerificationSchema.parse(farFuture)).toThrow()
    })

    it('should require all fields', () => {
      const incompleteData = {
        studentId: 'STU123456',
        university: '', // Empty
        graduationYear: 2025,
        major: 'Computer Science'
      }

      expect(() => StudentVerificationSchema.parse(incompleteData)).toThrow()
    })
  })

  describe('KYCSubmissionSchema', () => {
    it('should validate license submission', () => {
      const licenseSubmission = {
        type: 'license' as const,
        data: {
          licenseNumber: 'DL123456789',
          licenseState: 'FL',
          expirationDate: '2025-12-31'
        }
      }

      expect(() => KYCSubmissionSchema.parse(licenseSubmission)).not.toThrow()
    })

    it('should validate vehicle submission', () => {
      const vehicleSubmission = {
        type: 'vehicle' as const,
        data: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'Blue',
          licensePlate: 'ABC123',
          vin: '1HGBH41JXMN109186',
          seats: 5
        }
      }

      expect(() => KYCSubmissionSchema.parse(vehicleSubmission)).not.toThrow()
    })

    it('should validate student submission', () => {
      const currentYear = new Date().getFullYear()
      const studentSubmission = {
        type: 'student' as const,
        data: {
          studentId: 'STU123456',
          university: 'University of Florida',
          graduationYear: currentYear + 2,
          major: 'Computer Science'
        }
      }

      expect(() => KYCSubmissionSchema.parse(studentSubmission)).not.toThrow()
    })

    it('should reject invalid type', () => {
      const invalidSubmission = {
        type: 'invalid' as any,
        data: {}
      }

      expect(() => KYCSubmissionSchema.parse(invalidSubmission)).toThrow()
    })
  })

  describe('AdminReviewSchema', () => {
    it('should validate admin review', () => {
      const validReview = {
        verificationId: 'clp123456789012345',
        status: 'approved' as const,
        notes: 'Looks good'
      }

      expect(() => AdminReviewSchema.parse(validReview)).not.toThrow()
    })

    it('should accept review without notes', () => {
      const reviewWithoutNotes = {
        verificationId: 'clp123456789012345',
        status: 'rejected' as const
      }

      expect(() => AdminReviewSchema.parse(reviewWithoutNotes)).not.toThrow()
    })

    it('should reject invalid status', () => {
      const invalidReview = {
        verificationId: 'clp123456789012345',
        status: 'maybe' as any
      }

      expect(() => AdminReviewSchema.parse(invalidReview)).toThrow()
    })

    it('should reject invalid verification ID format', () => {
      const invalidId = {
        verificationId: 'invalid-id',
        status: 'approved' as const
      }

      expect(() => AdminReviewSchema.parse(invalidId)).toThrow()
    })
  })
})

describe('Utility Functions', () => {
  describe('maskLicenseNumber', () => {
    it('should mask long license numbers correctly', () => {
      expect(maskLicenseNumber('DL123456789')).toBe('DL*****89')
    })

    it('should mask medium license numbers', () => {
      expect(maskLicenseNumber('ABC123')).toBe('AB**23')
    })

    it('should handle short license numbers', () => {
      expect(maskLicenseNumber('AB12')).toBe('AB12') // No masking for very short
    })

    it('should handle very short license numbers', () => {
      expect(maskLicenseNumber('A1')).toBe('A1')
    })

    it('should handle single character', () => {
      expect(maskLicenseNumber('A')).toBe('A')
    })

    it('should handle empty string', () => {
      expect(maskLicenseNumber('')).toBe('')
    })
  })

  describe('getVerificationDisplayName', () => {
    it('should return correct display names', () => {
      expect(getVerificationDisplayName('license')).toBe('Driver License')
      expect(getVerificationDisplayName('vehicle')).toBe('Vehicle Registration')
      expect(getVerificationDisplayName('student')).toBe('Student ID')
      expect(getVerificationDisplayName('unknown')).toBe('Verification')
    })
  })

  describe('getStatusColor', () => {
    it('should return correct colors for statuses', () => {
      expect(getStatusColor('pending')).toBe('yellow')
      expect(getStatusColor('approved')).toBe('green')
      expect(getStatusColor('rejected')).toBe('red')
      expect(getStatusColor('unknown')).toBe('gray')
    })
  })
})

describe('Edge Cases and Security', () => {
  describe('Input Sanitization', () => {
    it('should handle special characters in license number', () => {
      const dataWithSpecialChars = {
        licenseNumber: 'DL-123/456',
        licenseState: 'FL',
        expirationDate: '2025-12-31'
      }

      // Should reject invalid characters
      expect(() => LicenseVerificationSchema.parse(dataWithSpecialChars)).toThrow()
    })

    it('should handle SQL injection attempts', () => {
      const maliciousData = {
        licenseNumber: "DL123'; DROP TABLE users; --",
        licenseState: 'FL',
        expirationDate: '2025-12-31'
      }

      // Should reject due to invalid characters
      expect(() => LicenseVerificationSchema.parse(maliciousData)).toThrow()
    })

    it('should handle XSS attempts', () => {
      const xssData = {
        make: '<script>alert("xss")</script>',
        model: 'Camry',
        year: 2020,
        color: 'Blue',
        licensePlate: 'ABC123',
        vin: '1HGBH41JXMN109186',
        seats: 5
      }

      // Should pass validation but be sanitized by the application
      expect(() => VehicleVerificationSchema.parse(xssData)).not.toThrow()
    })
  })

  describe('Boundary Testing', () => {
    it('should handle minimum valid year', () => {
      const minYearData = {
        make: 'Toyota',
        model: 'Camry',
        year: 2000, // Minimum allowed
        color: 'Blue',
        licensePlate: 'ABC123',
        vin: '1HGBH41JXMN109186',
        seats: 5
      }

      expect(() => VehicleVerificationSchema.parse(minYearData)).not.toThrow()
    })

    it('should handle maximum valid year', () => {
      const maxYearData = {
        make: 'Toyota',
        model: 'Camry',
        year: new Date().getFullYear() + 1, // Maximum allowed
        color: 'Blue',
        licensePlate: 'ABC123',
        vin: '1HGBH41JXMN109186',
        seats: 5
      }

      expect(() => VehicleVerificationSchema.parse(maxYearData)).not.toThrow()
    })

    it('should handle minimum and maximum seat counts', () => {
      const minSeats = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Blue',
        licensePlate: 'ABC123',
        vin: '1HGBH41JXMN109186',
        seats: 2 // Minimum
      }

      const maxSeats = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Blue',
        licensePlate: 'ABC123',
        vin: '1HGBH41JXMN109186',
        seats: 8 // Maximum
      }

      expect(() => VehicleVerificationSchema.parse(minSeats)).not.toThrow()
      expect(() => VehicleVerificationSchema.parse(maxSeats)).not.toThrow()
    })
  })
})