import { open } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { baseUrl, ensureRunDir, lockPath, pidAlive, port, portResponds, readLock, repoDir, waitUntilReady, writeLock } from "./lib.mjs";

const existing = await readLock();
if (existing && pidAlive(existing.pid) && existing.repoDir === repoDir && existing.port === port) {
  console.log(`Family Drill server already owned by this skill at ${baseUrl} (pid ${existing.pid})`);
  process.exit(0);
}
if (await portResponds()) {
  console.error(`Refusing to attach: port ${port} is occupied by a process this skill does not own.`);
  process.exit(1);
}

await ensureRunDir();
const log = await open(resolve(lockPath, "../server.log"), "a");
const child = spawn("npm", ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd: repoDir, detached: true, stdio: ["ignore", log.fd, log.fd]
});
child.unref();
await writeLock({ pid: child.pid, port, baseUrl, repoDir, startedAt: new Date().toISOString() });
try {
  await waitUntilReady();
  console.log(`Launched Family Drill at ${baseUrl} (pid ${child.pid})`);
} catch (error) {
  try { process.kill(-child.pid, "SIGTERM"); } catch {}
  console.error(error.message);
  process.exit(1);
}
