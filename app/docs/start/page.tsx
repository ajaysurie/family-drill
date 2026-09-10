import Link from "next/link";

export default function StartDocsPage() { return <>
  <span className="eyebrow">How it works</span><h1>The bot runs drills. The site reveals them.</h1>
  <p className="lede">Family Drill is bot-first. The organizer installs the bot, verifies their account, and chooses a schedule. Relatives receive surprise practice emails without a separate opt-in flow.</p>
  <div className="doc-options">
    <section><b>01 · Primary path</b><h2>Install the bot</h2><p>The bot manages the schedule, organizer updates, reports, and coaching. Its template is not published yet; the install page always shows the current status.</p><Link className="text-link" href="/docs/bot">View the install path →</Link></section>
    <section><b>02 · Hosted here</b><h2>Open a trusted reveal</h2><p>Every surprise email points back to this domain for a clear reveal and short lesson. No credentials or private information are requested.</p><Link className="text-link" href="/d/drill-leo">Try a demo reveal →</Link></section>
    <section><b>03 · Developers</b><h2>Run the local demo</h2><p>The household and report screens remain as test fixtures for contributors. They are not the daily product path.</p><Link className="text-link" href="/household">Open developer demo →</Link></section>
  </div>
  </>; }
