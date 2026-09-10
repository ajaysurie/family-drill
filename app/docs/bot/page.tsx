const endpoints = [
  ["GET", "/api/bot/health", "Check that the app is up and whether the household agreement is active."],
  ["GET", "/api/bot/members", "List only household member IDs and display names for schedule picks."],
  ["POST", "/api/bot/schedule", "Record a schedule intent for memberId and scenarioId (or surprise), with optional quietHours."],
  ["GET", "/api/bot/last-attempt", "Read the latest member display name, scenario clues, and coaching outcome."],
];

export default function BotDocsPage() { return <>
  <span className="eyebrow">Coach bot API</span><h1>Schedule drills and review the lesson.</h1><p className="lede">This thin API lets a future coach bot request approved work. Family Drill owns delivery; the bot never handles mail-provider credentials.</p>
  <div className="status-pill">Template placeholder · not yet published</div>
  <h2>Authentication</h2><p>Set <code>FAMILY_DRILL_BOT_TOKEN</code> in the app environment. Send <code>Authorization: Bearer &lt;token&gt;</code> on every request. Missing or incorrect tokens receive <code>401</code>.</p>
  <h2>Endpoints</h2>
  <div className="card-grid">{endpoints.map(([method, path, description]) => <article className="card" key={path}><strong><code>{method} {path}</code></strong><p>{description}</p></article>)}</div>
  <h2>Schedule request</h2><p>Send JSON such as <code>{'{"memberId":"maya","scenarioId":"surprise","quietHours":{"start":"21:00","end":"08:00","timezone":"America/New_York"}}'}</code>. The app rejects scheduling unless the household agreement is active. Quiet hours contain <code>start</code>, <code>end</code>, and an IANA <code>timezone</code>.</p>
  <h2>Hard nos</h2><ul><li>Use fictional organizations only—never spoof a real brand or From identity.</li><li>Never create credential forms or ask for passwords, financial details, or secrets.</li><li>Never put ESP keys in bot instructions, actions, chat, or templates. Delivery stays in the app.</li></ul>
  <p>No bot template or public install link has been published.</p>
  </>; }
