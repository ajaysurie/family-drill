import Link from "next/link";

export default function StartDocsPage() { return <>
  <span className="eyebrow">Start here</span><h1>Choose how to run Family Drill.</h1><p className="lede">Each option starts with one household agreement. Every drill uses a fictional organization and asks for no credentials.</p>
  <div className="doc-options">
    <section><b>01 · Hosted</b><h2>Use the hosted service</h2><p>Family Drill will host the app and mail delivery at familydrill.com and app.familydrill.com. Signup is not open yet. You can use the in-app household setup in this demo.</p><Link className="text-link" href="/household">Open household setup →</Link></section>
    <section><b>02 · Self-host</b><h2>Run it yourself</h2><p>Clone the MIT-licensed repository and deploy the Next.js app. Configure your own ESP credentials for authenticated mail from a domain you control.</p><a className="text-link" href="https://github.com/ajaysurie/family-drill">View the repository ↗</a></section>
    <section><b>03 · Grok Bot</b><h2>Schedule drills</h2><p>Use the template to schedule drills and provide coach tips. Give it an app URL. Do not give it mail-provider secrets.</p><Link className="text-link" href="/docs/bot">Read the bot instructions →</Link></section>
  </div>
  <div className="callout"><strong>Not sure?</strong> Try the in-app household setup. Self-host if you want to manage the app and mail delivery.</div>
  </>; }
