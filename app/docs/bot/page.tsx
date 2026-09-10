const endpoints = [
  ["POST", "/api/bot/install/start", "Verify an organizer email in the local demo and issue an install ID plus bot token."],
  ["GET", "/api/bot/install", "Read install state, capabilities, organizer email, and pause state."],
  ["GET · POST", "/api/bot/members", "List the bot-owned roster or add a member with name and email."],
  ["PATCH · DELETE", "/api/bot/members/:id", "Update or remove a roster member."],
  ["POST", "/api/bot/drills", "Queue a fictional drill and mint a reveal path on this app."],
  ["GET", "/api/bot/events?since=<cursor>", "Poll sent, revealed, engaged, and failed events."],
  ["GET", "/api/bot/drills/:id", "Read lesson bullets and the deliberate-button engagement method."],
  ["POST", "/api/bot/pause · /api/bot/resume", "Stop or resume all household sends and minting."],
  ["GET", "/api/bot/health", "Read service, install, and household pause state."]
];

export default function BotDocsPage() { return <>
  <span className="eyebrow">Coach bot API</span><h1>A bot-first contract for family drills.</h1>
  <p className="lede">The coach bot owns the roster and decides what to request. Family Drill owns delivery, quiet hours, rate limits, and reveal pages; the bot never handles mail-provider credentials.</p>
  <div className="status-pill">Template not published</div>
  <h2>Install and authentication</h2>
  <p>Start local organizer verification with <code>POST /api/bot/install/start</code> and <code>{'{"email":"organizer@example.test"}'}</code>. This demo completes the magic-link step immediately and returns <code>installId</code> and <code>botToken</code>. In a configured stub, <code>FAMILY_DRILL_BOT_TOKEN</code> is the install-scoped token.</p>
  <p>Send <code>Authorization: Bearer &lt;bot_token&gt;</code> or <code>X-Family-Drill-Token: &lt;bot_token&gt;</code>. This token is not an ESP key. Requests with a bad token receive <code>401</code>; sends and roster writes are rejected while the install is inactive or the household is paused.</p>
  <h2>Endpoints</h2>
  <div className="card-grid">{endpoints.map(([method, path, description]) => <article className="card" key={path}><strong><code>{method} {path}</code></strong><p>{description}</p></article>)}</div>
  <h2>Queue a drill</h2>
  <p>Send <code>{'{"memberId":"maya","scenarioId":"surprise","sendAt":"2026-09-11T14:00:00Z"}'}</code>. All fields are optional: the app can select a member and fictional scenario. The response contains <code>drillId</code>, <code>memberId</code>, <code>scenarioLabel</code>, <code>revealPath</code>, and <code>scheduledFor</code>. The stub shifts requests out of its 21:00–08:00 UTC quiet hours and limits a household to five drills per hour.</p>
  <h2>Events and coaching</h2>
  <p>Event polling returns an array of <code>{'{ type, at, drillId, memberName, summary, cursor }'}</code>. Types are <code>drill.sent</code>, <code>drill.revealed</code>, <code>lure.engaged</code>, and <code>drill.failed</code>. Pass the last cursor back as <code>since</code>. Drill detail returns only coaching context and lesson bullets—never credentials. A lure engagement is recorded only when the member deliberately presses the reveal-page button.</p>
  <h2>Safety boundaries</h2><ul><li>Use fictional organizations only—never spoof a real brand or From identity.</li><li>Never create credential forms or ask for passwords, financial details, or secrets.</li><li>Never put ESP keys in bot instructions, actions, chat, or templates. Delivery stays in the app.</li><li>The household installs once; there is no per-relative opt-in workflow.</li></ul>
  <p>No bot template or public install URL has been published.</p>
  </>; }
