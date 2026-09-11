import Link from "next/link";
import { BOT_INSTALL_URL } from "../../../lib/bot-install";
import { OnboardingSteps } from "../../onboarding-steps";
import { HOSTED_APP_URL } from "../../../lib/constants";

export default function StartDocsPage() { return <>
  <span className="eyebrow">Start here</span><h1>Install the bot. Pick where Family Drill runs.</h1>
  <p className="lede">Add relatives by telling the bot their names and email addresses in the bot chat. There is no hosted website form for adding family members. Relatives do not set anything up.</p>
  <h2>The easy path</h2>
  <OnboardingSteps />
  <div className="doc-options">
    <section><b>01 · Hosted</b><h2>Use {HOSTED_APP_URL}</h2><p>This is the default. Install the bot and let the hosted Family Drill service handle the app and email delivery.</p><a className="text-link" href={BOT_INSTALL_URL}>Install the Family Drill bot →</a><br /><Link className="text-link" href="/docs/bot">See setup instructions →</Link></section>
    <section><b>02 · Self-host</b><h2>Run it on your domain</h2><p>Clone the MIT-licensed app, deploy it on your own domain, and connect your own email service provider. Then point the bot to your app.</p><a className="text-link" href="https://github.com/ajaysurie/family-drill">Clone the repository ↗</a></section>
  </div>
  <div className="callout"><strong>Remember:</strong> after connecting your install code, add and manage relatives by talking to the bot.</div>
  <h2>What happens after a click?</h2><p>The practice link opens an instant reveal and simple coaching. It never asks for or collects a password, Social Security number, card number, or other secret.</p>
  </>; }
