import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("hosted schema persists bot state and the complete drill lifecycle", async () => {
  const [schema, migration, store] = await Promise.all([read("../lib/schema.ts"), read("../db/migrations/0001_foundation.sql"), read("../lib/store.ts")]);
  for (const value of ["BotInstall", "scheduledFor", "drill.sent", "drill.revealed", "lure.engaged", "drill.failed"]) {
    assert.match(schema + migration, new RegExp(value.replace(".", "\\.")));
  }
  assert.match(store, /organizerId/);
  assert.match(store, /innerJoin\(householdAgreements/);
  assert.doesNotMatch(store, /const members: Member\[\]|const attempts: Attempt\[\]/);
});

test("bot installation requires the authenticated organizer instead of trusting an email body", async () => {
  const route = await read("../app/api/bot/install/start/route.ts");
  assert.match(route, /await auth\(\)/);
  assert.match(route, /session\.user\.id/);
  assert.doesNotMatch(route, /request\.json|body\.email/);
});

test("magic links and drill delivery use the configured Resend account", async () => {
  const [auth, authEmail, env, mail, store] = await Promise.all([read("../auth.ts"), read("../lib/auth-email.ts"), read("../.env.example"), read("../lib/mail.ts"), read("../lib/store.ts")]);
  assert.match(auth, /sendAuthVerificationEmail/);
  assert.match(authEmail, /new Resend\(apiKey\)/);
  assert.match(authEmail, /NODE_ENV === "production"/);
  assert.match(env, /RESEND_API_KEY=/);
  assert.match(env, /EMAIL_FROM_AUTH=/);
  assert.match(mail, /process\.env\.MAIL_ADAPTER !== "resend"/);
  assert.match(store, /getMailAdapter\(\)\.sendDrill/);
});
