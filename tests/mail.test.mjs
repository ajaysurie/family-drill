import assert from "node:assert/strict";
import test from "node:test";
import { loadLib } from "./helpers/load-ts.mjs";

const lib = await loadLib(["brands.ts", "email-assets.ts", "render-drill-email.ts", "family-drill-email.ts", "mail.ts"]);
const { consoleMailAdapter, createResendMailAdapter, getMailAdapter, senderAddress } = await lib.import("mail");
test.after(lib.cleanup);

const scenario = { id: "parcel-redelivery", category: "delivery", layoutId: "cta-hero", brandId: "swiftbox", fromName: "Parcel Notice", subject: "Delivery update", preview: "An update", heroTitle: "Update", heroCaption: "Parcel waiting", bodyParagraphs: ["Please review."], footerLines: ["Parcel Notice"], clues: [], lesson: ["a", "b", "c"] };
const member = { id: "member-1", name: "Maya", email: "maya@example.test", householdId: "home-1" };
const drill = (scheduledFor) => ({ member, scenario, attempt: { drillToken: "token-1", scheduledFor } });
const fakeResend = (calls) => ({ emails: { send: async (payload) => { calls.push(payload); return { data: { id: "email-1" }, error: null }; } } });

test("drills borrow only the fictional display name and keep the verified address", async () => {
  const calls = [];
  await createResendMailAdapter(fakeResend(calls), "Family Drill <drills@familydrill.com>").sendDrill(drill());
  assert.equal(calls.length, 1);
  assert.equal(calls[0].from, "Parcel Notice <drills@familydrill.com>");
  assert.equal(calls[0].to, "maya@example.test");
  assert.equal(calls[0].subject, "Delivery update");
  assert.equal(calls[0].headers["X-Family-Drill"], "household-practice-drill");
  assert.equal(calls[0].scheduledAt, undefined);
  assert.match(calls[0].text, /http:\/\/localhost:3000\/d\/token-1/);
  assert.match(calls[0].html, /http:\/\/localhost:3000\/d\/token-1/);
});

test("future drills are handed to Resend's scheduler", async () => {
  const calls = [], later = new Date(Date.now() + 6 * 3_600_000).toISOString();
  await createResendMailAdapter(fakeResend(calls), "drills@familydrill.com").sendDrill(drill(later));
  assert.equal(calls[0].scheduledAt, later);
  assert.equal(calls[0].from, "Parcel Notice <drills@familydrill.com>");
});

test("heads-up email is honest, branded, and comes from Family Drill", async () => {
  const calls = [];
  await createResendMailAdapter(fakeResend(calls), "Family Drill <drills@familydrill.com>").sendHeadsUp({ member, organizer: "Alex" });
  assert.equal(calls[0].from, "Family Drill <drills@familydrill.com>");
  assert.match(calls[0].subject, /Alex added you to Family Drill/);
  assert.match(calls[0].text, /made up/);
  assert.match(calls[0].text, /Tell Alex/);
  assert.match(calls[0].html, /email-assets\/logo\/family-drill\.png/);
});

test("sender parsing accepts bare and named addresses", () => {
  assert.equal(senderAddress("Family Drill <drills@familydrill.com>"), "drills@familydrill.com");
  assert.equal(senderAddress("drills@familydrill.com"), "drills@familydrill.com");
});

test("adapter selection defaults to the console and fails loudly without a Resend key", () => {
  const previous = { adapter: process.env.MAIL_ADAPTER, key: process.env.RESEND_API_KEY };
  delete process.env.MAIL_ADAPTER;
  assert.equal(getMailAdapter(), consoleMailAdapter);
  process.env.MAIL_ADAPTER = "unknown";
  assert.equal(getMailAdapter(), consoleMailAdapter);
  process.env.MAIL_ADAPTER = "resend";
  delete process.env.RESEND_API_KEY;
  assert.throws(() => getMailAdapter(), /RESEND_API_KEY is required when MAIL_ADAPTER=resend/);
  if (previous.adapter === undefined) delete process.env.MAIL_ADAPTER; else process.env.MAIL_ADAPTER = previous.adapter;
  if (previous.key === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previous.key;
});

test("console adapter logs the stub without using Resend", async () => {
  const lines = [], originalLog = console.log;
  console.log = (line) => lines.push(line);
  try { await consoleMailAdapter.sendDrill(drill()); } finally { console.log = originalLog; }
  assert.equal(lines.length, 1);
  assert.match(lines[0], /^\[mail:stub\]/);
  assert.match(lines[0], /To: maya@example\.test/);
});
