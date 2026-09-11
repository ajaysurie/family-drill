export const foundationSql = `
DO $$ BEGIN CREATE TYPE "AgreementStatus" AS ENUM ('draft', 'active'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "DrillEventType" AS ENUM ('drill.sent', 'drill.revealed', 'lure.engaged', 'credentials.submitted', 'drill.failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TYPE "DrillEventType" ADD VALUE IF NOT EXISTS 'credentials.submitted';
CREATE TABLE IF NOT EXISTS "Organizer" ("id" text PRIMARY KEY, "name" text, "email" text UNIQUE, "emailVerified" timestamp, "image" text);
CREATE TABLE IF NOT EXISTS "Account" ("userId" text NOT NULL REFERENCES "Organizer"("id") ON DELETE CASCADE, "type" text NOT NULL, "provider" text NOT NULL, "providerAccountId" text NOT NULL, "refresh_token" text, "access_token" text, "expires_at" integer, "token_type" text, "scope" text, "id_token" text, "session_state" text, PRIMARY KEY ("provider", "providerAccountId"));
CREATE TABLE IF NOT EXISTS "Session" ("sessionToken" text PRIMARY KEY, "userId" text NOT NULL REFERENCES "Organizer"("id") ON DELETE CASCADE, "expires" timestamp NOT NULL);
CREATE TABLE IF NOT EXISTS "VerificationToken" ("identifier" text NOT NULL, "token" text NOT NULL, "expires" timestamp NOT NULL, PRIMARY KEY ("identifier", "token"));
CREATE TABLE IF NOT EXISTS "HouseholdAgreement" ("id" text PRIMARY KEY, "organizerId" text NOT NULL UNIQUE REFERENCES "Organizer"("id") ON DELETE CASCADE, "termsVersion" text NOT NULL, "status" "AgreementStatus" NOT NULL DEFAULT 'draft', "activatedAt" timestamp);
ALTER TABLE "HouseholdAgreement" ADD COLUMN IF NOT EXISTS "enabledCategories" text NOT NULL DEFAULT 'delivery,bank-payment,subscriptions,tech-support,school-kids,account-lockout';
ALTER TABLE "HouseholdAgreement" ADD COLUMN IF NOT EXISTS "smsPreview" integer NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS "Member" ("id" text PRIMARY KEY, "name" text NOT NULL, "email" text NOT NULL, "householdId" text NOT NULL REFERENCES "HouseholdAgreement"("id") ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS "Attempt" ("id" text PRIMARY KEY, "memberId" text NOT NULL REFERENCES "Member"("id") ON DELETE CASCADE, "scenarioId" text NOT NULL, "drillToken" text NOT NULL UNIQUE, "createdAt" timestamp NOT NULL DEFAULT now(), "scheduledFor" timestamp);
CREATE TABLE IF NOT EXISTS "DrillEvent" ("id" text PRIMARY KEY, "attemptId" text NOT NULL REFERENCES "Attempt"("id") ON DELETE CASCADE, "type" "DrillEventType" NOT NULL, "occurredAt" timestamp NOT NULL DEFAULT now(), "summary" text NOT NULL, UNIQUE ("attemptId", "type"));
CREATE TABLE IF NOT EXISTS "BotInstall" ("id" text PRIMARY KEY, "householdId" text NOT NULL UNIQUE REFERENCES "HouseholdAgreement"("id") ON DELETE CASCADE, "token" text NOT NULL UNIQUE, "active" integer NOT NULL DEFAULT 1, "householdPaused" integer NOT NULL DEFAULT 0);
`;

export const seedSql = `
INSERT INTO "Organizer" (id, name, email, "emailVerified") VALUES ('organizer-demo', 'Alex', 'organizer@example.test', now()) ON CONFLICT DO NOTHING;
INSERT INTO "HouseholdAgreement" (id, "organizerId", "termsVersion", status, "activatedAt") VALUES ('household-demo', 'organizer-demo', '2026-09-01', 'active', '2026-09-01T12:00:00Z') ON CONFLICT DO NOTHING;
INSERT INTO "Member" (id, name, email, "householdId") VALUES ('maya', 'Maya', 'maya@example.test', 'household-demo'), ('leo', 'Leo', 'leo@example.test', 'household-demo'), ('ruth', 'Ruth', 'ruth@example.test', 'household-demo') ON CONFLICT DO NOTHING;
INSERT INTO "Attempt" (id, "memberId", "scenarioId", "drillToken", "createdAt") VALUES ('attempt-leo', 'leo', 'parcel-redelivery', 'drill-leo', '2026-09-02T12:00:00Z') ON CONFLICT DO NOTHING;
`;
