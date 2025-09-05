import { z } from 'zod'

export const NotificationTypeSchema = z.enum([
  'booking_authorized',
  'booking_confirmed', 
  'trip_started',
  'trip_completed',
  'booking_cancelled',
  'booking_disputed'
])

export const NotificationChannelSchema = z.enum(['email', 'sms'])

export const NotificationStatusSchema = z.enum([
  'pending',
  'sent',
  'delivered',
  'failed',
  'retrying'
])

export const NotificationSchema = z.object({
  id: z.string(),
  type: NotificationTypeSchema,
  channel: NotificationChannelSchema,
  recipientId: z.string(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  subject: z.string().optional(),
  content: z.string(),
  templateData: z.record(z.any()).optional(),
  bookingId: z.string().optional(),
  rideId: z.string().optional(),
  status: NotificationStatusSchema,
  attempts: z.number().default(0),
  maxAttempts: z.number().default(3),
  scheduledAt: z.date(),
  sentAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  failedAt: z.date().optional(),
  errorMessage: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CreateNotificationSchema = z.object({
  type: NotificationTypeSchema,
  channel: NotificationChannelSchema,
  recipientId: z.string(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  subject: z.string().optional(),
  content: z.string(),
  templateData: z.record(z.any()).optional(),
  bookingId: z.string().optional(),
  rideId: z.string().optional(),
  scheduledAt: z.date().optional()
})

export const UpdateNotificationSchema = z.object({
  status: NotificationStatusSchema.optional(),
  attempts: z.number().optional(),
  sentAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  failedAt: z.date().optional(),
  errorMessage: z.string().optional()
})

// Template data interfaces for type safety
export interface BookingAuthorizedTemplateData {
  riderName: string
  driverName: string
  originText: string
  destText: string
  departAt: Date
  seats: number
  otpCode?: string
  estimatedCost: number
}

export interface TripStartedTemplateData {
  riderName: string
  driverName: string
  originText: string
  destText: string
  departAt: Date
  seats: number
}

export interface TripCompletedTemplateData {
  riderName: string
  driverName: string
  driverEmail: string
  driverPhone?: string
  originText: string
  destText: string
  departAt: Date
  seats: number
  finalShareCents: number
  zelleHandle?: string
  cashAppHandle?: string
  zelleQrUrl?: string
  cashAppQrUrl?: string
}

export interface BookingCancelledTemplateData {
  riderName: string
  driverName: string
  originText: string
  destText: string
  departAt: Date
  seats: number
  reason?: string
  isDriverCancellation?: boolean
  isRiderCancellation?: boolean
  apologyMessage?: string
  reSearchUrl?: string
  additionalMessage?: string
}

export interface BookingDisputedTemplateData {
  riderName: string
  driverName: string
  disputeOpenerName: string
  originText: string
  destText: string
  departAt: Date
  seats: number
  disputeReason: string
}

export type NotificationType = z.infer<typeof NotificationTypeSchema>
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>
export type NotificationStatus = z.infer<typeof NotificationStatusSchema>
export type Notification = z.infer<typeof NotificationSchema>
export type CreateNotification = z.infer<typeof CreateNotificationSchema>
export type UpdateNotification = z.infer<typeof UpdateNotificationSchema>