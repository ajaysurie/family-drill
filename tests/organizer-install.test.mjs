import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("verified organizers receive a copyable install code", async () => {
  const [page, client, login, constants, installConfig, store, setup] = await Promise.all([
    read("../app/install/page.tsx"), read("../app/copy-button.tsx"),
    read("../app/login/actions.ts"), read("../lib/constants.ts"),
    read("../lib/bot-install.ts"), read("../lib/store.ts"), read("../app/assistant-setup.tsx"),
  ]);
  assert.match(page, /await auth\(\)/);
  assert.match(page, /verifyInstall\(session\.user\.id\)/);
  assert.match(client, /navigator\.clipboard\.writeText\(value\)/);
  assert.match(page, /<CopyButton value=\{install\.botToken\} \/>/);
  assert.match(page, /<AssistantSetup appUrl=\{appBaseUrl\(\)\} code=\{install\.botToken\} \/>/);
  for (const assistant of ["Grok Bot", "Meta Muse", "Other assistants"]) assert.match(setup, new RegExp(assistant));
  assert.match(setup, /\/api\/mcp\/\$\{shown\}/);
  assert.match(setup, /\/agent\.md/);
  assert.match(page, /Keep this code private/);
  assert.match(login, /redirectTo: "\/install"/);
  assert.match(constants, /https:\/\/app\.familydrill\.com/);
  assert.match(installConfig, /https:\/\/x\.ai\/bot\/GYM2zP9NA3J4_g9tTX0qS/);
  const verifyInstall = store.match(/export async function verifyInstall[\s\S]*?export async function setPaused/)?.[0] ?? "";
  assert.ok(verifyInstall.indexOf("await activateHousehold(organizerId)") < verifyInstall.indexOf("db.insert(botInstalls)"), "agreement is activated before install credentials are issued");
  assert.match(store, /state\.status === "active"/);
  assert.match(verifyInstall, /if \(existing\?\.active && !rotate\) return/, "revisiting the install page keeps the connected code");
  for (const forbidden of ["bot_token", "Bearer", "ESP"]) assert.doesNotMatch(page + client, new RegExp(forbidden, "i"));
});

test("an active legacy install heals its draft agreement before a member write", async () => {
  const [store, membersRoute, tools] = await Promise.all([
    read("../lib/store.ts"),
    read("../app/api/bot/members/route.ts"),
    read("../lib/bot-tools.ts"),
  ]);
  const addMemberTool = tools.match(/name: "add_member"[\s\S]*?name: "update_member"/)?.[0] ?? "";
  const canOperate = store.match(/export async function canOperate[\s\S]*?\n\}/)?.[0] ?? "";

  assert.match(canOperate, /state\?\.active && !state\.paused && state\.status === "draft"/);
  assert.ok(canOperate.indexOf("await activateHousehold(organizerId)") < canOperate.lastIndexOf("await getOperationState(organizerId)"), "draft agreement is activated before operation state is re-evaluated");
  assert.match(canOperate, /state\?\.active && !state\.paused && state\.status === "active"/);
  assert.match(membersRoute, /runBotTool\("add_member"/);
  assert.ok(addMemberTool.indexOf("await canOperate(organizerId)") > 0 && addMemberTool.indexOf("await canOperate(organizerId)") < addMemberTool.indexOf("await addMember(organizerId"), "member creation uses the self-healing operation check");
});
