# Rydify MVP

A ride-sharing platform designed specifically for college students, focusing on safety, verification, and community.

## 🎯 MVP Features

### Core Navigation
- **Ride**: Search for rides, post ride requests
- **Drive**: Offer local and inter-city rides  
- **Profile**: Manage verification, view history

### User Flow

#### For Riders
1. **Search Rides**: Browse available rides by route and time
2. **Contact Drivers**: SMS/email deep links (edu-verified users only)
3. **Post Requests**: If no rides match, post a ride request
4. **Track History**: View past rides and ratings

#### For Drivers  
1. **Choose Ride Type**:
   - **Local Rides**: Campus and nearby (basic verification)
   - **Inter-city Rides**: Long distance (enhanced verification required)
2. **Create Rides**: Set route, time, seats, and pricing
3. **Manage Bookings**: Accept riders and coordinate pickup
4. **Earn Money**: Off-platform settlement for MVP

### Verification System
- **Student Email**: Required for all users (.edu verification)
- **KYC**: Identity verification for inter-city rides
- **Driver License**: Required for offering any rides
- **Progressive Verification**: Start with local, upgrade to inter-city

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Prisma + PostgreSQL (Supabase)
- **Authentication**: Auth.js with email/phone OTP
- **Maps**: Mapbox Places API (with graceful fallback)
- **File Uploads**: Supabase Storage
- **Validation**: Zod schemas
- **UI**: Custom components with Framer Motion animations

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+
PostgreSQL database (Supabase recommended)
```

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd rydify-mvp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your database URL, auth secrets, etc.

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# Auth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Mapbox (optional)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="pk...."

# Supabase (for file uploads)
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
```

## 📱 User Interface

### Design System
- **Colors**: Teal/Emerald gradient theme
- **Typography**: Inter font family
- **Components**: Consistent card-based layouts
- **Animations**: Smooth micro-interactions with Framer Motion
- **Responsive**: Mobile-first design

### Key Pages
1. **Landing Page** (`/`): Marketing and onboarding
2. **Ride Search** (`/ride`): Find and request rides
3. **Drive Portal** (`/drive`): Offer rides with type selection
4. **Profile Hub** (`/profile`): Verification and history management

## 🔒 Safety & Trust

### Verification Levels
```
Level 1: Student Email (.edu)
├── Can search rides
├── Can contact drivers
└── Can post ride requests

Level 2: + Identity (KYC)  
├── All Level 1 features
├── Can offer local rides
└── Enhanced trust score

Level 3: + Driver License
├── All Level 2 features
├── Can offer inter-city rides
└── Maximum earning potential
```

### Contact Security
- Only edu-verified users can contact drivers
- Contact via SMS/mailto deep links (no in-app messaging for MVP)
- Driver phone/email only shared upon contact initiation
- Parent notification system (future enhancement)

## 💰 Pricing Model

### Cost Structure
- **Driver Sets Total Trip Cost**: e.g., $20 for campus to airport
- **Cost Splits Among All Passengers**: Including driver
- **Dynamic Pricing**: Cost per person decreases as more riders join
- **Off-Platform Settlement**: Venmo, Cash App, etc. (MVP approach)

### Example
```
Trip: Campus → Airport ($20 total)
- 1 rider joins: $10 each (driver + 1 rider)
- 2 riders join: $6.67 each (driver + 2 riders)  
- 3 riders join: $5 each (driver + 3 riders)
```

## 🧪 Testing

### Run MVP Tests
```bash
# Test core functionality
npm run test:mvp

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

### Test Coverage
- User registration and verification
- Ride creation and search
- Contact flow validation
- Pricing calculations
- Mapbox fallback handling

## 📊 Database Schema

### Core Models
```prisma
User {
  id, email, name, phone
  eduVerified, kycVerified, licenseVerified
  ratingAvg, ratingCount
}

Ride {
  origin, destination, departAt
  seatsTotal, seatsAvailable
  totalTripCostCents, status
  driver → User
}

Booking {
  ride → Ride
  rider → User
  status, createdAt
}

Vehicle {
  make, model, year, color
  seats, licensePlate
  owner → User
}
```

## 🚢 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Mapbox API key added (optional)
- [ ] Supabase storage configured
- [ ] Auth.js secrets generated
- [ ] Domain and SSL configured

### Recommended Platforms
- **Frontend**: Vercel (seamless Next.js deployment)
- **Database**: Supabase (PostgreSQL + file storage)
- **Monitoring**: Vercel Analytics + Sentry

## 🔮 Future Enhancements

### Phase 2 Features
- In-app messaging system
- Real-time ride tracking
- Payment integration (Stripe)
- Push notifications
- Advanced matching algorithms

### Phase 3 Features  
- Multi-university support
- Ride scheduling and recurring rides
- Driver earnings dashboard
- Insurance integration
- Carbon footprint tracking

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run `npm run test:mvp` to validate
4. Submit PR with description
5. Code review and merge

### Code Standards
- TypeScript strict mode
- ESLint + Prettier formatting
- Comprehensive error handling
- Accessibility compliance (WCAG 2.1)

## 📞 Support

For technical issues or questions:
- Create GitHub issue with detailed description
- Include error logs and reproduction steps
- Tag with appropriate labels (bug, feature, question)

---

**Built with ❤️ for the Gator community** 🐊