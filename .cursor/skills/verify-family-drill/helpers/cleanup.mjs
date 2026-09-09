import { pidAlive, readLock, removeLock, repoDir } from "./lib.mjs";

const lock = await readLock();
if (!lock) { console.log("No skill-owned Family Drill server to clean up."); process.exit(0); }
if (lock.repoDir !== repoDir || !Number.isInteger(lock.pid)) {
  console.error("Refusing cleanup: ownership file does not identify this repository.");
  process.exit(1);
}
if (pidAlive(lock.pid)) {
  try { process.kill(-lock.pid, "SIGTERM"); } catch (error) { console.error(`Could not stop pid ${lock.pid}: ${error.message}`); process.exit(1); }
  console.log(`Stopped skill-owned server (pid ${lock.pid}).`);
} else console.log("Skill-owned server was already stopped.");
await removeLock();
