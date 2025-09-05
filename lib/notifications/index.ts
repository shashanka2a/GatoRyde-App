// Main exports for the notification system
export { Notifier } from './notifier'
export { NotificationProcessor } from './processor'
export { NotificationQueue } from './queue'
export { NotificationTemplates } from './templates'
export { NotificationProviders } from './providers'
export { initializeNotifications, shutdownNotifications } from './startup'

// Type exports
export type {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  Notification,
  CreateNotification,
  UpdateNotification,
  BookingAuthorizedTemplateData,
  TripStartedTemplateData,
  TripCompletedTemplateData,
  BookingCancelledTemplateData,
  BookingDisputedTemplateData
} from './types'

export type { QueuedNotification } from './queue'
export type { EmailProvider, SMSProvider } from './providers'
export type { NotificationTemplate } from './templates'