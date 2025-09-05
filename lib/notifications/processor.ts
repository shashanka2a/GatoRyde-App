import { NotificationQueue, QueuedNotification } from './queue'
import { NotificationProviders } from './providers'
import { NotificationTemplates } from './templates'

export class NotificationProcessor {
  private static isProcessing = false
  private static processingInterval: NodeJS.Timeout | null = null

  // Start the notification processor
  static start(intervalMs: number = 30000): void {
    if (this.processingInterval) {
      console.log('Notification processor already running')
      return
    }

    console.log(`Starting notification processor (interval: ${intervalMs}ms)`)
    
    this.processingInterval = setInterval(async () => {
      await this.processNotifications()
    }, intervalMs)

    // Process immediately on start
    this.processNotifications()
  }

  // Stop the notification processor
  static stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
      console.log('Notification processor stopped')
    }
  }

  // Process pending notifications
  static async processNotifications(): Promise<void> {
    if (this.isProcessing) {
      return // Prevent concurrent processing
    }

    this.isProcessing = true

    try {
      // Clean up expired processing items first
      await NotificationQueue.cleanupExpiredProcessing()

      // Get notifications ready for processing
      const notifications = await NotificationQueue.getReadyNotifications(10)

      if (notifications.length === 0) {
        return
      }

      console.log(`Processing ${notifications.length} notifications`)

      // Process each notification
      await Promise.allSettled(
        notifications.map(notification => this.processNotification(notification))
      )

    } catch (error) {
      console.error('Error in notification processing:', error)
    } finally {
      this.isProcessing = false
    }
  }

  // Process a single notification
  private static async processNotification(notification: QueuedNotification): Promise<void> {
    try {
      // Move to processing state
      await NotificationQueue.startProcessing(notification)

      // Determine recipient
      const recipient = notification.channel === 'email' 
        ? notification.recipientEmail 
        : notification.recipientPhone

      if (!recipient) {
        throw new Error(`No ${notification.channel} address provided for recipient ${notification.recipientId}`)
      }

      // Send the notification
      await NotificationProviders.sendNotification(
        notification.channel,
        recipient,
        notification.subject,
        notification.content
      )

      // Mark as sent
      await NotificationQueue.markSent(notification.id)

      console.log(`Notification sent: ${notification.id} (${notification.type}/${notification.channel} to ${NotificationTemplates.redactPII(recipient)})`)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Notification failed: ${notification.id} - ${NotificationTemplates.redactPII(errorMessage)}`)
      
      await NotificationQueue.handleFailure(notification, errorMessage)
    }
  }

  // Get processor status
  static getStatus(): {
    isRunning: boolean
    isProcessing: boolean
  } {
    return {
      isRunning: this.processingInterval !== null,
      isProcessing: this.isProcessing
    }
  }

  // Process notifications immediately (for testing/manual trigger)
  static async processNow(): Promise<void> {
    await this.processNotifications()
  }

  // Maintenance tasks (run periodically)
  static async runMaintenance(): Promise<void> {
    try {
      console.log('Running notification maintenance tasks...')
      
      // Clean up expired processing items
      await NotificationQueue.cleanupExpiredProcessing()
      
      // Purge old dead letter items (older than 7 days)
      await NotificationQueue.purgeOldDeadLetters()
      
      // Log queue stats
      const stats = await NotificationQueue.getQueueStats()
      console.log('Queue stats:', stats)
      
      console.log('Notification maintenance completed')
    } catch (error) {
      console.error('Error in notification maintenance:', error)
    }
  }
}