# ContactDriverCard Component

A React component that allows verified students to contact ride drivers via SMS or email, with built-in rate limiting and analytics tracking.

## Features

- ✅ **Verification Check**: Only allows contact between verified students and drivers
- ✅ **Cross-Platform SMS**: Automatically detects iOS vs Android/Desktop for proper SMS deep links
- ✅ **Email Integration**: Opens default email client with pre-filled message
- ✅ **Payment Methods Display**: Shows driver's Zelle and Cash App handles
- ✅ **Rate Limiting**: Prevents abuse with 5 contacts/hour per user/booking limit
- ✅ **Analytics Tracking**: Logs all contact attempts via API
- ✅ **Accessibility**: Full keyboard navigation and screen reader support
- ✅ **Mobile Optimized**: Finger-friendly buttons that work at 360px width
- ✅ **Error Handling**: Graceful error states and user feedback
- ✅ **Twilio Proxy Ready**: Optional proxied SMS routing (feature flag)

## Props

```typescript
interface ContactDriverCardProps {
  driver: {
    name: string
    phone: string
    email: string
    verified: boolean
    zelleHandle?: string | null
    cashAppHandle?: string | null
  }
  ride: {
    destText: string
    departAt: Date
  }
  currentUser: {
    eduVerified: boolean
  }
  bookingId?: string
  className?: string
}
```

## Usage

### Basic Usage

```tsx
import { ContactDriverCard } from '@/src/components/rides/ContactDriverCard'

function RideDetailsPage() {
  const driver = {
    name: 'Sarah Johnson',
    phone: '5551234567',
    email: 'sarah.johnson@ufl.edu',
    verified: true,
    zelleHandle: 'sarah.johnson@ufl.edu',
    cashAppHandle: '$sarahj',
  }

  const ride = {
    destText: 'Tampa International Airport',
    departAt: new Date('2024-12-25T14:30:00Z'),
  }

  const currentUser = {
    eduVerified: true,
  }

  return (
    <ContactDriverCard
      driver={driver}
      ride={ride}
      currentUser={currentUser}
      bookingId="booking_abc123"
    />
  )
}
```

### Unverified User Scenario

When either the current user or driver is not verified, the component shows a verification callout:

```tsx
<ContactDriverCard
  driver={driver}
  ride={ride}
  currentUser={{ eduVerified: false }}
  bookingId="booking_123"
/>
```

## Behavior

### Verification States

1. **Both Verified**: Shows contact buttons and payment methods
2. **User Not Verified**: Shows verification callout with link to `/app/profile`
3. **Driver Not Verified**: Shows verification callout (user cannot contact)

### Contact Methods

#### SMS Deep Links
- **iOS**: `sms:+1{phone}&body={encodedMessage}`
- **Android/Desktop**: `sms:+1{phone}?body={encodedMessage}`

#### Email Deep Links
- **Format**: `mailto:{email}?subject={subject}&body={encodedMessage}`

### Message Template

```
Hi, I'm interested in your ride to {DESTINATION} on {DATE}. Can I book a seat?
```

### Rate Limiting

- **Limit**: 5 contact attempts per hour per user per booking
- **Storage**: Upstash Redis with 1-hour TTL
- **Response**: HTTP 429 with descriptive error message

### Analytics Tracking

Each contact attempt creates a `ContactLog` entry:

```typescript
{
  bookingId: string
  userId: string
  method: 'sms' | 'email'
  createdAt: Date
}
```

## API Endpoints

### POST /api/contacts/log

Logs contact attempts and enforces rate limiting.

**Request Body:**
```json
{
  "bookingId": "booking_abc123",
  "method": "sms"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact logged successfully",
  "contactLogId": "log_xyz789"
}
```

**Error Responses:**
- `400`: Invalid request data
- `403`: Unauthorized (not booking owner)
- `404`: Booking not found
- `429`: Rate limit exceeded
- `500`: Server error

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `UPSTASH_REDIS_REST_URL`: Redis URL for rate limiting
- `UPSTASH_REDIS_REST_TOKEN`: Redis auth token

### Optional
- `TWILIO_PROXY_ENABLED=true`: Enable proxied SMS routing

## Database Schema

### ContactLog Model

```prisma
model ContactLog {
  id        String        @id @default(cuid())
  bookingId String
  userId    String
  method    ContactMethod
  createdAt DateTime      @default(now())

  booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  user    User    @relation("ContactLogs", fields: [userId], references: [id], onDelete: Cascade)

  @@map("contact_logs")
}

enum ContactMethod {
  sms
  email
  twilio_proxy
}
```

## Accessibility

- **ARIA Labels**: All buttons have descriptive `aria-label` attributes
- **Focus Management**: Visible focus rings with `focus-visible:ring-2`
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Readers**: Semantic HTML structure with proper headings and descriptions

## Mobile Optimization

- **Responsive Design**: Works at 360px minimum width
- **Touch Targets**: Buttons are 48px+ tall for finger-friendly interaction
- **Grid Layout**: Stacks buttons vertically on small screens
- **Text Sizing**: Readable text at all screen sizes

## Error Handling

- **Network Errors**: Shows user-friendly error messages
- **Rate Limiting**: Clear explanation of limits and retry timing
- **Validation Errors**: Specific field-level error messages
- **Fallback States**: Graceful degradation when features unavailable

## Testing

Run the test suite:

```bash
npm test ContactDriverCard.test.tsx
```

### Test Coverage

- ✅ Renders contact buttons for verified users
- ✅ Shows verification callout for unverified users
- ✅ Displays payment methods when available
- ✅ Logs contacts via API calls
- ✅ Handles API errors gracefully
- ✅ Generates correct SMS links for iOS/Android
- ✅ Has proper accessibility attributes

## Future Enhancements

- **Twilio Proxy Integration**: Full implementation of proxied SMS
- **Push Notifications**: Real-time contact notifications
- **Contact History**: Show previous contact attempts
- **Template Customization**: Allow custom message templates
- **Multi-language Support**: Internationalization for message templates