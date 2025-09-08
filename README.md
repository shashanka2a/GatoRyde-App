# 🚗 Rydify - University Ride-Sharing Platform

A production-ready Next.js 14 application for Rydify - a comprehensive student rideshare platform that connects university students for campus transportation through dual posting systems (drivers posting rides + riders posting requests).

## 🎯 Core Concept

Rydify is a university-focused ride-sharing platform that enables students to:
- **Drivers**: Post rides with fixed details (seats, cost, time)
- **Riders**: Post requests with flexible needs (seats needed, max cost)
- **Combined Display**: View both rides and requests together in one feed

## 🚀 Key Features

### 🔐 Authentication & Security
- **Edu Verification**: Only `.edu` emails allowed
- **OTP System**: Email-based verification with Gmail SMTP
- **JWT + Cookie Sessions**: Secure authentication
- **Route Protection**: Gated access to driver/rider features
- **Open Access**: Browse rides without login

### 🚗 Driver Flow
- **Driver Onboarding**: Complete verification process
- **Post Rides**: Create rides with origin, destination, departure time, seats, cost
- **Manage Bookings**: View and contact riders
- **Profile Management**: Edit driver information

### 🚶‍♂️ Rider Flow
- **Find Existing Rides**: Browse and book posted rides
- **Post Requests**: Create ride requests with flexible needs
- **Contact Drivers**: Direct communication with ride providers
- **Request Management**: Track and manage ride requests

### 🔄 Dual Posting System
- **Ride Cards**: Clean, scannable layout for posted rides
- **Request Cards**: Distinct styling for ride requests
- **Combined Search**: Both types displayed together, sorted by time
- **Visual Distinction**: Clear differentiation between rides and requests

### 📱 User Experience
- **Responsive Design**: Mobile-first approach
- **Active Navigation**: Clear visual feedback for current page
- **Smart Redirects**: Post-login routing based on user intent
- **Expandable Details**: Click to see full ride information
- **Contact CTAs**: Prominent buttons for communication

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Radix UI, shadcn/ui
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect)

### Backend
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: JWT + Cookies
- **Email**: Nodemailer (Gmail SMTP)
- **API**: Next.js API Routes
- **Validation**: Zod schemas

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase PostgreSQL
- **Email**: Gmail SMTP
- **Deployment**: Git-based CI/CD

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- Gmail SMTP credentials

### 1. Clone & Install
```bash
git clone https://github.com/shashanka2a/GatoRyde-App.git
cd GatoRyde-App
npm install
```

### 2. Environment Setup
Create `.env` file with:
```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Email (Gmail SMTP)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"

# JWT
JWT_SECRET="your-jwt-secret"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with mock data
node scripts/seed-mock-rides.js
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Clear all dummy data
node scripts/clear-mock-data.js

# Reset database schema
npx prisma db push --force-reset
```

### Deployment
The app is configured for Vercel deployment with automatic database migrations.

## 📁 Project Structure

```
├── app/                  # Next.js App Router
│   ├── api/             # API routes
│   │   ├── auth/        # Authentication endpoints
│   │   ├── rides/       # Ride management APIs
│   │   └── ride-requests/ # Ride request APIs
│   ├── auth/            # Authentication pages
│   ├── drive/           # Driver dashboard
│   ├── profile/         # User profile
│   └── rides/           # Ride browsing
├── src/
│   ├── components/      # React components
│   │   ├── auth/        # Authentication components
│   │   ├── rides/       # Ride-related components
│   │   └── layout/      # Layout components
│   └── hooks/           # Custom React hooks
├── lib/                 # Utility libraries
│   ├── auth/            # Authentication logic
│   ├── db/              # Database utilities
│   └── rides/           # Ride business logic
├── prisma/              # Database schema
├── scripts/             # Utility scripts
└── public/              # Static assets
```

## 🎨 Key Components

### Authentication
- **OTPLogin**: Email OTP verification form
- **AuthGates**: Route protection components
- **Session Management**: JWT + cookie handling

### Ride Management
- **RideList**: Combined display of rides and requests
- **RideCard**: Individual ride display component
- **RideRequestCard**: Ride request display component
- **CreateRideForm**: Driver ride creation form
- **PostRideRequestForm**: Rider request creation form

### Navigation & Layout
- **AppNavigation**: Main navigation component
- **BottomNavigation**: Mobile navigation
- **ContactDriverModal**: Driver contact interface

### Business Logic
- **useAuth**: Authentication hook
- **Ride Actions**: Server actions for ride operations
- **Contact Actions**: Communication management

## 🔧 Configuration

- **next.config.js**: Next.js configuration
- **tailwind.config.js**: Tailwind CSS customization
- **tsconfig.json**: TypeScript configuration
- **prisma/schema.prisma**: Database schema
- **middleware.ts**: Route protection and authentication

## 📱 User Flow

### 1. Authentication Flow
```
User visits app → Redirected to /auth/login → Enter .edu email → 
Receive OTP → Enter OTP → Authenticated → Profile setup (first time)
```

### 2. Driver Flow
```
/drive → "Become a Driver" → Complete verification → Post Ride → 
Fill form (origin, destination, time, seats, cost) → Ride live → 
Manage bookings → Contact riders
```

### 3. Rider Flow
```
/rides → "Find Ride" → Browse posted rides OR Post Request → 
Fill request form → Wait for offers → Accept offer → Contact driver
```

## 🗄️ Database Schema

### Core Models
- **User**: Profile + university verification
- **Driver**: Driver-specific data + verification
- **Ride**: Posted rides with booking capacity
- **RideRequest**: Rider requests with offer system
- **Booking**: Ride reservations
- **ContactLog**: Communication tracking
- **OTP**: Email verification codes

## ⚡ Performance

- **Server-Side Rendering**: Next.js App Router
- **Database Optimization**: Prisma ORM with connection pooling
- **Authentication**: JWT with secure cookie storage
- **Email Delivery**: Gmail SMTP for reliable OTP delivery
- **Responsive Design**: Mobile-first approach

## 🚀 Production Status

### ✅ Ready for Launch
- Complete authentication system
- Dual posting (rides + requests)
- Combined search & display
- Driver & rider flows
- Database schema deployed
- API endpoints working
- Clean UI/UX
- Production ready

### 🔗 Live Demo
- **Development**: http://localhost:3000
- **Production**: Deployed on Vercel
- **Database**: Supabase PostgreSQL
- **Repository**: https://github.com/shashanka2a/GatoRyde-App

## 📄 License

This project is licensed under the MIT License.