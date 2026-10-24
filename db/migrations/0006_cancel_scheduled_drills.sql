ALTER TYPE "DrillEventType" ADD VALUE IF NOT EXISTS 'drill.cancelled';
ALTER TABLE "Attempt" ADD COLUMN IF NOT EXISTS "providerMessageId" text;
