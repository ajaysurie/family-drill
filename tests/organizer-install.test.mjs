import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("verified organizers receive a copyable install code", async () => {
  const [page, client, login, constants] = await Promise.all([
    read("../app/install/page.tsx"), read("../app/install/install-code.tsx"),
    read("../app/login/actions.ts"), read("../lib/constants.ts"),
  ]);
  assert.match(page, /await auth\(\)/);
  assert.match(page, /verifyInstall\(session\.user\.id\)/);
  assert.match(client, /navigator\.clipboard\.writeText\(code\)/);
  assert.match(page + client, /Copy/);
  assert.match(page, /paste it into your Family Drill bot chat/i);
  assert.match(page, /not your email password/);
  assert.match(login, /redirectTo: "\/install"/);
  assert.match(constants, /https:\/\/app\.familydrill\.com/);
  assert.match(constants, /https:\/\/x\.ai\/bot\/GYM2zP9NA3J4_g9tTX0qS/);
  for (const forbidden of ["bot_token", "Bearer", "ESP"]) assert.doesNotMatch(page + client, new RegExp(forbidden, "i"));
});
