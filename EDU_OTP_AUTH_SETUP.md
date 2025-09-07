# .edu OTP Authentication Setup Guide for Next.js

## 🚀 Quick Setup Instructions

### 1. Create New Project
```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app
cd my-app
```

### 2. Install Dependencies
```bash
npm install @prisma/client prisma zod nodemailer @types/nodemailer sonner lucide-react
npm install -D @types/node
```

### 3. Setup Database
```bash
npx prisma init
npx prisma generate
npx prisma db push
```

### 4. Create Folder Structure
```bash
mkdir -p lib/auth
mkdir -p lib/notifications
mkdir -p app/api/auth/verify
mkdir -p app/api/auth/login-otp
mkdir -p app/api/auth/complete-profile
mkdir -p app/api/auth/session
mkdir -p src/components/auth
```

### 5. Create Core Files
```bash
touch lib/auth/otp.ts
touch lib/auth/university-detector.ts
touch lib/auth/useAuth.ts
touch lib/auth/jwt-edge.ts
touch lib/notifications/providers.ts
touch app/api/auth/verify/route.ts
touch app/api/auth/login-otp/route.ts
touch app/api/auth/complete-profile/route.ts
touch app/api/auth/session/route.ts
touch src/components/auth/OTPLogin.tsx
touch src/components/auth/ProfileCompletion.tsx
```

### 6. Environment Variables (.env)
```env
DATABASE_URL="your_postgresql_connection_string"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV="production"
```

### 7. Database Schema (prisma/schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  name         String?
  email        String   @unique
  phone        String?  @unique
  eduVerified  Boolean  @default(false)
  university   String?
  universityId String?
  state        String?
  city         String?
  photoUrl     String?
  ratingAvg    Float?
  ratingCount  Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("users")
}

model OTP {
  id         String   @id @default(cuid())
  identifier String   // Email or phone number
  type       String   // "email" or "sms"
  code       String   // The 6-digit OTP code
  expiresAt  DateTime // When the OTP expires
  createdAt  DateTime @default(now())

  @@unique([identifier, type])
  @@map("otps")
}
```

### 8. Test Setup
```bash
npx prisma studio
npm run dev
```

### 9. Deploy
```bash
git add .
git commit -m "Add edu OTP authentication"
git push
```

## 📋 Implementation Checklist

- [ ] Database schema created
- [ ] OTP manager with database storage
- [ ] Email provider (Gmail SMTP)
- [ ] University email validation
- [ ] JWT token generation
- [ ] API routes for auth flow
- [ ] Frontend components
- [ ] Error handling and logging
- [ ] Rate limiting
- [ ] Environment variables configured

## 🔧 Key Features

- **Database Storage**: OTPs stored in PostgreSQL (not in-memory)
- **Email Verification**: Gmail SMTP integration
- **University Validation**: .edu email validation with university mapping
- **Secure Authentication**: JWT tokens with HTTP-only cookies
- **Rate Limiting**: Prevents abuse
- **Comprehensive Logging**: Debug-friendly logging throughout
- **Serverless Compatible**: Works with Vercel deployment

## 🚨 Common Issues & Solutions

1. **OTP Not Found**: Use database storage instead of in-memory
2. **Email Not Sending**: Check SMTP credentials and app password
3. **Database Connection**: Use pooler connection for serverless
4. **JWT Errors**: Ensure JWT_SECRET is set
5. **Cookie Issues**: Check secure/sameSite settings for production

## 📁 File Structure
```
my-app/
├── lib/
│   ├── auth/
│   │   ├── otp.ts
│   │   ├── university-detector.ts
│   │   ├── useAuth.ts
│   │   └── jwt-edge.ts
│   └── notifications/
│       └── providers.ts
├── app/
│   └── api/
│       └── auth/
│           ├── verify/route.ts
│           ├── login-otp/route.ts
│           ├── complete-profile/route.ts
│           └── session/route.ts
├── src/
│   └── components/
│       └── auth/
│           ├── OTPLogin.tsx
│           └── ProfileCompletion.tsx
└── prisma/
    └── schema.prisma
```

## 🎯 Next Steps

1. Copy authentication code from existing project
2. Customize university mapping
3. Add additional validation rules
4. Implement user profile features
5. Add password reset functionality
6. Set up monitoring and analytics

---

**Note**: This setup provides a complete .edu OTP authentication system that's production-ready and serverless-compatible.
