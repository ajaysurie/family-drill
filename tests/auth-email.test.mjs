import assert from "node:assert/strict";
import test from "node:test";
import { loadLib } from "./helpers/load-ts.mjs";

const lib = await loadLib(["brands.ts", "email-assets.ts", "render-drill-email.ts", "family-drill-email.ts", "auth-email.ts"]);
const { createResendVerificationEmailSender, sendAuthVerificationEmail } = await lib.import("auth-email");

test.after(lib.cleanup);

test("organizer verification sends the magic link through Resend", async () => {
  const calls = [];
  const send = createResendVerificationEmailSender({
    emails: { send: async (payload) => { calls.push(payload); return { data: { id: "email-1" }, error: null }; } },
  });

  await send({
    identifier: "organizer@example.test",
    url: "https://app.familydrill.com/api/auth/callback/nodemailer?token=secret",
    from: "Family Drill <login@familydrill.com>",
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].to, "organizer@example.test");
  assert.equal(calls[0].from, "Family Drill <login@familydrill.com>");
  assert.match(calls[0].subject, /Sign in to Family Drill/);
  assert.match(calls[0].text, /token=secret/);
  assert.match(calls[0].html, /href="https:\/\/app\.familydrill\.com\/api\/auth\/callback\/nodemailer\?token=secret"/);
  assert.match(calls[0].html, /alt="Family Drill"/);
  assert.match(calls[0].text, /expires in 24 hours/);
});

test("production verification fails loudly without a Resend key", async () => {
  const previous = { key: process.env.RESEND_API_KEY, environment: process.env.NODE_ENV };
  delete process.env.RESEND_API_KEY;
  process.env.NODE_ENV = "production";
  try {
    await assert.rejects(
      sendAuthVerificationEmail({ identifier: "organizer@example.test", url: "https://example.test/link", from: "sender@example.test" }),
      /RESEND_API_KEY is required/,
    );
  } finally {
    if (previous.key === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previous.key;
    if (previous.environment === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous.environment;
  }
});

test("development verification logs the link when Resend is not configured", async () => {
  const previous = { key: process.env.RESEND_API_KEY, environment: process.env.NODE_ENV };
  const lines = [];
  const originalLog = console.log;
  delete process.env.RESEND_API_KEY;
  process.env.NODE_ENV = "development";
  console.log = (line) => lines.push(line);
  try {
    await sendAuthVerificationEmail({ identifier: "organizer@example.test", url: "http://localhost:3000/link", from: "sender@example.test" });
  } finally {
    console.log = originalLog;
    if (previous.key === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previous.key;
    if (previous.environment === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous.environment;
  }
  assert.match(lines[0], /\[auth:magic-link\].*http:\/\/localhost:3000\/link/);
});
