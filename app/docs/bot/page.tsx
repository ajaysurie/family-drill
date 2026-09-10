export default function BotDocsPage() { return <>
  <span className="eyebrow">Bot install path</span><h1>Install the bot to run Family Drill.</h1>
  <p className="lede">The bot is the product’s home: it owns the schedule, keeps the organizer informed, and reports what happened. This site hosts the trusted reveal pages.</p>
  <div className="callout"><strong>Not published yet.</strong> The bot template is still being prepared. This page is the install path and will link to the real template when it is available.</div>
  <h2>What setup will look like</h2><ol className="numbered">
    <li><span>1</span><div><strong>Install the Family Drill bot</strong><p>Use the official template link that will appear on this page. There is no placeholder install URL.</p></div></li>
    <li><span>2</span><div><strong>Verify the organizer</strong><p>Only the person organizing the drills verifies an account. Relatives do not complete an opt-in or verification flow.</p></div></li>
    <li><span>3</span><div><strong>Choose a schedule</strong><p>The bot schedules surprise email drills, shares status with the organizer, and brings back the report and coaching.</p></div></li>
    <li><span>4</span><div><strong>Use the hosted reveal</strong><p>Each practice link opens a Family Drill page on this domain so relatives can trust where the lesson comes from.</p></div></li>
  </ol>
  <h2>Keep delivery out of the bot</h2><p>Mail authentication and delivery belong to the Family Drill service. Never paste ESP credentials into bot instructions, actions, chat, or a template.</p>
  </>; }
