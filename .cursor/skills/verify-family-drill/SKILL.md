---
name: verify-family-drill
description: Verify Family Drill against a real local Next.js server, including its agreement, send, reveal, and deliberate-scoring flows.
---

# Verify Family Drill

## Principles

- **Laziness:** run the smallest check that proves the requested change; do not build a second test framework.
- **Subtract before add:** reuse the seeded household and browser-visible state instead of adding fixtures or APIs.
- **Prove it works:** compilation is necessary, not sufficient. Exercise a real HTTP server and, when available, Chromium.
- **Guard the context window:** report commands, concise evidence, and artifact paths—not full logs.

## When to use

Use this skill after changing Family Drill behavior, routes, copy, forms, or styles, and before asking for review. It is an in-repo local verification lane, not a production monitor.

## Surface map

| Surface | Proof |
| --- | --- |
| `/` | Family Drill landing or marketing home loads |
| `/household` | Active agreement and Maya, Leo, and Ruth are visible |
| `/admin` | Seed counts render; sending a stub drill increases a member's sent count |
| `/d/drill-leo` | Reveal is immediate; GET does not score; deliberate button POST does |
| `/docs/start`, `/docs/safety`, `/docs/bot` | Doctor only when present; a 404 means “not present,” not failure |

## Run

From the repository root:

```bash
npm install
npm test
npm run build
node .cursor/skills/verify-family-drill/helpers/launch.mjs
node .cursor/skills/verify-family-drill/helpers/doctor.mjs
node .cursor/skills/verify-family-drill/helpers/drive.mjs
node .cursor/skills/verify-family-drill/helpers/cleanup.mjs
```

`launch.mjs` starts `npm run dev` on `127.0.0.1:3000` by default and writes ownership state and logs beneath `.cursor/skills/verify-family-drill/.run/`. Set `FAMILY_DRILL_PORT` to use another port. It will not attach to a process it did not launch.

## Launch, doctor, drive, cleanup

1. **Launch** and wait for its HTTP readiness result. If the port is already occupied, stop that process or choose another port—never treat it as Family Drill.
2. **Doctor** the required routes, product language, and the absence of credential fields on drill HTML. Optional docs are checked when present and skipped on 404.
3. **Drive** the scenarios in `features/` with Playwright Chromium when it is already available. The driver records screenshots in `artifacts/`. If Playwright or Chromium is unavailable, it exits successfully with an explicit skip reason; the doctor remains the minimum real-server proof.
4. **Cleanup** only the process recorded in this skill's ownership file. Inspect `.run/server.log` if a check fails.

## Hard nos

- No email service provider, live mail delivery, tracking pixel, or production URL.
- No secrets, credential collection, or writes to production systems.
- No real-brand spoof test that depends on a mailbox or live mail provider.
- No copied Firestore, cron, ingest, or deployment machinery.
- Do not claim the browser journey passed when `drive.mjs` reported a skip.
