import Image from "next/image";
import Link from "next/link";
import { scamChecks } from "../../lib/family-drill-email";
import { realClickSteps } from "../lesson";
import { PrintButton } from "./print-button";

export const metadata = { title: "Teach your family to spot scams | Family Drill", description: "The 4-question scam check, the tricks scammers use, and how to talk to parents, grandparents, and kids about it." };

const tricks = [
  ["Hurry", "The message sets a deadline tonight, a countdown, or a final notice. Rushing stops you from checking."],
  ["Fear", "It says your account is locked, a payment failed, a virus was found, or your photos will be deleted."],
  ["Surprise money", "It offers a refund or a prize, or shows a charge you never made. Good and bad surprises both work."],
  ["Authority", "It claims to come from a bank, a school, a toll agency, or the tax office. Logos are easy to copy."],
  ["Strange ways to pay", "It asks for gift cards, a wire transfer, crypto, or a small fee to release something. Real organizations don't ask for these."],
  ["Secrecy", "\"Don't tell anyone\" or \"handle this privately.\" A real problem can always wait for a second opinion."],
];

const conversations = [
  ["Parents and grandparents", ["Lead with respect: \"These fool everyone, me included. Can we practice together?\"", "Promise you'll never be annoyed by a \"Is this real?\" call. Then keep that promise.", "Agree on one rule: no paying, no passwords, no remote access from a message, until you've talked."]],
  ["Teens and kids", ["Talk about their world: free game currency, fake giveaways, DMs from \"support\", and gift card requests.", "Make reporting a win. Spotting a fake and telling you earns praise, not a lecture.", "Explain that clicking a practice email is normal. That's what practice is for."]],
  ["Partners and adult siblings", ["Share what you catch. A quick \"look at this one\" helps everyone learn the signs.", "Turn on two-step sign-in for email and banking together.", "Decide who to call if someone ever breaks into an account."]],
] as const;

export default function LearnPage() {
  return <section className="learn">
    <div className="learn-hero"><div>
    <span className="eyebrow">Teach your family</span>
    <h1>Spotting scams is a skill you can practice.</h1>
    <p className="lede">Scammers rely on surprise and speed. Family Drill gives your family safe surprises to practice on. This page covers what to look for and how to talk about it without anyone feeling silly.</p>
    <p className="actions"><PrintButton /><Link className="button" href="/docs/bot">Set up practice emails →</Link></p>
    </div><Image src="/brand/hero-coaching.jpg" alt="A grandmother and her grown son smile at a laptop together" width={1600} height={900} /></div>

    <section className="fridge-card" aria-label="Printable scam check card">
      <div className="fridge-head"><b>Before you click, ask:</b><span>Family Drill · the 4-question check</span></div>
      <ol>{scamChecks.map(([question, detail]) => <li key={question}><strong>{question}</strong> {detail}</li>)}</ol>
      <p className="fridge-foot">Not sure? Don&apos;t click. Call family first. Asking is always the right move.</p>
    </section>

    <h2>Six tricks scammers use most</h2>
    <div className="trick-grid">{tricks.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>

    <h2>How to talk about it</h2>
    <div className="talk-grid">{conversations.map(([who, tips]) => <article key={who}><h3>{who}</h3><ul>{tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></article>)}</div>

    <div className="callout"><strong>Pick a family code word.</strong> Voice-cloning scams can sound like a grandchild or parent asking for urgent help. Agree on a word only your family knows, and ask for it whenever a call or message about an emergency asks for money.</div>

    <h2>If someone clicks a real one</h2>
    <ul className="steps-list">{realClickSteps.map(([lead, rest]) => <li key={lead}><strong>{lead}</strong> {rest}</li>)}</ul>

    <h2>After a practice click</h2>
    <p>Keep it light and short. Two minutes is enough: &quot;What made it look real? Which clue could you have caught? What will you do next time?&quot; Then move on. Your assistant can give you a coaching script for each drill. Praise a catch more than you mention a click.</p>
  </section>;
}
