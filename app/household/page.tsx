import Link from "next/link";
import { getHousehold, getMembers } from "../../lib/store";
import { activateAgreement, createMember } from "./actions";
import { auth } from "../../auth";
import { redirect } from "next/navigation";

const terms = [
  "Surprise practice emails may be sent to household members.",
  "Every sender organization and situation is fictional.",
  "A drill will never ask for credentials, financial details, or other private information.",
  "After a miss, the family will review the clues without shame or punishment.",
  "Any member can ask the organizer to stop sending drills."
];

export default async function HouseholdPage() {
  const session = await auth(); if (!session?.user?.id) redirect("/login");
  const household = await getHousehold(session.user.id); if (!household) redirect("/login");
  const members = await getMembers(session.user.id);
  return <section><span className="eyebrow">Legacy web demo</span><h1>Demo household setup</h1>
    <div className="legacy-notice"><div><strong>This form is a self-hosting demo.</strong><p>Organizers normally add family members and manage drills through the bot. This page remains for developers evaluating a clone.</p></div><Link className="button" href="/docs/bot">See bot setup →</Link></div>
    <p>{household.organizerName} organizes this demo household's fictional surprise drills.</p>
    <article className="card"><h2>Plain-language terms</h2><ul>{terms.map((term) => <li key={term}>{term}</li>)}</ul>
      {household.status === "active" ? <p className="notice">Agreement active since {new Date(household.activatedAt!).toLocaleDateString()} · terms {household.termsVersion}</p> : <form action={activateAgreement}><button className="secondary">Activate demo agreement</button></form>}
    </article>
    <h2 className="section-title">Household members</h2><div className="member-list">{members.map((member) => <article className="member" key={member.id}><b>{member.name}</b><span>{member.email}</span></article>)}</div>
    <form action={createMember} className="card add-member"><h2>Add a demo member</h2><label>Name<input name="name" required/></label><label>Email<input name="email" type="email" required/></label><button className="secondary">Add demo member</button></form>
    <p><Link href="/admin">Continue to the demo controls and report →</Link></p>
  </section>;
}
