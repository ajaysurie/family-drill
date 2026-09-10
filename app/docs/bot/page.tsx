const endpoints = [
  ["POST", "/api/bot/install/start", "Use the verified organizer session to issue an install ID plus bot token."],
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
  <span className="eyebrow">Bot install path</span><h1>Install the bot to run Family Drill.</h1>
  <p className="lede">The bot is the product's home: it owns the roster, schedule, organizer updates, and coaching. Family Drill owns delivery, quiet hours, rate limits, and the trusted reveal pages; the bot never handles mail-provider credentials.</p>
  <div className="status-pill">Template not published</div>
  <h2>What setup will look like</h2><ol className="numbered">
    <li><span>1</span><div><strong>Install the Family Drill bot</strong><p>The official template link will appear here after it is published. There is no placeholder install URL.</p></div></li>
    <li><span>2</span><div><strong>Verify the organizer</strong><p>Only the person organizing the drills verifies an account. Relatives do not complete a separate verification flow.</p></div></li>
    <li><span>3</span><div><strong>Choose a schedule</strong><p>The bot requests surprise drills, shares status with the organizer, and brings back reports and coaching.</p></div></li>
    <li><span>4</span><div><strong>Use the hosted reveal</strong><p>Each practice link opens a Family Drill page on this site so relatives know where the lesson comes from.</p></div></li>
  </ol>
  <h2>Install and authentication</h2>
  <p>After the organizer signs in by magic link, call <code>POST /api/bot/install/start</code> in that authenticated browser session. The endpoint uses the verified session identity—not a submitted email—and returns <code>installId</code> and a database-backed <code>botToken</code>.</p>
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
