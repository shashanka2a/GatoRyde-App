import { z } from 'zod'

// License verification schema
export const LicenseVerificationSchema = z.object({
  licenseNumber: z.string()
    .min(5, 'License number must be at least 5 characters')
    .max(20, 'License number must be less than 20 characters')
    .regex(/^[A-Z0-9\-]+$/i, 'License number contains invalid characters'),
  licenseState: z.string()
    .length(2, 'State must be 2 characters')
    .regex(/^[A-Z]{2}$/, 'State must be valid US state code'),
  expirationDate: z.string()
    .refine((date) => {
      const expDate = new Date(date)
      const today = new Date()
      return expDate > today
    }, 'License must not be expired'),
})

// Vehicle verification schema
export const VehicleVerificationSchema = z.object({
  make: z.string().min(1, 'Vehicle make is required'),
  model: z.string().min(1, 'Vehicle model is required'),
  year: z.number()
    .min(2000, 'Vehicle must be 2000 or newer')
    .max(new Date().getFullYear() + 1, 'Invalid vehicle year'),
  color: z.string().min(1, 'Vehicle color is required'),
  licensePlate: z.string()
    .min(2, 'License plate is required')
    .max(10, 'License plate too long')
    .regex(/^[A-Z0-9\-\s]+$/i, 'License plate contains invalid characters'),
  vin: z.string()
    .length(17, 'VIN must be exactly 17 characters')
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/i, 'Invalid VIN format'),
  seats: z.number()
    .min(2, 'Vehicle must have at least 2 seats')
    .max(8, 'Vehicle cannot have more than 8 seats'),
})

// Student verification schema
export const StudentVerificationSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  university: z.string().min(1, 'University is required'),
  graduationYear: z.number()
    .min(new Date().getFullYear(), 'Graduation year must be current year or later')
    .max(new Date().getFullYear() + 10, 'Graduation year too far in future'),
  major: z.string().min(1, 'Major is required'),
})

// Combined KYC submission schema
export const KYCSubmissionSchema = z.object({
  type: z.enum(['license', 'vehicle', 'student']),
  data: z.union([
    LicenseVerificationSchema,
    VehicleVerificationSchema,
    StudentVerificationSchema
  ]),
})

// Admin review schema
export const AdminReviewSchema = z.object({
  verificationId: z.string().cuid(),
  status: z.enum(['approved', 'rejected']),
  notes: z.string().optional(),
})

// File metadata interface
export interface FileMetadata {
  url: string
  path: string
  size: number
  type: string
  uploadedAt: string
}

// KYC submission interfaces
export interface LicenseVerificationData {
  licenseNumber: string
  licenseState: string
  expirationDate: string
}

export interface VehicleVerificationData {
  make: string
  model: string
  year: number
  color: string
  licensePlate: string
  vin: string
  seats: number
}

export interface StudentVerificationData {
  studentId: string
  university: string
  graduationYear: number
  major: string
}

export type VerificationData = 
  | LicenseVerificationData 
  | VehicleVerificationData 
  | StudentVerificationData

export interface KYCSubmission {
  type: 'license' | 'vehicle' | 'student'
  data: VerificationData
  files: Record<string, FileMetadata>
}

// Admin interfaces
export interface VerificationWithUser {
  id: string
  userId: string
  type: 'license' | 'vehicle' | 'student'
  status: 'pending' | 'approved' | 'rejected'
  data: VerificationData
  files: Record<string, FileMetadata>
  notes: string | null
  reviewedBy: string | null
  reviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
  }
}

// Type exports
export type LicenseVerificationRequest = z.infer<typeof LicenseVerificationSchema>
export type VehicleVerificationRequest = z.infer<typeof VehicleVerificationSchema>
export type StudentVerificationRequest = z.infer<typeof StudentVerificationSchema>
export type KYCSubmissionRequest = z.infer<typeof KYCSubmissionSchema>
export type AdminReviewRequest = z.infer<typeof AdminReviewSchema>

// Utility functions
export function maskLicenseNumber(licenseNumber: string): string {
  if (licenseNumber.length <= 4) return licenseNumber
  const visibleChars = 2
  const maskedLength = licenseNumber.length - visibleChars * 2
  const masked = '*'.repeat(Math.max(maskedLength, 1))
  return licenseNumber.slice(0, visibleChars) + masked + licenseNumber.slice(-visibleChars)
}

export function getVerificationDisplayName(type: string): string {
  switch (type) {
    case 'license': return 'Driver License'
    case 'vehicle': return 'Vehicle Registration'
    case 'student': return 'Student ID'
    default: return 'Verification'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'yellow'
    case 'approved': return 'green'
    case 'rejected': return 'red'
    default: return 'gray'
  }
}