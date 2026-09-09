import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const skillDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const repoDir = resolve(skillDir, "../../..");
export const runDir = resolve(skillDir, ".run");
export const lockPath = resolve(runDir, "server.json");
export const port = Number(process.env.FAMILY_DRILL_PORT || 3000);
export const baseUrl = `http://127.0.0.1:${port}`;

export async function ensureRunDir() { await mkdir(runDir, { recursive: true }); }
export async function readLock() {
  try { return JSON.parse(await readFile(lockPath, "utf8")); } catch { return null; }
}
export async function writeLock(value) { await ensureRunDir(); await writeFile(lockPath, `${JSON.stringify(value, null, 2)}\n`); }
export async function removeLock() { await rm(lockPath, { force: true }); }
export function pidAlive(pid) {
  try { process.kill(pid, 0); return true; } catch { return false; }
}
export async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, { redirect: "manual", signal: AbortSignal.timeout(5000), ...options });
}
export async function portResponds() {
  try { await request("/"); return true; } catch { return false; }
}
export async function waitUntilReady(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await portResponds()) return;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error(`server did not become ready at ${baseUrl} within ${timeoutMs}ms`);
}
