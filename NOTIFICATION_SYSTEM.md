# Notification System Documentation

A comprehensive notification system for Rydify that handles booking status changes with email/SMS notifications, retry logic, and proper PII handling.

## Features

### ✅ Notification Types
- **Booking Authorized**: Email rider (with OTP) & driver (new booking notification)
- **Trip Started**: SMS both parties (trip started confirmation)
- **Trip Completed**: Email both parties with payment info and QR codes
- **Booking Cancelled**: Email both parties with cancellation details
- **Booking Disputed**: Email both parties with dispute information

### ✅ Infrastructure
- **Queue System**: Redis-based queue with Upstash
- **Retry Logic**: Exponential backoff (1min, 5min, 15min)
- **Dead Letter Queue**: Failed notifications for monitoring
- **PII Redaction**: Automatic PII removal from logs
- **Template System**: Structured email/SMS templates
- **Provider Abstraction**: Support for multiple email/SMS providers

### ✅ Providers
- **Email**: Resend API (production) / Mock (development)
- **SMS**: Twilio API (production) / Mock (development)
- **Storage**: Upstash Redis for queue management

## Environment Variables

```env
# Required for production
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Email provider (Resend)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@rydify.com

# SMS provider (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_PHONE=+1234567890

# Optional
ENABLE_NOTIFICATIONS=true  # Enable in development
NODE_ENV=production        # Auto-enables notifications
```

## File Structure

```
lib/notifications/
├── index.ts              # Main exports
├── types.ts              # TypeScript types and schemas
├── templates.ts          # Email/SMS templates with PII redaction
├── queue.ts              # Redis queue management
├── providers.ts          # Email/SMS provider implementations
├── processor.ts          # Queue processing logic
├── notifier.ts           # High-level notification triggers
└── startup.ts            # System initialization

app/api/
├── notifications/
│   ├── process/route.ts      # Manual processing trigger
│   ├── dead-letter/route.ts  # Dead letter queue monitoring
│   └── maintenance/route.ts  # Maintenance tasks
└── webhooks/
    └── booking-status/route.ts  # Booking status change webhook

app/admin/
└── notifications/page.tsx   # Admin dashboard for monitoring
```

## Usage Examples

### Trigger Notifications

```typescript
import { Notifier } from '@/lib/notifications'

// Booking authorized (sends OTP to rider, notifies driver)
await Notifier.notifyBookingAuthorized('booking-id')

// Trip started (SMS both parties)
await Notifier.notifyTripStarted('booking-id')

// Trip completed (email with payment info)
await Notifier.notifyTripCompleted('booking-id')

// Booking cancelled
await Notifier.notifyBookingCancelled('booking-id', 'Driver cancelled')

// Booking disputed
await Notifier.notifyBookingDisputed('booking-id', 'Payment issue')
```

### Webhook Integration

```typescript
// POST /api/webhooks/booking-status
{
  "bookingId": "booking_123",
  "oldStatus": "pending",
  "newStatus": "authorized"
}
```

### Initialize System

```typescript
import { initializeNotifications } from '@/lib/notifications'

// In your app startup (e.g., server.ts or layout.tsx)
initializeNotifications()
```

## Template Examples

### Booking Authorized (Rider Email)
```
Subject: Rydify: Booking Confirmed - Campus to Airport

Hi John,

Great news! Your booking has been confirmed for:

🚗 Route: Campus → Airport
📅 Departure: Monday, March 15, 2024 at 2:00 PM EST
👥 Seats: 2
💰 Estimated cost: $25.00
🚨 Your OTP Code: 123456

Driver: Sarah

Please save your OTP code - you'll need it when the trip starts.

Safe travels!
The Rydify Team
```

### Trip Completed (Rider Email with Payment Info)
```
Subject: Rydify: Trip Completed - Payment Due $25.00

Hi John,

Your trip has been completed! Here are the details:

🚗 Route: Campus → Airport
📅 Date: Monday, March 15, 2024 at 2:00 PM EST
👥 Seats: 2
💰 Your share: $25.00

PAYMENT INFORMATION:
Driver: Sarah
Email: sarah@example.com
Phone: (555) 123-4567

Payment Options:
• Cash App: $sarahsmith
  Quick pay: https://cash.app/$sarahsmith/25.00
• Zelle: sarah@example.com

QR Codes available in the Rydify app for easy payment.

⚠️ IMPORTANT: Rydify does not process payments. All transactions are between you and the driver.

Thank you for using Rydify!
The Rydify Team
```

## Queue Management

### Queue States
- **Pending**: Waiting to be processed
- **Processing**: Currently being sent
- **Sent**: Successfully delivered
- **Failed**: Failed after max retries
- **Retrying**: Scheduled for retry

### Retry Logic
- **Attempt 1**: Immediate
- **Attempt 2**: 1 minute delay
- **Attempt 3**: 5 minute delay
- **Attempt 4**: 15 minute delay
- **Failed**: Moved to dead letter queue

### Monitoring
- Queue stats API: `GET /api/notifications/process`
- Dead letter queue: `GET /api/notifications/dead-letter`
- Admin dashboard: `/admin/notifications`

## Security & Privacy

### PII Redaction
All logs automatically redact:
- Email addresses → `[EMAIL_REDACTED]`
- Phone numbers → `[PHONE_REDACTED]`
- Cash App handles → `[CASHAPP_REDACTED]`

### Error Handling
- Graceful degradation on provider failures
- Comprehensive error logging (with PII redaction)
- Dead letter queue for failed notifications
- Automatic retry with exponential backoff

## Maintenance

### Automated Tasks
- **Cleanup**: Remove expired processing items
- **Purge**: Remove old dead letter items (7+ days)
- **Stats**: Log queue statistics

### Manual Tasks
- Process queue: `POST /api/notifications/process`
- Run maintenance: `POST /api/notifications/maintenance`
- Monitor dead letters: `GET /api/notifications/dead-letter`

## Integration Points

### Booking Status Changes
Integrate with your booking update logic:

```typescript
// After updating booking status
await fetch('/api/webhooks/booking-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bookingId: booking.id,
    oldStatus: oldStatus,
    newStatus: newStatus,
    reason: cancellationReason, // for cancelled
    disputeReason: disputeReason // for disputed
  })
})
```

### Payment Integration
The system automatically includes payment information in trip completion emails:
- Driver contact details
- Payment handles (Zelle, Cash App)
- QR code references
- Deep links for quick payments

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install @upstash/redis
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env.local
   # Add your Upstash, Resend, and Twilio credentials
   ```

3. **Enable in Development**
   ```bash
   export ENABLE_NOTIFICATIONS=true
   ```

4. **Initialize System**
   ```typescript
   import { initializeNotifications } from '@/lib/notifications'
   initializeNotifications()
   ```

## Production Deployment

1. **Set up Upstash Redis**
   - Create Redis database at upstash.com
   - Add REST URL and token to environment

2. **Configure Email Provider**
   - Set up Resend account
   - Add API key and from email

3. **Configure SMS Provider**
   - Set up Twilio account
   - Add account SID, auth token, and phone number

4. **Deploy with Environment Variables**
   ```bash
   NODE_ENV=production
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
   RESEND_API_KEY=...
   TWILIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   ```

5. **Monitor System**
   - Use admin dashboard at `/admin/notifications`
   - Set up alerts for dead letter queue growth
   - Monitor queue processing rates

## Testing

The system includes comprehensive testing capabilities:
- Mock providers for development
- Test notification triggers in admin dashboard
- Webhook testing endpoints
- Queue monitoring and stats

## Troubleshooting

### Common Issues
1. **Notifications not sending**: Check environment variables and provider credentials
2. **High dead letter count**: Check provider status and network connectivity
3. **Queue backing up**: Increase processing frequency or check for errors
4. **Missing notifications**: Verify webhook integration and booking status updates

### Debug Commands
```bash
# Check queue status
curl GET /api/notifications/process

# Process queue manually
curl -X POST /api/notifications/process

# Check dead letters
curl GET /api/notifications/dead-letter

# Run maintenance
curl -X POST /api/notifications/maintenance
```