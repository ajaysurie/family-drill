import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { baseUrl, skillDir } from "./lib.mjs";
import { selectors } from "./selectors.mjs";

let chromium;
try { ({ chromium } = await import("playwright")); }
catch { console.log("SKIP browser drive: Playwright is not installed; run doctor.mjs for real-server HTTP proof."); process.exit(0); }

let browser;
try { browser = await chromium.launch({ headless: true }); }
catch (error) { console.log(`SKIP browser drive: Chromium is unavailable (${error.message.split("\n")[0]}). Run doctor.mjs for HTTP proof.`); process.exit(0); }

const artifacts = resolve(skillDir, "artifacts"); await mkdir(artifacts, { recursive: true });
const page = await browser.newPage();
const rowFor = (name) => page.locator(selectors.adminRows).filter({ has: page.getByRole("heading", { name }) });
const sent = async (name) => Number(await rowFor(name).locator(selectors.sentCount).textContent());
try {
  await page.goto(`${baseUrl}/`); await page.getByRole("heading", { name: /Family Drill/i }).waitFor();
  await page.goto(`${baseUrl}/household`); await page.getByText("Maya", { exact: true }).waitFor(); await page.getByText("Leo", { exact: true }).waitFor(); await page.getByText("Ruth", { exact: true }).waitFor();
  await page.goto(`${baseUrl}/admin`); const mayaBefore = await sent("Maya"); await rowFor("Maya").getByRole("button", { name: "Send surprise drill" }).click(); await page.waitForLoadState("networkidle"); if (await sent("Maya") !== mayaBefore + 1) throw new Error("Maya sent count did not increase");
  const leoRow = rowFor("Leo"); const engagement = async () => Number(await leoRow.locator("div").filter({ hasText: "lure engagements" }).locator("b").textContent()); const leoBefore = await engagement();
  await page.goto(`${baseUrl}/d/drill-leo`); await page.getByRole("heading", { name: /No shame/i }).waitFor();
  await page.goto(`${baseUrl}/admin`); if (await engagement() !== leoBefore) throw new Error("GET incorrectly changed Leo's engagement count");
  await page.goto(`${baseUrl}/d/drill-leo`); await page.getByRole("button", { name: "I opened this from the email" }).click(); await page.locator(selectors.notice).waitFor();
  await page.goto(`${baseUrl}/admin`); if (await engagement() !== leoBefore + 1) throw new Error("deliberate confirmation did not increase Leo's count");
  await page.screenshot({ path: resolve(artifacts, "admin-verified.png"), fullPage: true });
  console.log("PASS browser drive: landing, agreement, send, reveal GET, and deliberate POST verified.");
} finally { await browser.close(); }
