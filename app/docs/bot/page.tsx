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
  <span className="eyebrow">Install the bot</span><h1>Run Family Drill from one conversation.</h1>
  <p className="lede">The organizer installs the bot, verifies once, and adds family emails. Family members do not set anything up. They receive surprise practice emails, get instant coaching when they click, and the organizer sees what landed in the bot.</p>
  <div className="status-pill">Template not published</div>
  <h2>Choose your app</h2>
  <p><strong>Hosted:</strong> use Family Drill on familydrill.com. <strong>Self-hosted:</strong> clone the app, run it on your own domain with your own email service provider, and give that app URL to the bot.</p>
  <h2>Install and authentication</h2>
  <p>There is no public bot-template link yet. When it is published, the install button will appear here. We will not send you to a placeholder or invented URL.</p>
  <p>After the organizer signs in by magic link, call <code>POST /api/bot/install/start</code> in that authenticated browser session. The endpoint uses the verified session identity, not a submitted email, and returns <code>installId</code> and a database-backed <code>botToken</code>.</p>
  <p>Send <code>Authorization: Bearer &lt;bot_token&gt;</code> or <code>X-Family-Drill-Token: &lt;bot_token&gt;</code>. This token is not an ESP key. Requests with a bad token receive <code>401</code>; sends and roster writes are rejected while the install is inactive or the household is paused.</p>
  <h2>Endpoints</h2>
  <div className="card-grid">{endpoints.map(([method, path, description]) => <article className="card" key={path}><strong><code>{method} {path}</code></strong><p>{description}</p></article>)}</div>
  <h2>Queue a drill</h2>
  <p>Send <code>{'{"memberId":"maya","scenarioId":"surprise","sendAt":"2026-09-11T14:00:00Z"}'}</code>. All fields are optional: the app can select a member and fictional scenario. The response contains <code>drillId</code>, <code>memberId</code>, <code>scenarioLabel</code>, <code>revealPath</code>, and <code>scheduledFor</code>. The stub shifts requests out of its 21:00–08:00 UTC quiet hours and limits a household to five drills per hour.</p>
  <h2>Events and coaching</h2>
  <p>Event polling returns an array of <code>{'{ type, at, drillId, memberName, summary, cursor }'}</code>. Types are <code>drill.sent</code>, <code>drill.revealed</code>, <code>lure.engaged</code>, and <code>drill.failed</code>. Pass the last cursor back as <code>since</code>. Drill detail returns only coaching context and lesson bullets. It never returns credentials. A lure engagement is recorded only when the member deliberately presses the reveal-page button.</p>
  <h2>Safety boundaries</h2><ul><li>Use fictional organizations only. Never spoof a real brand or From identity.</li><li>Email lures can appear to request personal information, but their links must open the reveal, not a data-entry form.</li><li>Never collect passwords, Social Security numbers, card details, or other secrets.</li><li>Never put ESP keys in bot instructions, actions, chat, or templates. Delivery stays in the app.</li><li>Only the organizer completes setup; there is no per-relative setup workflow.</li></ul>
  <p>No bot template or public install URL has been published.</p>
  </>; }
