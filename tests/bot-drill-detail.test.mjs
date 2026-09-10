import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const route = await readFile(new URL("../app/api/bot/drills/[id]/route.ts", import.meta.url), "utf8");
const store = await readFile(new URL("../lib/store.ts", import.meta.url), "utf8");

test("bot drill detail derives deliberate lure engagement from recorded events", () => {
  assert.match(store, /event\.attemptId === attemptId && event\.type === "lure\.engaged"/);
  assert.match(route, /const lureDeliberate = hasLureEngagement\(drill\.id\)/);
  assert.match(route, /lureEngagementMethod: lureDeliberate \? "explicit_button" : null/);
  assert.doesNotMatch(route, /lureDeliberate:\s*true/);
});
