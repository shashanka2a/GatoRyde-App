-- Add university fields to users table
ALTER TABLE "users" ADD COLUMN "universityId" TEXT;
ALTER TABLE "users" ADD COLUMN "state" TEXT;
ALTER TABLE "users" ADD COLUMN "city" TEXT;