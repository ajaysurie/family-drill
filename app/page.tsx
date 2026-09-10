import Image from "next/image";
import Link from "next/link";

const steps = [
  ["1", "Install the bot", "The organizer verifies their account and chooses a simple practice schedule."],
  ["2", "Let it run the drill", "The bot sends a relative a surprise practice email and keeps the organizer informed."],
  ["3", "Learn on the reveal", "The email opens a trustworthy page here that names the clues and gives calm coaching tips."],
];

export default function Home() {
  return <>
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">Scam practice for families</span>
        <h1>Practice spotting scams before one feels real.</h1>
        <p>Install the Family Drill bot. It schedules surprise email drills, keeps the organizer informed, and helps the family learn what to check next time.</p>
        <div className="actions">
          <Link className="button" href="/docs/bot">Get the bot <span aria-hidden>→</span></Link>
          <Link className="text-link" href="/d/drill-leo">Try a demo reveal <span aria-hidden>→</span></Link>
        </div>
        <p className="availability">The bot template is not published yet. The install page has the current status—no fake install link.</p>
      </div>
      <div className="hero-art">
        <Image src="/brand/hero-coaching.svg" alt="A family calmly practicing how to spot a suspicious message together" width={720} height={620} priority />
      </div>
    </section>

    <section className="why-reveal split">
      <div><span className="eyebrow">Why this site exists</span><h2>A bot can send a link. It cannot make that link trustworthy.</h2></div>
      <div><p>Every practice email returns to a hosted Family Drill reveal on this domain. The page clearly says it was a drill, explains the warning signs, and never asks for private information.</p><Link className="text-link" href="/d/drill-leo">See the reveal your relative would see →</Link></div>
    </section>

    <section>
      <span className="eyebrow">How it works</span><h2>The bot does the routine work.</h2>
      <div className="steps">{steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="truth-section">
      <div><span className="eyebrow">Safe by design</span><h2>Practice the pressure, not the harm.</h2><ul className="checks"><li>Fictional organizations and situations</li><li>Email from a domain Family Drill controls</li><li>Organizer verification only</li><li>Immediate, shame-free coaching</li></ul></div>
      <div className="not-card"><span className="eyebrow">Hard boundaries</span><h3>No impersonation. No secrets.</h3><ul><li>No real-brand or From spoofing</li><li>No credential forms</li><li>No mail-provider keys in the bot</li><li>No downloads</li></ul></div>
    </section>

    <section className="install-strip"><div><span className="eyebrow">Start with the bot</span><h2>Set the schedule once. Get coaching when it matters.</h2><p>The website hosts the reveal; the bot runs the practice.</p></div><Link className="button" href="/docs/bot">View install path →</Link></section>
  </>;
}
