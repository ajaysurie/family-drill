import assert from "node:assert/strict";
import test from "node:test";
import { classifyHtml, selectors } from "../.cursor/skills/verify-family-drill/helpers/selectors.mjs";

test("classifyHtml recognizes product language and credential fields", () => {
  assert.equal(classifyHtml("<h1>Family Drill</h1>").hasFamilyLanguage, true);
  assert.equal(classifyHtml("<p>household agreement</p>").hasFamilyLanguage, true);
  assert.equal(classifyHtml('<input type="password">').hasCredentialField, true);
  assert.equal(classifyHtml('<input type="hidden" name="memberId">').hasCredentialField, false);
});

test("browser selectors expose the required surfaces", () => {
  assert.deepEqual(Object.keys(selectors).sort(), ["adminRows", "deliberateButton", "notice", "sendButton", "sentCount"].sort());
});
