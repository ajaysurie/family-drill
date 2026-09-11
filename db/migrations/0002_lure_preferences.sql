ALTER TYPE "DrillEventType" ADD VALUE IF NOT EXISTS 'credentials.submitted';
ALTER TABLE "HouseholdAgreement" ADD COLUMN IF NOT EXISTS "enabledCategories" text NOT NULL DEFAULT 'delivery,bank-payment,subscriptions,tech-support,school-kids,account-lockout';
ALTER TABLE "HouseholdAgreement" ADD COLUMN IF NOT EXISTS "smsPreview" integer NOT NULL DEFAULT 0;
