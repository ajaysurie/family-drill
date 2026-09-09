INSERT INTO "Organizer" (id, name, email, "emailVerified") VALUES ('organizer-demo', 'Alex', 'organizer@example.test', now()) ON CONFLICT DO NOTHING;
INSERT INTO "HouseholdAgreement" (id, "organizerId", "termsVersion", status, "activatedAt") VALUES ('household-demo', 'organizer-demo', '2026-09-01', 'active', '2026-09-01T12:00:00Z') ON CONFLICT DO NOTHING;
INSERT INTO "Member" (id, name, email, "householdId") VALUES ('maya', 'Maya', 'maya@example.test', 'household-demo'), ('leo', 'Leo', 'leo@example.test', 'household-demo'), ('ruth', 'Ruth', 'ruth@example.test', 'household-demo') ON CONFLICT DO NOTHING;
INSERT INTO "Attempt" (id, "memberId", "scenarioId", "drillToken", "createdAt") VALUES ('attempt-leo', 'leo', 'garden-club', 'drill-leo', '2026-09-02T12:00:00Z') ON CONFLICT DO NOTHING;
