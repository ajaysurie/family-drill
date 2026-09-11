import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
import ts from "typescript";

const tempDirectory = await mkdtemp(path.join(process.cwd(), ".mail-test-"));
const compile = async (name) => {
  const source = await readFile(new URL(`../lib/${name}.ts`, import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
    .replace('"./render-drill-email"', '"./render-drill-email.js"');
  await writeFile(path.join(tempDirectory, `${name}.js`), output);
};

await writeFile(path.join(tempDirectory, "package.json"), '{"type":"module"}');
await compile("render-drill-email");
await compile("mail");
const { consoleMailAdapter, createResendMailAdapter, getMailAdapter } = await import(pathToFileURL(path.join(tempDirectory, "mail.js")));

const drill = {
  member: { id: "member-1", name: "Maya", email: "maya@example.test", householdId: "home-1" },
  scenario: { fromName: "Parcel Notice", fromLocalPart: "updates", fromDomain: "parcel-notice.test", subject: "Delivery update", preview: "An update", bodyParagraphs: ["Please review."], footerLines: ["Parcel Notice"] },
  attempt: { drillToken: "token-1" },
};

test.after(async () => rm(tempDirectory, { recursive: true, force: true }));

test("Resend adapter sends the rendered multipart payload from the verified sender", async () => {
  const calls = [];
  const adapter = createResendMailAdapter({ emails: { send: async (payload) => { calls.push(payload); return { data: { id: "email-1" }, error: null }; } } }, "Family Drill <drills@familydrill.com>");
  await adapter.sendDrill(drill);

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], {
    from: "Family Drill <drills@familydrill.com>",
    to: "maya@example.test",
    subject: "Delivery update",
    text: "Hello Maya,\n\nPlease review.\n\nView details: http://localhost:3000/d/token-1\n\nParcel Notice",
    html: calls[0].html,
  });
  assert.match(calls[0].html, /http:\/\/localhost:3000\/d\/token-1/);
});

test("adapter selection defaults to the console and fails loudly without a Resend key", () => {
  const previous = { adapter: process.env.MAIL_ADAPTER, key: process.env.RESEND_API_KEY };
  delete process.env.MAIL_ADAPTER;
  assert.equal(getMailAdapter(), consoleMailAdapter);
  process.env.MAIL_ADAPTER = "console";
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
  const lines = [];
  const originalLog = console.log;
  console.log = (line) => lines.push(line);
  try {
    await consoleMailAdapter.sendDrill(drill);
  } finally {
    console.log = originalLog;
  }
  assert.equal(lines.length, 1);
  assert.match(lines[0], /^\[mail:stub\]/);
  assert.match(lines[0], /To: maya@example\.test/);
});
