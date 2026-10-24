import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { loadLib } from "./helpers/load-ts.mjs";

const lib = await loadLib(["drill-planning.ts"]);
const { drillStatus } = await lib.import("drill-planning");
test.after(lib.cleanup);

test("only recorded events change a drill's outcome", () => {
  const past = new Date(Date.now() - 60_000), future = new Date(Date.now() + 3_600_000);
  assert.deepEqual(drillStatus(["drill.sent"], past), { outcome: "sent", clicked: false, confirmedByMember: false, enteredDetails: false, reported: false });
  assert.equal(drillStatus(["drill.sent"], future).outcome, "scheduled");
  assert.deepEqual(drillStatus(["drill.sent", "drill.revealed"], past), { outcome: "clicked", clicked: true, confirmedByMember: false, enteredDetails: false, reported: false });
  assert.equal(drillStatus(["drill.sent", "lure.engaged"], past).confirmedByMember, true);
  assert.equal(drillStatus(["drill.sent", "lure.engaged", "credentials.submitted"], past).outcome, "entered-details");
  assert.equal(drillStatus(["drill.sent", "drill.reported"], past).outcome, "reported");
  assert.deepEqual(drillStatus(["drill.sent", "drill.revealed", "drill.reported"], past), { outcome: "clicked", clicked: true, confirmedByMember: false, enteredDetails: false, reported: true });
  assert.equal(drillStatus(["drill.failed"], past).outcome, "failed");
  assert.equal(drillStatus(["drill.sent", "drill.cancelled"], future).outcome, "cancelled");
});

test("bot drill detail reports deliberate engagement only from the explicit button event", async () => {
  const [route, tools] = await Promise.all([readFile(new URL("../app/api/bot/drills/[id]/route.ts", import.meta.url), "utf8"), readFile(new URL("../lib/bot-tools.ts", import.meta.url), "utf8")]);
  assert.match(route, /runBotTool\("get_drill"/);
  assert.match(tools, /lureDeliberate: drill\.confirmedByMember, lureEngagementMethod: drill\.confirmedByMember \? "explicit_button" : null/);
});
