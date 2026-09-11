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

test("published bot install is available across organizer-facing pages", async () => {
  const [page, home, start, installConfig, readme, contract] = await Promise.all([
    read("../app/docs/bot/page.tsx"),
    read("../app/page.tsx"),
    read("../app/docs/start/page.tsx"),
    read("../lib/bot-install.ts"),
    read("../README.md"),
    read("../docs/bot-api.md"),
  ]);

  assert.match(installConfig, /https:\/\/x\.ai\/bot\/GYM2zP9NA3J4_g9tTX0qS/);
  for (const organizerPage of [page, home, start]) {
    assert.match(organizerPage, /BOT_INSTALL_URL/);
    assert.doesNotMatch(organizerPage, /Template not published|not public yet|not published yet/i);
  }
  assert.match(page, /github\.com\/ajaysurie\/family-drill\/blob\/main\/docs\/bot-api\.md/);
  assert.doesNotMatch(page, /\/api\/bot\//);
  assert.doesNotMatch(page, /Authorization:/);
  assert.doesNotMatch(page, /JSON|\.map\(/);
  assert.match(readme, /\[eggbot API contract\]\(docs\/bot-api\.md\)/);
  assert.match(contract, /POST \/api\/bot\/drills/);
  assert.match(contract, /Authorization: Bearer/);
  assert.match(contract, /drill\.revealed/);
  assert.match(contract, /POST \/api\/bot\/pause/);
});
