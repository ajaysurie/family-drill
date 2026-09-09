import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const scenarios = JSON.parse(await readFile(new URL("../lib/scenarios.json", import.meta.url), "utf8"));
const forbidden = /password|passcode|credential|credit\s*card|card\s*number|bank\s*(account)?|routing\s*number|social\s*security|\bssn\b|sign[ -]?in|log[ -]?in|attachment|download|<form|<input/i;

test("ships exactly three fictional scenarios", () => assert.equal(scenarios.length, 3));
test("scenarios contain no credential-like fields, forms, or unsafe prompts", () => {
  for (const scenario of scenarios) assert.doesNotMatch(JSON.stringify(scenario), forbidden, scenario.id);
});
test("every scenario has a three-bullet lesson", () => {
  for (const scenario of scenarios) assert.equal(scenario.lesson.length, 3, scenario.id);
});
