import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const scenarios = JSON.parse(await readFile(new URL("../lib/scenarios.json", import.meta.url), "utf8"));
const forbiddenSafetyContent = /password|passcode|credential|credit\s*card|card\s*number|routing\s*number|social\s*security|\bssn\b|sign[ -]?in|log[ -]?in|attachment|download|<form|<input/i;
const realBrands = /\b(?:Amazon|IRS|Medicare|FedEx|Microsoft|Chase|Citibank|Wells Fargo|Bank of America)\b/i;
const requiredScenarioIds = [
  "parcel-redelivery",
  "payment-failed",
  "benefits-update",
  "refund-bait",
  "account-security",
  "missed-voicemail",
  "pharmacy-pickup",
  "utility-past-due"
];

test("ships 8–10 parent-realistic scenarios covering the required lure types", () => {
  assert.ok(scenarios.length >= 8 && scenarios.length <= 10);
  const ids = new Set(scenarios.map(({ id }) => id));
  for (const id of requiredScenarioIds) assert.ok(ids.has(id), `missing ${id}`);
});

test("scenarios use unique ids and complete display fields", () => {
  assert.equal(new Set(scenarios.map(({ id }) => id)).size, scenarios.length);
  for (const scenario of scenarios) {
    for (const field of ["id", "fromName", "subject", "preview"]) {
      assert.equal(typeof scenario[field], "string", `${scenario.id}: ${field}`);
      assert.ok(scenario[field].trim(), `${scenario.id}: ${field} is empty`);
    }
  }
});

test("scenarios contain no real brands, credential collection, forms, or unsafe prompts", () => {
  for (const scenario of scenarios) {
    const content = JSON.stringify(scenario);
    assert.doesNotMatch(content, realBrands, scenario.id);
    assert.doesNotMatch(content, forbiddenSafetyContent, scenario.id);
  }
});

test("every scenario has a three-bullet lesson", () => {
  for (const scenario of scenarios) {
    assert.equal(scenario.lesson.length, 3, scenario.id);
    for (const lesson of scenario.lesson) assert.ok(lesson.trim(), scenario.id);
  }
});
