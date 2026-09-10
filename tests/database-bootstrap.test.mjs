import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("the runtime bootstrap applies the idempotent foundation and demo seed", async () => {
  const [bootstrap, migration, seed, database, store] = await Promise.all([
    read("../lib/database-bootstrap.ts"),
    read("../db/migrations/0001_foundation.sql"),
    read("../db/seed.sql"),
    read("../lib/db.ts"),
    read("../lib/store.ts"),
  ]);
  const [, embeddedFoundation, embeddedSeed] = bootstrap.match(/`([\s\S]*?)`[\s\S]*?`([\s\S]*?)`/) ?? [];

  assert.equal(embeddedFoundation?.trim(), migration.trim());
  assert.equal(embeddedSeed?.trim(), seed.trim());
  assert.match(migration, /CREATE TABLE IF NOT EXISTS "Attempt"/);
  assert.match(seed, /'attempt-leo'.*'drill-leo'/);
  assert.match(database, /pg_advisory_xact_lock[\s\S]*foundationSql[\s\S]*seedSql/);
  assert.match(store, /findAttempt\(token: string\) \{ await ensureSchema\(\);/);
});

test("unknown reveal tokens still use the existing not-found path", async () => {
  const [store, page] = await Promise.all([read("../lib/store.ts"), read("../app/d/[token]/page.tsx")]);
  assert.match(store, /return row \? attempt\(row\) : undefined/);
  assert.match(page, /if \(!attempt\) notFound\(\)/);
});

test("requested marketing copy uses plain punctuation", async () => {
  const copy = (await Promise.all([
    read("../app/page.tsx"),
    read("../app/layout.tsx"),
    read("../app/docs/start/page.tsx"),
    read("../app/docs/bot/page.tsx"),
  ])).join("\n");
  assert.doesNotMatch(copy, /[—“”‘’]/);
  assert.doesNotMatch(copy, /feel familiar|becomes a lesson, not a trap|look believable at a glance/i);
});
