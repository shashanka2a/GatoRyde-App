# Supabase Database Setup Instructions

## Step 1: Get your Supabase Database URL

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. In the "Connection string" section, copy the **URI** format
4. It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

## Step 2: Update your .env file

Replace the DATABASE_URL in your .env file with your Supabase URL:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

## Step 3: Push the schema to Supabase

Run these commands in your terminal:

```bash
# Generate Prisma client
npx prisma generate

# Push the schema to Supabase (this will create all tables)
npx prisma db push

# Optional: View your database in Prisma Studio
npx prisma studio
```

## Step 4: Verify the setup

After running `prisma db push`, you should see output like:

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "db.[YOUR-PROJECT-REF].supabase.co:5432"

🚀  Your database is now in sync with your schema.
```

## What tables will be created:

- `users` - User profiles with .edu email verification
- `drivers` - Driver-specific information and payment details
- `vehicles` - Vehicle information
- `rides` - Ride listings and details
- `bookings` - Ride bookings and payment status
- `contact_logs` - Communication tracking
- `verifications` - Document verification system
- `disputes` - Dispute resolution system

## Important Notes:

- The schema includes all the fields needed for the OTP auth flow (name, phone, eduVerified)
- Your auth system will work with the existing User model
- The profile completion flow will update the `name` and `phone` fields
- Make sure to keep your database password secure and never commit it to version control