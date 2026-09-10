import Image from "next/image";
import Link from "next/link";

const drillSteps = [
  ["01", "Agree once", "Set one plain-language household agreement."],
  ["02", "Get a surprise drill", "A fictional message arrives without warning."],
  ["03", "Open the link", "The reveal page appears. No private information is requested."],
  ["04", "Check the clues", "The page explains what made the message suspicious."],
  ["05", "Review the report", "The report counts sends and confirmed lure engagements."],
];

export default function Home() {
  return <>
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">Scam drills for households</span>
        <h1>Practice the scam before the real one hits.</h1>
        <p>One household agreement. Surprise drills. Instant reveal. No real brands. No forged headers.</p>
        <div className="actions">
          <Link className="button" href="/household">Start free <span aria-hidden>→</span></Link>
          <a className="button secondary" href="https://github.com/ajaysurie/family-drill">View on GitHub <span aria-hidden>↗</span></a>
        </div>
        <p className="trust-line">MIT <i/> open source <i/> household-only <i/> owned-domain mail</p>
      </div>
      <div className="hero-art">
        <Image src="/brand/hero-coaching.jpg" alt="A family calmly practicing how to spot a suspicious message together" width={720} height={620} priority />
      </div>
    </section>

    <section className="split problem">
      <div><span className="eyebrow">The problem</span><h2>Scam advice is easy to forget under pressure.</h2></div>
      <div><p>Real scams arrive between dinner, homework, and the group chat. A yearly lecture cannot recreate that moment.</p><p>Family Drill turns "be careful" into specific steps. Notice the rush, stop, and check with a person you trust.</p></div>
    </section>

    <section>
      <span className="eyebrow">How it works</span><h2>Agree once. Run surprise drills.</h2>
      <div className="steps">{drillSteps.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="truth-section">
      <div><span className="eyebrow">What it does</span><h2>Runs fictional drills for your household.</h2><ul className="checks"><li>Fictional organizations and situations</li><li>Authenticated mail from a domain you own</li><li>Immediate reveal with coach tips</li><li>A household report of sends and engagements</li></ul></div>
      <div className="not-card"><span className="eyebrow">What it is not</span><h3>This is not a phishing kit.</h3><ul><li>No brand impersonation</li><li>No forged From headers</li><li>No credential harvesting</li><li>No caller-ID spoofing</li><li>No downloads</li></ul></div>
    </section>

    <section>
      <span className="eyebrow">Two ways to run it</span><h2>Use the hosted service or self-host.</h2>
      <div className="run-grid">
        <article className="run-card featured"><span className="tag">Coming soon</span><h3>Hosted</h3><p>The hosted service will use familydrill.com and app.familydrill.com. For now, try the household setup in this demo.</p><Link href="/household">Open demo <span aria-hidden>→</span></Link></article>
        <article className="run-card"><span className="tag">MIT licensed</span><h3>Self-host</h3><p>Clone and deploy the project. Use your own legitimate mail provider and a domain you own.</p><a href="https://github.com/ajaysurie/family-drill">Clone on GitHub <span aria-hidden>↗</span></a></article>
      </div>
    </section>

    <section className="bot-card">
      <div><span className="eyebrow">Grok Bot template</span><h2>Use the bot for scheduling and coach tips.</h2><p>The optional template points to your Family Drill app URL. Keep ESP secrets in the app.</p></div><Link className="button secondary" href="/docs/bot">Bot instructions →</Link>
    </section>

    <section className="safety-strip"><div><span className="eyebrow">Safety rules</span><h2>Keep drills fictional and in the household.</h2></div><p>Households agree once. Drills use invented organizations. A miss opens the reveal and coach tips. <Link href="/docs/safety">Read the safety policy →</Link></p></section>
  </>;
}
