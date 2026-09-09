import Link from "next/link";
import { getHousehold, getMembers } from "../../lib/store";
import { activateAgreement, createMember } from "./actions";

const terms = [
  "Surprise practice emails may be sent to household members.",
  "Every sender organization and situation is fictional.",
  "A drill will never ask for credentials, financial details, or other private information.",
  "Family will coach kindly after a miss, rather than shame or punish.",
  "Any member can ask the organizer to stop sending drills."
];

export default function HouseholdPage() {
  const household = getHousehold();
  return <section><span className="eyebrow">Household agreement</span><h1>Agree once. Practice together.</h1>
    <p>{household.organizerName} organizes this household’s safe, fictional surprise drills.</p>
    <article className="card"><h2>Plain-language terms</h2><ul>{terms.map((term) => <li key={term}>{term}</li>)}</ul>
      {household.status === "active" ? <p className="notice">Agreement active since {new Date(household.activatedAt!).toLocaleDateString()} · terms {household.termsVersion}</p> : <form action={activateAgreement}><button>Activate household agreement</button></form>}
    </article>
    <h2 className="section-title">Household members</h2><div className="member-list">{getMembers().map((member) => <article className="member" key={member.id}><b>{member.name}</b><span>{member.email}</span></article>)}</div>
    <form action={createMember} className="card add-member"><h2>Add a member</h2><label>Name<input name="name" required/></label><label>Email<input name="email" type="email" required/></label><button>Add member</button></form>
    <p><Link href="/admin">Continue to drill controls and report →</Link></p>
  </section>;
}
