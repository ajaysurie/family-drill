import Link from "next/link";

const drillSteps = [
  ["01", "Agree once", "Set one plain-language household agreement."],
  ["02", "Surprise drill", "A fictional message arrives when nobody is expecting homework."],
  ["03", "Fail: click or call", "A miss becomes a useful practice rep—not a gotcha."],
  ["04", "Reveal + coach", "The drill identifies itself immediately and explains the clues."],
  ["05", "Scoreboard", "See patterns, practice again, and celebrate the pause."],
];

export default function Home() {
  return <>
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">The household safety gym</span>
        <h1>Practice the scam before the real one hits.</h1>
        <p>One household agreement. Surprise drills. Instant reveal. No real brands. No forged headers.</p>
        <div className="actions">
          <Link className="button" href="/household">Start free <span aria-hidden>→</span></Link>
          <a className="button secondary" href="https://github.com/ajaysurie/family-drill">View on GitHub <span aria-hidden>↗</span></a>
        </div>
        <p className="trust-line">MIT <i/> open source <i/> household-only <i/> owned-domain mail</p>
      </div>
      <div className="drill-preview" aria-label="Example fictional practice email">
        <div className="preview-bar"><span/><span/><span/><b>INBOX / PRACTICE</b></div>
        <div className="preview-body">
          <span className="practice-stamp">FICTIONAL DRILL</span>
          <small>From</small><strong>Northbridge Benefits</strong>
          <small>Subject</small><strong>Your family coverage needs attention</strong>
          <p>We noticed a time-sensitive change. Review the notice before Friday.</p>
          <span className="fake-button">Review notice</span>
          <p className="tiny">A made-up organization. An owned, authenticated sender. Nothing to enter or download.</p>
        </div>
      </div>
    </section>

    <section className="split problem">
      <div><span className="eyebrow">The problem</span><h2>Scam advice is easy to forget under pressure.</h2></div>
      <div><p>Real scams arrive between dinner, homework, and the group chat. A yearly lecture cannot recreate that moment.</p><p>Family Drill turns “be careful” into a repeatable skill: notice the rush, stop, and check with a person you trust.</p></div>
    </section>

    <section>
      <span className="eyebrow">The drill</span><h2>One agreement. Many useful reps.</h2>
      <div className="steps">{drillSteps.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="truth-section">
      <div><span className="eyebrow">What it is</span><h2>Safe practice, with the sharp edges removed.</h2><ul className="checks"><li>Fictional organizations and situations</li><li>Authenticated mail from a domain you own</li><li>Immediate reveal and kind coaching</li><li>A household scoreboard for learning</li></ul></div>
      <div className="not-card"><span className="eyebrow">What it isn’t</span><h3>Not a phishing kit. Full stop.</h3><ul><li>No brand impersonation</li><li>No forged From headers</li><li>No credential harvesting</li><li>No caller-ID spoofing</li><li>No sneaky downloads</li></ul></div>
    </section>

    <section>
      <span className="eyebrow">Two ways to run</span><h2>Take the easy route—or own the whole stack.</h2>
      <div className="run-grid">
        <article className="run-card featured"><span className="tag">Plug-and-play</span><h3>Hosted</h3><p>Use familydrill.com and app.familydrill.com. Set the household agreement, add your people, and start practicing.</p><Link href="/household">Start free <span aria-hidden>→</span></Link></article>
        <article className="run-card"><span className="tag">MIT licensed</span><h3>Self-host</h3><p>Clone the project, deploy it yourself, and bring keys for your own legitimate mail provider and owned domain.</p><a href="https://github.com/ajaysurie/family-drill">Clone on GitHub <span aria-hidden>↗</span></a></article>
      </div>
    </section>

    <section className="bot-card">
      <div className="bot-mark" aria-hidden>✦</div><div><span className="eyebrow">Grok Bot template</span><h2>Let a bot coach—not carry the keys.</h2><p>The optional template can schedule drills and coach your household. It only points to your Family Drill app URL; ESP secrets stay in the app, always.</p></div><Link className="button secondary" href="/docs/bot">Bot instructions →</Link>
    </section>

    <section className="safety-strip"><div><span className="eyebrow">Safety by design</span><h2>A gym, not a gotcha machine.</h2></div><p>Households agree once, drills use invented organizations, and misses prompt coaching—not shame. Abuse does not get a feature flag. <Link href="/docs/safety">Read the safety policy →</Link></p></section>
  </>;
}
