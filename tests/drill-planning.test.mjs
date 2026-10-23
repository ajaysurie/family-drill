import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { loadLib } from "./helpers/load-ts.mjs";

const lib = await loadLib(["drill-planning.ts"]);
const { nextAllowedTime, pickMember, pickScenario, isValidTimeZone } = await lib.import("drill-planning");
test.after(lib.cleanup);
const scenarios = JSON.parse(await readFile(new URL("../lib/scenarios.json", import.meta.url), "utf8"));
const now = new Date("2026-10-22T15:00:00Z");
const at = (iso, timeZone) => nextAllowedTime(iso, timeZone, now).at?.toISOString();

test("quiet hours follow the household's own time zone", () => {
  assert.equal(at("2026-10-22T18:00:00Z", "America/New_York"), "2026-10-22T18:00:00.000Z", "2 p.m. in New York sends as asked");
  assert.equal(at("2026-10-23T03:00:00Z", "America/New_York"), "2026-10-23T12:00:00.000Z", "11 p.m. moves to 8 a.m. next morning");
  assert.equal(at("2026-10-23T07:30:00Z", "America/Los_Angeles"), "2026-10-23T15:00:00.000Z", "12:30 a.m. moves to 8 a.m. Pacific");
  assert.equal(at("2026-10-22T22:00:00Z", "Europe/London"), "2026-10-23T07:00:00.000Z", "11 p.m. BST moves to 8 a.m. BST");
  assert.equal(at("2026-10-22T22:00:00Z", undefined), "2026-10-23T08:00:00.000Z", "defaults to UTC");
});

test("send times in the past send now, and far-future or invalid times are refused", () => {
  assert.equal(at("2026-10-01T12:00:00Z", "UTC"), now.toISOString());
  assert.deepEqual(nextAllowedTime("2026-10-30T12:00:00Z", "UTC", now), { error: "send_at_too_far" });
  assert.deepEqual(nextAllowedTime("next tuesday", "UTC", now), { error: "invalid_send_at" });
  assert.equal(isValidTimeZone("America/Chicago"), true);
  assert.equal(isValidTimeZone("Mars/Base"), false);
});

test("surprise drills go to whoever has had the fewest, then waited longest", () => {
  const members = ["ruth", "leo", "maya"].map((id) => ({ id, name: id, email: `${id}@example.test`, householdId: "h" }));
  const history = [{ memberId: "ruth", scenarioId: "toll-unpaid", createdAt: new Date("2026-10-01") }, { memberId: "leo", scenarioId: "toll-unpaid", createdAt: new Date("2026-10-05") }];
  assert.equal(pickMember(members, history).id, "maya");
  assert.equal(pickMember(members.slice(0, 2), history).id, "ruth");
});

test("surprise lures avoid repeats and the member's last category", () => {
  const history = [{ memberId: "ruth", scenarioId: "parcel-redelivery", createdAt: new Date("2026-10-01") }];
  for (let i = 0; i < 50; i++) {
    const pick = pickScenario(scenarios, history, "ruth");
    assert.notEqual(pick.id, "parcel-redelivery");
    assert.notEqual(pick.category, "delivery");
  }
  const seenAll = scenarios.map((scenario, index) => ({ memberId: "ruth", scenarioId: scenario.id, createdAt: new Date(Date.UTC(2026, 0, index + 1)) }));
  assert.equal(pickScenario(scenarios, seenAll, "ruth", () => 0).id, scenarios[0].id, "oldest-seen lure comes back first");
});
