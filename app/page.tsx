import Link from "next/link";
import { auth } from "../auth";
import { BOT_INSTALL_URL } from "../lib/bot-install";
import { brands } from "../lib/brands";
import { heroPath, logoPath } from "../lib/email-assets";
import scenarioData from "../lib/scenarios.json";
import type { Scenario } from "../lib/types";
import { OnboardingSteps } from "./onboarding-steps";

const scenarios = scenarioData as Scenario[];
const featured = ["toll-unpaid", "parcel-redelivery", "photos-storage", "shared-document", "payment-failed", "virus-warning"].map((id) => scenarios.find((scenario) => scenario.id === id)!);
const sample = scenarios.find((scenario) => scenario.id === "toll-unpaid")!;

const faqs = [
  ["Isn't this just phishing my own family?", "No. Everyone agrees to practice up front (your assistant can send each person a friendly heads-up), every company is invented, nothing is collected, and every click opens a lesson right away. It's a fire drill, not a fire."],
  ["Will my relatives be upset?", "The heads-up email and the lesson page are written to be kind. Nobody is graded, and clicking is treated as a normal part of practice. Anyone can ask to stop, and your assistant removes them immediately."],
  ["What does my assistant need access to?", "Only your Family Drill install code. It never sees anyone's passwords or inbox, and it can only use the built-in practice emails. It can't send anything else."],
  ["Which assistants work?", "Family Drill is built for Grok Bot and Meta Muse. Any assistant that supports MCP connectors, or can call an HTTPS API, works the same way."],
  ["What if someone types a password on a practice page?", "Nothing is sent. The practice sign-in fields aren't even connected to the form, so values never leave their device. We only record that the button was pressed."],
  ["Can I run it myself?", "Yes. Family Drill is MIT licensed. Clone it, deploy it on your own domain, and connect your own email provider."],
] as const;

export default async function Home() {
  const session = await auth();
  return <>
    {session?.user && <section className="bot-card"><div><span className="eyebrow">Organizer setup</span><h2>Finish connecting your assistant.</h2><p>Your organizer email is verified. Get the install code to connect the bot.</p></div><Link className="button" href="/install">Get install code →</Link></section>}
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">Scam practice for families</span>
        <h1>Teach your family to spot scams before a real one lands.</h1>
        <p>Your AI assistant sends safe, surprise practice emails to the people you love. They look real, but every company is invented. One click opens a short lesson showing exactly what gave it away.</p>
        <div className="actions">
          <Link className="button" href="/docs/bot">Get started <span aria-hidden>→</span></Link>
          <Link className="button secondary" href="/examples">See the practice emails</Link>
        </div>
        <p className="works-with"><span>Works with</span><b>Grok Bot</b><b>Meta Muse</b><b>any MCP assistant</b></p>
        <p className="organizer-note"><strong>Only the organizer sets it up.</strong> Add relatives by telling the bot their names and email addresses in the bot chat. There is no hosted website form for family members.</p>
      </div>
      <div className="hero-art" aria-label="A practice email and the lesson that follows a click">
        <div className="mock-email">
          <div className="mock-from"><b>{sample.fromName}</b><span>{sample.subject}</span></div>
          <img src={logoPath(sample.brandId)} alt={brands[sample.brandId].name} height={26} className="mock-logo" />
          <img src={heroPath(sample.id)} alt="" width={600} height={225} />
          <p>{sample.bodyParagraphs?.[1]}</p>
          <span className="mock-button" style={{ background: brands[sample.brandId].primary }}>{sample.ctaLabel}</span>
        </div>
        <div className="mock-lesson">
          <span className="eyebrow">After the click</span>
          <strong>Phew, that one was practice.</strong>
          <ol><li>The name said Crestway, the address didn&apos;t.</li><li>Small fee, big threat.</li><li>The link went somewhere else.</li></ol>
        </div>
      </div>
    </section>

    <section className="why">
      <article><h3>Realistic</h3><p>Toll fines, parcel fees, locked accounts, shared files. The same tactics real scammers use this year, with polished logos and layouts.</p></article>
      <article><h3>Safe</h3><p>Invented companies, no attachments, no tracking pixels, nothing collected. Practice sign-in pages never send what you type.</p></article>
      <article><h3>Kind</h3><p>No scores to shame anyone. Clicks become two-minute chats, and spotting one becomes a win the family celebrates.</p></article>
    </section>

    <section id="how">
      <span className="eyebrow">How it works</span><h2>About five minutes to set up. Then it runs itself.</h2>
      <OnboardingSteps />
    </section>

    <section className="examples-section">
      <span className="eyebrow">What your family sees</span><h2>Practice the scams going around right now.</h2>
      <div className="example-grid compact">{featured.map((scenario) => <Link className="example-card" href={`/examples/${scenario.id}`} key={scenario.id}>
        <img src={heroPath(scenario.id)} alt="" width={600} height={225} loading="lazy" />
        <div><strong>{scenario.fromName}</strong><h3>{scenario.subject}</h3><p>{scenario.lesson[0]}</p></div>
      </Link>)}</div>
      <p className="example-note">These are fictional organizations, not real brands. Email copy can mimic a request for personal information, but the link always opens an instant lesson. Family Drill never collects passwords, Social Security numbers, or card details. <Link href="/examples">See all practice emails →</Link></p>
    </section>

    <section className="teach-strip">
      <div><span className="eyebrow">Practice is half of it</span><h2>Talking is the other half.</h2><p>A printable 4-question check, the six tricks behind almost every scam, a family code word for voice-clone calls, and how to bring it up with parents, grandparents, and kids without a lecture.</p><Link className="button" href="/learn">Teach your family →</Link></div>
      <ol className="mini-check"><li>Was I expecting this?</li><li>Who really sent it?</li><li>Is it rushing me?</li><li>Can I check another way?</li></ol>
    </section>

    <section>
      <span className="eyebrow">Choose where it runs</span><h2>Hosted, or yours to run.</h2>
      <div className="run-grid">
        <article className="run-card featured"><span className="tag">Simplest</span><h3>Hosted on app.familydrill.com</h3><p>Sign in, connect your assistant, done. No servers or email setup.</p><Link href="/docs/bot">Connect your assistant <span aria-hidden>→</span></Link></article>
        <article className="run-card"><span className="tag">MIT licensed</span><h3>Clone and self-host</h3><p>Run the app on your own domain and connect your own email service provider.</p><a href="https://github.com/ajaysurie/family-drill">Clone on GitHub <span aria-hidden>↗</span></a></article>
      </div>
    </section>

    <section className="faq">
      <span className="eyebrow">Questions</span><h2>Good questions to ask first.</h2>
      {faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
      <p><Link href="/docs/safety">Read the full safety rules →</Link></p>
    </section>

    <section className="bot-card"><div><span className="eyebrow">Start with your assistant</span><h2>Give your family a practice run this week.</h2><p>Sign in, paste your install code into the bot chat, then add family names and emails in the chat, not on the website.</p></div><div className="bot-card-actions"><Link className="button light" href="/docs/bot">Get started →</Link><a className="button secondary" href={BOT_INSTALL_URL}>Open the Grok bot</a></div></section>
  </>;
}
