import { NotificationProcessor } from './processor'

// Initialize notification system on app startup
export function initializeNotifications(): void {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_NOTIFICATIONS === 'true') {
    console.log('Initializing notification system...')
    
    // Start the notification processor
    NotificationProcessor.start(30000) // Process every 30 seconds
    
    // Set up maintenance interval (run every hour)
    setInterval(async () => {
      try {
        await NotificationProcessor.runMaintenance()
      } catch (error) {
        console.error('Scheduled maintenance error:', error)
      }
    }, 60 * 60 * 1000) // 1 hour
    
    console.log('Notification system initialized')
  } else {
    console.log('Notification system disabled (set ENABLE_NOTIFICATIONS=true to enable in development)')
  }
}

// Graceful shutdown
export function shutdownNotifications(): void {
  console.log('Shutting down notification system...')
  NotificationProcessor.stop()
  console.log('Notification system shutdown complete')
}

// Handle process signals for graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', shutdownNotifications)
  process.on('SIGINT', shutdownNotifications)
}