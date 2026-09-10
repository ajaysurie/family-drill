import Link from "next/link";

export default function StartDocsPage() { return <>
  <span className="eyebrow">Start here</span><h1>Install the bot. Pick where Family Drill runs.</h1>
  <p className="lede">The organizer verifies once and adds family emails in the bot. Relatives do not set anything up—they simply receive occasional surprise practice messages.</p>
  <div className="doc-options">
    <section><b>01 · Hosted</b><h2>Use familydrill.com</h2><p>Install the bot and let the hosted Family Drill service handle the app and email delivery. The bot template is not published yet.</p><Link className="text-link" href="/docs/bot">See bot install instructions →</Link></section>
    <section><b>02 · Self-host</b><h2>Run it on your domain</h2><p>Clone the MIT-licensed app, deploy it on your own domain, and connect your own email service provider. Then point the bot to your app.</p><a className="text-link" href="https://github.com/ajaysurie/family-drill">Clone the repository ↗</a></section>
  </div>
  <div className="callout"><strong>Either way, the flow is the same:</strong> install bot → verify organizer → add family emails → send surprise drills → review what landed.</div>
  <h2>What happens after a click?</h2><p>The practice link opens an instant reveal and simple coaching. It never asks for or collects a password, Social Security number, card number, or other secret.</p>
  </>; }
