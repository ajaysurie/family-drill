import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { loadLib } from "./helpers/load-ts.mjs";

const lib = await loadLib(["brands.ts", "email-assets.ts", "render-drill-email.ts"]);
const { renderDrillEmail } = await lib.import("render-drill-email");
test.after(lib.cleanup);

const scenarios = JSON.parse(await readFile(new URL("../lib/scenarios.json", import.meta.url), "utf8"));
const member = { id: "member-1", name: "Maya", email: "maya@example.test", householdId: "home-1" };
const forbiddenLureWords = /\b(?:fictional|practice|drill|Family Drill|scenario|coaching|lesson)\b/i;
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

for (const scenario of scenarios) {
  test(`renders a safe, complete ${scenario.id} message`, () => {
    const revealUrl = `https://family.example.test/d/token-${scenario.id}`;
    const message = renderDrillEmail(scenario, member, revealUrl, "https://family.example.test");
    assert.doesNotMatch(message.text + message.html.replace(/<[^>]+>/g, " "), forbiddenLureWords);
    assert.match(message.text, new RegExp(escape(revealUrl)));
    assert.match(message.html, new RegExp(`href="${escape(revealUrl)}"`));
    assert.equal(message.fromName, scenario.fromName);
    assert.equal(message.subject, scenario.subject);
    assert.match(message.html, new RegExp(`data-layout-hero="${scenario.layoutId}"`));
  });
}

test("layout archetypes render distinct HTML", () => {
  const rendered = ["parcel-redelivery", "payment-failed", "stream-renewal", "virus-warning"].map((id) => renderDrillEmail(scenarios.find((s) => s.id === id), member, "https://example.test/d/x", "https://example.test").html);
  assert.equal(new Set(rendered).size, 4);
});

test("email artwork is static, shared by every recipient, and has readable fallbacks", () => {
  for (const scenario of scenarios) {
    const html = renderDrillEmail(scenario, member, "https://example.test/d/secret-token", "https://app.example.test").html;
    const images = [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);
    assert.equal(images.length, 2, scenario.id);
    for (const tag of images) {
      const src = tag.match(/src="([^"]+)"/)[1];
      assert.match(src, /^https:\/\/app\.example\.test\/(?:brand\/logos|email-assets\/hero)\/[\w-]+\.png$/, "no per-recipient query or token");
      assert.doesNotMatch(src, /secret-token|maya/i);
      assert.match(tag, /alt="[^"]+"/);
      assert.match(tag, /width="\d+" height="\d+"/);
    }
    assert.doesNotMatch(html, /data:image|<svg\b|<script\b|<form\b/i);
  }
});

test("every brand logo an email points at ships in public/", () => {
  for (const scenario of scenarios) {
    const src = renderDrillEmail(scenario, member, "#", "").html.match(/src="(\/brand\/logos\/[\w-]+\.png)"/)[1];
    assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), src);
  }
});

test("footers never double up a legal name's trailing period", () => {
  for (const scenario of scenarios) assert.doesNotMatch(renderDrillEmail(scenario, member, "https://example.test/d/x", "").html, /\.\. This is an automated message/, scenario.id);
});

test("site previews can render artwork from relative paths", () => {
  const html = renderDrillEmail(scenarios[0], member, "#lesson", "").html;
  assert.match(html, /src="\/email-assets\/hero\/parcel-redelivery\.png"/);
});
