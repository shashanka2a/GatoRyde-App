import { 
  CreateNotification, 
  Notification, 
  NotificationStatus,
  NotificationType,
  NotificationChannel 
} from './types'
import { NotificationTemplates } from './templates'

// Simple in-memory queue for MVP
const notificationQueue = new Map<string, QueuedNotification>()
const processingQueue = new Map<string, QueuedNotification>()
const deadLetterQueue: QueuedNotification[] = []

export interface QueuedNotification extends CreateNotification {
  id: string
  status: NotificationStatus
  attempts: number
  maxAttempts: number
  createdAt: Date
  updatedAt: Date
  scheduledAt: Date
}

export class NotificationQueue {
  private static readonly QUEUE_KEY = 'notifications:queue'
  private static readonly PROCESSING_KEY = 'notifications:processing'
  private static readonly DEAD_LETTER_KEY = 'notifications:dead_letter'
  private static readonly RETRY_DELAYS = [60, 300, 900] // 1min, 5min, 15min

  // Add notification to queue
  static async enqueue(notification: CreateNotification): Promise<string> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const queuedNotification: QueuedNotification = {
      ...notification,
      id,
      status: 'pending',
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      scheduledAt: notification.scheduledAt || new Date()
    }

    // Add to in-memory queue
    notificationQueue.set(id, queuedNotification)

    console.log(`Notification queued: ${id} (${notification.type}/${notification.channel})`)
    return id
  }

  // Get notifications ready for processing
  static async getReadyNotifications(limit: number = 10): Promise<QueuedNotification[]> {
    const now = Date.now()
    
    // Get notifications scheduled for now or earlier from in-memory queue
    const ready = Array.from(notificationQueue.values())
      .filter(n => n.scheduledAt.getTime() <= now)
      .slice(0, limit)

    return ready
  }

  // Move notification to processing
  static async startProcessing(notification: QueuedNotification): Promise<void> {
    // Remove from main queue
    notificationQueue.delete(notification.id)
    
    // Add to processing queue
    processingQueue.set(notification.id, {
      ...notification,
      status: 'processing',
      updatedAt: new Date()
    })
  }

  // Mark notification as sent
  static async markSent(notificationId: string): Promise<void> {
    processingQueue.delete(notificationId)
    
    // Log success (you might want to store this in a separate success log)
    console.log(`Notification sent successfully: ${notificationId}`)
  }

  // Handle notification failure
  static async handleFailure(
    notification: QueuedNotification, 
    error: string
  ): Promise<void> {
    const updatedNotification = {
      ...notification,
      attempts: notification.attempts + 1,
      status: 'failed' as NotificationStatus,
      updatedAt: new Date(),
      errorMessage: NotificationTemplates.redactPII(error)
    }

    // Remove from processing
    processingQueue.delete(notification.id)

    // Check if we should retry
    if (updatedNotification.attempts < updatedNotification.maxAttempts) {
      // Schedule retry with exponential backoff
      const retryDelay = this.RETRY_DELAYS[updatedNotification.attempts - 1] || 900
      const retryAt = new Date(Date.now() + retryDelay * 1000)
      
      updatedNotification.status = 'retrying'
      updatedNotification.scheduledAt = retryAt

      // Add back to queue for retry
      notificationQueue.set(notification.id, updatedNotification)

      console.log(`Notification retry scheduled: ${notification.id} (attempt ${updatedNotification.attempts}/${updatedNotification.maxAttempts})`)
    } else {
      // Move to dead letter queue
      deadLetterQueue.push(updatedNotification)
      
      console.error(`Notification moved to dead letter queue: ${notification.id} - ${NotificationTemplates.redactPII(error)}`)
    }
  }

  // Get dead letter queue items (for monitoring/debugging)
  static async getDeadLetterQueue(limit: number = 50): Promise<QueuedNotification[]> {
    return deadLetterQueue.slice(0, limit)
  }

  // Get queue stats
  static async getQueueStats(): Promise<{
    pending: number
    processing: number
    deadLetter: number
  }> {
    return {
      pending: notificationQueue.size,
      processing: processingQueue.size,
      deadLetter: deadLetterQueue.length
    }
  }

  // Clean up expired processing items (run periodically)
  static async cleanupExpiredProcessing(): Promise<void> {
    // In-memory implementation doesn't need cleanup
    console.log('Processing queue cleanup (no-op for in-memory)')
  }

  // Purge old dead letter items (run periodically)
  static async purgeOldDeadLetters(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const cutoff = Date.now() - maxAge
    const initialLength = deadLetterQueue.length
    
    // Remove old items
    for (let i = deadLetterQueue.length - 1; i >= 0; i--) {
      if (new Date(deadLetterQueue[i].createdAt).getTime() < cutoff) {
        deadLetterQueue.splice(i, 1)
      }
    }

    const purgeCount = initialLength - deadLetterQueue.length
    if (purgeCount > 0) {
      console.log(`Purged ${purgeCount} old dead letter notifications`)
    }
  }
}