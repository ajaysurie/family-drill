import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("verified organizers receive a copyable install code", async () => {
  const [page, client, login, constants, installConfig, store] = await Promise.all([
    read("../app/install/page.tsx"), read("../app/install/install-code.tsx"),
    read("../app/login/actions.ts"), read("../lib/constants.ts"),
    read("../lib/bot-install.ts"), read("../lib/store.ts"),
  ]);
  assert.match(page, /await auth\(\)/);
  assert.match(page, /verifyInstall\(session\.user\.id\)/);
  assert.match(client, /navigator\.clipboard\.writeText\(code\)/);
  assert.match(page + client, /Copy/);
  assert.match(page, /paste it into your Family Drill bot chat/i);
  assert.match(page, /Keep this code private/);
  assert.match(login, /redirectTo: "\/install"/);
  assert.match(constants, /https:\/\/app\.familydrill\.com/);
  assert.match(installConfig, /https:\/\/x\.ai\/bot\/GYM2zP9NA3J4_g9tTX0qS/);
  const verifyInstall = store.match(/export async function verifyInstall[\s\S]*?export async function setPaused/)?.[0] ?? "";
  assert.ok(verifyInstall.indexOf("await activateHousehold(organizerId)") < verifyInstall.indexOf("db.insert(botInstalls)"), "agreement is activated before install credentials are issued");
  assert.match(store, /row\.status === "active"/);
  for (const forbidden of ["bot_token", "Bearer", "ESP"]) assert.doesNotMatch(page + client, new RegExp(forbidden, "i"));
});
