import { z } from 'zod'

// User schemas
export const UserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  phone: z.string().nullable(),
  eduVerified: z.boolean(),
  universityId: z.string().nullable(),
  state: z.string().nullable(),
  city: z.string().nullable(),
  photoUrl: z.string().nullable(),
  ratingAvg: z.number().nullable(),
  ratingCount: z.number(),
  createdAt: z.date(),
})

export const CreateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  eduVerified: z.boolean().default(false),
  universityId: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  photoUrl: z.string().optional(),
})

export const UpdateUserSchema = CreateUserSchema.partial()

// Driver schemas
export const DriverSchema = z.object({
  userId: z.string(),
  licenseNumber: z.string(),
  licensePhotoUrl: z.string().nullable(),
  verified: z.boolean(),
  offeredSeats: z.number(),
  zelleHandle: z.string().nullable(),
  cashAppHandle: z.string().nullable(),
  venmoHandle: z.string().nullable(),
  zelleQrUrl: z.string().nullable(),
  cashAppQrUrl: z.string().nullable(),
  paymentQrUrl: z.string().nullable(),
  vehicleId: z.string().nullable(),
})

export const CreateDriverSchema = z.object({
  userId: z.string(),
  licenseNumber: z.string(),
  licensePhotoUrl: z.string().optional(),
  verified: z.boolean().default(false),
  offeredSeats: z.number().default(4),
  zelleHandle: z.string().optional(),
  cashAppHandle: z.string().optional(),
  venmoHandle: z.string().optional(),
  zelleQrUrl: z.string().optional(),
  cashAppQrUrl: z.string().optional(),
  paymentQrUrl: z.string().optional(),
  vehicleId: z.string().optional(),
})

export const UpdateDriverSchema = CreateDriverSchema.partial().omit({ userId: true })

// Vehicle schemas
export const VehicleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  color: z.string(),
  plate: z.string(),
  seats: z.number(),
  photoUrl: z.string().nullable(),
})

export const CreateVehicleSchema = z.object({
  userId: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  color: z.string(),
  plate: z.string(),
  seats: z.number(),
  photoUrl: z.string().optional(),
})

export const UpdateVehicleSchema = CreateVehicleSchema.partial().omit({ userId: true })

// Ride schemas
export const RideStatusSchema = z.enum(['open', 'full', 'in_progress', 'completed', 'cancelled'])

export const RideSchema = z.object({
  id: z.string(),
  driverId: z.string(),
  originText: z.string(),
  originLat: z.number(),
  originLng: z.number(),
  destText: z.string(),
  destLat: z.number(),
  destLng: z.number(),
  departAt: z.date(),
  seatsTotal: z.number(),
  seatsAvailable: z.number(),
  pricePerSeatCents: z.number(),
  status: RideStatusSchema,
  polyline: z.string().nullable(),
})

export const CreateRideSchema = z.object({
  driverId: z.string(),
  originText: z.string(),
  originLat: z.number(),
  originLng: z.number(),
  destText: z.string(),
  destLat: z.number(),
  destLng: z.number(),
  departAt: z.date(),
  seatsTotal: z.number(),
  seatsAvailable: z.number(),
  pricePerSeatCents: z.number(),
  polyline: z.string().optional(),
})

export const UpdateRideSchema = CreateRideSchema.partial().omit({ driverId: true })

// Booking schemas
export const BookingStatusSchema = z.enum(['pending', 'authorized', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'])

export const BookingSchema = z.object({
  id: z.string(),
  rideId: z.string(),
  riderId: z.string(),
  seats: z.number(),
  authEstimateCents: z.number(),
  finalShareCents: z.number().nullable(),
  status: BookingStatusSchema,
  tripStartOtp: z.string().nullable(),
  otpExpiresAt: z.date().nullable(),
  tripStartedAt: z.date().nullable(),
  tripCompletedAt: z.date().nullable(),
  paidByRider: z.boolean().default(false),
  confirmedByDriver: z.boolean().default(false),
  proofOfPaymentUrl: z.string().nullable(),
})

export const CreateBookingSchema = z.object({
  rideId: z.string(),
  riderId: z.string(),
  seats: z.number(),
  authEstimateCents: z.number(),
  finalShareCents: z.number().optional(),
  tripStartOtp: z.string().optional(),
  paidByRider: z.boolean().default(false),
  confirmedByDriver: z.boolean().default(false),
  proofOfPaymentUrl: z.string().optional(),
})

export const UpdateBookingSchema = CreateBookingSchema.partial().omit({ rideId: true, riderId: true })

// Payment schemas
export const PaymentSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  stripePaymentIntent: z.string(),
  amountCents: z.number(),
  authorizedAt: z.date().nullable(),
  capturedAt: z.date().nullable(),
  refundStatus: z.string().nullable(),
})

export const CreatePaymentSchema = z.object({
  bookingId: z.string(),
  stripePaymentIntent: z.string(),
  amountCents: z.number(),
})

export const UpdatePaymentSchema = z.object({
  authorizedAt: z.date().optional(),
  capturedAt: z.date().optional(),
  refundStatus: z.string().optional(),
})

// Message schemas
export const MessageSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  fromUserId: z.string(),
  text: z.string(),
  createdAt: z.date(),
})

export const CreateMessageSchema = z.object({
  bookingId: z.string(),
  fromUserId: z.string(),
  text: z.string(),
})

// Verification schemas
export const VerificationTypeSchema = z.enum(['license', 'vehicle', 'student'])
export const VerificationStatusSchema = z.enum(['pending', 'approved', 'rejected'])

export const VerificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: VerificationTypeSchema,
  status: VerificationStatusSchema,
  files: z.any().nullable(),
  notes: z.string().nullable(),
})

export const CreateVerificationSchema = z.object({
  userId: z.string(),
  type: VerificationTypeSchema,
  files: z.any().optional(),
  notes: z.string().optional(),
})

export const UpdateVerificationSchema = z.object({
  status: VerificationStatusSchema.optional(),
  files: z.any().optional(),
  notes: z.string().optional(),
})

// Dispute schemas
export const DisputeStatusSchema = z.enum(['open', 'resolved', 'rejected'])

export const DisputeSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  openedById: z.string(),
  reason: z.string(),
  status: DisputeStatusSchema,
  resolution: z.string().nullable(),
})

export const CreateDisputeSchema = z.object({
  bookingId: z.string(),
  openedById: z.string(),
  reason: z.string(),
})

export const UpdateDisputeSchema = z.object({
  status: DisputeStatusSchema.optional(),
  resolution: z.string().optional(),
})

// Type exports
export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
export type UpdateUser = z.infer<typeof UpdateUserSchema>

export type Driver = z.infer<typeof DriverSchema>
export type CreateDriver = z.infer<typeof CreateDriverSchema>
export type UpdateDriver = z.infer<typeof UpdateDriverSchema>

export type Vehicle = z.infer<typeof VehicleSchema>
export type CreateVehicle = z.infer<typeof CreateVehicleSchema>
export type UpdateVehicle = z.infer<typeof UpdateVehicleSchema>

export type Ride = z.infer<typeof RideSchema>
export type CreateRide = z.infer<typeof CreateRideSchema>
export type UpdateRide = z.infer<typeof UpdateRideSchema>
export type RideStatus = z.infer<typeof RideStatusSchema>

export type Booking = z.infer<typeof BookingSchema>
export type CreateBooking = z.infer<typeof CreateBookingSchema>
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>
export type BookingStatus = z.infer<typeof BookingStatusSchema>

export type Payment = z.infer<typeof PaymentSchema>
export type CreatePayment = z.infer<typeof CreatePaymentSchema>
export type UpdatePayment = z.infer<typeof UpdatePaymentSchema>

export type Message = z.infer<typeof MessageSchema>
export type CreateMessage = z.infer<typeof CreateMessageSchema>

export type Verification = z.infer<typeof VerificationSchema>
export type CreateVerification = z.infer<typeof CreateVerificationSchema>
export type UpdateVerification = z.infer<typeof UpdateVerificationSchema>
export type VerificationType = z.infer<typeof VerificationTypeSchema>
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>

export type Dispute = z.infer<typeof DisputeSchema>
export type CreateDispute = z.infer<typeof CreateDisputeSchema>
export type UpdateDispute = z.infer<typeof UpdateDisputeSchema>
export type DisputeStatus = z.infer<typeof DisputeStatusSchema>