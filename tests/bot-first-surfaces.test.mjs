import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("legacy web organizer pages point people to the primary bot flow", async () => {
  const [admin, household] = await Promise.all([
    read("../app/admin/page.tsx"),
    read("../app/household/page.tsx"),
  ]);

  for (const page of [admin, household]) {
    assert.match(page, /Legacy web demo/);
    assert.match(page, /href="\/docs\/bot"/);
    assert.match(page, /See bot setup/);
  }
  assert.match(admin, /Send demo drill/);
  assert.match(household, /Add demo member/);
});

test("documentation navigation leads with bot installation", async () => {
  const layout = await read("../app/docs/layout.tsx");
  assert.ok(layout.indexOf('href="/docs/bot"') < layout.indexOf('href="/docs/start"'));
  assert.doesNotMatch(layout, /Family Drill docs/);
});
