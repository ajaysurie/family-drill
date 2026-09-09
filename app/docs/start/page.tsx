import Link from "next/link";

export default function StartDocsPage() { return <>
  <span className="eyebrow">Start here</span><h1>Pick your lane.</h1><p className="lede">The same household safety gym, in three shapes. Every lane starts with one household agreement and uses fictional, no-credential drills.</p>
  <div className="doc-options">
    <section><b>01 · Hosted</b><h2>Plug in and practice</h2><p>Family Drill hosts the app and mail delivery at familydrill.com and app.familydrill.com. Hosted signup is still on its way; today, the in-app household flow is the front door.</p><Link className="text-link" href="/household">Open the household setup →</Link></section>
    <section><b>02 · Self-host</b><h2>Own the stack</h2><p>Clone the MIT-licensed repository, deploy the Next.js app, and configure your own ESP credentials for authenticated mail from a domain you control.</p><a className="text-link" href="https://github.com/ajaysurie/family-drill">View the repository ↗</a></section>
    <section><b>03 · Grok Bot</b><h2>Add a coach</h2><p>Use the template as a scheduler and household coach. Give it an app URL, never mail-provider secrets.</p><Link className="text-link" href="/docs/bot">Read the bot brief →</Link></section>
  </div>
  <div className="callout"><strong>Not sure?</strong> Start hosted. Self-host when you want infrastructure chores as part of family night.</div>
  </>; }
