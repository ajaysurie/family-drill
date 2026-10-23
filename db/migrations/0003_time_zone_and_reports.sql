ALTER TYPE "DrillEventType" ADD VALUE IF NOT EXISTS 'drill.reported';
ALTER TABLE "HouseholdAgreement" ADD COLUMN IF NOT EXISTS "timeZone" text;
