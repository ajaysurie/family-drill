import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
import ts from "typescript";

const tempDirectory = await mkdtemp(path.join(process.cwd(), ".auth-email-test-"));
const source = await readFile(new URL("../lib/auth-email.ts", import.meta.url), "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
await writeFile(path.join(tempDirectory, "package.json"), '{"type":"module"}');
await writeFile(path.join(tempDirectory, "auth-email.js"), output);
const { createResendVerificationEmailSender, sendAuthVerificationEmail } = await import(pathToFileURL(path.join(tempDirectory, "auth-email.js")));

test.after(async () => rm(tempDirectory, { recursive: true, force: true }));

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
  assert.match(calls[0].html, /token=secret/);
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
