# Vercel Web Analytics Setup for GatoRyde

## Overview
This guide explains how to set up Vercel Web Analytics for the GatoRyde app to track user behavior, performance metrics, and key business events.

## What's Already Configured

### 1. Analytics Components
- ✅ `@vercel/analytics` and `@vercel/speed-insights` packages installed
- ✅ Analytics and SpeedInsights components added to root layout
- ✅ Next.js config optimized for analytics

### 2. Custom Analytics Events
The following events are tracked throughout the app:

#### Authentication Events
- `login_attempt` - When user attempts to log in
- `login_success` - When user successfully logs in
- `logout` - When user logs out

#### Ride Events
- `search_rides` - When user searches for rides
- `create_ride` - When driver creates a new ride
- `book_ride` - When rider books a ride
- `create_ride_request` - When rider posts a ride request
- `search_ride_requests` - When user searches for ride requests

#### Location Events
- `use_location_suggestion` - When user clicks on a smart location suggestion
- `search_location` - When user searches for a location

#### Driver Events
- `become_driver` - When user starts driver onboarding
- `complete_driver_verification` - When driver completes verification

#### Contact Events
- `contact_driver` - When rider contacts a driver
- `contact_rider` - When driver contacts a rider

#### General Events
- `page_view` - When user visits a page
- `error` - When errors occur
- `use_feature` - When users interact with specific features

## Environment Variables

### Required for Vercel Deployment

Add these environment variables in your Vercel dashboard:

```bash
# Vercel Analytics (automatically set by Vercel)
VERCEL_ANALYTICS_ID=your_analytics_id

# Your existing environment variables
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
MAPBOX_ACCESS_TOKEN=your_mapbox_token
# ... other existing variables
```

## Deployment Steps

### 1. Deploy to Vercel
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy your app
vercel --prod
```

### 2. Enable Analytics in Vercel Dashboard
1. Go to your project in Vercel dashboard
2. Navigate to "Analytics" tab
3. Enable "Web Analytics"
4. Copy the `VERCEL_ANALYTICS_ID` if needed

### 3. Verify Analytics
After deployment, you can verify analytics are working by:
1. Visiting your deployed app
2. Performing some actions (search rides, create ride, etc.)
3. Checking the Vercel Analytics dashboard for data

## Analytics Dashboard

Once deployed, you'll have access to:

### Real-time Metrics
- Page views
- Unique visitors
- Bounce rate
- Session duration

### Custom Events
- All the custom events defined in `lib/analytics.ts`
- User journey tracking
- Feature usage analytics

### Performance Metrics
- Core Web Vitals
- Page load times
- Performance scores

## Custom Analytics Usage

### Adding New Events
To add new analytics events, use the `analytics` object from `lib/analytics.ts`:

```typescript
import { analytics } from '@/lib/analytics'

// Track a custom event
analytics.useFeature('new_feature', { 
  context: 'additional_data' 
})

// Track an error
analytics.error('Something went wrong', 'checkout_flow')
```

### Page View Tracking
Page views are automatically tracked, but you can add custom page view tracking:

```typescript
import { trackPageView } from '@/lib/analytics'

// Track a specific page view
trackPageView('custom_page_name')
```

## Privacy & GDPR Compliance

Vercel Analytics is privacy-focused:
- ✅ No cookies required
- ✅ GDPR compliant
- ✅ No personal data collection
- ✅ IP addresses are anonymized

## Troubleshooting

### Analytics Not Showing Data
1. Check that `VERCEL_ANALYTICS_ID` is set in environment variables
2. Verify the Analytics component is in your root layout
3. Wait 24-48 hours for initial data to appear
4. Check browser console for any analytics errors

### Custom Events Not Tracking
1. Verify the event is being called in the browser
2. Check that the analytics import is correct
3. Ensure the event data is valid (no undefined values)

## Performance Impact

Vercel Analytics is designed to be lightweight:
- Minimal impact on page load times
- Asynchronous loading
- No blocking of page rendering
- Optimized bundle size

## Next Steps

1. Deploy to Vercel with the environment variables
2. Monitor the analytics dashboard for insights
3. Use the data to optimize user experience
4. Set up alerts for key metrics
5. Create custom reports based on your business needs

## Support

For issues with Vercel Analytics:
- Check Vercel documentation: https://vercel.com/docs/analytics
- Contact Vercel support through your dashboard
- Review the analytics implementation in `lib/analytics.ts`
