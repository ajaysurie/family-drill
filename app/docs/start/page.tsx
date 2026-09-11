import Link from "next/link";
import { BOT_TEMPLATE_URL, HOSTED_APP_URL } from "../../../lib/constants";

export default function StartDocsPage() { return <>
  <span className="eyebrow">Start here</span><h1>Install the bot. Pick where Family Drill runs.</h1>
  <p className="lede">The organizer verifies once and adds family emails in the bot. Relatives do not set anything up. They receive occasional surprise practice messages.</p>
  <div className="doc-options">
    <section><b>01 · Hosted</b><h2>Use {HOSTED_APP_URL}</h2><p>This is the default. Install the bot and let the hosted Family Drill service handle the app and email delivery.</p><Link className="text-link" href={BOT_TEMPLATE_URL}>Install the bot →</Link></section>
    <section><b>02 · Self-host</b><h2>Run it on your domain</h2><p>Clone the MIT-licensed app, deploy it on your own domain, and connect your own email service provider. Then point the bot to your app.</p><a className="text-link" href="https://github.com/ajaysurie/family-drill">Clone the repository ↗</a></section>
  </div>
  <div className="callout"><strong>Getting started:</strong> install bot → verify on the site → copy the install code into the bot chat → add family → send surprise drills.</div>
  <h2>What happens after a click?</h2><p>The practice link opens an instant reveal and simple coaching. It never asks for or collects a password, Social Security number, card number, or other secret.</p>
  </>; }
