import Link from "next/link";
import { brands } from "../lib/brands";
import { heroPath, logoPath } from "../lib/email-assets";
import { scamChecks } from "../lib/family-drill-email";
import type { Clue, Scenario } from "../lib/types";

export const realClickSteps = [
  ["Don't panic, and don't feel ashamed.", "Professionals write scams to fool smart people."],
  ["If you typed a password,", "change it right away on the real site or app, and anywhere else you use it."],
  ["If you shared card or bank details,", "call the number on the back of your card and ask them to block it."],
  ["If you let someone connect to your computer,", "disconnect from the internet and get help from someone you trust."],
  ["Tell someone.", "A quick call to family helps you act fast and helps them stay alert."],
] as const;

export function lessonClues(scenario: Scenario, sender: string, linkHost: string): Clue[] {
  return [
    { label: "The name and the address didn't match", detail: `It said "${scenario.fromName}", but the email came from ${sender}. Check the address, not just the name.` },
    ...scenario.clues,
    { label: "The link went somewhere else", detail: `The button led to ${linkHost}, not ${brands[scenario.brandId].name}. Before you tap, press and hold the link, or hover over it with a mouse, to see where it goes.` },
  ];
}

// The email as the relative saw it, with numbered pins that match the clue list below.
export function EmailReplica({ scenario, sender }: { scenario: Scenario; sender: string }) {
  const brand = brands[scenario.brandId];
  const pin = (n: number) => <span className="pin" aria-label={`Clue ${n}`}>{n}</span>;
  return <figure className="replica" aria-label="The practice email you received">
    <div className="replica-head">
      <div className="replica-row">{pin(1)}<span><b>From:</b> {scenario.fromName} <span className="replica-address">&lt;{sender}&gt;</span></span></div>
      <div className="replica-row"><span><b>Subject:</b> {scenario.subject}</span></div>
    </div>
    <div className="replica-body">
      <img src={logoPath(scenario.brandId)} alt={brand.name} height={28} className="replica-logo" />
      <img src={heroPath(scenario.id)} alt="" className="replica-hero" />
      <div className="replica-row"><span className="pins">{scenario.clues.map((clue, index) => <span key={clue.label}>{pin(index + 2)}</span>)}</span><p>{scenario.bodyParagraphs?.join(" ")}</p></div>
      <div className="replica-row">{pin(scenario.clues.length + 2)}<span className="replica-button" style={{ background: brand.primary }}>{scenario.ctaLabel}</span></div>
    </div>
  </figure>;
}

export function CluesList({ clues }: { clues: Clue[] }) {
  return <ol className="clues">{clues.map((clue, index) => <li key={clue.label}><span className="pin">{index + 1}</span><div><strong>{clue.label}</strong><p>{clue.detail}</p></div></li>)}</ol>;
}

export function NextTime() {
  return <>
    <section className="lesson-block"><h2>Next time, try the 4-question check</h2>
      <div className="check-grid">{scamChecks.map(([question, detail], index) => <article key={question}><span>{index + 1}</span><h3>{question}</h3><p>{detail}</p></article>)}</div>
    </section>
    <section className="lesson-block"><h2>If a real scam ever gets you</h2>
      <ul className="steps-list">{realClickSteps.map(([lead, rest]) => <li key={lead}><strong>{lead}</strong> {rest}</li>)}</ul>
      <p><Link href="/learn">More tips for you and your family →</Link></p>
    </section>
  </>;
}
