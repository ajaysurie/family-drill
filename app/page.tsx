import Image from "next/image";
import Link from "next/link";
import scenarios from "../lib/scenarios.json";

const drillSteps = [
  ["1", "Install the bot", "The family organizer verifies their email once."],
  ["2", "Add your family", "Tell the bot which relatives should get practice emails."],
  ["3", "Let drills arrive", "The bot sends surprise emails from fictional organizations."],
  ["4", "See what landed", "A click reveals the drill, gives coaching, and appears in the bot report."],
];

export default function Home() {
  return <>
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">Scam practice for families</span>
        <h1>Send your family safe, surprise scam drills.</h1>
        <p>Install the bot, add your family&apos;s emails, and see which practice messages they spot. Every click opens a lesson. It never opens a form asking for private information.</p>
        <div className="actions">
          <Link className="button" href="/docs/bot">Install the Family Drill bot <span aria-hidden>→</span></Link>
          <Link className="button secondary" href="/d/drill-leo">Try a demo reveal</Link>
        </div>
        <p className="organizer-note"><strong>Only the organizer sets it up.</strong> Family members just receive occasional practice emails.</p>
      </div>
      <div className="hero-art"><Image src="/brand/hero-coaching.jpg" alt="A family calmly practicing how to spot a suspicious message together" width={720} height={620} priority /></div>
    </section>

    <section>
      <span className="eyebrow">How it works</span><h2>Four steps. The bot does the work.</h2>
      <div className="steps">{drillSteps.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="examples-section">
      <span className="eyebrow">What your family sees</span><h2>Practice common scam tactics.</h2>
      <p className="section-intro">Parcel trouble. A bank alert. Benefits paperwork. A tax refund. Every organization is fictional, and each message demonstrates a common pressure tactic.</p>
      <div className="inbox-grid">{scenarios.slice(0, 6).map((scenario) => <article className="inbox-card" key={scenario.id}>
        <div className="inbox-avatar" aria-hidden>{scenario.fromName.charAt(0)}</div><div><strong>{scenario.fromName}</strong><h3>{scenario.subject}</h3><p>{scenario.preview}</p></div>
      </article>)}</div>
      <p className="example-note">These are fictional organizations, not real brands. Email copy can mimic a request for personal information, but the link always opens an instant reveal and coaching. Family Drill never collects passwords, Social Security numbers, or card details.</p>
    </section>

    <section>
      <span className="eyebrow">Choose where it runs</span><h2>Hosted, or yours to run.</h2>
      <div className="run-grid">
        <article className="run-card featured"><span className="tag">Simplest</span><h3>Hosted on app.familydrill.com</h3><p>Install the bot and use the Family Drill service. No app deployment or email-provider setup.</p><Link href="/docs/bot">Get bot install instructions <span aria-hidden>→</span></Link></article>
        <article className="run-card"><span className="tag">MIT licensed</span><h3>Clone and self-host</h3><p>Run the app on your own domain and connect your own email service provider.</p><a href="https://github.com/ajaysurie/family-drill">Clone on GitHub <span aria-hidden>↗</span></a></article>
      </div>
    </section>

    <section className="safety-strip"><div><span className="eyebrow">The safe part</span><h2>Every click opens coaching.</h2></div><p>The reveal explains the clues immediately. The bot reports sends and clicks so the organizer knows what to practice next. No real brand impersonation, forged senders, downloads, or credential collection. <Link href="/docs/safety">Read the safety rules →</Link></p></section>
    <section className="bot-card"><div><span className="eyebrow">Start with the bot</span><h2>Ready to give your family a practice run?</h2><p>Install the bot, verify your organizer email, and paste your install code into the bot chat.</p></div><Link className="button secondary" href="/docs/bot">Install the Family Drill bot →</Link></section>
  </>;
}
