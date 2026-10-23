import { notFound } from "next/navigation";
import { appBaseUrl } from "../../../lib/email-assets";
import { drillSender } from "../../../lib/mail";
import { getRevealContext } from "../../../lib/store";
import { CluesList, EmailReplica, NextTime, lessonClues } from "../../lesson";
import { confirm } from "./actions";
import { RevealBeacon } from "./reveal-beacon";

export const metadata = { title: "This was a practice email | Family Drill", robots: { index: false } };

export default async function DrillPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ confirmed?: string; submitted?: string }> }) {
  const { token } = await params; const context = await getRevealContext(token);
  if (!context) notFound();
  const { attempt, scenario, memberName, organizer } = context;
  const query = await searchParams; const confirmed = query.confirmed === "1" || query.submitted === "1";
  const sender = drillSender(), clues = lessonClues(scenario, sender, new URL(appBaseUrl()).host);
  return <section className="reveal">
    <RevealBeacon token={token} />
    <div className="reveal-banner"><span aria-hidden>✓</span><div><span className="eyebrow">This was a family drill</span><p>Nothing bad happened. No information was collected.</p></div></div>
    <h1>Phew, {memberName}. That one was practice.</h1>
    <p className="lede">{organizer} set up practice emails like this so your family gets better at spotting scams. The company is made up. Real scammers send emails that look just like it, so here&apos;s what gave this one away.</p>
    {query.submitted && <p className="notice">You pressed sign in on a practice page. Nothing you typed was sent or saved. On a real scam page, that is how passwords get stolen.</p>}
    <div className="reveal-grid">
      <EmailReplica scenario={scenario} sender={sender} />
      <div><h2>What gave it away</h2><CluesList clues={clues} /></div>
    </div>
    <NextTime />
    <section className="lesson-block confirm-card">
      {confirmed ? <p className="notice" role="status">Thanks! {organizer} will see that this one got a click, so you can practice together. No private information was collected.</p> : <form action={confirm.bind(null, token)}>
        <h2>Help {organizer} see what&apos;s working</h2>
        <p>Did you get here by clicking the link in the email? Letting them know isn&apos;t a test of you. It helps choose what to practice next.</p>
        <button>Yes, I clicked the link in the email</button>
        <small className="help">Only this button records a confirmed click. Loading this page does not.</small>
      </form>}
      <p className="help">Want to stop getting practice emails? Just tell {organizer}. Drill sent {new Date(attempt.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })}.</p>
    </section>
  </section>;
}

