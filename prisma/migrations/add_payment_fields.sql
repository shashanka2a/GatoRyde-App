-- Add payment tracking fields to bookings table
ALTER TABLE bookings 
ADD COLUMN "paidByRider" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "confirmedByDriver" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "proofOfPaymentUrl" TEXT;

-- Update existing completed bookings to have finalShareCents if null
-- This is a placeholder - you'll need to implement the actual logic
-- UPDATE bookings SET "finalShareCents" = "authEstimateCents" WHERE status = 'completed' AND "finalShareCents" IS NULL;